// Unit tests for type mapping
import { mapTypeSpecTypeToGo } from '../../src/core/type-mapper';

describe('TypeSpec to Go Type Mapping', () => {
  describe('Basic Types', () => {
    const basicTypeTests = [
      { input: 'string', expected: 'string' },
      { input: 'int32', expected: 'int32' },
      { input: 'int64', expected: 'int64' },
      { input: 'boolean', expected: 'bool' },
      { input: 'float64', expected: 'float64' },
    ];

    basicTypeTests.forEach(({ input, expected }) => {
      test(`should map ${input} to ${expected}`, () => {
        expect(mapTypeSpecTypeToGo(input)).toBe(expected);
      });
    });
  });

  describe('Array Types', () => {
    test('should map array types', () => {
      expect(mapTypeSpecTypeToGo('string[]')).toBe('[]string');
      expect(mapTypeSpecTypeToGo('int32[]')).toBe('[]int32');
    });

    test('should handle nested arrays', () => {
      expect(mapTypeSpecTypeToGo('User[]')).toBe('[]User');
    });
  });

  describe('Map Types', () => {
    test('should map Record types to Go maps', () => {
      expect(mapTypeSpecTypeToGo('Record<string, int32>')).toBe('map[string]int32');
      expect(mapTypeSpecTypeToGo('Record<string, string>')).toBe('map[string]string');
    });
  });

  describe('Custom Types', () => {
    test('should handle enum types', () => {
      const knownEnums = ['Status', 'Priority'];
      expect(mapTypeSpecTypeToGo('Status', knownEnums)).toBe('Status');
      expect(mapTypeSpecTypeToGo('Priority', knownEnums)).toBe('Priority');
    });

    test('should handle unknown custom types', () => {
      expect(mapTypeSpecTypeToGo('CustomType')).toBe('CustomType');
    });
  });
});