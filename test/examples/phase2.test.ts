// Phase 2 validation: Arrays, optionals, enums
// Tests that validate incremental complexity

import { TypeSpecGoEmitter } from '../../src/core/emitter';
import { EmitterConfig } from '../../src/types';

describe('Phase 2: Incremental Complexity', () => {
  const phase2Config: EmitterConfig = {
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

  test('should handle arrays', async () => {
    const typespecInput = `model Blog {
  title: string;
  tags: string[];
  views: int32[];
}`;

    const emitter = new TypeSpecGoEmitter(phase2Config);
    const result = await emitter.generateFromString(typespecInput);

    expect(result.mainCode).toContain('Tags []string');
    expect(result.mainCode).toContain('Views []int32');
  });

  test('should handle optional fields', async () => {
    const typespecInput = `model Person {
  name: string;
  email?: string;
  age: int32;
  tags?: string[];
}`;

    const emitter = new TypeSpecGoEmitter(phase2Config);
    const result = await emitter.generateFromString(typespecInput);

    expect(result.mainCode).toContain('Email *string');
    expect(result.mainCode).toContain('Tags *[]string');

    // Constructor should only include required fields
    expect(result.mainCode).toContain('func NewPerson(name string, age int32) *Person');
  });

  test('should handle enums', async () => {
    const typespecInput = `enum Status {
  Active,
  Inactive,
  Pending
}

model Task {
  id: int32;
  title: string;
  status: Status;
}`;

    const emitter = new TypeSpecGoEmitter(phase2Config);
    const result = await emitter.generateFromString(typespecInput);

    // Enum generation
    expect(result.mainCode).toContain('type Status int');
    expect(result.mainCode).toContain('StatusActive Status = iota');
    expect(result.mainCode).toContain('StatusInactive');
    expect(result.mainCode).toContain('StatusPending');
    expect(result.mainCode).toContain('func (e Status) String() string');

    // Enum usage in struct
    expect(result.mainCode).toContain('Status Status `json:"status"`');
  });

  test('should handle maps', async () => {
    const typespecInput = `model Config {
  name: string;
  settings: Record<string, string>;
  counters: Record<string, int32>;
  flags?: Record<string, boolean>;
}`;

    const emitter = new TypeSpecGoEmitter(phase2Config);
    const result = await emitter.generateFromString(typespecInput);

    expect(result.mainCode).toContain('Settings map[string]string');
    expect(result.mainCode).toContain('Counters map[string]int32');
    expect(result.mainCode).toContain('Flags *map[string]bool');
  });
});