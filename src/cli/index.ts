#!/usr/bin/env node

import { Command } from 'commander';
import { LocatorHealer } from '../healer/locator-healer.js';
import { TestGenerator } from '../generator/test-generator.js';
import type { ElementSnapshot } from '../types/index.js';

const program = new Command();

program
  .name('hatch')
  .description('AI-powered test locator healing for Playwright')
  .version('1.0.0-MVP');

program
  .command('heal')
  .description('Heal a broken locator')
  .argument('<selector>', 'Broken locator to heal')
  .option('-s, --snapshots <json>', 'Element snapshots as JSON')
  .action(async (selector: string, options: { snapshots?: string }) => {
    const healer = new LocatorHealer();
    
    let snapshots: ElementSnapshot[] = [];
    if (options.snapshots) {
      try {
        snapshots = JSON.parse(options.snapshots);
      } catch {
        console.error('Invalid JSON for snapshots');
        process.exit(1);
      }
    }

    const suggestions = healer.suggestHealing(selector, snapshots);
    
    if (suggestions.length === 0) {
      console.log('No healing suggestions found');
      return;
    }

    console.log('\nHealing Suggestions:\n');
    suggestions.forEach((s, i) => {
      console.log(`${i + 1}. ${s.fixed}`);
      console.log(`   Confidence: ${(s.strategy.confidence * 100).toFixed(0)}%`);
      console.log(`   Reason: ${s.reason}\n`);
    });
  });

program
  .command('generate')
  .description('Generate test code from steps')
  .argument('<steps...>', 'Test steps')
  .option('-l, --language <lang>', 'Language (java|typescript|javascript)', 'java')
  .action(async (steps: string[], options: { language: 'java' | 'typescript' | 'javascript' }) => {
    const generator = new TestGenerator();
    const result = generator.generate({ steps, framework: 'playwright', language: options.language });
    
    console.log('\nGenerated Test:\n');
    console.log(result.code);
  });

program.parse();
