import { LocatorHealer } from '../src/healer/locator-healer.js';

describe('LocatorHealer', () => {
  const healer = new LocatorHealer();

  const mockSnapshots = [
    { ref: 'e1', tag: 'button', role: 'button', label: 'Submit', text: 'Submit Order', attributes: {} },
    { ref: 'e2', tag: 'input', label: 'Username', placeholder: 'Enter username', attributes: {} },
    { ref: 'e3', tag: 'div', testId: 'trade-panel', text: 'Trading Panel', attributes: {} },
    { ref: 'e4', tag: 'input', placeholder: 'Search', attributes: { class: 'search-input' } },
    { ref: 'e5', tag: 'span', text: 'Price', attributes: { id: 'price-display' } },
  ];

  describe('suggestHealing', () => {
    it('should suggest getByRole for broken CSS selector', () => {
      const suggestions = healer.suggestHealing('.submit-btn', mockSnapshots);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].strategy.type).toBe('role');
    });

    it('should suggest getByLabel for broken input selector', () => {
      const suggestions = healer.suggestHealing('#username-field', mockSnapshots);
      expect(suggestions[0].strategy.type).toBe('label');
    });

    it('should return highest confidence first', () => {
      const suggestions = healer.suggestHealing('.unknown', mockSnapshots);
      for (let i = 1; i < suggestions.length; i++) {
        expect(suggestions[i-1].strategy.confidence).toBeGreaterThanOrEqual(suggestions[i].strategy.confidence);
      }
    });

    it('should not suggest same type as broken locator', () => {
      const suggestions = healer.suggestHealing("getByRole('button')", mockSnapshots);
      expect(suggestions.some(s => s.strategy.type === 'role')).toBe(false);
    });
  });

  describe('confidence levels', () => {
    it('should assign highest confidence to role locators', () => {
      const suggestions = healer.suggestHealing('.btn', mockSnapshots);
      const roleSuggestion = suggestions.find(s => s.strategy.type === 'role');
      expect(roleSuggestion?.strategy.confidence).toBe(0.95);
    });

    it('should assign lower confidence to text locators', () => {
      const suggestions = healer.suggestHealing('.btn', mockSnapshots);
      const textSuggestion = suggestions.find(s => s.strategy.type === 'text');
      expect(textSuggestion?.strategy.confidence).toBeLessThan(0.7);
    });
  });
});
