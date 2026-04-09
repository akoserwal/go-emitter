// Enum Generation Example
// Shows both simple and string-valued enums

// Simple enum (maps to Go iota pattern)
enum Status {
  Active,
  Inactive,
  Pending,
  Suspended
}

// String-valued enum (explicit string values)
enum UserRole {
  Admin: "admin",
  Manager: "manager",
  Developer: "developer",
  User: "user",
  Guest: "guest"
}

// Enum with mixed naming
enum OrderStatus {
  Created: "created",
  Processing: "processing",
  Shipped: "shipped",
  Delivered: "delivered",
  Cancelled: "cancelled",
  Refunded: "refunded"
}

// Using enums in models
model User {
  id: int64;
  name: string;
  status: Status;
  role: UserRole;
}

model Order {
  id: int64;
  userId: int64;
  status: OrderStatus;
  total: float64;
}