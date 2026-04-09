// Phase 1 validation: Basic proof of concept
// Tests that validate the simplest working version

import { TypeSpecGoEmitter } from '../../src/core/emitter';
import { EmitterConfig } from '../../src/types';

describe('Phase 1: Proof of Concept', () => {
  const phase1Config: EmitterConfig = {
    packageName: 'main',
    imports: [],
    generateValidation: false,
    generateBuilders: false,
    generateJSON: false,
    generateHTTPClient: false,
    generateTests: false,
    generateDocs: false,
    lintGo: false,
  };

  test('should handle the original simple case', async () => {
    // The very first example that proved the concept works
    const typespecInput = `model User {
  name: string;
  age: int32;
  email: string;
}`;

    const emitter = new TypeSpecGoEmitter(phase1Config);
    const result = await emitter.generateFromString(typespecInput);

    expect(result.mainCode).toContain('package main');
    expect(result.mainCode).toContain('type User struct');
    expect(result.mainCode).toContain('Name string `json:"name"`');
    expect(result.mainCode).toContain('Age int32 `json:"age"`');
    expect(result.mainCode).toContain('Email string `json:"email"`');

    // Should have constructor
    expect(result.mainCode).toContain('func NewUser(name string, age int32, email string) *User');
  });

  test('should handle basic types correctly', async () => {
    const typespecInput = `model Product {
  id: int64;
  name: string;
  price: float64;
  available: boolean;
}`;

    const emitter = new TypeSpecGoEmitter(phase1Config);
    const result = await emitter.generateFromString(typespecInput);

    expect(result.mainCode).toContain('ID int64');
    expect(result.mainCode).toContain('Name string');
    expect(result.mainCode).toContain('Price float64');
    expect(result.mainCode).toContain('Available bool');
  });
});