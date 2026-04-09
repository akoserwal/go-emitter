// Phase 3 validation: Interfaces, HTTP clients, unions
// Tests that validate real-world features

import { TypeSpecGoEmitter } from '../../src/core/emitter';
import { EmitterConfig } from '../../src/types';

describe('Phase 3: Real-World Features', () => {
  const phase3Config: EmitterConfig = {
    packageName: 'client',
    imports: ['fmt', 'encoding/json', 'net/http', 'context'],
    generateValidation: true,
    generateBuilders: false,
    generateJSON: true,
    generateHTTPClient: true,
    generateTests: false,
    generateDocs: false,
    lintGo: false,
  };

  test('should generate interfaces with context', async () => {
    const typespecInput = `model User {
  id: int64;
  name: string;
}

interface UserService {
  getUser(id: int64): User;
  createUser(user: User): User;
  listUsers(): User[];
  deleteUser(id: int64): void;
}`;

    const emitter = new TypeSpecGoEmitter(phase3Config);
    const result = await emitter.generateFromString(typespecInput);

    expect(result.mainCode).toContain('type UserService interface');
    expect(result.mainCode).toContain('GetUser(ctx context.Context, id int64) (User, error)');
    expect(result.mainCode).toContain('CreateUser(ctx context.Context, user User) (User, error)');
    expect(result.mainCode).toContain('ListUsers(ctx context.Context) ([]User, error)');
    expect(result.mainCode).toContain('DeleteUser(ctx context.Context, id int64) error');
  });

  test('should generate HTTP clients', async () => {
    const typespecInput = `interface UserService {
  getUser(id: int64): User;
  createUser(user: User): User;
}`;

    const emitter = new TypeSpecGoEmitter(phase3Config);
    const result = await emitter.generateFromString(typespecInput);

    // Client struct
    expect(result.mainCode).toContain('type UserServiceClient struct');
    expect(result.mainCode).toContain('baseURL string');
    expect(result.mainCode).toContain('httpClient *http.Client');

    // Constructor
    expect(result.mainCode).toContain('func NewUserServiceClient(baseURL string) *UserServiceClient');

    // HTTP method implementations
    expect(result.mainCode).toContain('func (c *UserServiceClient) GetUser(ctx context.Context, id int64) (User, error)');
    expect(result.mainCode).toContain('func (c *UserServiceClient) CreateUser(ctx context.Context, user User) (User, error)');
  });

  test('should generate unions', async () => {
    const typespecInput = `model TextMessage {
  type: "text";
  content: string;
}

model ImageMessage {
  type: "image";
  url: string;
}

union Message {
  TextMessage,
  ImageMessage
}`;

    const emitter = new TypeSpecGoEmitter(phase3Config);
    const result = await emitter.generateFromString(typespecInput);

    expect(result.mainCode).toContain('type Message interface');
    expect(result.mainCode).toContain('IsMessage()');
    expect(result.mainCode).toContain('func (u *MessageTextMessage) IsMessage() bool');
    expect(result.mainCode).toContain('func (u *MessageImageMessage) IsMessage() bool');
  });

  test('should handle complex real-world example', async () => {
    const typespecInput = `enum Priority {
  Low,
  Medium,
  High,
  Critical
}

enum Status {
  Active,
  Inactive
}

model User {
  id: int64;
  name: string;
  email?: string;
  roles: string[];
  status: Status;
}

model Issue {
  id: int64;
  title: string;
  description?: string;
  priority: Priority;
  assignee?: User;
  tags?: string[];
}`;

    const emitter = new TypeSpecGoEmitter(phase3Config);
    const result = await emitter.generateFromString(typespecInput);

    // Should have all enums
    expect(result.mainCode).toContain('type Priority int');
    expect(result.mainCode).toContain('type Status int');

    // Should have complex structs with proper types
    expect(result.mainCode).toContain('Assignee *User `json:"assignee"`');
    expect(result.mainCode).toContain('Priority Priority `json:"priority"`');

    // Should have validation enabled
    expect(result.mainCode).toContain('func (m *User) Validate() error');
    expect(result.mainCode).toContain('func (m *Issue) Validate() error');

    // Should have JSON methods enabled
    expect(result.mainCode).toContain('func (m *User) ToJSON()');
    expect(result.mainCode).toContain('func (m *Issue) ToJSON()');
  });
});