import * as fs from 'fs';

import { parseTypeSpecFile } from './parser';
import { generateGoStruct } from '../generators/go-struct';
import { generateGoEnum } from '../generators/go-enum';
import { generateGoInterface } from '../generators/go-interface';
import { generateGoUnion } from '../generators/go-union';
import { EmitterConfig, GenerationResult } from '../types';

/**
 * Main emitter class - coordinates all generation
 * Clear separation of concerns
 */
export class TypeSpecGoEmitter {
  constructor(private config: EmitterConfig) {}

  async generateFromFile(inputFile: string): Promise<GenerationResult> {
    const content = fs.readFileSync(inputFile, 'utf8');
    return this.generateFromString(content);
  }

  async generateFromString(content: string): Promise<GenerationResult> {
    const parsed = parseTypeSpecFile(content);

    // Auto-add required imports for HTTP client generation
    if (this.config.generateHTTPClient && parsed.interfaces.length > 0) {
      const requiredImports = ['fmt', 'encoding/json', 'net/http', 'context'];
      const existingImports = this.config.imports || [];
      this.config.imports = [...existingImports, ...requiredImports].filter(
        (imp, index, arr) => arr.indexOf(imp) === index
      ); // Remove duplicates
    }

    let mainCode = this.generatePackageHeader();

    // Get enum names for type resolution
    const enumNames = parsed.enums.map((e) => e.enumName);

    // Generate in order: enums, unions, interfaces, models
    parsed.enums.forEach((enumDef) => {
      mainCode += generateGoEnum(enumDef);
    });

    parsed.unions.forEach((unionDef) => {
      mainCode += generateGoUnion(unionDef);
    });

    parsed.interfaces.forEach((interfaceDef) => {
      mainCode += generateGoInterface(interfaceDef, enumNames, this.config);
    });

    parsed.models.forEach((modelDef) => {
      mainCode += generateGoStruct(modelDef, enumNames, this.config);
    });

    const result: GenerationResult = { mainCode };

    // Generate optional files
    if (this.config.generateTests) {
      result.testCode = this.generateTests(parsed);
    }

    if (this.config.generateDocs) {
      result.documentation = this.generateDocumentation(parsed);
    }

    return result;
  }

  private generatePackageHeader(): string {
    let code = `package ${this.config.packageName}\n\n`;

    if (this.config.imports && this.config.imports.length > 0) {
      if (this.config.imports.length === 1) {
        code += `import "${this.config.imports[0]}"\n\n`;
      } else {
        code += 'import (\n';
        this.config.imports.forEach((imp) => {
          code += `\t"${imp}"\n`;
        });
        code += ')\n\n';
      }
    }

    return code;
  }

  private generateTests(parsed: any): string {
    // Simplified test generation
    return `package ${this.config.packageName}

import (
\t"testing"
\t"encoding/json"
)

// Generated tests for all types
${parsed.models
  .map(
    (model: any) => `
func Test${model.modelName}_Basic(t *testing.T) {
\t// Test would go here - simplified for clean architecture
\tt.Skip("Generated test placeholder")
}
`
  )
  .join('')}
`;
  }

  private generateDocumentation(parsed: any): string {
    // Simplified documentation generation
    return `# Generated Go Client

Auto-generated from TypeSpec definitions.

## Types Generated

- ${parsed.models.length} models
- ${parsed.enums.length} enums
- ${parsed.interfaces.length} interfaces
- ${parsed.unions.length} unions

## Usage

See the generated Go code for usage examples.
`;
  }
}
