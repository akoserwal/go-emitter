/**
 * TypeSpec to Go type mapping
 * Simple and transparent - no magic
 */

/**
 * Convert TypeSpec field names to Go naming conventions
 * Examples: id -> ID, userId -> UserID, productId -> ProductID
 */
export function toGoFieldName(fieldName: string): string {
  // Handle common ID patterns
  if (fieldName === 'id') return 'ID';
  if (fieldName.endsWith('Id')) {
    const prefix = fieldName.slice(0, -2);
    return prefix.charAt(0).toUpperCase() + prefix.slice(1) + 'ID';
  }

  // Handle Go reserved keywords
  const goKeywords = ['type', 'interface', 'struct', 'func', 'var', 'const', 'package', 'import'];
  if (goKeywords.includes(fieldName.toLowerCase())) {
    return fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + 'Field';
  }

  // Standard field name conversion
  return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
}

/**
 * Convert TypeSpec parameter names to Go naming conventions
 * Handles reserved keywords differently for parameters
 */
export function toGoParamName(paramName: string): string {
  // Handle Go reserved keywords for parameters
  const goKeywords = ['type', 'interface', 'struct', 'func', 'var', 'const', 'package', 'import'];
  if (goKeywords.includes(paramName.toLowerCase())) {
    return paramName + 'Param';
  }
  return paramName;
}

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
    utcDateTime: 'time.Time',
    bytes: '[]byte',
  };

  // Check if it's a known enum or custom type
  if (knownEnums.includes(typespecType)) {
    return typespecType;
  }

  return typeMap[typespecType] || typespecType;
}
