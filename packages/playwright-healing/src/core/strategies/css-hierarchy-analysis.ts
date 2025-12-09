import { Page, Locator } from '@playwright/test';
import { HealingResult } from './data-testid-recovery';

/**
 * CSS Hierarchy Analysis Strategy
 * 
 * Analyzes DOM structure and generates alternative selectors based on
 * element hierarchy, CSS classes, HTML structure, and relationships.
 * 
 * Implements 10 different selector generation strategies to maximize
 * the chances of finding a working alternative.
 */
export class CSSHierarchyAnalysisStrategy {
  /**
   * Parse a CSS selector to extract element information
   */
  private parseSelector(selector: string): {
    tag?: string;
    id?: string;
    classes: string[];
    attributes: Map<string, string>;
  } {
    const result = {
      tag: undefined as string | undefined,
      id: undefined as string | undefined,
      classes: [] as string[],
      attributes: new Map<string, string>()
    };

    // Extract tag name
    const tagMatch = selector.match(/^([a-z][a-z0-9]*)/i);
    if (tagMatch) result.tag = tagMatch[1];

    // Extract ID
    const idMatch = selector.match(/#([a-z_][\w-]*)/i);
    if (idMatch) result.id = idMatch[1];

    // Extract classes
    const classMatches = selector.matchAll(/\.([a-z_][\w-]*)/gi);
    for (const match of classMatches) {
      result.classes.push(match[1]);
    }

    // Extract attributes
    const attrMatches = selector.matchAll(/\[([^=\]]+)(?:=["']([^"']+)["'])?\]/g);
    for (const match of attrMatches) {
      result.attributes.set(match[1], match[2] || '');
    }

    return result;
  }

  /**
   * Get element information from a Locator
   */
  private async getElementInfo(element: Locator): Promise<{
    tag: string;
    id: string | null;
    classes: string[];
    attributes: Map<string, string>;
    parent: string | null;
    siblings: number;
  }> {
    try {
      const info = await element.evaluate((el) => {
        const tag = el.tagName.toLowerCase();
        const id = el.id || null;
        const classes: string[] = Array.from(el.classList) as string[];
        
        const attributes = new Map<string, string>();
        for (let i = 0; i < el.attributes.length; i++) {
          const attr = el.attributes[i];
          attributes.set(attr.name, attr.value);
        }

        const parent = el.parentElement?.tagName.toLowerCase() || null;
        const siblings = el.parentElement?.children.length || 0;

        return {
          tag,
          id,
          classes,
          attributes: Array.from(attributes.entries()),
          parent,
          siblings
        };
      });

      return {
        ...info,
        attributes: new Map(info.attributes)
      };
    } catch (error) {
      throw new Error(`Failed to get element info: ${error}`);
    }
  }

  /**
   * Strategy 1: ID-based selector
   */
  private generateIdSelector(id: string): string {
    return `#${id}`;
  }

  /**
   * Strategy 2: Class combination selector
   */
  private generateClassSelector(classes: string[]): string[] {
    if (classes.length === 0) return [];
    
    const selectors: string[] = [];
    
    // Single class
    classes.forEach(cls => selectors.push(`.${cls}`));
    
    // Two-class combinations
    for (let i = 0; i < classes.length - 1; i++) {
      for (let j = i + 1; j < classes.length; j++) {
        selectors.push(`.${classes[i]}.${classes[j]}`);
      }
    }
    
    // All classes
    if (classes.length > 2) {
      selectors.push(`.${classes.join('.')}`);
    }

    return selectors;
  }

  /**
   * Strategy 3: Tag + attribute selector
   */
  private generateTagAttributeSelector(
    tag: string,
    attributes: Map<string, string>
  ): string[] {
    const selectors: string[] = [];

    attributes.forEach((value, key) => {
      if (key === 'class' || key === 'id') return; // Skip these
      
      if (value) {
        selectors.push(`${tag}[${key}="${value}"]`);
      } else {
        selectors.push(`${tag}[${key}]`);
      }
    });

    return selectors;
  }

  /**
   * Strategy 4: Nth-child selector
   */
  private async generateNthChildSelector(
    element: Locator,
    parent: string
  ): Promise<string[]> {
    try {
      const index = await element.evaluate((el) => {
        const parent = el.parentElement;
        if (!parent) return -1;
        return Array.from(parent.children).indexOf(el) + 1;
      });

      if (index > 0) {
        return [
          `${parent} > :nth-child(${index})`,
          `:nth-child(${index})`
        ];
      }
    } catch {
      // Ignore errors
    }
    return [];
  }

  /**
   * Strategy 5: Nth-of-type selector
   */
  private async generateNthOfTypeSelector(
    element: Locator,
    tag: string
  ): Promise<string[]> {
    try {
      const index = await element.evaluate((el) => {
        const parent = el.parentElement;
        if (!parent) return -1;
        
        const siblings = Array.from(parent.children).filter(
          (child: Element) => child.tagName === el.tagName
        );
        return siblings.indexOf(el) + 1;
      });

      if (index > 0) {
        return [`${tag}:nth-of-type(${index})`];
      }
    } catch {
      // Ignore errors
    }
    return [];
  }

  /**
   * Strategy 6: Parent-child relationship
   */
  private async generateParentChildSelector(
    element: Locator
  ): Promise<string[]> {
    try {
      const selectors: string[] = [];
      const info = await element.evaluate((el) => {
        const parentTag = el.parentElement?.tagName.toLowerCase();
        const parentClasses = el.parentElement ? Array.from(el.parentElement.classList) : [];
        const tag = el.tagName.toLowerCase();
        const classes = Array.from(el.classList);

        return { parentTag, parentClasses, tag, classes };
      });

      if (info.parentTag) {
        // Parent tag > child tag
        selectors.push(`${info.parentTag} > ${info.tag}`);

        // Parent with class > child
        if (info.parentClasses.length > 0) {
          selectors.push(`${info.parentTag}.${info.parentClasses[0]} > ${info.tag}`);
        }

        // Parent > child with class
        if (info.classes.length > 0) {
          selectors.push(`${info.parentTag} > ${info.tag}.${info.classes[0]}`);
        }
      }

      return selectors;
    } catch {
      return [];
    }
  }

  /**
   * Strategy 7: Descendant selector with depth
   */
  private async generateDescendantSelector(element: Locator): Promise<string[]> {
    try {
      const path = await element.evaluate((el) => {
        const parts: string[] = [];
        let current: Element | null = el;
        let depth = 0;

        while (current && depth < 4) {
          const tag = current.tagName.toLowerCase();
          const id = (current as HTMLElement).id;
          const classes: string[] = Array.from(current.classList) as string[];

          if (id) {
            parts.unshift(`#${id}`);
            break; // Stop at ID
          } else if (classes.length > 0) {
            parts.unshift(`${tag}.${classes[0]}`);
          } else {
            parts.unshift(tag);
          }

          current = current.parentElement;
          depth++;
        }

        return parts;
      });

      const selectors: string[] = [];
      
      // Generate selectors with different depths
      for (let i = 0; i < path.length; i++) {
        selectors.push(path.slice(i).join(' > '));
        selectors.push(path.slice(i).join(' '));
      }

      return selectors;
    } catch {
      return [];
    }
  }

  /**
   * Strategy 8: Attribute-only selector
   */
  private generateAttributeOnlySelector(attributes: Map<string, string>): string[] {
    const selectors: string[] = [];

    attributes.forEach((value, key) => {
      if (key === 'class' || key === 'id') return;
      
      if (value) {
        selectors.push(`[${key}="${value}"]`);
      } else {
        selectors.push(`[${key}]`);
      }
    });

    return selectors;
  }

  /**
   * Strategy 9: Similar class name selector
   */
  private async generateSimilarClassSelector(
    page: Page,
    classes: string[]
  ): Promise<string[]> {
    if (classes.length === 0) return [];

    const selectors: string[] = [];

    try {
      // Find elements with similar class names
      for (const cls of classes) {
        const baseName = cls.split(/[-_]/)[0];
        if (baseName.length < 3) continue;

        // Find classes that start with the same base
        const similarElements = await page.locator(`[class*="${baseName}"]`).all();
        
        for (const el of similarElements.slice(0, 5)) {
          const elementClasses = await el.evaluate(e => Array.from(e.classList) as string[]);
          elementClasses.forEach((c: string) => {
            if (c !== cls && c.startsWith(baseName)) {
              selectors.push(`.${c}`);
            }
          });
        }
      }
    } catch {
      // Ignore errors
    }

    return selectors;
  }

  /**
   * Strategy 10: Role and ARIA selector
   */
  private async generateRoleSelector(element: Locator): Promise<string[]> {
    try {
      const info = await element.evaluate((el) => {
        const role = el.getAttribute('role');
        const ariaLabel = el.getAttribute('aria-label');
        const ariaLabelledBy = el.getAttribute('aria-labelledby');
        
        return { role, ariaLabel, ariaLabelledBy };
      });

      const selectors: string[] = [];

      if (info.role) {
        selectors.push(`[role="${info.role}"]`);
      }

      if (info.ariaLabel) {
        selectors.push(`[aria-label="${info.ariaLabel}"]`);
      }

      if (info.ariaLabelledBy) {
        selectors.push(`[aria-labelledby="${info.ariaLabelledBy}"]`);
      }

      return selectors;
    } catch {
      return [];
    }
  }

  /**
   * Attempt to heal a failed selector using CSS hierarchy analysis
   */
  async heal(page: Page, originalSelector: string): Promise<HealingResult> {
    const timestamp = Date.now();

    console.log(`[CSSHierarchy] Attempting to heal selector: ${originalSelector}`);

    const alternatives: Array<{ selector: string; confidence: number; strategy: string }> = [];

    try {
      // First, try to find any element matching the original structure
      const parsed = this.parseSelector(originalSelector);
      
      // Generate alternative selectors using all strategies
      const allSelectors: Array<{ selector: string; strategy: string; priority: number }> = [];

      // Strategy 1: ID-based (highest priority)
      if (parsed.id) {
        allSelectors.push({
          selector: this.generateIdSelector(parsed.id),
          strategy: 'id-selector',
          priority: 100
        });
      }

      // Strategy 2: Class combinations
      const classSelectors = this.generateClassSelector(parsed.classes);
      classSelectors.forEach((sel, idx) => {
        allSelectors.push({
          selector: sel,
          strategy: 'class-selector',
          priority: 90 - idx * 5
        });
      });

      // Strategy 8: Attribute-only
      if (parsed.attributes.size > 0) {
        const attrSelectors = this.generateAttributeOnlySelector(parsed.attributes);
        attrSelectors.forEach((sel, idx) => {
          allSelectors.push({
            selector: sel,
            strategy: 'attribute-selector',
            priority: 85 - idx * 5
          });
        });
      }

      // Try each alternative selector
      for (const { selector, strategy, priority } of allSelectors) {
        try {
          const elements = await page.locator(selector).all();
          
          if (elements.length > 0) {
            const element = elements[0];
            const isVisible = await element.isVisible().catch(() => false);
            
            if (isVisible) {
              // Apply additional strategies to this element
              const elementInfo = await this.getElementInfo(element);
              
              // Add parent-child selectors
              const parentChildSelectors = await this.generateParentChildSelector(element);
              parentChildSelectors.forEach(sel => {
                allSelectors.push({ selector: sel, strategy: 'parent-child', priority: 75 });
              });

              // Add nth-child selectors
              if (elementInfo.parent) {
                const nthChildSelectors = await this.generateNthChildSelector(element, elementInfo.parent);
                nthChildSelectors.forEach(sel => {
                  allSelectors.push({ selector: sel, strategy: 'nth-child', priority: 70 });
                });
              }

              // Add descendant selectors
              const descendantSelectors = await this.generateDescendantSelector(element);
              descendantSelectors.forEach(sel => {
                allSelectors.push({ selector: sel, strategy: 'descendant', priority: 65 });
              });

              // Add role selectors
              const roleSelectors = await this.generateRoleSelector(element);
              roleSelectors.forEach(sel => {
                allSelectors.push({ selector: sel, strategy: 'role-selector', priority: 80 });
              });

              alternatives.push({
                selector,
                confidence: priority,
                strategy: `css-hierarchy-${strategy}`
              });
            }
          }
        } catch {
          // Skip invalid selectors
        }
      }

      // Remove duplicates
      const uniqueAlternatives = alternatives.reduce((acc, curr) => {
        const exists = acc.find(a => a.selector === curr.selector);
        if (!exists || exists.confidence < curr.confidence) {
          return [...acc.filter(a => a.selector !== curr.selector), curr];
        }
        return acc;
      }, [] as Array<{ selector: string; confidence: number; strategy: string }>);

      // Sort by confidence
      uniqueAlternatives.sort((a, b) => b.confidence - a.confidence);

      if (uniqueAlternatives.length > 0) {
        const best = uniqueAlternatives[0];

        console.log(`[CSSHierarchy] Successfully healed to: ${best.selector} (strategy: ${best.strategy})`);
        
        return {
          success: true,
          selector: best.selector,
          confidence: best.confidence,
          strategy: 'css-hierarchy-analysis',
          reasoning: `Generated alternative using ${best.strategy}`,
          alternatives: uniqueAlternatives.slice(0, 10).map(a => ({
            selector: a.selector,
            confidence: a.confidence
          })),
          timestamp
        };
      }

      return {
        success: false,
        selector: originalSelector,
        confidence: 0,
        strategy: 'css-hierarchy-analysis',
        reasoning: 'No alternative CSS selectors could locate a visible element',
        timestamp
      };

    } catch (error) {
      console.error(`[CSSHierarchy] Error during healing:`, error);
      return {
        success: false,
        selector: originalSelector,
        confidence: 0,
        strategy: 'css-hierarchy-analysis',
        reasoning: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp
      };
    }
  }

  /**
   * Check if this strategy is applicable
   */
  isApplicable(selector: string): boolean {
    // Applicable to any CSS selector
    return /^[#.[\w]/.test(selector) || /^[a-z]/i.test(selector);
  }

  /**
   * Get strategy name
   */
  getName(): string {
    return 'css-hierarchy-analysis';
  }

  /**
   * Perform health check
   */
  async healthCheck(page: Page): Promise<boolean> {
    try {
      await page.locator('body').count();
      return true;
    } catch (error) {
      console.error('[CSSHierarchy] Health check failed:', error);
      return false;
    }
  }
}
