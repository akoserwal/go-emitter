// E-commerce API Example
// Demonstrates: Complex models, enums, interfaces, validation

enum OrderStatus {
  Pending,
  Processing,
  Shipped,
  Delivered,
  Cancelled
}

enum PaymentMethod {
  CreditCard,
  PayPal,
  BankTransfer,
  Crypto
}

model Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

model Product {
  id: int64;
  name: string;
  description?: string;
  price: float64;
  category: string;
  inStock: boolean;
  tags?: string[];
  metadata?: Record<string, string>;
}

model OrderItem {
  productId: int64;
  quantity: int32;
  price: float64;
  product?: Product;
}

model Order {
  id: int64;
  userId: int64;
  items: OrderItem[];
  status: OrderStatus;
  total: float64;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

model CreateOrderRequest {
  userId: int64;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  notes?: string;
}

model UpdateOrderRequest {
  status?: OrderStatus;
  notes?: string;
}

interface OrderService {
  getOrder(id: int64): Order;
  createOrder(request: CreateOrderRequest): Order;
  updateOrder(id: int64, request: UpdateOrderRequest): Order;
  listOrders(userId?: int64, status?: OrderStatus): Order[];
  cancelOrder(id: int64): void;
}

interface ProductService {
  getProduct(id: int64): Product;
  listProducts(category?: string, inStock?: boolean): Product[];
  searchProducts(query: string): Product[];
}