import { Router } from 'express';
import { TenantService } from '../services/tenant.service';
import { z } from 'zod';
import { authenticateToken, AuthRequest } from '../middleware/auth';

// Validation schemas
const CreateTenantSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  region: z.enum(['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1']).default('us-east-1').optional(),
  plan: z.enum(['starter', 'professional', 'enterprise', 'enterprise-plus']).default('starter').optional(),
  adminEmail: z.string().email().optional(),
  adminPassword: z.string().min(8).optional()
});

const UpdateTenantSchema = z.object({
  name: z.string().min(1).optional(),
  plan: z.enum(['starter', 'professional', 'enterprise', 'enterprise-plus']).optional(),
  region: z.enum(['us-east-1', 'eu-west-1', 'ap-southeast-1']).optional()
});

export function tenantRoutes(tenantService: TenantService): Router {
  const router = Router();

  // Get tenants for authenticated user
  router.get('/', authenticateToken, async (req: AuthRequest, res, next) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      // If user has admin role, show all tenants, otherwise show only their tenants
      const tenants = req.user?.role === 'admin' 
        ? await tenantService.listTenantsRaw(limit, offset)
        : await tenantService.listTenantsForUserRaw(req.user!.id, limit, offset);
        
      res.json({
        success: true,
        data: tenants,
        count: tenants.length
      });
    } catch (error) {
      next(error);
    }
  });

  // Get tenant by ID
  router.get('/:tenantId', authenticateToken, async (req: AuthRequest, res, next) => {
    try {
      const { tenantId } = req.params;
      
      // First check if tenant exists
      const tenant = await tenantService.getTenantRaw(tenantId);
      
      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: 'Tenant not found'
        });
      }

      // Then check if user has access to this tenant (unless admin)
      if (req.user?.role !== 'admin' && 
          !(await tenantService.userHasAccessToTenant(req.user!.id, tenantId))) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this tenant'
        });
      }

      res.json({
        success: true,
        data: tenant
      });
    } catch (error) {
      next(error);
    }
  });

  // Create new tenant
  router.post('/', authenticateToken, async (req: AuthRequest, res, next) => {
    try {
      const validatedData = CreateTenantSchema.parse(req.body);
      
      // For testing: create a simple tenant record without full provisioning
      const tenant = await tenantService.createSimpleTenantRaw({
        name: validatedData.name,
        slug: validatedData.slug,
        region: validatedData.region || 'us-east-1',
        plan: validatedData.plan || 'starter'
      });
      
      res.status(201).json({
        success: true,
        data: tenant,
        message: 'Tenant created successfully'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }
      next(error);
    }
  });

  // Update tenant
  router.put('/:tenantId', authenticateToken, async (req: AuthRequest, res, next) => {
    try {
      const { tenantId } = req.params;
      const validatedData = UpdateTenantSchema.parse(req.body);
      
      const tenant = await tenantService.updateTenant(tenantId, validatedData);
      
      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: 'Tenant not found'
        });
      }

      res.json({
        success: true,
        data: tenant,
        message: 'Tenant updated successfully'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }
      next(error);
    }
  });

  // Delete tenant (soft delete)
  router.delete('/:tenantId', authenticateToken, async (req: AuthRequest, res, next) => {
    try {
      const { tenantId } = req.params;
      await tenantService.deleteTenant(tenantId);
      
      res.json({
        success: true,
        message: 'Tenant deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  });

  // Get tenant statistics (simplified for MVP)
  router.get('/:tenantId/stats', authenticateToken, async (req: AuthRequest, res, next) => {
    try {
      const { tenantId } = req.params;
      const tenant = await tenantService.getTenant(tenantId);
      
      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: 'Tenant not found'
        });
      }
      
      // For MVP, return basic stats
      const stats = {
        tenantId,
        name: tenant.name,
        plan: tenant.plan,
        region: tenant.region,
        createdAt: tenant.createdAt,
        status: 'active' // Simplified status
      };
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}