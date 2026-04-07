/**
 * TypeSpec Go Emitter v2 - Main Emitter Implementation
 */

import {
  EmitContext,
  emitFile,
  Model,
  Enum,
  Interface,
  Union,
  isArrayModelType,
  getDoc,
  getTypeName,
} from "@typespec/compiler";

import {
  getHttpService,
  getHttpOperation,
  getRoute,
} from "@typespec/http";

import { GoEmitterOptions, EmitResult, CodeFile } from "./types.js";
import { GoCodeGenerator } from "./generator.js";

export async function $onEmit(context: EmitContext<GoEmitterOptions>): Promise<void> {
  const emitter = new GoEmitter(context);
  await emitter.emitProgram();
}

class GoEmitter {
  private generator: GoCodeGenerator;

  constructor(private context: EmitContext<GoEmitterOptions>) {
    this.generator = new GoCodeGenerator(context.program, context.options);
  }

  async emitProgram(): Promise<void> {
    const { program } = this.context;
    const files: CodeFile[] = [];

    // Process global namespace
    for (const [name, type] of program.globalNamespace.models) {
      if (type.kind === "Model") {
        const code = this.generator.emitModel(type);
        if (code) {
          files.push({
            path: `${this.toFileName(name)}.go`,
            content: code
          });
        }
      }
    }

    for (const [name, type] of program.globalNamespace.enums) {
      if (type.kind === "Enum") {
        const code = this.generator.emitEnum(type);
        if (code) {
          files.push({
            path: `${this.toFileName(name)}_enum.go`,
            content: code
          });
        }
      }
    }

    for (const [name, type] of program.globalNamespace.interfaces) {
      if (type.kind === "Interface") {
        const code = this.generator.emitInterface(type);
        if (code) {
          files.push({
            path: `${this.toFileName(name)}_client.go`,
            content: code
          });
        }
      }
    }

    // Write all files
    const outputDir = this.context.options["output-dir"] ?? "./generated";

    for (const file of files) {
      await emitFile(this.context.program, {
        path: `${outputDir}/${file.path}`,
        content: file.content,
      });
    }
  }

  private toFileName(name: string): string {
    // Convert PascalCase to snake_case for Go file names
    return name.replace(/([A-Z])/g, (match, letter, index) => {
      return index === 0 ? letter.toLowerCase() : `_${letter.toLowerCase()}`;
    });
  }
}