import {
  ParsedTypeSpec,
  ModelDef,
  EnumDef,
  InterfaceDef,
  UnionDef,
  FieldDef,
  MethodDef,
} from '../types';

/**
 * Simple TypeSpec parser using regex
 *
 */
export function parseTypeSpecFile(content: string): ParsedTypeSpec {
  const result: ParsedTypeSpec = { models: [], enums: [], interfaces: [], unions: [] };

  // Parse enums
  result.enums = parseEnums(content);

  // Parse unions
  result.unions = parseUnions(content);

  // Parse interfaces
  result.interfaces = parseInterfaces(content);

  // Parse models
  result.models = parseModels(content);

  return result;
}

function parseEnums(content: string): EnumDef[] {
  const enums: EnumDef[] = [];
  const enumRegex = /enum\s+(\w+)\s*\{\s*(.*?)\s*\}/gs;

  let match;
  while ((match = enumRegex.exec(content)) !== null) {
    const enumName = match[1];
    const enumContent = match[2];

    // Handle both TypeSpec formats:
    // Simple: Active, Inactive
    // String values: Active: "active", Inactive: "inactive"
    const values = enumContent
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0)
      .map((v) => {
        // If it has a colon, extract just the key part
        const colonIndex = v.indexOf(':');
        return colonIndex > 0 ? v.substring(0, colonIndex).trim() : v;
      });

    enums.push({ enumName, values });
  }

  return enums;
}

function parseUnions(content: string): UnionDef[] {
  const unions: UnionDef[] = [];
  const unionRegex = /union\s+(\w+)\s*\{\s*(.*?)\s*\}/gs;

  let match;
  while ((match = unionRegex.exec(content)) !== null) {
    const unionName = match[1];
    const typesContent = match[2];
    const types = typesContent
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    unions.push({ unionName, types });
  }

  return unions;
}

function parseInterfaces(content: string): InterfaceDef[] {
  const interfaces: InterfaceDef[] = [];
  const interfaceRegex = /interface\s+(\w+)\s*\{\s*(.*?)\s*\}/gs;

  let match;
  while ((match = interfaceRegex.exec(content)) !== null) {
    const interfaceName = match[1];
    const methodsContent = match[2];
    const methods = parseMethods(methodsContent);
    interfaces.push({ interfaceName, methods });
  }

  return interfaces;
}

function parseMethods(content: string): MethodDef[] {
  const methods: MethodDef[] = [];
  const methodRegex = /(\w+)\(([^)]*)\):\s*(\w+(?:\[\])?)\s*;/g;

  let match;
  while ((match = methodRegex.exec(content)) !== null) {
    const name = match[1];
    const paramsString = match[2].trim();
    const returnType = match[3];

    const params = parseParams(paramsString);
    methods.push({ name, params, returnType });
  }

  return methods;
}

function parseParams(paramsString: string) {
  const params = [];
  if (paramsString) {
    const paramPairs = paramsString.split(',');
    for (const paramPair of paramPairs) {
      const paramMatch = paramPair.trim().match(/(\w+):\s*(\w+(?:\[\])?)/);
      if (paramMatch) {
        params.push({ name: paramMatch[1], type: paramMatch[2] });
      }
    }
  }
  return params;
}

function parseModels(content: string): ModelDef[] {
  const models: ModelDef[] = [];
  const modelRegex = /model\s+(\w+)\s*\{\s*(.*?)\s*\}/gs;

  let match;
  while ((match = modelRegex.exec(content)) !== null) {
    const modelName = match[1];
    const fieldsContent = match[2];
    const fields = parseFields(fieldsContent);
    models.push({ modelName, fields });
  }

  return models;
}

function parseFields(content: string): FieldDef[] {
  const fields: FieldDef[] = [];
  const fieldRegex = /(\w+)(\?)?\s*:\s*((?:Record<\w+,\s*\w+>|\w+(?:\[\])?))\s*;/g;

  let match;
  while ((match = fieldRegex.exec(content)) !== null) {
    fields.push({
      name: match[1],
      optional: match[2] === '?',
      type: match[3],
    });
  }

  return fields;
}
