import { UnionDef } from '../types';
import { toGoTypeName, toGoFieldName } from '../core/type-mapper';

export function generateGoUnion(union: UnionDef, knownEnums: string[]): string {
  const { unionName, types } = union;
  const goUnionName = toGoTypeName(unionName);

  // Check if this is a discriminated union (contains colons)
  const isDiscriminated = types.some((type) => type.includes(':'));

  if (isDiscriminated) {
    return generateDiscriminatedUnion(union, knownEnums);
  }

  // Generate simple union
  return generateSimpleUnion(union, knownEnums);
}

function generateDiscriminatedUnion(union: UnionDef, knownEnums: string[]): string {
  const { unionName, types } = union;
  const goUnionName = toGoTypeName(unionName);

  let result = '';

  // Generate interface with type discrimination
  result += `// ${goUnionName} represents a discriminated union type\n`;
  result += `type ${goUnionName} interface {\n`;
  result += `\tIs${goUnionName}() bool\n`;
  result += `\tType() string\n`;
  result += `\tValue() interface{}\n`;
  result += `}\n\n`;

  // Generate concrete implementations for each discriminated case
  for (const type of types) {
    const parts = type.split(':').map((p) => p.trim());
    if (parts.length === 2) {
      const discriminator = parts[0];
      const typeName = parts[1];
      const wrapperName = `${goUnionName}${toGoTypeName(discriminator)}`;

      result += `// ${wrapperName} implements ${goUnionName}\n`;
      result += `type ${wrapperName} struct {\n`;
      result += `\tData ${mapTypeSpecToGo(typeName)} \`json:"data"\`\n`;
      result += `\tTypeValue string \`json:"type"\`\n`;
      result += `}\n\n`;

      result += `func New${wrapperName}(data ${mapTypeSpecToGo(typeName)}) *${wrapperName} {\n`;
      result += `\treturn &${wrapperName}{\n`;
      result += `\t\tData: data,\n`;
      result += `\t\tTypeValue: "${discriminator}",\n`;
      result += `\t}\n`;
      result += `}\n\n`;

      result += `func (u *${wrapperName}) Is${goUnionName}() bool { return true }\n`;
      result += `func (u *${wrapperName}) Type() string { return u.TypeValue }\n`;
      result += `func (u *${wrapperName}) Value() interface{} { return u.Data }\n\n`;
    }
  }

  return result;
}

function generateSimpleUnion(union: UnionDef, knownEnums: string[]): string {
  const { unionName, types } = union;
  const goUnionName = toGoTypeName(unionName);

  let result = '';

  // Generate interface
  result += `// ${goUnionName} represents a union type\n`;
  result += `type ${goUnionName} interface {\n`;
  result += `\tIs${goUnionName}() bool\n`;
  result += `\tValue() interface{}\n`;
  result += `}\n\n`;

  // Generate wrapper types for each union member
  for (const type of types) {
    const cleanType = type.trim();
    if (cleanType === 'null') {
      continue; // Skip null for now
    }

    // Handle string literals
    if (cleanType.startsWith('"') && cleanType.endsWith('"')) {
      const literal = cleanType.slice(1, -1);
      const wrapperName = `${goUnionName}${toGoTypeName(literal)}`;

      result += `// ${wrapperName} implements ${goUnionName}\n`;
      result += `type ${wrapperName} struct {\n`;
      result += `\tvalue string\n`;
      result += `}\n\n`;

      result += `func New${wrapperName}() *${wrapperName} {\n`;
      result += `\treturn &${wrapperName}{value: "${literal}"}\n`;
      result += `}\n\n`;

      result += `func (u *${wrapperName}) Is${goUnionName}() bool { return true }\n`;
      result += `func (u *${wrapperName}) Value() interface{} { return u.value }\n\n`;
    } else {
      // Handle type references
      const wrapperName = `${goUnionName}${toGoTypeName(cleanType)}`;

      // Map TypeSpec types to Go types
      const goType = mapTypeSpecToGo(cleanType);

      result += `// ${wrapperName} implements ${goUnionName}\n`;
      result += `type ${wrapperName} struct {\n`;
      result += `\tData ${goType} \`json:"value"\`\n`;
      result += `}\n\n`;

      result += `func New${wrapperName}(value ${goType}) *${wrapperName} {\n`;
      result += `\treturn &${wrapperName}{Data: value}\n`;
      result += `}\n\n`;

      result += `func (u *${wrapperName}) Is${goUnionName}() bool { return true }\n`;
      result += `func (u *${wrapperName}) Value() interface{} { return u.Data }\n\n`;
    }
  }

  return result;
}

function mapTypeSpecToGo(typeName: string): string {
  // Handle arrays first
  if (typeName.endsWith('[]')) {
    const baseType = typeName.slice(0, -2);
    const mappedBase = mapTypeSpecToGo(baseType);
    return `[]${mappedBase}`;
  }

  switch (typeName) {
    case 'string':
      return 'string';
    case 'int32':
      return 'int32';
    case 'int64':
      return 'int64';
    case 'float32':
      return 'float32';
    case 'float64':
      return 'float64';
    case 'boolean':
      return 'bool';
    default:
      // Keep as-is for custom types
      return typeName;
  }
}
