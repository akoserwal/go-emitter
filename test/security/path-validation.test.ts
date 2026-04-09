// Security tests for path validation
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

describe('Path Traversal Security', () => {
  const cliPath = path.join(__dirname, '../../dist/cli/index.js');

  test('should reject directory traversal in input path', async () => {
    try {
      await execAsync(`node ${cliPath} ../../../etc/passwd output.go`);
      fail('Expected security error for path traversal');
    } catch (error: any) {
      expect(error.stderr).toContain('Security error');
      expect(error.stderr).toContain('attempts to access files outside');
    }
  });

  test('should reject directory traversal in output path', async () => {
    try {
      await execAsync(`node ${cliPath} examples/01-basic-types/basic-models.tsp ../../../tmp/malicious.go`);
      fail('Expected security error for path traversal');
    } catch (error: any) {
      expect(error.stderr).toContain('Security error');
      expect(error.stderr).toContain('attempts to access files outside');
    }
  });

  test('should reject directory traversal in config path', async () => {
    try {
      await execAsync(`node ${cliPath} examples/01-basic-types/basic-models.tsp output.go --config ../../../etc/passwd`);
      fail('Expected security error for path traversal');
    } catch (error: any) {
      expect(error.stderr).toContain('Security error');
      expect(error.stderr).toContain('attempts to access files outside');
    }
  });

  test('should reject invalid input file extensions', async () => {
    try {
      await execAsync(`node ${cliPath} malicious.txt output.go`);
      fail('Expected error for invalid file extension');
    } catch (error: any) {
      expect(error.stderr).toContain('Input file must be a TypeSpec file (.tsp)');
    }
  });

  test('should reject invalid output file extensions', async () => {
    try {
      await execAsync(`node ${cliPath} examples/01-basic-types/basic-models.tsp malicious.txt`);
      fail('Expected error for invalid file extension');
    } catch (error: any) {
      expect(error.stderr).toContain('Output file must be a Go file (.go)');
    }
  });

  test('should accept valid relative paths', async () => {
    // This test should succeed without security errors
    const { stderr } = await execAsync(`node ${cliPath} --help`);
    expect(stderr).not.toContain('Security error');
  });
});