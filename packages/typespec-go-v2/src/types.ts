/**
 * Types for TypeSpec Go Emitter v2
 */

export interface GoEmitterOptions {
  /**
   * Output directory for generated Go files
   * @default "./generated"
   */
  "output-dir"?: string;

  /**
   * Go package name for generated code
   * @default "generated"
   */
  "package-name"?: string;

  /**
   * Generate HTTP client implementations for interfaces
   * @default true
   */
  "generate-http-client"?: boolean;

  /**
   * Generate validation methods for models
   * @default false
   */
  "generate-validation"?: boolean;

  /**
   * Generate JSON helper methods
   * @default true
   */
  "generate-json-helpers"?: boolean;

  /**
   * Generate constructor functions
   * @default true
   */
  "generate-constructors"?: boolean;

  /**
   * Generate comprehensive documentation comments
   * @default true
   */
  "generate-docs"?: boolean;
}

export interface CodeFile {
  path: string;
  content: string;
}

export interface EmitResult {
  files: CodeFile[];
}