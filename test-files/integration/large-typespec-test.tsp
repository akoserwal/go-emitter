// Large TypeSpec file for performance testing
// Simulates a comprehensive enterprise API

// User management system
enum UserRole {
  Admin,
  Manager,
  Employee,
  Guest,
  SuperAdmin,
  Moderator,
  Viewer,
  Editor
}

enum UserStatus {
  Active,
  Inactive,
  Suspended,
  Pending,
  Archived,
  Banned
}

model Address {
  id: int64;
  street: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  coordinates?: GeoCoordinate;
  validatedAt?: utcDateTime;
  createdAt: utcDateTime;
  updatedAt?: utcDateTime;
}

model GeoCoordinate {
  latitude: float64;
  longitude: float64;
  accuracy?: float32;
  timestamp: utcDateTime;
}

model UserProfile {
  userId: int64;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  displayName?: string;
  phoneNumber?: string;
  alternateEmail?: string;
  dateOfBirth?: utcDateTime;
  avatar?: string;
  timezone?: string;
  locale?: string;
  role: UserRole;
  status: UserStatus;
  addresses: Address[];
  preferences: UserPreferences;
  metadata?: Record<string>;
  tags?: string[];
  customFields?: Record<string>;
  createdAt: utcDateTime;
  updatedAt?: utcDateTime;
  lastLoginAt?: utcDateTime;
  emailVerifiedAt?: utcDateTime;
  phoneVerifiedAt?: utcDateTime;
}

model UserPreferences {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
  language: string;
  theme: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  measurements: string;
}

model NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  marketing: boolean;
  security: boolean;
  updates: boolean;
  mentions: boolean;
  frequency: string;
}

model PrivacySettings {
  profileVisibility: string;
  searchable: boolean;
  showEmail: boolean;
  showPhone: boolean;
  allowMessages: boolean;
  allowInvites: boolean;
  dataRetention: int32;
}

model AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  colorBlindMode?: string;
}

// Product catalog system
enum ProductStatus {
  Active,
  Inactive,
  OutOfStock,
  Discontinued,
  ComingSoon,
  PreOrder
}

enum ProductType {
  Physical,
  Digital,
  Service,
  Subscription,
  Bundle,
  Virtual
}

model Category {
  categoryId: int64;
  name: string;
  description?: string;
  slug: string;
  parentCategoryId?: int64;
  level: int32;
  sortOrder: int32;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  imageUrl?: string;
  iconUrl?: string;
  customAttributes?: Record<string>;
  createdAt: utcDateTime;
  updatedAt?: utcDateTime;
}

model ProductVariant {
  variantId: int64;
  productId: int64;
  sku: string;
  barcode?: string;
  title?: string;
  price: float64;
  compareAtPrice?: float64;
  costPrice?: float64;
  inventory: InventoryInfo;
  attributes: VariantAttribute[];
  dimensions?: ProductDimensions;
  weight?: float32;
  images: string[];
  isDefault: boolean;
  position: int32;
  status: ProductStatus;
  createdAt: utcDateTime;
  updatedAt?: utcDateTime;
}

model InventoryInfo {
  quantity: int32;
  reserved: int32;
  available: int32;
  reorderPoint: int32;
  maxStock: int32;
  trackQuantity: boolean;
  allowBackorder: boolean;
  requiresShipping: boolean;
  warehouse?: string;
  location?: string;
  lastStockUpdate: utcDateTime;
}

model VariantAttribute {
  name: string;
  value: string;
  position: int32;
  displayName?: string;
}

model ProductDimensions {
  length: float32;
  width: float32;
  height: float32;
  weight: float32;
  unit: string;
}

model Product {
  productId: int64;
  title: string;
  description?: string;
  shortDescription?: string;
  slug: string;
  type: ProductType;
  status: ProductStatus;
  vendor?: string;
  brand?: string;
  categoryId: int64;
  category: Category;
  variants: ProductVariant[];
  images: ProductImage[];
  tags: string[];
  options: ProductOption[];
  seo: ProductSEO;
  pricing: ProductPricing;
  shipping: ShippingInfo;
  ratings: ProductRatings;
  customAttributes?: Record<string>;
  featuredImageUrl?: string;
  galleryImages?: string[];
  videoUrls?: string[];
  downloadUrls?: string[];
  relatedProductIds?: int64[];
  crossSellProductIds?: int64[];
  upSellProductIds?: int64[];
  isDigital: boolean;
  isFeatured: boolean;
  requiresShipping: boolean;
  taxable: boolean;
  giftCard: boolean;
  createdAt: utcDateTime;
  updatedAt?: utcDateTime;
  publishedAt?: utcDateTime;
}

model ProductImage {
  imageId: int64;
  productId: int64;
  variantId?: int64;
  url: string;
  altText?: string;
  position: int32;
  isMain: boolean;
  width?: int32;
  height?: int32;
  fileSize?: int32;
  format?: string;
  createdAt: utcDateTime;
}

model ProductOption {
  optionId: int64;
  name: string;
  displayName?: string;
  values: ProductOptionValue[];
  position: int32;
  isRequired: boolean;
}

model ProductOptionValue {
  valueId: int64;
  value: string;
  displayValue?: string;
  position: int32;
  isDefault: boolean;
  priceAdjustment?: float64;
}

model ProductSEO {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  metaTags?: Record<string>;
  structuredData?: Record<string>;
}

model ProductPricing {
  basePrice: float64;
  salePrice?: float64;
  costPrice?: float64;
  margin?: float32;
  taxRate?: float32;
  currency: string;
  priceRules?: PriceRule[];
  bulkPricing?: BulkPriceTier[];
}

model PriceRule {
  ruleId: int64;
  name: string;
  description?: string;
  discountType: string;
  discountValue: float64;
  conditions: Record<string>;
  startDate?: utcDateTime;
  endDate?: utcDateTime;
  isActive: boolean;
}

model BulkPriceTier {
  minQuantity: int32;
  maxQuantity?: int32;
  price: float64;
  discountPercent?: float32;
}

model ShippingInfo {
  requiresShipping: boolean;
  weight?: float32;
  dimensions?: ProductDimensions;
  shippingClassId?: int64;
  handlingTime?: int32;
  freeShippingThreshold?: float64;
  shippingRates?: ShippingRate[];
}

model ShippingRate {
  rateId: int64;
  name: string;
  description?: string;
  rate: float64;
  conditions?: Record<string>;
  isActive: boolean;
}

model ProductRatings {
  averageRating: float32;
  totalReviews: int32;
  ratingDistribution: Record<int32>;
  lastReviewedAt?: utcDateTime;
}

// Order management system
enum OrderStatus {
  Pending,
  Processing,
  Shipped,
  Delivered,
  Cancelled,
  Refunded,
  PartiallyShipped,
  OnHold,
  BackOrdered
}

enum PaymentStatus {
  Pending,
  Authorized,
  Captured,
  Failed,
  Cancelled,
  Refunded,
  PartiallyRefunded
}

enum FulfillmentStatus {
  Unfulfilled,
  PartiallyFulfilled,
  Fulfilled,
  Restocked
}

model OrderLineItem {
  lineItemId: int64;
  orderId: int64;
  productId: int64;
  variantId: int64;
  quantity: int32;
  unitPrice: float64;
  totalPrice: float64;
  originalPrice: float64;
  discountAmount: float64;
  taxAmount: float64;
  productTitle: string;
  variantTitle?: string;
  sku: string;
  weight?: float32;
  dimensions?: ProductDimensions;
  customizations?: Record<string>;
  giftMessage?: string;
  fulfillmentStatus: FulfillmentStatus;
  shippedAt?: utcDateTime;
  deliveredAt?: utcDateTime;
  refundedAmount?: float64;
  returnedQuantity?: int32;
  notes?: string;
  createdAt: utcDateTime;
  updatedAt?: utcDateTime;
}

model Order {
  orderId: int64;
  orderNumber: string;
  customerId: int64;
  customerEmail: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  lineItems: OrderLineItem[];
  shippingAddress: Address;
  billingAddress: Address;
  shipping: OrderShipping;
  payment: OrderPayment;
  pricing: OrderPricing;
  timeline: OrderTimeline;
  notes?: string;
  internalNotes?: string;
  customerNotes?: string;
  giftMessage?: string;
  referralCode?: string;
  discountCodes?: string[];
  loyaltyPointsUsed?: int32;
  loyaltyPointsEarned?: int32;
  riskAssessment?: RiskAssessment;
  customAttributes?: Record<string>;
  tags?: string[];
  source: string;
  sourceIdentifier?: string;
  isGift: boolean;
  requiresSignature: boolean;
  hasDigitalItems: boolean;
  hasPhysicalItems: boolean;
  createdAt: utcDateTime;
  updatedAt?: utcDateTime;
}

model OrderShipping {
  method: string;
  carrier?: string;
  service?: string;
  rate: float64;
  estimatedDelivery?: utcDateTime;
  actualDelivery?: utcDateTime;
  trackingNumbers?: string[];
  trackingUrls?: string[];
  insurance?: float64;
  signature: boolean;
  packaging?: string;
  weight?: float32;
  dimensions?: ProductDimensions;
  shippedAt?: utcDateTime;
  deliveredAt?: utcDateTime;
  attemptedDeliveryAt?: utcDateTime;
  deliveryInstructions?: string;
  deliveryNotes?: string;
}

model OrderPayment {
  paymentId: string;
  gatewayTransactionId?: string;
  method: string;
  processor: string;
  amount: float64;
  currency: string;
  exchangeRate?: float64;
  status: PaymentStatus;
  authorizationCode?: string;
  capturedAt?: utcDateTime;
  refunds?: PaymentRefund[];
  fees?: PaymentFee[];
  billingDetails: BillingDetails;
  cardDetails?: CardDetails;
  riskScore?: float32;
  fraudAnalysis?: Record<string>;
  processedAt?: utcDateTime;
  failureReason?: string;
  retriesCount: int32;
  lastRetryAt?: utcDateTime;
}

model PaymentRefund {
  refundId: string;
  amount: float64;
  reason?: string;
  refundedAt: utcDateTime;
  gatewayRefundId?: string;
  notes?: string;
}

model PaymentFee {
  feeType: string;
  amount: float64;
  description?: string;
}

model BillingDetails {
  firstName: string;
  lastName: string;
  company?: string;
  address: Address;
  phone?: string;
  email?: string;
}

model CardDetails {
  lastFour: string;
  brand: string;
  expiryMonth: int32;
  expiryYear: int32;
  fingerprint?: string;
  country?: string;
  funding?: string;
}

model OrderPricing {
  subtotal: float64;
  taxTotal: float64;
  shippingTotal: float64;
  discountTotal: float64;
  total: float64;
  currency: string;
  taxExempt: boolean;
  taxInclusive: boolean;
  discounts: OrderDiscount[];
  taxes: OrderTax[];
  fees: OrderFee[];
}

model OrderDiscount {
  discountId: string;
  code?: string;
  type: string;
  value: float64;
  amount: float64;
  description?: string;
  appliedAt: utcDateTime;
}

model OrderTax {
  taxId: string;
  rate: float32;
  amount: float64;
  jurisdiction: string;
  type: string;
  inclusive: boolean;
}

model OrderFee {
  feeId: string;
  type: string;
  amount: float64;
  description?: string;
  taxable: boolean;
}

model OrderTimeline {
  createdAt: utcDateTime;
  confirmedAt?: utcDateTime;
  paymentProcessedAt?: utcDateTime;
  shippedAt?: utcDateTime;
  deliveredAt?: utcDateTime;
  completedAt?: utcDateTime;
  cancelledAt?: utcDateTime;
  refundedAt?: utcDateTime;
  estimatedDelivery?: utcDateTime;
  lastStatusUpdate: utcDateTime;
}

model RiskAssessment {
  score: float32;
  level: string;
  factors: string[];
  recommendation: string;
  reviewRequired: boolean;
  assessedAt: utcDateTime;
  assessedBy?: string;
  notes?: string;
}

// API Services
interface UserService {
  createUser(user: CreateUserRequest): UserProfile;
  getUser(userId: int64): UserProfile;
  updateUser(userId: int64, updates: UpdateUserRequest): UserProfile;
  deleteUser(userId: int64): void;
  listUsers(filters?: UserFilters): UserProfile[];
  searchUsers(query: string): UserProfile[];
  activateUser(userId: int64): UserProfile;
  deactivateUser(userId: int64): UserProfile;
  resetPassword(userId: int64): void;
  changePassword(userId: int64, request: ChangePasswordRequest): void;
  updatePreferences(userId: int64, preferences: UserPreferences): UserProfile;
  addAddress(userId: int64, address: Address): UserProfile;
  updateAddress(userId: int64, addressId: int64, address: Address): UserProfile;
  removeAddress(userId: int64, addressId: int64): UserProfile;
  setDefaultAddress(userId: int64, addressId: int64): UserProfile;
  uploadAvatar(userId: int64, image: bytes): UserProfile;
  getUserActivity(userId: int64, filters?: ActivityFilters): ActivityRecord[];
  getUserAnalytics(userId: int64, period: string): UserAnalytics;
}

interface ProductService {
  createProduct(product: CreateProductRequest): Product;
  getProduct(productId: int64): Product;
  updateProduct(productId: int64, updates: UpdateProductRequest): Product;
  deleteProduct(productId: int64): void;
  listProducts(filters?: ProductFilters): Product[];
  searchProducts(query: string, filters?: SearchFilters): ProductSearchResult;
  getProductsByCategory(categoryId: int64): Product[];
  getRelatedProducts(productId: int64): Product[];
  updateProductStatus(productId: int64, status: ProductStatus): Product;
  updateInventory(productId: int64, variantId: int64, inventory: InventoryUpdate): ProductVariant;
  addProductImages(productId: int64, images: ProductImageRequest[]): Product;
  removeProductImage(productId: int64, imageId: int64): Product;
  bulkUpdateProducts(updates: BulkProductUpdate[]): BulkUpdateResult;
  exportProducts(filters?: ProductFilters, format: string): bytes;
  importProducts(data: bytes, format: string): ImportResult;
}

interface OrderService {
  createOrder(order: CreateOrderRequest): Order;
  getOrder(orderId: int64): Order;
  updateOrder(orderId: int64, updates: UpdateOrderRequest): Order;
  cancelOrder(orderId: int64, reason?: string): Order;
  listOrders(filters?: OrderFilters): Order[];
  getCustomerOrders(customerId: int64): Order[];
  updateOrderStatus(orderId: int64, status: OrderStatus): Order;
  addTracking(orderId: int64, tracking: TrackingInfo): Order;
  updateTracking(orderId: int64, trackingId: string, updates: TrackingUpdate): Order;
  processPayment(orderId: int64, payment: PaymentRequest): OrderPayment;
  refundPayment(orderId: int64, refund: RefundRequest): PaymentRefund;
  shipOrder(orderId: int64, shipping: ShipmentRequest): Order;
  markDelivered(orderId: int64, delivery: DeliveryConfirmation): Order;
  calculateShipping(orderId: int64, address: Address): ShippingQuote[];
  applyDiscount(orderId: int64, discountCode: string): Order;
  removeDiscount(orderId: int64, discountId: string): Order;
  addOrderNote(orderId: int64, note: string, isInternal: boolean): Order;
  getOrderAnalytics(period: string, filters?: OrderFilters): OrderAnalytics;
}

// Request/Response models
model CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
  sendWelcomeEmail?: boolean;
}

model UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  preferences?: UserPreferences;
}

model ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

model UserFilters {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  createdAfter?: utcDateTime;
  createdBefore?: utcDateTime;
  lastLoginAfter?: utcDateTime;
  hasOrders?: boolean;
  page?: int32;
  limit?: int32;
  sortBy?: string;
  sortOrder?: string;
}

model ActivityFilters {
  type?: string;
  dateFrom?: utcDateTime;
  dateTo?: utcDateTime;
  page?: int32;
  limit?: int32;
}

model ActivityRecord {
  id: int64;
  userId: int64;
  type: string;
  description: string;
  metadata?: Record<string>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: utcDateTime;
}

model UserAnalytics {
  totalOrders: int32;
  totalSpent: float64;
  averageOrderValue: float64;
  lastOrderDate?: utcDateTime;
  favoriteCategories: string[];
  loyaltyPoints: int32;
  registrationDate: utcDateTime;
}

model CreateProductRequest {
  title: string;
  description?: string;
  categoryId: int64;
  type: ProductType;
  variants: CreateVariantRequest[];
  images?: ProductImageRequest[];
  seo?: ProductSEO;
  tags?: string[];
}

model CreateVariantRequest {
  sku: string;
  price: float64;
  inventory: int32;
  attributes?: VariantAttribute[];
}

model UpdateProductRequest {
  title?: string;
  description?: string;
  categoryId?: int64;
  status?: ProductStatus;
  seo?: ProductSEO;
  tags?: string[];
}

model ProductImageRequest {
  url: string;
  altText?: string;
  position?: int32;
  isMain?: boolean;
}

model ProductFilters {
  categoryId?: int64;
  status?: ProductStatus;
  type?: ProductType;
  minPrice?: float64;
  maxPrice?: float64;
  inStock?: boolean;
  tags?: string[];
  search?: string;
  page?: int32;
  limit?: int32;
  sortBy?: string;
  sortOrder?: string;
}

model SearchFilters {
  categories?: int64[];
  priceRange?: PriceRange;
  attributes?: Record<string>;
  inStock?: boolean;
  rating?: float32;
}

model PriceRange {
  min?: float64;
  max?: float64;
}

model ProductSearchResult {
  products: Product[];
  total: int32;
  facets: SearchFacets;
  suggestions?: string[];
}

model SearchFacets {
  categories: FacetCount[];
  priceRanges: FacetCount[];
  attributes: Record<FacetCount[]>;
}

model FacetCount {
  value: string;
  count: int32;
}

model InventoryUpdate {
  quantity?: int32;
  reserved?: int32;
  reorderPoint?: int32;
  allowBackorder?: boolean;
}

model BulkProductUpdate {
  productId: int64;
  updates: Record<string>;
}

model BulkUpdateResult {
  totalProcessed: int32;
  successful: int32;
  failed: int32;
  errors: BulkError[];
}

model BulkError {
  productId: int64;
  error: string;
  field?: string;
}

model ImportResult {
  totalRows: int32;
  imported: int32;
  skipped: int32;
  errors: ImportError[];
}

model ImportError {
  row: int32;
  error: string;
  data?: Record<string>;
}

model CreateOrderRequest {
  customerId: int64;
  lineItems: CreateLineItemRequest[];
  shippingAddress: Address;
  billingAddress?: Address;
  shippingMethod?: string;
  paymentMethod: string;
  discountCodes?: string[];
  notes?: string;
}

model CreateLineItemRequest {
  productId: int64;
  variantId: int64;
  quantity: int32;
  customizations?: Record<string>;
}

model UpdateOrderRequest {
  status?: OrderStatus;
  shippingAddress?: Address;
  billingAddress?: Address;
  notes?: string;
  internalNotes?: string;
}

model OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  fulfillmentStatus?: FulfillmentStatus;
  customerId?: int64;
  createdAfter?: utcDateTime;
  createdBefore?: utcDateTime;
  minTotal?: float64;
  maxTotal?: float64;
  shippingMethod?: string;
  search?: string;
  page?: int32;
  limit?: int32;
  sortBy?: string;
  sortOrder?: string;
}

model TrackingInfo {
  carrier: string;
  trackingNumber: string;
  url?: string;
  estimatedDelivery?: utcDateTime;
}

model TrackingUpdate {
  status?: string;
  estimatedDelivery?: utcDateTime;
  actualDelivery?: utcDateTime;
  notes?: string;
}

model PaymentRequest {
  amount: float64;
  method: string;
  token?: string;
  billingDetails?: BillingDetails;
}

model RefundRequest {
  amount: float64;
  reason?: string;
  notify: boolean;
}

model ShipmentRequest {
  carrier: string;
  service: string;
  trackingNumber: string;
  items?: int64[];
  packaging?: string;
  insurance?: float64;
}

model DeliveryConfirmation {
  signature?: string;
  notes?: string;
  photos?: string[];
  deliveredAt: utcDateTime;
}

model ShippingQuote {
  carrier: string;
  service: string;
  rate: float64;
  estimatedDays: int32;
  estimatedDelivery: utcDateTime;
}

model OrderAnalytics {
  totalOrders: int32;
  totalRevenue: float64;
  averageOrderValue: float64;
  topProducts: ProductSalesData[];
  ordersByStatus: Record<int32>;
  ordersByDay: DailyOrderData[];
  customerMetrics: CustomerMetrics;
}

model ProductSalesData {
  productId: int64;
  productTitle: string;
  unitsSold: int32;
  revenue: float64;
}

model DailyOrderData {
  date: string;
  orderCount: int32;
  revenue: float64;
  averageValue: float64;
}

model CustomerMetrics {
  newCustomers: int32;
  returningCustomers: int32;
  customerRetentionRate: float32;
  averageLifetimeValue: float64;
}