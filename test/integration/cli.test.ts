// CLI integration tests
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

describe('CLI Integration', () => {
  const tmpDir = path.join(__dirname, '../../tmp');

  beforeEach(() => {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('should generate Go code from CLI', () => {
    const inputFile = path.join(tmpDir, 'test.tsp');
    const outputFile = path.join(tmpDir, 'output.go');

    // Create test TypeSpec file
    fs.writeFileSync(inputFile, `
      model User {
        id: int64;
        name: string;
      }
    `);

    // Run CLI
    const cliPath = path.join(__dirname, '../../dist/cli/index.js');
    const command = `node ${cliPath} ${inputFile} ${outputFile}`;

    const output = execSync(command, { encoding: 'utf8' });

    expect(output).toContain('Code generation complete');
    expect(fs.existsSync(outputFile)).toBe(true);

    const generatedCode = fs.readFileSync(outputFile, 'utf8');
    expect(generatedCode).toContain('type User struct');
    expect(generatedCode).toContain('Name string `json:"name"`');
  });

  test('should use config file when provided', () => {
    const inputFile = path.join(tmpDir, 'test.tsp');
    const outputFile = path.join(tmpDir, 'output.go');
    const configFile = path.join(tmpDir, 'config.json');

    // Create test files
    fs.writeFileSync(inputFile, `model User { name: string; }`);
    fs.writeFileSync(configFile, JSON.stringify({
      packageName: 'testpkg',
      generateValidation: true
    }));

    // Run CLI with config
    const cliPath = path.join(__dirname, '../../dist/cli/index.js');
    const command = `node ${cliPath} ${inputFile} ${outputFile} -c ${configFile}`;

    execSync(command, { encoding: 'utf8' });

    const generatedCode = fs.readFileSync(outputFile, 'utf8');
    expect(generatedCode).toContain('package testpkg');
    expect(generatedCode).toContain('func (m *User) Validate() error');
  });

  test('should handle package name override', () => {
    const inputFile = path.join(tmpDir, 'test.tsp');
    const outputFile = path.join(tmpDir, 'output.go');

    fs.writeFileSync(inputFile, `model User { name: string; }`);

    // Run CLI with package override
    const cliPath = path.join(__dirname, '../../dist/cli/index.js');
    const command = `node ${cliPath} ${inputFile} ${outputFile} -p custompkg`;

    execSync(command, { encoding: 'utf8' });

    const generatedCode = fs.readFileSync(outputFile, 'utf8');
    expect(generatedCode).toContain('package custompkg');
  });
});