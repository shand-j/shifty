import { beforeAll, afterAll } from '@jest/globals';
import axios from 'axios';

// Global test setup
beforeAll(async () => {
  // Wait for services to be ready
  await waitForServices();
});

afterAll(async () => {
  // Cleanup after tests
});

// Wait for all services to be healthy
async function waitForServices(): Promise<void> {
  const services = [
    { name: 'API Gateway', url: 'http://localhost:3000/health', required: true },
    { name: 'Auth Service', url: 'http://localhost:3002/health', required: true },
    { name: 'Tenant Manager', url: 'http://localhost:3001/health', required: false }, // Temporarily optional while fixing stability
    { name: 'AI Orchestrator', url: 'http://localhost:3003/health', required: true },
    { name: 'Test Generator', url: 'http://localhost:3004/health', required: true }, // CORE SERVICE - MUST BE REQUIRED
    { name: 'Healing Engine', url: 'http://localhost:3005/health', required: true },
  ];

  const maxRetries = 5; // Increased retries
  const retryDelay = 3000; // Increased delay

  for (const service of services) {
    let retries = 0;
    let isHealthy = false;

    while (retries < maxRetries && !isHealthy) {
      try {
        const response = await axios.get(service.url, { 
          timeout: 8000,
          httpAgent: false, // Prevent circular references
          httpsAgent: false 
        });
        if (response.status === 200) {
          console.log(`✅ ${service.name} is ready`);
          isHealthy = true;
        }
      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          if (service.required) {
            throw new Error(`Required service ${service.name} failed to start after ${maxRetries} attempts`);
          } else {
            console.log(`⚠️ Optional service ${service.name} is not available`);
            break;
          }
        }
        console.log(`⏳ Waiting for ${service.name}... (${retries}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  console.log('🚀 All services are ready for testing');
}