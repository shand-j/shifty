#!/usr/bin/env node

/**
 * Shifty CLI - Development and Management Tool
 */

const { Command } = require('commander');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const program = new Command();

program
  .name('shifty')
  .description('Shifty AI Testing Platform - Development CLI')
  .version('1.0.0');

// Development commands
program
  .command('setup')
  .description('Setup development environment')
  .action(() => {
    console.log('🚀 Setting up Shifty development environment...');
    runScript('./tools/scripts/setup-dev.sh');
  });

program
  .command('dev')
  .description('Start development environment')
  .option('-s, --service <service>', 'Start specific service only')
  .action((options) => {
    if (options.service) {
      console.log(`🔧 Starting ${options.service} service...`);
      runCommand('npm', ['run', 'dev', '--workspace', `@shifty/${options.service}`]);
    } else {
      console.log('🔧 Starting all services...');
      runCommand('docker-compose', ['up', '-d']);
      runCommand('npm', ['run', 'dev']);
    }
  });

program
  .command('stop')
  .description('Stop all services')
  .action(() => {
    console.log('⏹️ Stopping all services...');
    runCommand('docker-compose', ['down']);
  });

program
  .command('logs')
  .description('View service logs')
  .option('-s, --service <service>', 'Show logs for specific service')
  .option('-f, --follow', 'Follow log output')
  .action((options) => {
    const args = ['logs'];
    if (options.follow) args.push('-f');
    if (options.service) args.push(options.service);
    
    runCommand('docker-compose', args);
  });

// Database commands
program
  .command('db:migrate')
  .description('Run database migrations')
  .option('-t, --tenant <tenantId>', 'Run migrations for specific tenant')
  .action((options) => {
    if (options.tenant) {
      console.log(`🗄️ Running migrations for tenant: ${options.tenant}`);
      runCommand('npm', ['run', 'db:migrate:tenant', '--', options.tenant]);
    } else {
      console.log('🗄️ Running platform migrations...');
      runCommand('npm', ['run', 'db:migrate']);
    }
  });

program
  .command('db:seed')
  .description('Seed database with development data')
  .action(() => {
    console.log('🌱 Seeding database...');
    runCommand('npm', ['run', 'db:seed']);
  });

program
  .command('db:reset')
  .description('Reset database (WARNING: destroys all data)')
  .action(() => {
    console.log('⚠️ Resetting database...');
    runCommand('docker-compose', ['down', '-v']);
    runCommand('docker-compose', ['up', '-d', 'platform-db']);
    setTimeout(() => {
      runCommand('npm', ['run', 'db:migrate']);
      runCommand('npm', ['run', 'db:seed']);
    }, 5000);
  });

// AI commands
program
  .command('ai:setup')
  .description('Setup AI models')
  .action(() => {
    console.log('🤖 Setting up AI models...');
    runScript('./tools/scripts/setup-ollama.sh');
  });

program
  .command('ai:test')
  .description('Test AI model connectivity')
  .option('-m, --model <model>', 'Test specific model', 'llama3.1:8b')
  .action((options) => {
    console.log(`🧪 Testing AI model: ${options.model}`);
    // Implementation would test the AI model
  });

// Deployment commands
program
  .command('deploy')
  .description('Deploy to environment')
  .option('-e, --env <environment>', 'Target environment', 'dev')
  .action((options) => {
    console.log(`🚀 Deploying to ${options.env}...`);
    runCommand('npm', ['run', `deploy:${options.env}`]);
  });

// Tenant management commands  
program
  .command('tenant:create')
  .description('Create new tenant')
  .requiredOption('-n, --name <name>', 'Tenant name')
  .requiredOption('-e, --email <email>', 'Admin email')
  .option('-r, --region <region>', 'AWS region', 'us-east-1')
  .option('-p, --plan <plan>', 'Subscription plan', 'starter')
  .action((options) => {
    console.log(`🏢 Creating tenant: ${options.name}`);
    // Implementation would call tenant creation API
  });

program
  .command('tenant:list')
  .description('List all tenants')
  .action(() => {
    console.log('🏢 Listing tenants...');
    // Implementation would call tenant listing API
  });

// Utility functions
function runCommand(command, args = []) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: true
  });
  
  child.on('error', (error) => {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  });
  
  child.on('close', (code) => {
    if (code !== 0) {
      console.error(`Command failed with exit code ${code}`);
      process.exit(code);
    }
  });
}

function runScript(scriptPath) {
  if (!fs.existsSync(scriptPath)) {
    console.error(`Script not found: ${scriptPath}`);
    process.exit(1);
  }
  
  runCommand('bash', [scriptPath]);
}

program.parse();