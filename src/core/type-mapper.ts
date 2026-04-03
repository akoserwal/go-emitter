/**
 * TypeSpec to Go type mapping
 * Simple and transparent - no magic
 */
export function mapTypeSpecTypeToGo(typespecType: string, knownEnums: string[] = []): string {
  // Handle arrays first
  if (typespecType.endsWith('[]')) {
    const baseType = typespecType.slice(0, -2);
    const goBaseType = mapTypeSpecTypeToGo(baseType, knownEnums);
    return `[]${goBaseType}`;
  }

  // Handle maps like Record<string, int32>
  const recordMatch = typespecType.match(/^Record<(\w+),\s*(\w+)>$/);
  if (recordMatch) {
    const keyType = mapTypeSpecTypeToGo(recordMatch[1], knownEnums);
    const valueType = mapTypeSpecTypeToGo(recordMatch[2], knownEnums);
    return `map[${keyType}]${valueType}`;
  }

  // Basic type mapping
  const typeMap: { [key: string]: string } = {
    string: 'string',
    int32: 'int32',
    int64: 'int64',
    float32: 'float32',
    float64: 'float64',
    boolean: 'bool',
  };

  // Check if it's a known enum or custom type
  if (knownEnums.includes(typespecType)) {
    return typespecType;
  }

  return typeMap[typespecType] || typespecType;
}
