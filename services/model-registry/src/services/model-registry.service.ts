import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseManager } from '@shifty/database';
import {
  TenantModel,
  ModelSource,
  ModelStatus,
  ModelConfig,
  ModelRegistrationRequest,
  TrainingJob,
  TrainingJobConfig,
  TrainingJobStatus,
  ModelEvaluationResult,
  ModelDeploymentConfig,
} from '@shifty/shared';

export class ModelRegistryService {
  private dbManager: DatabaseManager;
  private huggingFaceApiToken: string;
  private ollamaEndpoint: string;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
    this.huggingFaceApiToken = process.env.HUGGINGFACE_API_TOKEN || '';
    this.ollamaEndpoint = process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';
  }

  /**
   * Register a new model for a tenant
   */
  async registerModel(request: ModelRegistrationRequest): Promise<TenantModel> {
    const modelId = uuidv4();
    console.log(`📦 Registering model for tenant ${request.tenantId}: ${request.name}`);

    // Validate model source exists
    await this.validateModelSource(request.source, request.sourceId);

    const model: TenantModel = {
      id: modelId,
      tenantId: request.tenantId,
      name: request.name,
      source: request.source,
      sourceId: request.sourceId,
      version: request.version || '1.0.0',
      status: 'pending',
      config: request.config || {
        temperature: 0.7,
        maxTokens: 2048,
        topP: 0.9,
        topK: 40,
        repetitionPenalty: 1.1,
        contextWindow: 4096,
      },
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.createModelRecord(model);

    // Start async download/validation
    this.initiateModelDownload(model).catch(err => {
      console.error(`Failed to download model ${modelId}:`, err);
      this.updateModelStatus(modelId, 'failed');
    });

    console.log(`✅ Model registered: ${modelId}`);
    return model;
  }

  /**
   * Get model by ID
   */
  async getModel(modelId: string): Promise<TenantModel | null> {
    const query = 'SELECT * FROM tenant_models WHERE id = $1';
    const result = await this.dbManager.query(query, [modelId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.transformModelRow(result.rows[0]);
  }

  /**
   * Get all models for a tenant
   */
  async getTenantModels(tenantId: string): Promise<TenantModel[]> {
    const query = 'SELECT * FROM tenant_models WHERE tenant_id = $1 ORDER BY created_at DESC';
    const result = await this.dbManager.query(query, [tenantId]);
    return result.rows.map(row => this.transformModelRow(row));
  }

  /**
   * Deploy a model to a GPU instance
   */
  async deployModel(config: ModelDeploymentConfig): Promise<{ success: boolean; endpoint?: string }> {
    const model = await this.getModel(config.modelId);
    if (!model) {
      throw new Error(`Model not found: ${config.modelId}`);
    }

    if (model.status !== 'ready') {
      throw new Error(`Model not ready for deployment: ${model.status}`);
    }

    console.log(`🚀 Deploying model ${config.modelId} to instance ${config.instanceId}`);

    try {
      // Call GPU provisioner to deploy the model
      const response = await axios.post(
        `${process.env.GPU_PROVISIONER_URL}/api/v1/instances/${config.instanceId}/deploy`,
        {
          modelId: config.modelId,
          modelPath: model.checkpointPath || model.sourceId,
          config: model.config,
          replicas: config.replicas,
        }
      );

      // Update model status
      await this.dbManager.query(
        `UPDATE tenant_models SET 
          status = 'deployed', 
          deployed_instance_id = $2,
          deployed_at = NOW(),
          updated_at = NOW()
        WHERE id = $1`,
        [config.modelId, config.instanceId]
      );

      console.log(`✅ Model deployed: ${config.modelId}`);
      return { success: true, endpoint: response.data.endpoint };
    } catch (error) {
      console.error(`❌ Failed to deploy model: ${error}`);
      throw error;
    }
  }

  /**
   * Start a training job
   */
  async startTrainingJob(
    tenantId: string,
    config: TrainingJobConfig
  ): Promise<TrainingJob> {
    const jobId = uuidv4();
    console.log(`🎓 Starting training job for tenant ${tenantId}`);

    const job: TrainingJob = {
      id: jobId,
      tenantId,
      config,
      status: 'queued',
      logs: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.createTrainingJobRecord(job);

    // Queue the training job (in production, this would go to a job queue)
    this.executeTrainingJob(job).catch(err => {
      console.error(`Training job ${jobId} failed:`, err);
      this.updateTrainingJobStatus(jobId, 'failed');
    });

    console.log(`✅ Training job queued: ${jobId}`);
    return job;
  }

  /**
   * Get training job status
   */
  async getTrainingJob(jobId: string): Promise<TrainingJob | null> {
    const query = 'SELECT * FROM training_jobs WHERE id = $1';
    const result = await this.dbManager.query(query, [jobId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.transformTrainingJobRow(result.rows[0]);
  }

  /**
   * Get tenant training jobs
   */
  async getTenantTrainingJobs(tenantId: string): Promise<TrainingJob[]> {
    const query = 'SELECT * FROM training_jobs WHERE tenant_id = $1 ORDER BY created_at DESC';
    const result = await this.dbManager.query(query, [tenantId]);
    return result.rows.map(row => this.transformTrainingJobRow(row));
  }

  /**
   * Create model evaluation
   */
  async createEvaluation(
    modelId: string,
    tenantId: string,
    evaluationType: 'automated' | 'human' | 'benchmark',
    metrics: ModelEvaluationResult['metrics']
  ): Promise<ModelEvaluationResult> {
    const evalId = uuidv4();

    const evaluation: ModelEvaluationResult = {
      id: evalId,
      modelId,
      tenantId,
      evaluationType,
      metrics,
      sampleResults: [],
      createdAt: new Date(),
    };

    await this.dbManager.query(
      `INSERT INTO model_evaluations (id, model_id, tenant_id, evaluation_type, metrics, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [evalId, modelId, tenantId, evaluationType, JSON.stringify(metrics), new Date()]
    );

    return evaluation;
  }

  /**
   * Get model evaluations
   */
  async getModelEvaluations(modelId: string): Promise<ModelEvaluationResult[]> {
    const query = 'SELECT * FROM model_evaluations WHERE model_id = $1 ORDER BY created_at DESC';
    const result = await this.dbManager.query(query, [modelId]);
    return result.rows.map(row => ({
      id: row.id,
      modelId: row.model_id,
      tenantId: row.tenant_id,
      evaluationType: row.evaluation_type,
      metrics: typeof row.metrics === 'string' ? JSON.parse(row.metrics) : row.metrics,
      sampleResults: row.sample_results || [],
      approved: row.approved,
      approvedBy: row.approved_by,
      createdAt: row.created_at,
    }));
  }

  /**
   * Delete model (with secure cleanup)
   */
  async deleteModel(modelId: string): Promise<void> {
    const model = await this.getModel(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    console.log(`🗑️ Deleting model: ${modelId}`);

    // If deployed, undeploy first
    if (model.deployedInstanceId) {
      await axios.post(
        `${process.env.GPU_PROVISIONER_URL}/api/v1/instances/${model.deployedInstanceId}/undeploy`,
        { modelId }
      );
    }

    // Delete model files (call data lifecycle service for secure deletion)
    if (model.checkpointPath) {
      await axios.post(
        `${process.env.DATA_LIFECYCLE_URL}/api/v1/secure-delete`,
        {
          tenantId: model.tenantId,
          paths: [model.checkpointPath],
          method: 'secure_overwrite',
        }
      );
    }

    // Delete database record
    await this.dbManager.query('DELETE FROM tenant_models WHERE id = $1', [modelId]);
    
    // Delete evaluations
    await this.dbManager.query('DELETE FROM model_evaluations WHERE model_id = $1', [modelId]);

    console.log(`✅ Model deleted: ${modelId}`);
  }

  // Private methods
  private async validateModelSource(source: ModelSource, sourceId: string): Promise<void> {
    switch (source) {
      case 'huggingface':
        await this.validateHuggingFaceModel(sourceId);
        break;
      case 'ollama':
        await this.validateOllamaModel(sourceId);
        break;
      case 'custom':
      case 's3':
        // Custom validation would check S3 path accessibility
        break;
    }
  }

  private async validateHuggingFaceModel(modelId: string): Promise<void> {
    try {
      const response = await axios.get(
        `https://huggingface.co/api/models/${modelId}`,
        {
          headers: this.huggingFaceApiToken 
            ? { Authorization: `Bearer ${this.huggingFaceApiToken}` }
            : {},
        }
      );
      
      if (!response.data.id) {
        throw new Error(`Model not found on Hugging Face: ${modelId}`);
      }
    } catch (error) {
      throw new Error(`Failed to validate Hugging Face model ${modelId}: ${error}`);
    }
  }

  private async validateOllamaModel(modelName: string): Promise<void> {
    try {
      const response = await axios.get(`${this.ollamaEndpoint}/api/tags`);
      const models = response.data.models || [];
      
      if (!models.find((m: any) => m.name === modelName)) {
        // Model not available locally, but can be pulled
        console.log(`Model ${modelName} not available locally, will be pulled`);
      }
    } catch (error) {
      console.warn(`Could not validate Ollama model ${modelName}: ${error}`);
    }
  }

  private async initiateModelDownload(model: TenantModel): Promise<void> {
    await this.updateModelStatus(model.id, 'downloading');

    switch (model.source) {
      case 'huggingface':
        // Download from Hugging Face Hub
        // In production, this would download to tenant-scoped storage
        await this.downloadHuggingFaceModel(model);
        break;
      case 'ollama':
        // Pull via Ollama
        await this.pullOllamaModel(model);
        break;
      case 'custom':
      case 's3':
        // Already available, just validate
        break;
    }

    await this.updateModelStatus(model.id, 'validating');
    // Validate model integrity
    await this.validateModelIntegrity(model);
    
    await this.updateModelStatus(model.id, 'ready');
  }

  private async downloadHuggingFaceModel(model: TenantModel): Promise<void> {
    console.log(`📥 Downloading Hugging Face model: ${model.sourceId}`);
    // In production, use huggingface_hub library via Python subprocess
    // or direct API calls to download model weights
    
    // Simulate download
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update checkpoint path
    const checkpointPath = `/models/${model.tenantId}/${model.id}`;
    await this.dbManager.query(
      'UPDATE tenant_models SET checkpoint_path = $2 WHERE id = $1',
      [model.id, checkpointPath]
    );
  }

  private async pullOllamaModel(model: TenantModel): Promise<void> {
    console.log(`📥 Pulling Ollama model: ${model.sourceId}`);
    
    await axios.post(`${this.ollamaEndpoint}/api/pull`, {
      name: model.sourceId,
    });
  }

  private async validateModelIntegrity(model: TenantModel): Promise<void> {
    console.log(`✓ Validating model integrity: ${model.id}`);
    // In production, verify checksums, run basic inference test
  }

  private async updateModelStatus(modelId: string, status: ModelStatus): Promise<void> {
    await this.dbManager.query(
      'UPDATE tenant_models SET status = $2, updated_at = NOW() WHERE id = $1',
      [modelId, status]
    );
  }

  private async executeTrainingJob(job: TrainingJob): Promise<void> {
    await this.updateTrainingJobStatus(job.id, 'provisioning');

    // Request GPU instance for training
    const gpuResponse = await axios.post(
      `${process.env.GPU_PROVISIONER_URL}/api/v1/instances`,
      {
        tenantId: job.tenantId,
        config: {
          instanceType: 'A100_40GB',
          gpuCount: 1,
          diskSize: 100,
          region: 'us-east',
          maxBudgetPerHour: 5,
        },
      }
    );

    const instanceId = gpuResponse.data.data.instance.id;
    await this.dbManager.query(
      'UPDATE training_jobs SET gpu_instance_id = $2 WHERE id = $1',
      [job.id, instanceId]
    );

    await this.updateTrainingJobStatus(job.id, 'preparing_data');
    // Prepare training data...

    await this.updateTrainingJobStatus(job.id, 'training');
    // Execute training...
    // This would run the actual training loop

    await this.updateTrainingJobStatus(job.id, 'evaluating');
    // Run evaluation...

    await this.updateTrainingJobStatus(job.id, 'saving');
    // Save model checkpoint...

    // Create output model record
    const outputModelId = uuidv4();
    const baseModel = await this.getModel(job.config.baseModelId);
    
    if (baseModel) {
      const outputModel: TenantModel = {
        id: outputModelId,
        tenantId: job.tenantId,
        name: `${baseModel.name}-finetuned-${job.id.slice(0, 8)}`,
        source: 'custom',
        sourceId: `training-job-${job.id}`,
        version: '1.0.0',
        status: 'ready',
        config: baseModel.config,
        checkpointPath: `/models/${job.tenantId}/${outputModelId}`,
        metadata: {
          trainingJobId: job.id,
          baseModelId: job.config.baseModelId,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.createModelRecord(outputModel);
      
      await this.dbManager.query(
        'UPDATE training_jobs SET output_model_id = $2 WHERE id = $1',
        [job.id, outputModelId]
      );
    }

    await this.updateTrainingJobStatus(job.id, 'completed');

    // Terminate GPU instance
    await axios.delete(`${process.env.GPU_PROVISIONER_URL}/api/v1/instances/${instanceId}`);
  }

  private async updateTrainingJobStatus(jobId: string, status: TrainingJobStatus): Promise<void> {
    const updates: Record<string, any> = { status };
    
    if (status === 'training') {
      updates.started_at = new Date();
    } else if (status === 'completed' || status === 'failed') {
      updates.completed_at = new Date();
    }

    const setClause = Object.keys(updates)
      .map((key, i) => `${key} = $${i + 2}`)
      .join(', ');

    await this.dbManager.query(
      `UPDATE training_jobs SET ${setClause}, updated_at = NOW() WHERE id = $1`,
      [jobId, ...Object.values(updates)]
    );
  }

  private async createModelRecord(model: TenantModel): Promise<void> {
    await this.dbManager.query(
      `INSERT INTO tenant_models (
        id, tenant_id, name, source, source_id, version, status,
        config, deployed_instance_id, checkpoint_path, metadata,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        model.id,
        model.tenantId,
        model.name,
        model.source,
        model.sourceId,
        model.version,
        model.status,
        JSON.stringify(model.config),
        model.deployedInstanceId || null,
        model.checkpointPath || null,
        JSON.stringify(model.metadata),
        model.createdAt,
        model.updatedAt,
      ]
    );
  }

  private async createTrainingJobRecord(job: TrainingJob): Promise<void> {
    await this.dbManager.query(
      `INSERT INTO training_jobs (
        id, tenant_id, config, status, gpu_instance_id, progress,
        output_model_id, logs, started_at, completed_at, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        job.id,
        job.tenantId,
        JSON.stringify(job.config),
        job.status,
        job.gpuInstanceId || null,
        JSON.stringify(job.progress || {}),
        job.outputModelId || null,
        JSON.stringify(job.logs),
        job.startedAt || null,
        job.completedAt || null,
        job.createdAt,
        job.updatedAt,
      ]
    );
  }

  private transformModelRow(row: any): TenantModel {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      source: row.source,
      sourceId: row.source_id,
      version: row.version,
      status: row.status,
      config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
      deployedInstanceId: row.deployed_instance_id,
      checkpointPath: row.checkpoint_path,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deployedAt: row.deployed_at,
    };
  }

  private transformTrainingJobRow(row: any): TrainingJob {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
      status: row.status,
      gpuInstanceId: row.gpu_instance_id,
      progress: typeof row.progress === 'string' ? JSON.parse(row.progress) : row.progress,
      outputModelId: row.output_model_id,
      logs: typeof row.logs === 'string' ? JSON.parse(row.logs) : row.logs,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
