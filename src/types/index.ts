// Core types for the TypeSpec Go emitter

export interface ParsedTypeSpec {
  models: ModelDef[];
  enums: EnumDef[];
  interfaces: InterfaceDef[];
  unions: UnionDef[];
}

export interface ModelDef {
  modelName: string;
  fields: FieldDef[];
}

export interface FieldDef {
  name: string;
  type: string;
  optional: boolean;
}

export interface EnumDef {
  enumName: string;
  values: string[];
}

export interface InterfaceDef {
  interfaceName: string;
  methods: MethodDef[];
}

export interface MethodDef {
  name: string;
  params: ParamDef[];
  returnType: string;
}

export interface ParamDef {
  name: string;
  type: string;
}

export interface UnionDef {
  unionName: string;
  types: string[];
}

export interface EmitterConfig {
  packageName: string;
  imports: string[];
  generateValidation: boolean;
  generateBuilders: boolean;
  generateJSON: boolean;
  generateHTTPClient: boolean;
  generateTests: boolean;
  generateDocs: boolean;
  lintGo: boolean;
}

export interface GenerationResult {
  mainCode: string;
  testCode?: string;
  documentation?: string;
}
