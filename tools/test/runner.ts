#!/usr/bin/env node

// Simple test runner
// No Jest bloat, just Node.js and TypeScript

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface TestResult {
  file: string;
  passed: boolean;
  error?: string;
  duration: number;
}

class SimpleTestRunner {
  private testFiles: string[] = [];
  private results: TestResult[] = [];

  constructor(private testDir: string) {
    this.findTestFiles();
  }

  private findTestFiles() {
    const findTests = (dir: string): void => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          findTests(fullPath);
        } else if (entry.name.endsWith('.test.ts')) {
          this.testFiles.push(fullPath);
        }
      }
    };

    findTests(this.testDir);
  }

  async runTests(): Promise<void> {
    console.log('🧪 Simple Test Runner');
    console.log(`Found ${this.testFiles.length} test files\n`);

    for (const testFile of this.testFiles) {
      await this.runTestFile(testFile);
    }

    this.printSummary();
  }

  private async runTestFile(testFile: string): Promise<void> {
    const relativePath = path.relative(process.cwd(), testFile);
    const startTime = Date.now();

    try {
      // Compile and run TypeScript test file
      const jsFile = testFile.replace('.test.ts', '.test.js');

      // Compile TypeScript
      execSync(`npx tsc ${testFile} --outDir tmp --module commonjs --target es2020`, {
        stdio: 'pipe'
      });

      // Run the compiled test
      const jsPath = jsFile.replace(path.dirname(testFile), 'tmp');
      execSync(`node ${jsPath}`, { stdio: 'pipe' });

      const duration = Date.now() - startTime;
      this.results.push({
        file: relativePath,
        passed: true,
        duration
      });

      console.log(`✅ ${relativePath} (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        file: relativePath,
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      });

      console.log(`❌ ${relativePath} (${duration}ms)`);
      if (error instanceof Error) {
        console.log(`   ${error.message}`);
      }
    }
  }

  private printSummary(): void {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;

    console.log(`\n📊 Test Summary:`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📝 Total: ${total}`);

    if (failed > 0) {
      console.log(`\n🔍 Failed Tests:`);
      this.results
        .filter(r => !r.passed)
        .forEach(r => console.log(`   ${r.file}: ${r.error}`));

      process.exit(1);
    }

    console.log(`\n🎉 All tests passed!`);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const testDir = path.join(__dirname, '../test');
  const runner = new SimpleTestRunner(testDir);
  runner.runTests().catch(console.error);
}