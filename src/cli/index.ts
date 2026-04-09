#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { TypeSpecGoEmitter } from '../core/emitter';
import { EmitterConfig } from '../types';

interface CLIArgs {
  input: string;
  output: string;
  config?: string;
  packageName?: string;
  watch?: boolean;
  help?: boolean;
  version?: boolean;
}

function parseArgs(): CLIArgs {
  const args: CLIArgs = { input: '', output: '' };

  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];

    if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg === '--version' || arg === '-v') {
      args.version = true;
    } else if (arg === '--watch' || arg === '-w') {
      args.watch = true;
    } else if (arg === '--config' || arg === '-c') {
      args.config = process.argv[++i];
    } else if (arg === '--package' || arg === '-p') {
      args.packageName = process.argv[++i];
    } else if (!args.input) {
      args.input = arg;
    } else if (!args.output) {
      args.output = arg;
    }
  }

  return args;
}

function validatePath(userPath: string, purpose: 'input' | 'output' | 'config'): string {
  // Resolve path to prevent directory traversal
  const resolved = path.resolve(userPath);
  const cwd = process.cwd();

  // Check if resolved path is within current working directory or subdirectories
  if (!resolved.startsWith(cwd)) {
    throw new Error(
      `Security error: ${purpose} path '${userPath}' attempts to access files outside the current directory. Resolved to: ${resolved}`
    );
  }

  // Additional validation for file extensions
  if (purpose === 'input' && !userPath.endsWith('.tsp')) {
    throw new Error(`Input file must be a TypeSpec file (.tsp), got: ${userPath}`);
  }

  if (purpose === 'output' && !userPath.endsWith('.go')) {
    throw new Error(`Output file must be a Go file (.go), got: ${userPath}`);
  }

  if (purpose === 'config' && !userPath.endsWith('.json')) {
    throw new Error(`Config file must be a JSON file (.json), got: ${userPath}`);
  }

  return resolved;
}

function loadConfig(configPath?: string, packageOverride?: string): EmitterConfig {
  const defaultConfig: EmitterConfig = {
    packageName: 'main',
    imports: [],
    generateValidation: false,
    generateBuilders: false,
    generateJSON: false,
    generateHTTPClient: false,
    generateTests: false,
    generateDocs: false,
    lintGo: false,
  };

  let config = defaultConfig;

  if (configPath) {
    const validatedConfigPath = validatePath(configPath, 'config');
    if (fs.existsSync(validatedConfigPath)) {
      try {
        const configFile = fs.readFileSync(validatedConfigPath, 'utf8');
        config = { ...defaultConfig, ...JSON.parse(configFile) };
      } catch (error) {
        console.warn('Failed to parse config, using defaults');
      }
    }
  }

  if (packageOverride) {
    config.packageName = packageOverride;
  }

  return config;
}

function showHelp() {
  console.log(`
🚀 TypeSpec to Go Code Generator (go-emitter)

USAGE:
  go-emitter <input.tsp> <output.go> [options]

OPTIONS:
  -c, --config <file>     Configuration file (JSON)
  -p, --package <name>    Package name override
  -w, --watch            Watch for file changes (auto-regenerate)
  -h, --help             Show this help
  -v, --version          Show version

FEATURES:
  ✅ Models & structs     Generate Go structs from TypeSpec models
  ✅ Interfaces          Generate Go interfaces from TypeSpec interfaces
  ✅ Enums              Generate Go enums with String() methods
  ✅ HTTP clients       Generate REST API client code
  ✅ JSON serialization JSON tags and marshal/unmarshal methods
  ✅ Validation         Input validation and error handling
  ✅ Go conventions     Proper naming, reserved keyword handling

EXAMPLES:
  # Basic usage
  go-emitter api.tsp models.go

  # With custom package name
  go-emitter api.tsp client.go -p myclient

  # With configuration file
  go-emitter api.tsp models.go -c config.json

  # Watch mode for development
  go-emitter api.tsp models.go --watch

CONFIG FILE FORMAT (config.json):
  {
    "packageName": "models",
    "generateHTTPClient": true,
    "generateValidation": true,
    "generateJSON": true,
    "generateBuilders": false,
    "generateTests": false,
    "generateDocs": false
  }

For more info: https://github.com/typespec-community/typespec-go
  `);
}

function showVersion() {
  const version = require('../../package.json').version;
  console.log(`go-emitter v${version}`);
}

async function main() {
  const args = parseArgs();

  if (args.help) {
    showHelp();
    return;
  }

  if (args.version) {
    showVersion();
    return;
  }

  if (!args.input || !args.output) {
    console.error('Error: Input and output files are required');
    console.error('Run with --help for usage information');
    process.exit(1);
  }

  try {
    // Validate and resolve paths to prevent directory traversal
    const validatedInput = validatePath(args.input, 'input');
    const validatedOutput = validatePath(args.output, 'output');

    if (!fs.existsSync(validatedInput)) {
      console.error(`Error: Input file '${args.input}' does not exist`);
      process.exit(1);
    }

    const config = loadConfig(args.config, args.packageName);
    const emitter = new TypeSpecGoEmitter(config);

    console.log(`🔄 Generating Go code from ${args.input} -> ${args.output}`);

    const result = await emitter.generateFromFile(validatedInput);

    // Write main file
    fs.writeFileSync(validatedOutput, result.mainCode);

    // Write namespace files
    if (result.namespaceFiles) {
      const outputDir = validatedOutput.replace(/\.go$/, '');
      for (const [namespace, code] of Object.entries(result.namespaceFiles)) {
        const namespaceFile = `${outputDir}_${namespace}.go`;
        // Validate additional generated files
        const validatedNamespaceFile = validatePath(namespaceFile, 'output');
        fs.writeFileSync(validatedNamespaceFile, code);
        console.log(`Generated namespace file -> ${namespaceFile}`);
      }
    }

    // Write optional files
    if (result.testCode) {
      const testFile = validatedOutput.replace('.go', '_test.go');
      const validatedTestFile = validatePath(testFile, 'output');
      fs.writeFileSync(validatedTestFile, result.testCode);
      console.log(`Generated test file -> ${testFile}`);
    }

    if (result.documentation) {
      const docFile = validatedOutput.replace(/\.go$/, '') + '_README.md';
      // For documentation, we need a more flexible validation since it's not a .go file
      const validatedDocFile = path.resolve(docFile);
      if (!validatedDocFile.startsWith(process.cwd())) {
        throw new Error(
          `Security error: Documentation path attempts to access files outside current directory`
        );
      }
      fs.writeFileSync(validatedDocFile, result.documentation);
      console.log(`Generated documentation -> ${docFile}`);
    }

    console.log(`✅ Code generation complete!`);

    if (args.watch) {
      console.log(`👁️  Watching ${args.input} for changes...`);
      fs.watchFile(validatedInput, async () => {
        console.log(`🔄 File changed, regenerating...`);
        try {
          const newResult = await emitter.generateFromFile(validatedInput);
          fs.writeFileSync(validatedOutput, newResult.mainCode);
          console.log(`✅ Regenerated!`);
        } catch (error) {
          console.error('❌ Regeneration failed:', error);
        }
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Security error:')) {
      console.error('🛡️  Security Error:', error.message);
      console.error(
        'Tip: Ensure file paths are within the current directory and use relative paths.'
      );
    } else {
      console.error('❌ Generation failed:', error);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
