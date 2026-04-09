import {
  ParsedTypeSpec,
  ModelDef,
  EnumDef,
  InterfaceDef,
  UnionDef,
  FieldDef,
  MethodDef,
  DecoratorInfo,
  NamespaceDef,
} from '../types';

/**
 * Simple TypeSpec parser using regex
 *
 */
export function parseTypeSpecFile(content: string): ParsedTypeSpec {
  const result: ParsedTypeSpec = {
    models: [],
    enums: [],
    interfaces: [],
    unions: [],
    namespaces: [],
    globalItems: {
      models: [],
      enums: [],
      interfaces: [],
      unions: []
    }
  };

  // First, parse namespaces
  result.namespaces = parseNamespaces(content);

  // Then parse global items (items not in any namespace)
  const globalContent = extractGlobalContent(content);
  result.globalItems.enums = parseEnums(globalContent);
  result.globalItems.unions = parseUnions(globalContent);
  result.globalItems.interfaces = parseInterfaces(globalContent);
  result.globalItems.models = parseModels(globalContent);

  // For backward compatibility, also populate the root arrays with all items
  result.enums = [...result.globalItems.enums, ...result.namespaces.flatMap(ns => ns.enums)];
  result.unions = [...result.globalItems.unions, ...result.namespaces.flatMap(ns => ns.unions)];
  result.interfaces = [...result.globalItems.interfaces, ...result.namespaces.flatMap(ns => ns.interfaces)];
  result.models = [...result.globalItems.models, ...result.namespaces.flatMap(ns => ns.models)];

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

  // Split the content into individual method blocks
  // Look for patterns like: @decorator methodName( ... ): ReturnType;
  const methodBlocks = extractMethodBlocks(content);

  for (const block of methodBlocks) {
    const methodMatch = block.match(/^((?:@\w+(?:\([^)]*\))?\s*)*)\s*(\w+)\s*\(([\s\S]*?)\):\s*(\w+(?:\[\])?)\s*;?\s*$/);
    if (methodMatch) {
      const decoratorsString = methodMatch[1].trim();
      const name = methodMatch[2];
      const paramsString = methodMatch[3].trim();
      const returnType = methodMatch[4];

      const params = parseParams(paramsString);
      const httpMethod = parseHttpMethodDecorator(decoratorsString);

      methods.push({ name, params, returnType, httpMethod });
    }
  }

  return methods;
}

function extractMethodBlocks(content: string): string[] {
  const blocks: string[] = [];
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  let currentBlock = '';
  let inMethod = false;
  let braceDepth = 0;
  let parenDepth = 0;

  for (const line of lines) {
    // Count parentheses and braces to track method boundaries
    for (const char of line) {
      if (char === '(') parenDepth++;
      if (char === ')') parenDepth--;
      if (char === '{') braceDepth++;
      if (char === '}') braceDepth--;
    }

    // Start of a new method (decorator or method name)
    if (!inMethod && (line.startsWith('@') || /^\w+\s*\(/.test(line))) {
      inMethod = true;
      currentBlock = line;
    }
    // Continue building current method
    else if (inMethod) {
      currentBlock += '\n' + line;
    }

    // End of method (semicolon and balanced parens)
    if (inMethod && line.includes(';') && parenDepth === 0 && braceDepth === 0) {
      blocks.push(currentBlock.trim());
      currentBlock = '';
      inMethod = false;
    }
  }

  // Handle any remaining block
  if (currentBlock.trim()) {
    blocks.push(currentBlock.trim());
  }

  return blocks;
}

function parseParams(paramsString: string) {
  const params = [];
  if (paramsString) {
    // Clean up multiline parameters by removing extra whitespace
    const cleanedParams = paramsString.replace(/\s+/g, ' ').trim();

    // Split by comma, but be careful with decorators that might contain commas
    const paramPairs = splitParams(cleanedParams);

    for (const paramPair of paramPairs) {
      const trimmed = paramPair.trim();

      // Enhanced regex to capture decorator, name, and type - handle optional params
      const paramMatch = trimmed.match(/(@\w+(?:\([^)]*\))?\s+)?(\w+\??):?\s*(\w+(?:\[\])?)\??/);
      if (paramMatch) {
        const decoratorString = paramMatch[1]?.trim();
        const nameWithOptional = paramMatch[2];
        const type = paramMatch[3];

        // Extract parameter name and check if optional
        const isOptional = nameWithOptional.includes('?') || trimmed.includes('?:') || trimmed.endsWith('?');
        const name = nameWithOptional.replace('?', '');

        const decorator = parseParameterDecorator(decoratorString);
        params.push({ name, type, decorator, optional: isOptional });
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

// Helper function to split parameters while respecting decorator syntax
function splitParams(paramsString: string): string[] {
  const params: string[] = [];
  let current = '';
  let parenDepth = 0;
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < paramsString.length; i++) {
    const char = paramsString[i];

    if (!inString) {
      if (char === '"' || char === "'") {
        inString = true;
        stringChar = char;
      } else if (char === '(') {
        parenDepth++;
      } else if (char === ')') {
        parenDepth--;
      } else if (char === ',' && parenDepth === 0) {
        params.push(current.trim());
        current = '';
        continue;
      }
    } else {
      if (char === stringChar && paramsString[i - 1] !== '\\') {
        inString = false;
        stringChar = '';
      }
    }

    current += char;
  }

  if (current.trim()) {
    params.push(current.trim());
  }

  return params;
}

// Parse HTTP method decorators (@get, @post, etc.)
function parseHttpMethodDecorator(decoratorsString: string): string | undefined {
  if (!decoratorsString) return undefined;

  const httpMethods = ['get', 'post', 'put', 'delete', 'patch'];
  for (const method of httpMethods) {
    if (decoratorsString.includes(`@${method}`)) {
      return method.toUpperCase();
    }
  }
  return undefined;
}

// Parse parameter decorators (@header, @query, @path, @body)
function parseParameterDecorator(decoratorString: string): DecoratorInfo | undefined {
  if (!decoratorString) return undefined;

  // Handle @header, @query, @path, @body with optional custom names
  const decoratorMatch = decoratorString.match(/@(header|query|path|body)(?:\("([^"]+)"\))?/);
  if (decoratorMatch) {
    return {
      type: decoratorMatch[1] as 'header' | 'query' | 'path' | 'body',
      name: decoratorMatch[2] // Custom name if provided
    };
  }

  return undefined;
}

// Parse namespace blocks with proper brace matching
function parseNamespaces(content: string): NamespaceDef[] {
  const namespaces: NamespaceDef[] = [];
  const namespaceStartRegex = /namespace\s+(\w+)\s*\{/g;

  let match;
  while ((match = namespaceStartRegex.exec(content)) !== null) {
    const namespaceName = match[1];
    const namespaceStartIndex = match.index + match[0].length;

    // Find the matching closing brace using brace counting
    const namespaceContent = extractBracedContent(content, namespaceStartIndex);

    if (namespaceContent !== null) {
      const namespace: NamespaceDef = {
        namespaceName,
        models: parseModels(namespaceContent),
        enums: parseEnums(namespaceContent),
        interfaces: parseInterfaces(namespaceContent),
        unions: parseUnions(namespaceContent),
      };

      namespaces.push(namespace);
    }
  }

  return namespaces;
}

// Extract content between balanced braces
function extractBracedContent(content: string, startIndex: number): string | null {
  let braceCount = 1;
  let currentIndex = startIndex;

  while (currentIndex < content.length && braceCount > 0) {
    const char = content[currentIndex];
    if (char === '{') {
      braceCount++;
    } else if (char === '}') {
      braceCount--;
    }
    currentIndex++;
  }

  if (braceCount === 0) {
    // Return content between braces (excluding the closing brace)
    return content.substring(startIndex, currentIndex - 1);
  }

  return null; // Unmatched braces
}

// Extract content that's not inside any namespace
function extractGlobalContent(content: string): string {
  let result = '';
  let currentIndex = 0;
  const namespaceStartRegex = /namespace\s+\w+\s*\{/g;

  let match;
  while ((match = namespaceStartRegex.exec(content)) !== null) {
    // Add content before this namespace
    result += content.substring(currentIndex, match.index);

    // Skip the entire namespace block
    const namespaceStartIndex = match.index + match[0].length;
    const namespaceContent = extractBracedContent(content, namespaceStartIndex);

    if (namespaceContent !== null) {
      // Move past the entire namespace block (including closing brace)
      currentIndex = namespaceStartIndex + namespaceContent.length + 1;
    } else {
      // If brace matching fails, just skip the match
      currentIndex = match.index + match[0].length;
    }
  }

  // Add any remaining content after the last namespace
  result += content.substring(currentIndex);

  return result;
}
