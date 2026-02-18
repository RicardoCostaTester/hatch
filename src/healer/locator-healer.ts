import type { LocatorType, LocatorStrategy, ElementSnapshot, HealingSuggestion, HealerConfig } from '../types/index.js';

const CONFIDENCE: Record<LocatorType, number> = {
  role: 0.95,
  label: 0.90,
  testId: 0.85,
  placeholder: 0.80,
  text: 0.60,
  css: 0.30,
  xpath: 0.20
};

export class LocatorHealer {
  private config: HealerConfig;

  constructor(config?: Partial<HealerConfig>) {
    this.config = {
      priorityOrder: ['role', 'label', 'testId', 'placeholder', 'text', 'css'],
      minConfidence: 0.7,
      ...config
    };
  }

  suggestHealing(brokenLocator: string, snapshots: ElementSnapshot[]): HealingSuggestion[] {
    const suggestions: HealingSuggestion[] = [];
    const brokenType = this.detectType(brokenLocator);

    for (const strategyType of this.config.priorityOrder) {
      if (strategyType === brokenType) continue;

      const element = this.findBestMatch(strategyType, snapshots);
      if (!element) continue;

      const fixed = this.buildLocator(strategyType, element);
      suggestions.push({
        original: brokenLocator,
        fixed,
        strategy: { type: strategyType, selector: fixed, confidence: this.calculateConfidence(strategyType, element) },
        reason: this.getReason(strategyType, element)
      });
    }

    return suggestions.sort((a, b) => b.strategy.confidence - a.strategy.confidence);
  }

  private findBestMatch(type: LocatorType, snapshots: ElementSnapshot[]): ElementSnapshot | null {
    for (const s of snapshots) {
      switch (type) {
        case 'role': if (s.role) return s; break;
        case 'label': if (s.label) return s; break;
        case 'testId': if (s.testId) return s; break;
        case 'placeholder': if (s.placeholder) return s; break;
        case 'text': if (s.text && s.text.length > 2) return s; break;
        case 'css': if (s.attributes['class'] || s.attributes['id']) return s; break;
      }
    }
    return null;
  }

  private buildLocator(type: LocatorType, el: ElementSnapshot): string {
    switch (type) {
      case 'role':
        return `getByRole('${el.role || 'button'}'${el.label ? `, { name: '${el.label}' }` : ''})`;
      case 'label':
        return `getByLabel('${el.label}')`;
      case 'testId':
        return `getByTestId('${el.testId}')`;
      case 'placeholder':
        return `getByPlaceholder('${el.placeholder}')`;
      case 'text':
        return `getByText('${el.text}', { exact: false })`;
      case 'css':
        return el.attributes['id'] 
          ? `locator('#${el.attributes['id']}')` 
          : `locator('.${(el.attributes['class'] || '').split(' ')[0]}')`;
      default:
        return '';
    }
  }

  private calculateConfidence(type: LocatorType, el: ElementSnapshot): number {
    let confidence = CONFIDENCE[type];
    if (type === 'role' && !el.role) confidence *= 0.5;
    if (type === 'text' && el.text && el.text.length < 3) confidence *= 0.7;
    return Math.min(confidence, 1);
  }

  private detectType(selector: string): LocatorType {
    if (selector.startsWith('getByRole')) return 'role';
    if (selector.startsWith('getByLabel')) return 'label';
    if (selector.startsWith('getByTestId')) return 'testId';
    if (selector.startsWith('getByPlaceholder')) return 'placeholder';
    if (selector.startsWith('getByText')) return 'text';
    if (selector.includes('#') || selector.includes('.')) return 'css';
    return 'css';
  }

  private getReason(type: LocatorType, el: ElementSnapshot): string {
    const reasons: Record<LocatorType, string> = {
      role: `ARIA role '${el.role}' is resilient to DOM changes`,
      label: `Label '${el.label}' provides stable form targeting`,
      testId: `testId '${el.testId}' is the most stable selector`,
      placeholder: `Placeholder '${el.placeholder}' targets inputs reliably`,
      text: `Text '${el.text}' matches visible content`,
      css: 'Fallback to CSS selector using class/id',
      xpath: 'Fallback to XPath selector'
    };
    return reasons[type];
  }
}
