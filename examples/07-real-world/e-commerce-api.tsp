// Real-World E-commerce API Example
// Demonstrates complex real-world patterns

namespace ECommerceAPI {
  // Product Management
  enum ProductStatus {
    Active: "active",
    Inactive: "inactive",
    OutOfStock: "out_of_stock",
    Discontinued: "discontinued"
  }

  enum ProductCategory {
    Electronics: "electronics",
    Clothing: "clothing",
    Books: "books",
    Home: "home",
    Sports: "sports"
  }

  union ProductPrice {
    fixed: FixedPrice,
    tiered: TieredPrice,
    variable: VariablePrice
  }

  model FixedPrice {
    type: "fixed";
    amount: float64;
    currency: string;
  }

  model TieredPrice {
    type: "tiered";
    tiers: PriceTier[];
    currency: string;
  }

  model VariablePrice {
    type: "variable";
    basePrice: float64;
    modifiers: PriceModifier[];
    currency: string;
  }

  model PriceTier {
    minQuantity: int32;
    maxQuantity?: int32;
    price: float64;
  }

  model PriceModifier {
    name: string;
    type: string;
    value: float64;
    condition?: string;
  }

  model Product {
    id: int64;
    sku: string;
    name: string;
    description?: string;
    category: ProductCategory;
    status: ProductStatus;
    pricing: ProductPrice;
    inventory: ProductInventory;
    attributes: ProductAttributes;
    images: string[];
    tags: string[];
    weight?: float64;
    dimensions?: ProductDimensions;
    createdAt: utcDateTime;
    updatedAt?: utcDateTime;
  }

  model ProductInventory {
    available: int32;
    reserved: int32;
    reorderLevel: int32;
    supplier?: string;
    location?: string;
  }

  model ProductAttributes {
    brand?: string;
    color?: string;
    size?: string;
    material?: string;
    warranty?: string;
    custom: Record<string>;
  }

  model ProductDimensions {
    length: float64;
    width: float64;
    height: float64;
    unit: string;
  }

  // Order Management
  enum OrderStatus {
    Pending: "pending",
    Confirmed: "confirmed",
    Processing: "processing",
    Shipped: "shipped",
    Delivered: "delivered",
    Cancelled: "cancelled",
    Refunded: "refunded"
  }

  enum PaymentStatus {
    Pending: "pending",
    Authorized: "authorized",
    Captured: "captured",
    Failed: "failed",
    Refunded: "refunded"
  }

  union PaymentMethod {
    card: CreditCardPayment,
    bank: BankTransferPayment,
    digital: DigitalWalletPayment
  }

  model CreditCardPayment {
    type: "card";
    last4: string;
    brand: string;
    expiryMonth: int32;
    expiryYear: int32;
    cardholderName: string;
  }

  model BankTransferPayment {
    type: "bank";
    accountNumber: string;
    routingNumber: string;
    bankName: string;
  }

  model DigitalWalletPayment {
    type: "digital";
    provider: string;
    accountId: string;
  }

  model Order {
    id: int64;
    orderNumber: string;
    customerId: int64;
    items: OrderItem[];
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod?: PaymentMethod;
    shippingAddress: Address;
    billingAddress?: Address;
    totals: OrderTotals;
    discounts?: Discount[];
    shipping?: ShippingInfo;
    notes?: string;
    createdAt: utcDateTime;
    updatedAt?: utcDateTime;
    shippedAt?: utcDateTime;
    deliveredAt?: utcDateTime;
  }

  model OrderItem {
    productId: int64;
    sku: string;
    name: string;
    quantity: int32;
    unitPrice: float64;
    totalPrice: float64;
    discounts?: Discount[];
    attributes?: Record<string>;
  }

  model Address {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    type?: string;
    isDefault?: boolean;
  }

  model OrderTotals {
    subtotal: float64;
    tax: float64;
    shipping: float64;
    discounts: float64;
    total: float64;
    currency: string;
  }

  model Discount {
    id: int64;
    code?: string;
    name: string;
    type: string;
    amount: float64;
    appliedTo: string;
  }

  model ShippingInfo {
    carrier: string;
    service: string;
    trackingNumber?: string;
    estimatedDelivery?: utcDateTime;
    cost: float64;
  }

  // API Interfaces with full decorator support
  interface ProductAPI {
    @get
    getProduct(@path productId: int64): Product;

    @get
    listProducts(
      @query category?: ProductCategory,
      @query status?: ProductStatus,
      @query("search") query?: string,
      @query page?: int32,
      @query limit?: int32
    ): ProductListResponse;

    @post
    createProduct(
      @header("Authorization") token: string,
      @body product: CreateProductRequest
    ): Product;

    @put
    updateProduct(
      @path productId: int64,
      @header("Authorization") token: string,
      @body updates: UpdateProductRequest
    ): Product;

    @delete
    deleteProduct(
      @path productId: int64,
      @header("Authorization") token: string
    ): void;
  }

  interface OrderAPI {
    @get
    getOrder(@path orderId: int64): Order;

    @get
    getCustomerOrders(
      @path customerId: int64,
      @query status?: OrderStatus,
      @query page?: int32,
      @query limit?: int32
    ): OrderListResponse;

    @post
    createOrder(
      @header("Authorization") token: string,
      @body order: CreateOrderRequest
    ): Order;

    @patch
    updateOrderStatus(
      @path orderId: int64,
      @header("Authorization") token: string,
      @body update: OrderStatusUpdate
    ): Order;

    @post
    processPayment(
      @path orderId: int64,
      @header("Authorization") token: string,
      @body payment: ProcessPaymentRequest
    ): PaymentResult;
  }

  // Request/Response models
  model ProductListResponse {
    products: Product[];
    pagination: PaginationInfo;
    filters: FilterInfo;
  }

  model OrderListResponse {
    orders: Order[];
    pagination: PaginationInfo;
    summary: OrderSummary;
  }

  model PaginationInfo {
    page: int32;
    limit: int32;
    total: int64;
    hasNext: boolean;
    hasPrev: boolean;
  }

  model FilterInfo {
    category?: ProductCategory;
    status?: ProductStatus;
    priceMin?: float64;
    priceMax?: float64;
    inStock?: boolean;
  }

  model OrderSummary {
    totalOrders: int64;
    totalValue: float64;
    averageOrderValue: float64;
    currency: string;
  }

  model CreateProductRequest {
    sku: string;
    name: string;
    description?: string;
    category: ProductCategory;
    pricing: ProductPrice;
    inventory: ProductInventory;
    attributes?: ProductAttributes;
    images?: string[];
    tags?: string[];
  }

  model UpdateProductRequest {
    name?: string;
    description?: string;
    status?: ProductStatus;
    pricing?: ProductPrice;
    inventory?: ProductInventory;
    attributes?: ProductAttributes;
    images?: string[];
    tags?: string[];
  }

  model CreateOrderRequest {
    customerId: int64;
    items: CreateOrderItem[];
    shippingAddress: Address;
    billingAddress?: Address;
    paymentMethod?: PaymentMethod;
    discountCode?: string;
    notes?: string;
  }

  model CreateOrderItem {
    productId: int64;
    quantity: int32;
    attributes?: Record<string>;
  }

  model OrderStatusUpdate {
    status: OrderStatus;
    notes?: string;
    trackingInfo?: ShippingInfo;
  }

  model ProcessPaymentRequest {
    paymentMethod: PaymentMethod;
    amount: float64;
    currency: string;
    description?: string;
  }

  model PaymentResult {
    success: boolean;
    transactionId?: string;
    status: PaymentStatus;
    amount: float64;
    currency: string;
    processedAt: utcDateTime;
    failureReason?: string;
  }
}