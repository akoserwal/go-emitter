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
      const requiredImports = ['context', 'encoding/json', 'fmt', 'net/http'];
      const existingImports = this.config.imports || [];
      this.config.imports = [...existingImports, ...requiredImports]
        .filter((imp, index, arr) => arr.indexOf(imp) === index) // Remove duplicates
        .sort(); // Sort alphabetically for Go conventions
    }

    // Auto-add time import if utcDateTime is used
    if (content.includes('utcDateTime')) {
      const existingImports = this.config.imports || [];
      this.config.imports = [...existingImports, 'time']
        .filter((imp, index, arr) => arr.indexOf(imp) === index)
        .sort();
    }

    const codeParts: string[] = [];
    codeParts.push(this.generatePackageHeader());

    // Get enum names for type resolution (from global items only)
    const enumNames = parsed.globalItems.enums.map((e) => e.enumName);

    // Generate global items only (not namespace items)
    parsed.globalItems.enums.forEach((enumDef) => {
      codeParts.push(generateGoEnum(enumDef));
    });

    parsed.globalItems.unions.forEach((unionDef) => {
      codeParts.push(generateGoUnion(unionDef, enumNames));
    });

    parsed.globalItems.interfaces.forEach((interfaceDef) => {
      codeParts.push(generateGoInterface(interfaceDef, enumNames, this.config));
    });

    parsed.globalItems.models.forEach((modelDef) => {
      codeParts.push(generateGoStruct(modelDef, enumNames, this.config));
    });

    const mainCode = codeParts.join('');

    const result: GenerationResult = { mainCode };

    // Generate namespace files
    if (parsed.namespaces.length > 0) {
      result.namespaceFiles = this.generateNamespaceFiles(parsed.namespaces);
    }

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
    const parts: string[] = [];
    parts.push(`package ${this.config.packageName}\n\n`);

    if (this.config.imports && this.config.imports.length > 0) {
      if (this.config.imports.length === 1) {
        parts.push(`import "${this.config.imports[0]}"\n\n`);
      } else {
        parts.push('import (\n');
        this.config.imports.forEach((imp) => {
          parts.push(`\t"${imp}"\n`);
        });
        parts.push(')\n\n');
      }
    }

    return parts.join('');
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

  private generateNamespaceFiles(namespaces: any[]): { [namespace: string]: string } {
    const namespaceFiles: { [namespace: string]: string } = {};

    for (const namespace of namespaces) {
      const namespaceParts: string[] = [];
      namespaceParts.push(this.generateNamespacePackageHeader(namespace.namespaceName));

      // Get enum names for this namespace for type resolution
      const enumNames = namespace.enums.map((e: any) => e.enumName);

      // Generate in order: enums, unions, interfaces, models
      namespace.enums.forEach((enumDef: any) => {
        namespaceParts.push(generateGoEnum(enumDef));
      });

      namespace.unions.forEach((unionDef: any) => {
        namespaceParts.push(generateGoUnion(unionDef, enumNames));
      });

      namespace.interfaces.forEach((interfaceDef: any) => {
        namespaceParts.push(generateGoInterface(interfaceDef, enumNames, {
          ...this.config,
          packageName: namespace.namespaceName.toLowerCase()
        }));
      });

      namespace.models.forEach((modelDef: any) => {
        namespaceParts.push(generateGoStruct(modelDef, enumNames, this.config));
      });

      namespaceFiles[namespace.namespaceName.toLowerCase()] = namespaceParts.join('');
    }

    return namespaceFiles;
  }

  private generateNamespacePackageHeader(namespaceName: string): string {
    const packageName = namespaceName.toLowerCase();
    const parts: string[] = [];
    parts.push(`package ${packageName}\n\n`);

    // Determine required imports
    const requiredImports = this.getRequiredImports();

    if (requiredImports.length > 0) {
      if (requiredImports.length === 1) {
        parts.push(`import "${requiredImports[0]}"\n\n`);
      } else {
        parts.push('import (\n');
        requiredImports.forEach((imp) => {
          parts.push(`\t"${imp}"\n`);
        });
        parts.push(')\n\n');
      }
    }

    return parts.join('');
  }

  private getRequiredImports(): string[] {
    const imports = new Set<string>();

    // Add configured imports
    if (this.config.imports) {
      this.config.imports.forEach(imp => imports.add(imp));
    }

    // Add imports for HTTP client generation
    if (this.config.generateHTTPClient) {
      imports.add('bytes');
      imports.add('context');
      imports.add('encoding/json');
      imports.add('fmt');
      imports.add('net/http');
      imports.add('net/url');
    }

    // Always include time for timestamp fields
    imports.add('time');

    return Array.from(imports).sort();
  }
}
