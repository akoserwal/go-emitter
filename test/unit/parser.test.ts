// Unit tests for the core parser
// Test each component in isolation

import { parseTypeSpecFile } from '../../src/core/parser';
import { ParsedTypeSpec } from '../../src/types';

describe('TypeSpec Parser', () => {
  describe('Basic Model Parsing', () => {
    test('should parse simple model', () => {
      const input = `model User { id: int64; name: string; }`;

      const result = parseTypeSpecFile(input);

      expect(result.models).toHaveLength(1);
      expect(result.models[0].modelName).toBe('User');
      expect(result.models[0].fields).toHaveLength(2);
      expect(result.models[0].fields[0]).toEqual({
        name: 'id',
        type: 'int64',
        optional: false
      });
    });

    test('should parse optional fields', () => {
      const input = `model User { name: string; email?: string; }`;

      const result = parseTypeSpecFile(input);

      const fields = result.models[0].fields;
      expect(fields[0].optional).toBe(false);
      expect(fields[1].optional).toBe(true);
    });

    test('should parse array fields', () => {
      const input = `model User { tags: string[]; }`;

      const result = parseTypeSpecFile(input);

      const field = result.models[0].fields[0];
      expect(field.type).toBe('string[]');
    });
  });

  describe('Enum Parsing', () => {
    test('should parse simple enum', () => {
      const input = `enum Status { Active, Inactive }`;

      const result = parseTypeSpecFile(input);

      expect(result.enums).toHaveLength(1);
      expect(result.enums[0].enumName).toBe('Status');
      expect(result.enums[0].values).toEqual(['Active', 'Inactive']);
    });
  });

  describe('Interface Parsing', () => {
    test('should parse simple interface', () => {
      const input = `interface UserService { getUser(id: int64): User; }`;

      const result = parseTypeSpecFile(input);

      expect(result.interfaces).toHaveLength(1);
      expect(result.interfaces[0].interfaceName).toBe('UserService');
      expect(result.interfaces[0].methods).toHaveLength(1);
      expect(result.interfaces[0].methods[0].name).toBe('getUser');
    });
  });

  describe('Complex Parsing', () => {
    test('should parse multiple types', () => {
      const input = `
        enum Status { Active, Inactive }
        model User { id: int64; name: string; status: Status; }
        interface UserService { getUser(id: int64): User; }
      `;

      const result = parseTypeSpecFile(input);

      expect(result.enums).toHaveLength(1);
      expect(result.models).toHaveLength(1);
      expect(result.interfaces).toHaveLength(1);
    });
  });
});