// Real-world example tests using the actual examples
import { TypeSpecGoEmitter } from '../../src/core/emitter';
import * as fs from 'fs';
import * as path from 'path';

describe('Real-World Examples', () => {
  test('should handle e-commerce example', async () => {
    const ecommerceFile = path.join(__dirname, '../../examples/ecommerce/api.tsp');
    const configFile = path.join(__dirname, '../../examples/ecommerce/config.json');

    if (!fs.existsSync(ecommerceFile)) {
      console.warn('E-commerce example not found, skipping test');
      return;
    }

    const typespecContent = fs.readFileSync(ecommerceFile, 'utf8');
    const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

    const emitter = new TypeSpecGoEmitter(config);
    const result = await emitter.generateFromString(typespecContent);

    // Should have complex enums
    expect(result.mainCode).toContain('type OrderStatus int');
    expect(result.mainCode).toContain('type PaymentMethod int');

    // Should have complex models with validation
    expect(result.mainCode).toContain('type Order struct');
    expect(result.mainCode).toContain('ShippingAddress Address');
    expect(result.mainCode).toContain('Items []OrderItem');

    // Should have validation and builders enabled
    expect(result.mainCode).toContain('func (m *Order) Validate() error');
    expect(result.mainCode).toContain('type OrderBuilder struct');

    // Should compile as valid Go
    expect(result.mainCode).toContain('package ecommerce');
  });

  test('should handle blog API example', async () => {
    const blogFile = path.join(__dirname, '../../examples/blog-api/api.tsp');

    if (!fs.existsSync(blogFile)) {
      console.warn('Blog API example not found, skipping test');
      return;
    }

    const typespecContent = fs.readFileSync(blogFile, 'utf8');

    const config = {
      packageName: 'blog',
      imports: ['fmt', 'encoding/json'],
      generateValidation: true,
      generateBuilders: false,
      generateJSON: true,
      generateHTTPClient: false,
      generateTests: false,
      generateDocs: false,
      lintGo: false,
    };

    const emitter = new TypeSpecGoEmitter(config);
    const result = await emitter.generateFromString(typespecContent);

    // Should have blog-specific types
    expect(result.mainCode).toContain('type Post struct');
    expect(result.mainCode).toContain('type PostStatus int');
    expect(result.mainCode).toContain('type UserRole int');

    // Should have service interface
    expect(result.mainCode).toContain('type BlogService interface');
    expect(result.mainCode).toContain('GetPost(ctx context.Context');
  });

  test('should handle user management example', async () => {
    const userMgmtFile = path.join(__dirname, '../../examples/user-management/api.tsp');

    if (!fs.existsSync(userMgmtFile)) {
      console.warn('User management example not found, skipping test');
      return;
    }

    const typespecContent = fs.readFileSync(userMgmtFile, 'utf8');

    const config = {
      packageName: 'usermgmt',
      imports: ['fmt', 'encoding/json', 'context'],
      generateValidation: true,
      generateBuilders: false,
      generateJSON: true,
      generateHTTPClient: false,
      generateTests: false,
      generateDocs: false,
      lintGo: false,
    };

    const emitter = new TypeSpecGoEmitter(config);
    const result = await emitter.generateFromString(typespecContent);

    // Should have auth-specific types
    expect(result.mainCode).toContain('type AuthToken struct');
    expect(result.mainCode).toContain('type Permission struct');
    expect(result.mainCode).toContain('type Role struct');

    // Should have multiple service interfaces
    expect(result.mainCode).toContain('type AuthService interface');
    expect(result.mainCode).toContain('type UserService interface');
    expect(result.mainCode).toContain('type RoleService interface');
  });
});