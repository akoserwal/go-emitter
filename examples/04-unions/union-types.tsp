// Union Type Generation Example
// Shows discriminated and simple unions

// Simple union (no discriminator field)
union StringOrNumber {
  string,
  int32,
  float64
}

// Discriminated union with explicit type field
union PaymentMethod {
  card: CreditCard,
  bank: BankTransfer,
  crypto: CryptoCurrency
}

model CreditCard {
  type: "card";
  cardNumber: string;
  expiryMonth: int32;
  expiryYear: int32;
  cvv: string;
}

model BankTransfer {
  type: "bank";
  accountNumber: string;
  routingNumber: string;
  bankName: string;
}

model CryptoCurrency {
  type: "crypto";
  currency: string;
  walletAddress: string;
  network: string;
}

// Complex union with multiple types
union NotificationChannel {
  email: EmailNotification,
  sms: SMSNotification,
  push: PushNotification,
  webhook: WebhookNotification
}

model EmailNotification {
  type: "email";
  recipient: string;
  subject: string;
  template: string;
}

model SMSNotification {
  type: "sms";
  phoneNumber: string;
  message: string;
}

model PushNotification {
  type: "push";
  deviceToken: string;
  title: string;
  body: string;
}

model WebhookNotification {
  type: "webhook";
  url: string;
  payload: Record<string>;
}

// Using unions in models
model Transaction {
  id: int64;
  amount: float64;
  paymentMethod: PaymentMethod;
  metadata?: StringOrNumber;
}

model NotificationRequest {
  id: int64;
  userId: int64;
  channel: NotificationChannel;
  priority: int32;
}