// Union Types Test Cases for Phase 5

// Simple unions
union StringOrNumber {
  string,
  int32,
}

union Status {
  "active",
  "inactive",
  "pending",
}

// Discriminated unions - most common pattern
union PaymentMethod {
  creditCard: CreditCardPayment,
  paypal: PayPalPayment,
  bankTransfer: BankTransferPayment,
}

model CreditCardPayment {
  type: "creditCard";
  cardNumber: string;
  expiryMonth: int32;
  expiryYear: int32;
  cvv: string;
}

model PayPalPayment {
  type: "paypal";
  email: string;
  paypalId: string;
}

model BankTransferPayment {
  type: "bankTransfer";
  accountNumber: string;
  routingNumber: string;
  bankName: string;
}

// Nested unions
union ComplexData {
  simpleValue: string,
  arrayValue: string[],
  objectValue: ComplexObject,
}

model ComplexObject {
  id: int64;
  data: StringOrNumber;
}

// Union with null
union OptionalData {
  string,
  null,
}

interface PaymentService {
  processPayment(method: PaymentMethod): PaymentResult;
  getPaymentMethods(): PaymentMethod[];
}

model PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}