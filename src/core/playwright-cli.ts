import { spawn } from 'child_process';
import type { ElementSnapshot } from '../types/index.js';

export class PlaywrightCLI {
  async open(url: string): Promise<void> {
    await this.run('open', [url]);
  }

  async snapshot(): Promise<ElementSnapshot[]> {
    const output = await this.run('snapshot', []);
    return this.parseSnapshot(output);
  }

  async click(ref: string): Promise<void> {
    await this.run('click', [ref]);
  }

  async fill(ref: string, value: string): Promise<void> {
    await this.run('fill', [ref, value]);
  }

  async type(ref: string, text: string): Promise<void> {
    await this.run('type', [ref, text]);
  }

  async press(key: string): Promise<void> {
    await this.run('press', [key]);
  }

  async screenshot(path?: string): Promise<void> {
    await this.run('screenshot', path ? [path] : []);
  }

  async eval(expression: string, ref?: string): Promise<unknown> {
    const args = ref ? [expression, ref] : [expression];
    const output = await this.run('eval', args);
    try {
      return JSON.parse(output);
    } catch {
      return output;
    }
  }

  private async run(subcommand: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const proc = spawn('npx', ['playwright-cli', subcommand, ...args], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      proc.stdout?.on('data', (data) => { stdout += data.toString(); });
      proc.stderr?.on('data', (data) => { stderr += data.toString(); });

      proc.on('close', (code) => {
        if (code === 0) resolve(stdout.trim());
        else reject(new Error(stderr || stdout));
      });

      proc.on('error', reject);
    });
  }

  private parseSnapshot(output: string): ElementSnapshot[] {
    try {
      const lines = output.split('\n').filter(l => l.trim());
      const snapshots: ElementSnapshot[] = [];

      for (const line of lines) {
        const match = line.match(/^(\w+)\s+(.+)$/);
        if (!match) continue;

        const [, ref, content] = match;
        const snapshot: ElementSnapshot = { ref, tag: 'unknown', attributes: {} };

        const roleMatch = content.match(/role=(\w+)/);
        if (roleMatch) snapshot.role = roleMatch[1];

        const labelMatch = content.match(/label=([^,\s]+)/);
        if (labelMatch) snapshot.label = labelMatch[1];

        const textMatch = content.match(/text=([^,\s]+)/);
        if (textMatch) snapshot.text = textMatch[1];

        const placeholderMatch = content.match(/placeholder=([^,\s]+)/);
        if (placeholderMatch) snapshot.placeholder = placeholderMatch[1];

        const testIdMatch = content.match(/testid=([^,\s]+)/);
        if (testIdMatch) snapshot.testId = testIdMatch[1];

        snapshots.push(snapshot);
      }

      return snapshots;
    } catch {
      return [];
    }
  }
}
