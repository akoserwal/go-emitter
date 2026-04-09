package main

// StringOrNumber represents a union type
type StringOrNumber interface {
	IsStringOrNumber() bool
	Value() interface{}
}

// StringOrNumberString implements StringOrNumber
type StringOrNumberString struct {
	Data string `json:"value"`
}

func NewStringOrNumberString(value string) *StringOrNumberString {
	return &StringOrNumberString{Data: value}
}

func (u *StringOrNumberString) IsStringOrNumber() bool { return true }
func (u *StringOrNumberString) Value() interface{} { return u.Data }

// StringOrNumberInt32 implements StringOrNumber
type StringOrNumberInt32 struct {
	Data int32 `json:"value"`
}

func NewStringOrNumberInt32(value int32) *StringOrNumberInt32 {
	return &StringOrNumberInt32{Data: value}
}

func (u *StringOrNumberInt32) IsStringOrNumber() bool { return true }
func (u *StringOrNumberInt32) Value() interface{} { return u.Data }

// StringOrNumberFloat64 implements StringOrNumber
type StringOrNumberFloat64 struct {
	Data float64 `json:"value"`
}

func NewStringOrNumberFloat64(value float64) *StringOrNumberFloat64 {
	return &StringOrNumberFloat64{Data: value}
}

func (u *StringOrNumberFloat64) IsStringOrNumber() bool { return true }
func (u *StringOrNumberFloat64) Value() interface{} { return u.Data }

// PaymentMethod represents a discriminated union type
type PaymentMethod interface {
	IsPaymentMethod() bool
	Type() string
	Value() interface{}
}

// PaymentMethodCard implements PaymentMethod
type PaymentMethodCard struct {
	Data CreditCard `json:"data"`
	TypeValue string `json:"type"`
}

func NewPaymentMethodCard(data CreditCard) *PaymentMethodCard {
	return &PaymentMethodCard{
		Data: data,
		TypeValue: "card",
	}
}

func (u *PaymentMethodCard) IsPaymentMethod() bool { return true }
func (u *PaymentMethodCard) Type() string { return u.TypeValue }
func (u *PaymentMethodCard) Value() interface{} { return u.Data }

// PaymentMethodBank implements PaymentMethod
type PaymentMethodBank struct {
	Data BankTransfer `json:"data"`
	TypeValue string `json:"type"`
}

func NewPaymentMethodBank(data BankTransfer) *PaymentMethodBank {
	return &PaymentMethodBank{
		Data: data,
		TypeValue: "bank",
	}
}

func (u *PaymentMethodBank) IsPaymentMethod() bool { return true }
func (u *PaymentMethodBank) Type() string { return u.TypeValue }
func (u *PaymentMethodBank) Value() interface{} { return u.Data }

// PaymentMethodCrypto implements PaymentMethod
type PaymentMethodCrypto struct {
	Data CryptoCurrency `json:"data"`
	TypeValue string `json:"type"`
}

func NewPaymentMethodCrypto(data CryptoCurrency) *PaymentMethodCrypto {
	return &PaymentMethodCrypto{
		Data: data,
		TypeValue: "crypto",
	}
}

func (u *PaymentMethodCrypto) IsPaymentMethod() bool { return true }
func (u *PaymentMethodCrypto) Type() string { return u.TypeValue }
func (u *PaymentMethodCrypto) Value() interface{} { return u.Data }

// NotificationChannel represents a discriminated union type
type NotificationChannel interface {
	IsNotificationChannel() bool
	Type() string
	Value() interface{}
}

// NotificationChannelEmail implements NotificationChannel
type NotificationChannelEmail struct {
	Data EmailNotification `json:"data"`
	TypeValue string `json:"type"`
}

func NewNotificationChannelEmail(data EmailNotification) *NotificationChannelEmail {
	return &NotificationChannelEmail{
		Data: data,
		TypeValue: "email",
	}
}

func (u *NotificationChannelEmail) IsNotificationChannel() bool { return true }
func (u *NotificationChannelEmail) Type() string { return u.TypeValue }
func (u *NotificationChannelEmail) Value() interface{} { return u.Data }

// NotificationChannelSms implements NotificationChannel
type NotificationChannelSms struct {
	Data SMSNotification `json:"data"`
	TypeValue string `json:"type"`
}

func NewNotificationChannelSms(data SMSNotification) *NotificationChannelSms {
	return &NotificationChannelSms{
		Data: data,
		TypeValue: "sms",
	}
}

func (u *NotificationChannelSms) IsNotificationChannel() bool { return true }
func (u *NotificationChannelSms) Type() string { return u.TypeValue }
func (u *NotificationChannelSms) Value() interface{} { return u.Data }

// NotificationChannelPush implements NotificationChannel
type NotificationChannelPush struct {
	Data PushNotification `json:"data"`
	TypeValue string `json:"type"`
}

func NewNotificationChannelPush(data PushNotification) *NotificationChannelPush {
	return &NotificationChannelPush{
		Data: data,
		TypeValue: "push",
	}
}

func (u *NotificationChannelPush) IsNotificationChannel() bool { return true }
func (u *NotificationChannelPush) Type() string { return u.TypeValue }
func (u *NotificationChannelPush) Value() interface{} { return u.Data }

// NotificationChannelWebhook implements NotificationChannel
type NotificationChannelWebhook struct {
	Data WebhookNotification `json:"data"`
	TypeValue string `json:"type"`
}

func NewNotificationChannelWebhook(data WebhookNotification) *NotificationChannelWebhook {
	return &NotificationChannelWebhook{
		Data: data,
		TypeValue: "webhook",
	}
}

func (u *NotificationChannelWebhook) IsNotificationChannel() bool { return true }
func (u *NotificationChannelWebhook) Type() string { return u.TypeValue }
func (u *NotificationChannelWebhook) Value() interface{} { return u.Data }

// CreditCard represents a creditcard entity
type CreditCard struct {
	CardNumber string `json:"cardNumber"`
	ExpiryMonth int32 `json:"expiryMonth"`
	ExpiryYear int32 `json:"expiryYear"`
	Cvv string `json:"cvv"`
}

// NewCreditCard creates a new CreditCard instance
func NewCreditCard(cardNumber string, expiryMonth int32, expiryYear int32, cvv string) *CreditCard {
	return &CreditCard{
		CardNumber: cardNumber,
		ExpiryMonth: expiryMonth,
		ExpiryYear: expiryYear,
		Cvv: cvv,
	}
}

// BankTransfer represents a banktransfer entity
type BankTransfer struct {
	AccountNumber string `json:"accountNumber"`
	RoutingNumber string `json:"routingNumber"`
	BankName string `json:"bankName"`
}

// NewBankTransfer creates a new BankTransfer instance
func NewBankTransfer(accountNumber string, routingNumber string, bankName string) *BankTransfer {
	return &BankTransfer{
		AccountNumber: accountNumber,
		RoutingNumber: routingNumber,
		BankName: bankName,
	}
}

// CryptoCurrency represents a cryptocurrency entity
type CryptoCurrency struct {
	Currency string `json:"currency"`
	WalletAddress string `json:"walletAddress"`
	Network string `json:"network"`
}

// NewCryptoCurrency creates a new CryptoCurrency instance
func NewCryptoCurrency(currency string, walletAddress string, network string) *CryptoCurrency {
	return &CryptoCurrency{
		Currency: currency,
		WalletAddress: walletAddress,
		Network: network,
	}
}

// EmailNotification represents a emailnotification entity
type EmailNotification struct {
	Recipient string `json:"recipient"`
	Subject string `json:"subject"`
	Template string `json:"template"`
}

// NewEmailNotification creates a new EmailNotification instance
func NewEmailNotification(recipient string, subject string, template string) *EmailNotification {
	return &EmailNotification{
		Recipient: recipient,
		Subject: subject,
		Template: template,
	}
}

// SMSNotification represents a smsnotification entity
type SMSNotification struct {
	PhoneNumber string `json:"phoneNumber"`
	Message string `json:"message"`
}

// NewSMSNotification creates a new SMSNotification instance
func NewSMSNotification(phoneNumber string, message string) *SMSNotification {
	return &SMSNotification{
		PhoneNumber: phoneNumber,
		Message: message,
	}
}

// PushNotification represents a pushnotification entity
type PushNotification struct {
	DeviceToken string `json:"deviceToken"`
	Title string `json:"title"`
	Body string `json:"body"`
}

// NewPushNotification creates a new PushNotification instance
func NewPushNotification(deviceToken string, title string, body string) *PushNotification {
	return &PushNotification{
		DeviceToken: deviceToken,
		Title: title,
		Body: body,
	}
}

// WebhookNotification represents a webhooknotification entity
type WebhookNotification struct {
	Url string `json:"url"`
}

// NewWebhookNotification creates a new WebhookNotification instance
func NewWebhookNotification(url string) *WebhookNotification {
	return &WebhookNotification{
		Url: url,
	}
}

// Transaction represents a transaction entity
type Transaction struct {
	ID int64 `json:"id"`
	Amount float64 `json:"amount"`
	PaymentMethod PaymentMethod `json:"paymentMethod"`
	Metadata *StringOrNumber `json:"metadata"`
}

// NewTransaction creates a new Transaction instance
func NewTransaction(id int64, amount float64, paymentMethod PaymentMethod) *Transaction {
	return &Transaction{
		ID: id,
		Amount: amount,
		PaymentMethod: paymentMethod,
	}
}

// NotificationRequest represents a notificationrequest entity
type NotificationRequest struct {
	ID int64 `json:"id"`
	UserID int64 `json:"userId"`
	Channel NotificationChannel `json:"channel"`
	Priority int32 `json:"priority"`
}

// NewNotificationRequest creates a new NotificationRequest instance
func NewNotificationRequest(id int64, userId int64, channel NotificationChannel, priority int32) *NotificationRequest {
	return &NotificationRequest{
		ID: id,
		UserID: userId,
		Channel: channel,
		Priority: priority,
	}
}

