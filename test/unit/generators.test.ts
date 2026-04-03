// Unit tests for code generators
import { generateGoEnum } from '../../src/generators/go-enum';
import { generateGoStruct } from '../../src/generators/go-struct';
import { EnumDef, ModelDef, EmitterConfig } from '../../src/types';

describe('Go Code Generators', () => {
  describe('Enum Generator', () => {
    test('should generate basic enum', () => {
      const enumDef: EnumDef = {
        enumName: 'Status',
        values: ['Active', 'Inactive']
      };

      const result = generateGoEnum(enumDef);

      expect(result).toContain('type Status int');
      expect(result).toContain('StatusActive Status = iota');
      expect(result).toContain('StatusInactive');
      expect(result).toContain('func (e Status) String() string');
    });
  });

  describe('Struct Generator', () => {
    const basicConfig: EmitterConfig = {
      packageName: 'test',
      imports: [],
      generateValidation: false,
      generateBuilders: false,
      generateJSON: false,
      generateHTTPClient: false,
      generateTests: false,
      generateDocs: false,
      lintGo: false,
    };

    test('should generate basic struct', () => {
      const modelDef: ModelDef = {
        modelName: 'User',
        fields: [
          { name: 'id', type: 'int64', optional: false },
          { name: 'name', type: 'string', optional: false }
        ]
      };

      const result = generateGoStruct(modelDef, [], basicConfig);

      expect(result).toContain('type User struct');
      expect(result).toContain('Id int64 `json:"id"`');
      expect(result).toContain('Name string `json:"name"`');
      expect(result).toContain('func NewUser(id int64, name string) *User');
    });

    test('should handle optional fields', () => {
      const modelDef: ModelDef = {
        modelName: 'User',
        fields: [
          { name: 'name', type: 'string', optional: false },
          { name: 'email', type: 'string', optional: true }
        ]
      };

      const result = generateGoStruct(modelDef, [], basicConfig);

      expect(result).toContain('Email *string `json:"email"`');
    });

    test('should generate validation when enabled', () => {
      const configWithValidation = { ...basicConfig, generateValidation: true };
      const modelDef: ModelDef = {
        modelName: 'User',
        fields: [
          { name: 'name', type: 'string', optional: false }
        ]
      };

      const result = generateGoStruct(modelDef, [], configWithValidation);

      expect(result).toContain('func (m *User) Validate() error');
      expect(result).toContain('if m.Name == ""');
    });
  });
});