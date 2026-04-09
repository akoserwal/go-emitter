// Core types for the TypeSpec Go emitter

export interface ParsedTypeSpec {
  models: ModelDef[];
  enums: EnumDef[];
  interfaces: InterfaceDef[];
  unions: UnionDef[];
  namespaces: NamespaceDef[];
  globalItems: {
    models: ModelDef[];
    enums: EnumDef[];
    interfaces: InterfaceDef[];
    unions: UnionDef[];
  };
}

export interface NamespaceDef {
  namespaceName: string;
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
  httpMethod?: string; // @get, @post, @put, @delete
  route?: string; // Extracted from path parameters
}

export interface ParamDef {
  name: string;
  type: string;
  decorator?: DecoratorInfo;
}

export interface DecoratorInfo {
  type: 'header' | 'query' | 'path' | 'body';
  name?: string; // Custom name for header/query, e.g., @header("X-API-Key")
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
  namespaceFiles?: { [namespace: string]: string }; // namespace -> Go code
}
