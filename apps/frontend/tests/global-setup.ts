/**
 * Playwright Global Setup
 * 
 * Validates that all required services are available before running tests.
 * This prevents cryptic timeout errors and provides clear feedback about missing dependencies.
 */

import axios from 'axios';

async function globalSetup() {
  console.log('🔍 Validating test dependencies...\n');
  
  const checks = [
    { 
      name: 'Frontend Server', 
      url: process.env.FRONTEND_URL || 'http://localhost:3006',
      required: true 
    },
    { 
      name: 'API Gateway', 
      url: 'http://localhost:3000/health',
      required: true 
    },
    { 
      name: 'Auth Service', 
      url: 'http://localhost:3002/health',
      required: true 
    },
  ];
  
  const errors: string[] = [];
  
  for (const check of checks) {
    try {
      await axios.get(check.url, { timeout: 3000 });
      console.log(`  ✅ ${check.name} - Available`);
    } catch (error: any) {
      const message = `  ❌ ${check.name} - NOT AVAILABLE (${check.url})`;
      console.error(message);
      if (check.required) {
        errors.push(message);
      }
    }
  }
  
  // Verify test user exists
  try {
    const apiUrl = process.env.SHIFTY_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await axios.post(`${apiUrl}/api/v1/auth/login`, {
      email: 'test@shifty.com',
      password: 'password123',
    }, { timeout: 3000 });
    
    if (response.data.token) {
      console.log('  ✅ Test user authenticated\n');
    }
  } catch (error: any) {
    const status = error.response?.status;
    if (status === 401) {
      const message = '  ❌ Test user test@shifty.com - INVALID CREDENTIALS';
      console.error(message);
      console.error('     💡 Ensure database seed data is loaded (init-platform-db.sql)\n');
      errors.push(message);
    } else if (status === 404) {
      const message = '  ❌ Auth endpoint - NOT FOUND';
      console.error(message);
      errors.push(message);
    } else {
      const message = '  ❌ Test user authentication - FAILED';
      console.error(message);
      console.error(`     Error: ${error.message}\n`);
      errors.push(message);
    }
  }
  
  if (errors.length > 0) {
    console.error('\n❌ Pre-test validation failed. Please fix the following issues:\n');
    errors.forEach(err => console.error(err));
    console.error('\n💡 Tips:');
    console.error('   - Run ./scripts/start-mvp.sh to start all backend services');
    console.error('   - Run npm run dev in apps/frontend (should auto-start via webServer config)');
    console.error('   - Ensure database migrations have run (check docker logs shifty-platform-db)');
    console.error('');
    throw new Error('Pre-test validation failed. See errors above.');
  }
  
  console.log('✨ All dependencies validated. Starting tests...\n');
}

export default globalSetup;
