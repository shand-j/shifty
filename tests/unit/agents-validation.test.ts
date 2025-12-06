import * as fs from 'fs';
import * as path from 'path';

// Skip global setup for this test - it's a file validation test
jest.mock('../../tests/setup', () => ({}));

describe('Custom Agents Validation', () => {
  const agentsDir = path.join(__dirname, '../../.github/agents');
  
  describe('qe-collaborator.agent.md', () => {
    const agentPath = path.join(agentsDir, 'qe-collaborator.agent.md');
    let agentContent: string;
    
    beforeAll(() => {
      agentContent = fs.readFileSync(agentPath, 'utf-8');
    });
    
    it('should exist', () => {
      expect(fs.existsSync(agentPath)).toBe(true);
    });
    
    it('should have YAML frontmatter with name and description', () => {
      expect(agentContent).toMatch(/^---\n/);
      expect(agentContent).toContain('name: qe-collaborator');
      expect(agentContent).toContain('description:');
      expect(agentContent).toMatch(/---\n\n# QE Collaborator/);
    });
    
    it('should define agent mission and core capabilities', () => {
      expect(agentContent).toContain('## 0. Agent Mission & Core Capabilities');
      expect(agentContent).toContain('Fast Context Delivery');
      expect(agentContent).toContain('Cross-Persona Knowledge Sharing');
      expect(agentContent).toContain('Gap & Risk Identification');
      expect(agentContent).toContain('AI Output Validation');
      expect(agentContent).toContain('Collaboration Facilitation');
    });
    
    it('should include all four persona interaction patterns', () => {
      expect(agentContent).toContain('## 1. Persona Interaction Patterns');
      expect(agentContent).toContain('### 1.1 Collaborating with Product Owners');
      expect(agentContent).toContain('### 1.2 Collaborating with Designers');
      expect(agentContent).toContain('### 1.3 Collaborating with QA/SDET');
      expect(agentContent).toContain('### 1.4 Collaborating with Developers');
    });
    
    it('should define collaboration workflows', () => {
      expect(agentContent).toContain('## 2. Collaboration Workflows');
      expect(agentContent).toContain('### 2.1 Requirements Validation Workflow');
      expect(agentContent).toContain('### 2.2 Design Review Workflow');
      expect(agentContent).toContain('### 2.3 Implementation Collaboration Workflow');
      expect(agentContent).toContain('### 2.4 Test Gap Identification Workflow');
      expect(agentContent).toContain('### 2.5 AI Output Validation Workflow');
    });
    
    it('should include fast context delivery mechanisms', () => {
      expect(agentContent).toContain('## 3. Fast Context Delivery Mechanisms');
      expect(agentContent).toContain('### 3.1 Context Sources & Integration');
      expect(agentContent).toContain('Jira Integration');
      expect(agentContent).toContain('Design System Integration');
      expect(agentContent).toContain('Telemetry & Quality Data');
      expect(agentContent).toContain('Code Repository');
    });
    
    it('should define risk and gap identification', () => {
      expect(agentContent).toContain('## 4. Risk & Gap Identification');
      expect(agentContent).toContain('### 4.1 Quality Risk Detection');
      expect(agentContent).toContain('### 4.2 Test Gap Analysis');
    });
    
    it('should include collaboration intelligence', () => {
      expect(agentContent).toContain('## 5. Collaboration Intelligence');
      expect(agentContent).toContain('### 5.1 Stakeholder Routing');
      expect(agentContent).toContain('### 5.2 Proactive Collaboration Prompts');
      expect(agentContent).toContain('### 5.3 Knowledge Capture & Sharing');
    });
    
    it('should define integration with Shifty ecosystem', () => {
      expect(agentContent).toContain('## 6. Integration with Shifty Ecosystem');
      expect(agentContent).toContain('### 6.1 MCP Tool Usage');
      expect(agentContent).toContain('### 6.2 Service Integration');
      expect(agentContent).toContain('jira.bridge');
      expect(agentContent).toContain('telemetry.query');
      expect(agentContent).toContain('manual.sessions');
      expect(agentContent).toContain('ci.status');
    });
    
    it('should define success metrics', () => {
      expect(agentContent).toContain('## 7. Success Metrics');
      expect(agentContent).toContain('### 7.1 Collaboration Efficiency');
      expect(agentContent).toContain('### 7.2 Quality Outcomes');
      expect(agentContent).toContain('### 7.3 Team Productivity');
      expect(agentContent).toContain('### 7.4 Telemetry Queries');
    });
    
    it('should include best practices and guardrails', () => {
      expect(agentContent).toContain('## 8. Best Practices & Guardrails');
      expect(agentContent).toContain('### 8.1 Data Governance');
      expect(agentContent).toContain('### 8.2 Escalation Guidelines');
      expect(agentContent).toContain('### 8.3 Collaboration Etiquette');
      expect(agentContent).toContain('### 8.4 Continuous Improvement');
    });
    
    it('should provide example interactions', () => {
      expect(agentContent).toContain('## 9. Example Interactions');
      expect(agentContent).toContain('### 9.1 Product → QE Collaborator');
      expect(agentContent).toContain('### 9.2 Designer → QE Collaborator');
      expect(agentContent).toContain('### 9.3 QA → QE Collaborator');
      expect(agentContent).toContain('### 9.4 Dev → QE Collaborator');
    });
    
    it('should include operational runbooks', () => {
      expect(agentContent).toContain('## 10. Operational Runbooks');
      expect(agentContent).toContain('### 10.1 Handling Ambiguous Questions');
      expect(agentContent).toContain('### 10.2 Handling Context Not Found');
      expect(agentContent).toContain('### 10.3 Handling Conflicting Information');
      expect(agentContent).toContain('### 10.4 Handling Escalations');
    });
    
    it('should have appendices', () => {
      expect(agentContent).toContain('## Appendix A: Persona Communication Styles');
      expect(agentContent).toContain('## Appendix B: Integration Examples');
      expect(agentContent).toContain('## Appendix C: Telemetry Events');
    });
    
    it('should include usage notes for GitHub Copilot', () => {
      expect(agentContent).toContain('## Usage Notes for GitHub Copilot');
      expect(agentContent).toContain('Treat this file as the authoritative definition');
    });
    
    it('should be well-formatted markdown', () => {
      // Check for proper heading hierarchy
      const headings = agentContent.match(/^#{1,6} /gm) || [];
      expect(headings.length).toBeGreaterThan(30); // Should have many sections
      
      // Check for code blocks
      expect(agentContent).toMatch(/```/);
      
      // Check for lists
      expect(agentContent).toMatch(/^- /m);
      expect(agentContent).toMatch(/^\d+\. /m);
    });
    
    it('should reference all four personas consistently', () => {
      expect(agentContent).toContain('Product Owner');
      expect(agentContent).toContain('Designer');
      expect(agentContent).toContain('QA/SDET');
      expect(agentContent).toContain('Developer');
    });
    
    it('should mention MCP tools', () => {
      expect(agentContent).toContain('jira.bridge');
      expect(agentContent).toContain('manual.sessions');
      expect(agentContent).toContain('telemetry.query');
      expect(agentContent).toContain('ci.status');
      expect(agentContent).toContain('repo.fs');
    });
  });
  
  describe('agents README.md', () => {
    const readmePath = path.join(agentsDir, 'README.md');
    let readmeContent: string;
    
    beforeAll(() => {
      readmeContent = fs.readFileSync(readmePath, 'utf-8');
    });
    
    it('should exist', () => {
      expect(fs.existsSync(readmePath)).toBe(true);
    });
    
    it('should document all three agents', () => {
      expect(readmeContent).toContain('shifty-dev');
      expect(readmeContent).toContain('shifty');
      expect(readmeContent).toContain('qe-collaborator');
    });
    
    it('should provide usage guide', () => {
      expect(readmeContent).toContain('## Using Custom Agents');
      expect(readmeContent).toContain('## Agent Selection Guide');
    });
    
    it('should include examples', () => {
      expect(readmeContent).toContain('## QE Collaborator Examples');
      expect(readmeContent).toContain('Example 1');
      expect(readmeContent).toContain('Example 2');
      expect(readmeContent).toContain('Example 3');
    });
  });
});
