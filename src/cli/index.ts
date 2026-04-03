#!/usr/bin/env node

import * as fs from 'fs';
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

  if (configPath && fs.existsSync(configPath)) {
    try {
      const configFile = fs.readFileSync(configPath, 'utf8');
      config = { ...defaultConfig, ...JSON.parse(configFile) };
    } catch (error) {
      console.warn('Failed to parse config, using defaults');
    }
  }

  if (packageOverride) {
    config.packageName = packageOverride;
  }

  return config;
}

function showHelp() {
  console.log(`
TypeSpec to Go Code Generator

USAGE:
  go-emitter <input.tsp> <output.go> [options]

OPTIONS:
  -c, --config <file>     Configuration file (JSON)
  -p, --package <name>    Package name override
  -w, --watch            Watch for file changes
  -h, --help             Show this help
  -v, --version          Show version

EXAMPLES:
  go-emitter api.tsp models.go
  go-emitter api.tsp client.go -c config.json
  go-emitter api.tsp models.go -p mypackage
  `);
}

function showVersion() {
  console.log('go-emitter v1.0.0');
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

  if (!fs.existsSync(args.input)) {
    console.error(`Error: Input file '${args.input}' does not exist`);
    process.exit(1);
  }

  try {
    const config = loadConfig(args.config, args.packageName);
    const emitter = new TypeSpecGoEmitter(config);

    console.log(`🔄 Generating Go code from ${args.input} -> ${args.output}`);

    const result = await emitter.generateFromFile(args.input);

    // Write main file
    fs.writeFileSync(args.output, result.mainCode);

    // Write optional files
    if (result.testCode) {
      const testFile = args.output.replace('.go', '_test.go');
      fs.writeFileSync(testFile, result.testCode);
      console.log(`Generated test file -> ${testFile}`);
    }

    if (result.documentation) {
      const docFile = args.output.replace(/\.go$/, '') + '_README.md';
      fs.writeFileSync(docFile, result.documentation);
      console.log(`Generated documentation -> ${docFile}`);
    }

    console.log(`✅ Code generation complete!`);

    if (args.watch) {
      console.log(`👁️  Watching ${args.input} for changes...`);
      fs.watchFile(args.input, async () => {
        console.log(`🔄 File changed, regenerating...`);
        try {
          const newResult = await emitter.generateFromFile(args.input);
          fs.writeFileSync(args.output, newResult.mainCode);
          console.log(`✅ Regenerated!`);
        } catch (error) {
          console.error('❌ Regeneration failed:', error);
        }
      });
    }
  } catch (error) {
    console.error('❌ Generation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
