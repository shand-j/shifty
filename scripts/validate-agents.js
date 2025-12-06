#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Custom Agents...\n');

const agentsDir = path.join(__dirname, '../.github/agents');
const agentPath = path.join(agentsDir, 'qe-collaborator.agent.md');
const readmePath = path.join(agentsDir, 'README.md');

let allTestsPassed = true;
let passCount = 0;
let failCount = 0;

function test(name, condition) {
  if (condition) {
    console.log(`✅ ${name}`);
    passCount++;
  } else {
    console.log(`❌ ${name}`);
    allTestsPassed = false;
    failCount++;
  }
}

// Read agent file
const agentContent = fs.readFileSync(agentPath, 'utf-8');
const readmeContent = fs.readFileSync(readmePath, 'utf-8');

console.log('Testing qe-collaborator.agent.md:\n');

// Basic structure tests
test('File exists', fs.existsSync(agentPath));
test('Has YAML frontmatter', agentContent.startsWith('---\n'));
test('Has agent name', agentContent.includes('name: qe-collaborator'));
test('Has description', agentContent.includes('description:'));

// Content tests
test('Has mission statement', agentContent.includes('## 0. Agent Mission & Core Capabilities'));
test('Has Fast Context Delivery', agentContent.includes('Fast Context Delivery'));
test('Has Cross-Persona Knowledge Sharing', agentContent.includes('Cross-Persona Knowledge Sharing'));
test('Has Gap & Risk Identification', agentContent.includes('Gap & Risk Identification'));
test('Has AI Output Validation', agentContent.includes('AI Output Validation'));
test('Has Collaboration Facilitation', agentContent.includes('Collaboration Facilitation'));

// Persona tests
test('Has Product Owner interaction', agentContent.includes('### 1.1 Collaborating with Product Owners'));
test('Has Designer interaction', agentContent.includes('### 1.2 Collaborating with Designers'));
test('Has QA/SDET interaction', agentContent.includes('### 1.3 Collaborating with QA/SDET'));
test('Has Developer interaction', agentContent.includes('### 1.4 Collaborating with Developers'));

// Workflow tests
test('Has Requirements Validation', agentContent.includes('### 2.1 Requirements Validation Workflow'));
test('Has Design Review', agentContent.includes('### 2.2 Design Review Workflow'));
test('Has Implementation Collaboration', agentContent.includes('### 2.3 Implementation Collaboration Workflow'));
test('Has Test Gap Identification', agentContent.includes('### 2.4 Test Gap Identification Workflow'));
test('Has AI Output Validation', agentContent.includes('### 2.5 AI Output Validation Workflow'));

// Integration tests
test('Has MCP Tool Usage', agentContent.includes('### 6.1 MCP Tool Usage'));
test('References jira.bridge', agentContent.includes('jira.bridge'));
test('References manual.sessions', agentContent.includes('manual.sessions'));
test('References telemetry.query', agentContent.includes('telemetry.query'));
test('References ci.status', agentContent.includes('ci.status'));

// Example tests
test('Has example interactions', agentContent.includes('## 9. Example Interactions'));
test('Has Product example', agentContent.includes('### 9.1 Product → QE Collaborator'));
test('Has Designer example', agentContent.includes('### 9.2 Designer → QE Collaborator'));
test('Has QA example', agentContent.includes('### 9.3 QA → QE Collaborator'));
test('Has Dev example', agentContent.includes('### 9.4 Dev → QE Collaborator'));

console.log('\nTesting agents/README.md:\n');

test('README exists', fs.existsSync(readmePath));
test('Documents shifty-dev', readmeContent.includes('### 1. shifty-dev'));
test('Documents shifty', readmeContent.includes('### 2. shifty'));
test('Documents qe-collaborator', readmeContent.includes('### 3. qe-collaborator'));
test('Has usage guide', readmeContent.includes('## Using Custom Agents'));
test('Has examples', readmeContent.includes('## QE Collaborator Examples'));

console.log('\n' + '='.repeat(50));
console.log(`\nResults: ${passCount} passed, ${failCount} failed`);

if (allTestsPassed) {
  console.log('✅ All tests passed!\n');
  process.exit(0);
} else {
  console.log('❌ Some tests failed\n');
  process.exit(1);
}
