import type { TestGenerationRequest, TestGenerationResult, LocatorStrategy } from '../types/index.js';

export class TestGenerator {
  generate(request: TestGenerationRequest): TestGenerationResult {
    const { steps, language } = request;

    const code = language === 'java' 
      ? this.buildJava(steps) 
      : this.buildTypeScript(steps, language);

    return { code, locators: this.extractLocators(code), errors: [] };
  }

  private buildJava(steps: string[]): string {
    const body = steps.map(s => this.javaStep(s)).join('\n    ');
    return `package com.example.tests;

import com.microsoft.playwright.*;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class GeneratedTest {
  @Test
  public void test() {
    try (Playwright playwright = Playwright.create()) {
      Browser browser = playwright.chromium().launch();
      Page page = browser.newPage();
      ${body}
      browser.close();
    }
  }
}`;
  }

  private buildTypeScript(steps: string[], lang: 'typescript' | 'javascript'): string {
    const import_ = lang === 'typescript' 
      ? `import { test, expect } from '@playwright/test';\n`
      : `const { test, expect } = require('@playwright/test');\n`;

    const body = steps.map(s => this.tsStep(s)).join('\n  ');
    return `${import_}test('generated test', async ({ page }) => {
  ${body}
});`;
  }

  private javaStep(step: string): string {
    const p = this.parseStep(step);
    switch (p.action) {
      case 'navigate':
        return `page.navigate("${p.target}");`;
      case 'click':
        return `page.locator("${p.target}").click();`;
      case 'fill':
        return `page.locator("${p.target}").fill("${p.value}");`;
      default:
        return `// ${step}`;
    }
  }

  private tsStep(step: string): string {
    const p = this.parseStep(step);
    switch (p.action) {
      case 'navigate':
        return `await page.goto('${p.target}');`;
      case 'click':
        return `await page.locator('${p.target}').click();`;
      case 'fill':
        return `await page.locator('${p.target}').fill('${p.value}');`;
      default:
        return `// ${step}`;
    }
  }

  private parseStep(step: string): { action: string; target: string; value?: string } {
    const l = step.toLowerCase();
    
    if (l.includes('navigate') || l.includes('go to') || l.includes('open')) {
      const url = step.match(/(?:to |https?:\/\/)[^\s]+/)?.[0] || '';
      return { action: 'navigate', target: url.replace(/^(to |go to )/i, '') };
    }
    if (l.includes('click')) {
      return { action: 'click', target: this.suggestLocator(step) };
    }
    if (l.includes('type') || l.includes('fill')) {
      const match = step.match(/(?:type|fill) (.+) (?:in|into|on) (.+)/i);
      if (match) return { action: 'fill', target: this.suggestLocator(match[2]), value: match[1] };
    }
    
    return { action: 'comment', target: step };
  }

  private suggestLocator(target: string): string {
    const l = target.toLowerCase();
    if (l.includes('button')) return `getByRole('button', { name: /${target}/i })`;
    if (l.includes('link')) return `getByRole('link', { name: /${target}/i })`;
    if (l.includes('input') || l.includes('field')) return `getByLabel(/${target}/i)`;
    return `getByText(/${target}/i)`;
  }

  private extractLocators(code: string): LocatorStrategy[] {
    const patterns = [
      /getByRole\([^)]+\)/g,
      /getByLabel\([^)]+\)/g,
      /getByText\([^)]+\)/g,
      /getByPlaceholder\([^)]+\)/g,
      /getByTestId\([^)]+\)/g,
      /locator\([^)]+\)/g
    ];

    const locators: LocatorStrategy[] = [];
    for (const p of patterns) {
      const matches = code.match(p);
      if (matches) {
        for (const m of matches) {
          locators.push({ type: this.detectType(m), selector: m, confidence: 0.8 });
        }
      }
    }
    return locators;
  }

  private detectType(sel: string): LocatorStrategy['type'] {
    if (sel.startsWith('getByRole')) return 'role';
    if (sel.startsWith('getByLabel')) return 'label';
    if (sel.startsWith('getByText')) return 'text';
    if (sel.startsWith('getByPlaceholder')) return 'placeholder';
    if (sel.startsWith('getByTestId')) return 'testId';
    return 'css';
  }
}
