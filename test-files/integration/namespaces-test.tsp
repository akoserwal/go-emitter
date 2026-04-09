// Namespace Test Cases for Phase 5.1

namespace UserAPI {
  model User {
    id: int64;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: utcDateTime;
  }

  enum UserRole {
    Admin,
    User,
    Guest
  }

  interface UserService {
    @get
    getUser(@path id: int64): User;

    @post
    createUser(@body user: CreateUserRequest): User;

    @put
    updateUser(@path id: int64, @body updates: UpdateUserRequest): User;

    @delete
    deleteUser(@path id: int64): void;
  }

  model CreateUserRequest {
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }

  model UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    role?: UserRole;
  }
}

namespace ProductAPI {
  model Product {
    id: int64;
    name: string;
    description?: string;
    price: float64;
    category: ProductCategory;
    inStock: boolean;
  }

  enum ProductCategory {
    Electronics,
    Clothing,
    Books,
    Home
  }

  interface ProductService {
    @get
    getProduct(@path id: int64): Product;

    @get
    listProducts(@query category?: ProductCategory): Product[];

    @post
    createProduct(@body product: CreateProductRequest): Product;
  }

  model CreateProductRequest {
    name: string;
    description?: string;
    price: float64;
    category: ProductCategory;
  }
}

namespace OrderAPI {
  // Cross-namespace references (future enhancement)
  model Order {
    id: int64;
    userId: int64;  // Reference to UserAPI.User.id
    productId: int64;  // Reference to ProductAPI.Product.id
    quantity: int32;
    total: float64;
    status: OrderStatus;
  }

  enum OrderStatus {
    Pending,
    Processing,
    Shipped,
    Delivered,
    Cancelled
  }

  interface OrderService {
    @get
    getOrder(@path id: int64): Order;

    @post
    createOrder(@body order: CreateOrderRequest): Order;
  }

  model CreateOrderRequest {
    userId: int64;
    productId: int64;
    quantity: int32;
  }
}

// Global namespace (no explicit namespace)
model GlobalConfig {
  apiVersion: string;
  environment: string;
}