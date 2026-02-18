export type LocatorType = 'role' | 'label' | 'text' | 'placeholder' | 'testId' | 'css' | 'xpath';

export interface LocatorStrategy {
  type: LocatorType;
  selector: string;
  confidence: number;
}

export interface ElementSnapshot {
  ref: string;
  tag: string;
  role?: string;
  label?: string;
  text?: string;
  placeholder?: string;
  testId?: string;
  attributes: Record<string, string>;
}

export interface HealingSuggestion {
  original: string;
  fixed: string;
  strategy: LocatorStrategy;
  reason: string;
}

export interface TestGenerationRequest {
  url?: string;
  steps: string[];
  framework: 'playwright';
  language: 'java' | 'typescript' | 'javascript';
}

export interface TestGenerationResult {
  code: string;
  locators: LocatorStrategy[];
  errors: string[];
}

export interface HealerConfig {
  priorityOrder: LocatorType[];
  minConfidence: number;
}
