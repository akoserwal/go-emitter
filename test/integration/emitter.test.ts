// Integration tests for the complete emitter
import { TypeSpecGoEmitter } from '../../src/core/emitter';
import { EmitterConfig } from '../../src/types';

describe('TypeSpec Go Emitter Integration', () => {
  const basicConfig: EmitterConfig = {
    packageName: 'test',
    imports: ['fmt'],
    generateValidation: true,
    generateBuilders: false,
    generateJSON: true,
    generateHTTPClient: false,
    generateTests: false,
    generateDocs: false,
    lintGo: false,
  };

  test('should generate complete Go code from TypeSpec', async () => {
    const typespecInput = `
      enum Status { Active, Inactive }

      model User {
        id: int64;
        name: string;
        email?: string;
        status: Status;
      }

      interface UserService {
        getUser(id: int64): User;
      }
    `;

    const emitter = new TypeSpecGoEmitter(basicConfig);
    const result = await emitter.generateFromString(typespecInput);

    // Check package header
    expect(result.mainCode).toContain('package test');
    expect(result.mainCode).toContain('import "fmt"');

    // Check enum generation
    expect(result.mainCode).toContain('type Status int');
    expect(result.mainCode).toContain('StatusActive Status = iota');

    // Check struct generation
    expect(result.mainCode).toContain('type User struct');
    expect(result.mainCode).toContain('Status Status `json:"status"`');

    // Check interface generation
    expect(result.mainCode).toContain('type UserService interface');
    expect(result.mainCode).toContain('GetUser(ctx context.Context, id int64)');

    // Check validation (enabled in config)
    expect(result.mainCode).toContain('func (m *User) Validate() error');

    // Check JSON methods (enabled in config)
    expect(result.mainCode).toContain('func (m *User) ToJSON()');
  });

  test('should handle HTTP client generation', async () => {
    const configWithHTTP = { ...basicConfig, generateHTTPClient: true };
    const typespecInput = `
      interface UserService {
        getUser(id: int64): User;
      }
    `;

    const emitter = new TypeSpecGoEmitter(configWithHTTP);
    const result = await emitter.generateFromString(typespecInput);

    expect(result.mainCode).toContain('type UserServiceClient struct');
    expect(result.mainCode).toContain('func NewUserServiceClient(baseURL string)');
  });

  test('should handle empty input gracefully', async () => {
    const emitter = new TypeSpecGoEmitter(basicConfig);
    const result = await emitter.generateFromString('');

    expect(result.mainCode).toContain('package test');
    expect(result.mainCode).toContain('import "fmt"');
  });
});