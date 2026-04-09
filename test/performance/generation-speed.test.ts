// Performance tests for code generation
import { TypeSpecGoEmitter } from '../../src/core/emitter';
import { EmitterConfig } from '../../src/types';

describe('Generation Performance', () => {
  const performanceConfig: EmitterConfig = {
    packageName: 'perftest',
    imports: ['context', 'fmt', 'encoding/json', 'net/http'],
    generateValidation: true,
    generateBuilders: true,
    generateJSON: true,
    generateHTTPClient: true,
    generateTests: false,
    generateDocs: false,
    lintGo: false,
  };

  test('should generate large schema within reasonable time', async () => {
    // Create a large TypeSpec with many models
    const largeTypeSpec = generateLargeTypeSpec(100); // 100 models

    const emitter = new TypeSpecGoEmitter(performanceConfig);

    const startTime = process.hrtime.bigint();
    const result = await emitter.generateFromString(largeTypeSpec);
    const endTime = process.hrtime.bigint();

    const durationMs = Number(endTime - startTime) / 1_000_000;

    // Should generate 100 models in under 2 seconds (with string array optimization)
    expect(durationMs).toBeLessThan(2000);

    // Verify it actually generated content
    expect(result.mainCode).toContain('package perftest');
    expect(result.mainCode.length).toBeGreaterThan(10000); // Should be substantial

    console.log(`Generated ${largeTypeSpec.split('model ').length - 1} models in ${durationMs.toFixed(2)}ms`);
  });

  test('should handle complex nested structures efficiently', async () => {
    const complexTypeSpec = `
    model Address {
      street: string;
      city: string;
      country: string;
    }

    model Contact {
      email?: string;
      phone?: string;
      address: Address;
    }

    model User {
      id: int64;
      name: string;
      contact: Contact;
      roles: string[];
      metadata: Record<string>;
      isActive: boolean;
    }

    model Order {
      id: int64;
      user: User;
      items: OrderItem[];
      total: float64;
      status: OrderStatus;
    }

    model OrderItem {
      productId: int64;
      name: string;
      quantity: int32;
      price: float64;
    }

    enum OrderStatus {
      Pending,
      Confirmed,
      Shipped,
      Delivered,
      Cancelled
    }

    interface UserService {
      getUser(id: int64): User;
      createUser(user: User): User;
      listUsers(): User[];
    }

    interface OrderService {
      getOrder(id: int64): Order;
      createOrder(order: Order): Order;
      listOrders(): Order[];
    }
    `;

    const emitter = new TypeSpecGoEmitter(performanceConfig);

    const startTime = process.hrtime.bigint();
    const result = await emitter.generateFromString(complexTypeSpec);
    const endTime = process.hrtime.bigint();

    const durationMs = Number(endTime - startTime) / 1_000_000;

    // Complex nested structures should still be fast
    expect(durationMs).toBeLessThan(500);

    // Verify comprehensive generation
    expect(result.mainCode).toContain('type User struct');
    expect(result.mainCode).toContain('type Order struct');
    expect(result.mainCode).toContain('type UserService interface');
    expect(result.mainCode).toContain('type OrderStatus int');

    console.log(`Generated complex nested structures in ${durationMs.toFixed(2)}ms`);
  });
});

function generateLargeTypeSpec(modelCount: number): string {
  const models: string[] = [];

  for (let i = 0; i < modelCount; i++) {
    models.push(`
    model Model${i} {
      id: int64;
      name: string;
      description?: string;
      value: float64;
      isActive: boolean;
      tags: string[];
      metadata: Record<string>;
      createdAt: utcDateTime;
      updatedAt?: utcDateTime;
    }`);
  }

  return models.join('\n');
}