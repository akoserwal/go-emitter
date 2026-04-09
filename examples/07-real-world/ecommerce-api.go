package ecommerceapi

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"
)

// ProductStatus represents the possible values for productstatus
type ProductStatus int

// ProductStatus constants
const (
	ProductStatusActive ProductStatus = iota
	ProductStatusInactive
	ProductStatusOutOfStock
	ProductStatusDiscontinued
)

// String returns the string representation of ProductStatus
func (e ProductStatus) String() string {
	switch e {
	case ProductStatusActive:
		return "Active"
	case ProductStatusInactive:
		return "Inactive"
	case ProductStatusOutOfStock:
		return "OutOfStock"
	case ProductStatusDiscontinued:
		return "Discontinued"
	default:
		return "Unknown"
	}
}

// ProductCategory represents the possible values for productcategory
type ProductCategory int

// ProductCategory constants
const (
	ProductCategoryElectronics ProductCategory = iota
	ProductCategoryClothing
	ProductCategoryBooks
	ProductCategoryHome
	ProductCategorySports
)

// String returns the string representation of ProductCategory
func (e ProductCategory) String() string {
	switch e {
	case ProductCategoryElectronics:
		return "Electronics"
	case ProductCategoryClothing:
		return "Clothing"
	case ProductCategoryBooks:
		return "Books"
	case ProductCategoryHome:
		return "Home"
	case ProductCategorySports:
		return "Sports"
	default:
		return "Unknown"
	}
}

// OrderStatus represents the possible values for orderstatus
type OrderStatus int

// OrderStatus constants
const (
	OrderStatusPending OrderStatus = iota
	OrderStatusConfirmed
	OrderStatusProcessing
	OrderStatusShipped
	OrderStatusDelivered
	OrderStatusCancelled
	OrderStatusRefunded
)

// String returns the string representation of OrderStatus
func (e OrderStatus) String() string {
	switch e {
	case OrderStatusPending:
		return "Pending"
	case OrderStatusConfirmed:
		return "Confirmed"
	case OrderStatusProcessing:
		return "Processing"
	case OrderStatusShipped:
		return "Shipped"
	case OrderStatusDelivered:
		return "Delivered"
	case OrderStatusCancelled:
		return "Cancelled"
	case OrderStatusRefunded:
		return "Refunded"
	default:
		return "Unknown"
	}
}

// PaymentStatus represents the possible values for paymentstatus
type PaymentStatus int

// PaymentStatus constants
const (
	PaymentStatusPending PaymentStatus = iota
	PaymentStatusAuthorized
	PaymentStatusCaptured
	PaymentStatusFailed
	PaymentStatusRefunded
)

// String returns the string representation of PaymentStatus
func (e PaymentStatus) String() string {
	switch e {
	case PaymentStatusPending:
		return "Pending"
	case PaymentStatusAuthorized:
		return "Authorized"
	case PaymentStatusCaptured:
		return "Captured"
	case PaymentStatusFailed:
		return "Failed"
	case PaymentStatusRefunded:
		return "Refunded"
	default:
		return "Unknown"
	}
}

// ProductPrice represents a discriminated union type
type ProductPrice interface {
	IsProductPrice() bool
	Type() string
	Value() interface{}
}

// ProductPriceFixed implements ProductPrice
type ProductPriceFixed struct {
	Data FixedPrice `json:"data"`
	TypeValue string `json:"type"`
}

func NewProductPriceFixed(data FixedPrice) *ProductPriceFixed {
	return &ProductPriceFixed{
		Data: data,
		TypeValue: "fixed",
	}
}

func (u *ProductPriceFixed) IsProductPrice() bool { return true }
func (u *ProductPriceFixed) Type() string { return u.TypeValue }
func (u *ProductPriceFixed) Value() interface{} { return u.Data }

// ProductPriceTiered implements ProductPrice
type ProductPriceTiered struct {
	Data TieredPrice `json:"data"`
	TypeValue string `json:"type"`
}

func NewProductPriceTiered(data TieredPrice) *ProductPriceTiered {
	return &ProductPriceTiered{
		Data: data,
		TypeValue: "tiered",
	}
}

func (u *ProductPriceTiered) IsProductPrice() bool { return true }
func (u *ProductPriceTiered) Type() string { return u.TypeValue }
func (u *ProductPriceTiered) Value() interface{} { return u.Data }

// ProductPriceVariable implements ProductPrice
type ProductPriceVariable struct {
	Data VariablePrice `json:"data"`
	TypeValue string `json:"type"`
}

func NewProductPriceVariable(data VariablePrice) *ProductPriceVariable {
	return &ProductPriceVariable{
		Data: data,
		TypeValue: "variable",
	}
}

func (u *ProductPriceVariable) IsProductPrice() bool { return true }
func (u *ProductPriceVariable) Type() string { return u.TypeValue }
func (u *ProductPriceVariable) Value() interface{} { return u.Data }

// PaymentMethod represents a discriminated union type
type PaymentMethod interface {
	IsPaymentMethod() bool
	Type() string
	Value() interface{}
}

// PaymentMethodCard implements PaymentMethod
type PaymentMethodCard struct {
	Data CreditCardPayment `json:"data"`
	TypeValue string `json:"type"`
}

func NewPaymentMethodCard(data CreditCardPayment) *PaymentMethodCard {
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
	Data BankTransferPayment `json:"data"`
	TypeValue string `json:"type"`
}

func NewPaymentMethodBank(data BankTransferPayment) *PaymentMethodBank {
	return &PaymentMethodBank{
		Data: data,
		TypeValue: "bank",
	}
}

func (u *PaymentMethodBank) IsPaymentMethod() bool { return true }
func (u *PaymentMethodBank) Type() string { return u.TypeValue }
func (u *PaymentMethodBank) Value() interface{} { return u.Data }

// PaymentMethodDigital implements PaymentMethod
type PaymentMethodDigital struct {
	Data DigitalWalletPayment `json:"data"`
	TypeValue string `json:"type"`
}

func NewPaymentMethodDigital(data DigitalWalletPayment) *PaymentMethodDigital {
	return &PaymentMethodDigital{
		Data: data,
		TypeValue: "digital",
	}
}

func (u *PaymentMethodDigital) IsPaymentMethod() bool { return true }
func (u *PaymentMethodDigital) Type() string { return u.TypeValue }
func (u *PaymentMethodDigital) Value() interface{} { return u.Data }

// ProductAPI defines the contract for productapi operations
type ProductAPI interface {
	GetProduct(ctx context.Context, productId int64) (Product, error)
	ListProducts(ctx context.Context, category *ProductCategory, status *ProductStatus, query *string, page *int32, limit *int32) (ProductListResponse, error)
	CreateProduct(ctx context.Context, token string, product CreateProductRequest) (Product, error)
	UpdateProduct(ctx context.Context, productId int64, token string, updates UpdateProductRequest) (Product, error)
	DeleteProduct(ctx context.Context, productId int64, token string) error
}

// ProductAPIClient implements ProductAPI using HTTP requests
type ProductAPIClient struct {
	baseURL string
	httpClient *http.Client
}

// NewProductAPIClient creates a new HTTP client for ProductAPI
func NewProductAPIClient(baseURL string) *ProductAPIClient {
	return &ProductAPIClient{
		baseURL: baseURL,
		httpClient: &http.Client{},
	}
}

// GetProduct GETs getProduct via HTTP
func (c *ProductAPIClient) GetProduct(ctx context.Context, productId int64) (Product, error) {
	var result Product
	requestURL := fmt.Sprintf("%s/getProduct/%v", c.baseURL, productId)
	req, err := http.NewRequestWithContext(ctx, "GET", requestURL, nil)
	if err != nil {
		return result, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return result, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return result, fmt.Errorf("HTTP error: %d", resp.StatusCode)
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return result, err
	}
	return result, nil
}

// ListProducts GETs listProducts via HTTP
func (c *ProductAPIClient) ListProducts(ctx context.Context, category *ProductCategory, status *ProductStatus, query *string, page *int32, limit *int32) (ProductListResponse, error) {
	var result ProductListResponse
	requestURL := fmt.Sprintf("%s/listProducts", c.baseURL)
	queryParams := url.Values{}
	if category != nil {
		queryParams.Set("category", fmt.Sprintf("%v", *category))
	}
	if status != nil {
		queryParams.Set("status", fmt.Sprintf("%v", *status))
	}
	if query != nil {
		queryParams.Set("search", fmt.Sprintf("%v", *query))
	}
	if page != nil {
		queryParams.Set("page", fmt.Sprintf("%v", *page))
	}
	if limit != nil {
		queryParams.Set("limit", fmt.Sprintf("%v", *limit))
	}
	if len(queryParams) > 0 {
		requestURL += "?" + queryParams.Encode()
	}
	req, err := http.NewRequestWithContext(ctx, "GET", requestURL, nil)
	if err != nil {
		return result, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return result, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return result, fmt.Errorf("HTTP error: %d", resp.StatusCode)
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return result, err
	}
	return result, nil
}

// CreateProduct POSTs createProduct via HTTP
func (c *ProductAPIClient) CreateProduct(ctx context.Context, token string, product CreateProductRequest) (Product, error) {
	var result Product
	requestURL := fmt.Sprintf("%s/createProduct", c.baseURL)
	reqBodyBytes, err := json.Marshal(product)
	if err != nil {
		return result, err
	}
	reqBody := bytes.NewBuffer(reqBodyBytes)
	req, err := http.NewRequestWithContext(ctx, "POST", requestURL, reqBody)
	if err != nil {
		return result, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", token)
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return result, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated {
		return result, fmt.Errorf("HTTP error: %d", resp.StatusCode)
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return result, err
	}
	return result, nil
}

// UpdateProduct PUTs updateProduct via HTTP
func (c *ProductAPIClient) UpdateProduct(ctx context.Context, productId int64, token string, updates UpdateProductRequest) (Product, error) {
	var result Product
	requestURL := fmt.Sprintf("%s/updateProduct/%v", c.baseURL, productId)
	reqBodyBytes, err := json.Marshal(updates)
	if err != nil {
		return result, err
	}
	reqBody := bytes.NewBuffer(reqBodyBytes)
	req, err := http.NewRequestWithContext(ctx, "PUT", requestURL, reqBody)
	if err != nil {
		return result, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", token)
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return result, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return result, fmt.Errorf("HTTP error: %d", resp.StatusCode)
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return result, err
	}
	return result, nil
}

// DeleteProduct DELETEs deleteProduct via HTTP
func (c *ProductAPIClient) DeleteProduct(ctx context.Context, productId int64, token string) error {

	requestURL := fmt.Sprintf("%s/deleteProduct/%v", c.baseURL, productId)
	req, err := http.NewRequestWithContext(ctx, "DELETE", requestURL, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", token)
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent {
		return fmt.Errorf("HTTP error: %d", resp.StatusCode)
	}
	return nil
}

// OrderAPI defines the contract for orderapi operations
type OrderAPI interface {
	GetOrder(ctx context.Context, orderId int64) (Order, error)
	GetCustomerOrders(ctx context.Context, customerId int64, status *OrderStatus, page *int32, limit *int32) (OrderListResponse, error)
	CreateOrder(ctx context.Context, token string, order CreateOrderRequest) (Order, error)
	UpdateOrderStatus(ctx context.Context, orderId int64, token string, update OrderStatusUpdate) (Order, error)
	ProcessPayment(ctx context.Context, orderId int64, token string, payment ProcessPaymentRequest) (PaymentResult, error)
}

// OrderAPIClient implements OrderAPI using HTTP requests
type OrderAPIClient struct {
	baseURL string
	httpClient *http.Client
}

// NewOrderAPIClient creates a new HTTP client for OrderAPI
func NewOrderAPIClient(baseURL string) *OrderAPIClient {
	return &OrderAPIClient{
		baseURL: baseURL,
		httpClient: &http.Client{},
	}
}

// GetOrder GETs getOrder via HTTP
func (c *OrderAPIClient) GetOrder(ctx context.Context, orderId int64) (Order, error) {
	var result Order
	requestURL := fmt.Sprintf("%s/getOrder/%v", c.baseURL, orderId)
	req, err := http.NewRequestWithContext(ctx, "GET", requestURL, nil)
	if err != nil {
		return result, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return result, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return result, fmt.Errorf("HTTP error: %d", resp.StatusCode)
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return result, err
	}
	return result, nil
}

// GetCustomerOrders GETs getCustomerOrders via HTTP
func (c *OrderAPIClient) GetCustomerOrders(ctx context.Context, customerId int64, status *OrderStatus, page *int32, limit *int32) (OrderListResponse, error) {
	var result OrderListResponse
	requestURL := fmt.Sprintf("%s/getCustomerOrders/%v", c.baseURL, customerId)
	queryParams := url.Values{}
	if status != nil {
		queryParams.Set("status", fmt.Sprintf("%v", *status))
	}
	if page != nil {
		queryParams.Set("page", fmt.Sprintf("%v", *page))
	}
	if limit != nil {
		queryParams.Set("limit", fmt.Sprintf("%v", *limit))
	}
	if len(queryParams) > 0 {
		requestURL += "?" + queryParams.Encode()
	}
	req, err := http.NewRequestWithContext(ctx, "GET", requestURL, nil)
	if err != nil {
		return result, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return result, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return result, fmt.Errorf("HTTP error: %d", resp.StatusCode)
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return result, err
	}
	return result, nil
}

// CreateOrder POSTs createOrder via HTTP
func (c *OrderAPIClient) CreateOrder(ctx context.Context, token string, order CreateOrderRequest) (Order, error) {
	var result Order
	requestURL := fmt.Sprintf("%s/createOrder", c.baseURL)
	reqBodyBytes, err := json.Marshal(order)
	if err != nil {
		return result, err
	}
	reqBody := bytes.NewBuffer(reqBodyBytes)
	req, err := http.NewRequestWithContext(ctx, "POST", requestURL, reqBody)
	if err != nil {
		return result, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", token)
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return result, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated {
		return result, fmt.Errorf("HTTP error: %d", resp.StatusCode)
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return result, err
	}
	return result, nil
}

// UpdateOrderStatus PATCHs updateOrderStatus via HTTP
func (c *OrderAPIClient) UpdateOrderStatus(ctx context.Context, orderId int64, token string, update OrderStatusUpdate) (Order, error) {
	var result Order
	requestURL := fmt.Sprintf("%s/updateOrderStatus/%v", c.baseURL, orderId)
	reqBodyBytes, err := json.Marshal(update)
	if err != nil {
		return result, err
	}
	reqBody := bytes.NewBuffer(reqBodyBytes)
	req, err := http.NewRequestWithContext(ctx, "PATCH", requestURL, reqBody)
	if err != nil {
		return result, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", token)
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return result, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return result, fmt.Errorf("HTTP error: %d", resp.StatusCode)
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return result, err
	}
	return result, nil
}

// ProcessPayment POSTs processPayment via HTTP
func (c *OrderAPIClient) ProcessPayment(ctx context.Context, orderId int64, token string, payment ProcessPaymentRequest) (PaymentResult, error) {
	var result PaymentResult
	requestURL := fmt.Sprintf("%s/processPayment/%v", c.baseURL, orderId)
	reqBodyBytes, err := json.Marshal(payment)
	if err != nil {
		return result, err
	}
	reqBody := bytes.NewBuffer(reqBodyBytes)
	req, err := http.NewRequestWithContext(ctx, "POST", requestURL, reqBody)
	if err != nil {
		return result, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", token)
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return result, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated {
		return result, fmt.Errorf("HTTP error: %d", resp.StatusCode)
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return result, err
	}
	return result, nil
}

// FixedPrice represents a fixedprice entity
type FixedPrice struct {
	Amount float64 `json:"amount"`
	Currency string `json:"currency"`
}

// NewFixedPrice creates a new FixedPrice instance
func NewFixedPrice(amount float64, currency string) *FixedPrice {
	return &FixedPrice{
		Amount: amount,
		Currency: currency,
	}
}

func (m *FixedPrice) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *FixedPrice) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// TieredPrice represents a tieredprice entity
type TieredPrice struct {
	Tiers []PriceTier `json:"tiers"`
	Currency string `json:"currency"`
}

// NewTieredPrice creates a new TieredPrice instance
func NewTieredPrice(tiers []PriceTier, currency string) *TieredPrice {
	return &TieredPrice{
		Tiers: tiers,
		Currency: currency,
	}
}

func (m *TieredPrice) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *TieredPrice) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// VariablePrice represents a variableprice entity
type VariablePrice struct {
	BasePrice float64 `json:"basePrice"`
	Modifiers []PriceModifier `json:"modifiers"`
	Currency string `json:"currency"`
}

// NewVariablePrice creates a new VariablePrice instance
func NewVariablePrice(basePrice float64, modifiers []PriceModifier, currency string) *VariablePrice {
	return &VariablePrice{
		BasePrice: basePrice,
		Modifiers: modifiers,
		Currency: currency,
	}
}

func (m *VariablePrice) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *VariablePrice) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// PriceTier represents a pricetier entity
type PriceTier struct {
	MinQuantity int32 `json:"minQuantity"`
	MaxQuantity *int32 `json:"maxQuantity"`
	Price float64 `json:"price"`
}

// NewPriceTier creates a new PriceTier instance
func NewPriceTier(minQuantity int32, price float64) *PriceTier {
	return &PriceTier{
		MinQuantity: minQuantity,
		Price: price,
	}
}

func (m *PriceTier) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *PriceTier) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// PriceModifier represents a pricemodifier entity
type PriceModifier struct {
	Name string `json:"name"`
	TypeField string `json:"type"`
	Value float64 `json:"value"`
	Condition *string `json:"condition"`
}

// NewPriceModifier creates a new PriceModifier instance
func NewPriceModifier(name string, typeParam string, value float64) *PriceModifier {
	return &PriceModifier{
		Name: name,
		TypeField: typeParam,
		Value: value,
	}
}

func (m *PriceModifier) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *PriceModifier) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// Product represents a product entity
type Product struct {
	ID int64 `json:"id"`
	Sku string `json:"sku"`
	Name string `json:"name"`
	Description *string `json:"description"`
	Category ProductCategory `json:"category"`
	Status ProductStatus `json:"status"`
	Pricing ProductPrice `json:"pricing"`
	Inventory ProductInventory `json:"inventory"`
	Attributes ProductAttributes `json:"attributes"`
	Images []string `json:"images"`
	Tags []string `json:"tags"`
	Weight *float64 `json:"weight"`
	Dimensions *ProductDimensions `json:"dimensions"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt *time.Time `json:"updatedAt"`
}

// NewProduct creates a new Product instance
func NewProduct(id int64, sku string, name string, category ProductCategory, status ProductStatus, pricing ProductPrice, inventory ProductInventory, attributes ProductAttributes, images []string, tags []string, createdAt time.Time) *Product {
	return &Product{
		ID: id,
		Sku: sku,
		Name: name,
		Category: category,
		Status: status,
		Pricing: pricing,
		Inventory: inventory,
		Attributes: attributes,
		Images: images,
		Tags: tags,
		CreatedAt: createdAt,
	}
}

func (m *Product) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *Product) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// ProductInventory represents a productinventory entity
type ProductInventory struct {
	Available int32 `json:"available"`
	Reserved int32 `json:"reserved"`
	ReorderLevel int32 `json:"reorderLevel"`
	Supplier *string `json:"supplier"`
	Location *string `json:"location"`
}

// NewProductInventory creates a new ProductInventory instance
func NewProductInventory(available int32, reserved int32, reorderLevel int32) *ProductInventory {
	return &ProductInventory{
		Available: available,
		Reserved: reserved,
		ReorderLevel: reorderLevel,
	}
}

func (m *ProductInventory) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *ProductInventory) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// ProductAttributes represents a productattributes entity
type ProductAttributes struct {
	Brand *string `json:"brand"`
	Color *string `json:"color"`
	Size *string `json:"size"`
	Material *string `json:"material"`
	Warranty *string `json:"warranty"`
}

// NewProductAttributes creates a new ProductAttributes instance
func NewProductAttributes() *ProductAttributes {
	return &ProductAttributes{

	}
}

func (m *ProductAttributes) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *ProductAttributes) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// ProductDimensions represents a productdimensions entity
type ProductDimensions struct {
	Length float64 `json:"length"`
	Width float64 `json:"width"`
	Height float64 `json:"height"`
	Unit string `json:"unit"`
}

// NewProductDimensions creates a new ProductDimensions instance
func NewProductDimensions(length float64, width float64, height float64, unit string) *ProductDimensions {
	return &ProductDimensions{
		Length: length,
		Width: width,
		Height: height,
		Unit: unit,
	}
}

func (m *ProductDimensions) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *ProductDimensions) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// CreditCardPayment represents a creditcardpayment entity
type CreditCardPayment struct {
	Last4 string `json:"last4"`
	Brand string `json:"brand"`
	ExpiryMonth int32 `json:"expiryMonth"`
	ExpiryYear int32 `json:"expiryYear"`
	CardholderName string `json:"cardholderName"`
}

// NewCreditCardPayment creates a new CreditCardPayment instance
func NewCreditCardPayment(last4 string, brand string, expiryMonth int32, expiryYear int32, cardholderName string) *CreditCardPayment {
	return &CreditCardPayment{
		Last4: last4,
		Brand: brand,
		ExpiryMonth: expiryMonth,
		ExpiryYear: expiryYear,
		CardholderName: cardholderName,
	}
}

func (m *CreditCardPayment) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *CreditCardPayment) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// BankTransferPayment represents a banktransferpayment entity
type BankTransferPayment struct {
	AccountNumber string `json:"accountNumber"`
	RoutingNumber string `json:"routingNumber"`
	BankName string `json:"bankName"`
}

// NewBankTransferPayment creates a new BankTransferPayment instance
func NewBankTransferPayment(accountNumber string, routingNumber string, bankName string) *BankTransferPayment {
	return &BankTransferPayment{
		AccountNumber: accountNumber,
		RoutingNumber: routingNumber,
		BankName: bankName,
	}
}

func (m *BankTransferPayment) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *BankTransferPayment) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// DigitalWalletPayment represents a digitalwalletpayment entity
type DigitalWalletPayment struct {
	Provider string `json:"provider"`
	AccountID string `json:"accountId"`
}

// NewDigitalWalletPayment creates a new DigitalWalletPayment instance
func NewDigitalWalletPayment(provider string, accountId string) *DigitalWalletPayment {
	return &DigitalWalletPayment{
		Provider: provider,
		AccountID: accountId,
	}
}

func (m *DigitalWalletPayment) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *DigitalWalletPayment) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// Order represents a order entity
type Order struct {
	ID int64 `json:"id"`
	OrderNumber string `json:"orderNumber"`
	CustomerID int64 `json:"customerId"`
	Items []OrderItem `json:"items"`
	Status OrderStatus `json:"status"`
	PaymentStatus PaymentStatus `json:"paymentStatus"`
	PaymentMethod *PaymentMethod `json:"paymentMethod"`
	ShippingAddress Address `json:"shippingAddress"`
	BillingAddress *Address `json:"billingAddress"`
	Totals OrderTotals `json:"totals"`
	Discounts *[]Discount `json:"discounts"`
	Shipping *ShippingInfo `json:"shipping"`
	Notes *string `json:"notes"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt *time.Time `json:"updatedAt"`
	ShippedAt *time.Time `json:"shippedAt"`
	DeliveredAt *time.Time `json:"deliveredAt"`
}

// NewOrder creates a new Order instance
func NewOrder(id int64, orderNumber string, customerId int64, items []OrderItem, status OrderStatus, paymentStatus PaymentStatus, shippingAddress Address, totals OrderTotals, createdAt time.Time) *Order {
	return &Order{
		ID: id,
		OrderNumber: orderNumber,
		CustomerID: customerId,
		Items: items,
		Status: status,
		PaymentStatus: paymentStatus,
		ShippingAddress: shippingAddress,
		Totals: totals,
		CreatedAt: createdAt,
	}
}

func (m *Order) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *Order) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// OrderItem represents a orderitem entity
type OrderItem struct {
	ProductID int64 `json:"productId"`
	Sku string `json:"sku"`
	Name string `json:"name"`
	Quantity int32 `json:"quantity"`
	UnitPrice float64 `json:"unitPrice"`
	TotalPrice float64 `json:"totalPrice"`
	Discounts *[]Discount `json:"discounts"`
}

// NewOrderItem creates a new OrderItem instance
func NewOrderItem(productId int64, sku string, name string, quantity int32, unitPrice float64, totalPrice float64) *OrderItem {
	return &OrderItem{
		ProductID: productId,
		Sku: sku,
		Name: name,
		Quantity: quantity,
		UnitPrice: unitPrice,
		TotalPrice: totalPrice,
	}
}

func (m *OrderItem) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *OrderItem) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// Address represents a address entity
type Address struct {
	Street1 string `json:"street1"`
	Street2 *string `json:"street2"`
	City string `json:"city"`
	State string `json:"state"`
	PostalCode string `json:"postalCode"`
	Country string `json:"country"`
	TypeField *string `json:"type"`
	IsDefault *bool `json:"isDefault"`
}

// NewAddress creates a new Address instance
func NewAddress(street1 string, city string, state string, postalCode string, country string) *Address {
	return &Address{
		Street1: street1,
		City: city,
		State: state,
		PostalCode: postalCode,
		Country: country,
	}
}

func (m *Address) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *Address) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// OrderTotals represents a ordertotals entity
type OrderTotals struct {
	Subtotal float64 `json:"subtotal"`
	Tax float64 `json:"tax"`
	Shipping float64 `json:"shipping"`
	Discounts float64 `json:"discounts"`
	Total float64 `json:"total"`
	Currency string `json:"currency"`
}

// NewOrderTotals creates a new OrderTotals instance
func NewOrderTotals(subtotal float64, tax float64, shipping float64, discounts float64, total float64, currency string) *OrderTotals {
	return &OrderTotals{
		Subtotal: subtotal,
		Tax: tax,
		Shipping: shipping,
		Discounts: discounts,
		Total: total,
		Currency: currency,
	}
}

func (m *OrderTotals) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *OrderTotals) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// Discount represents a discount entity
type Discount struct {
	ID int64 `json:"id"`
	Code *string `json:"code"`
	Name string `json:"name"`
	TypeField string `json:"type"`
	Amount float64 `json:"amount"`
	AppliedTo string `json:"appliedTo"`
}

// NewDiscount creates a new Discount instance
func NewDiscount(id int64, name string, typeParam string, amount float64, appliedTo string) *Discount {
	return &Discount{
		ID: id,
		Name: name,
		TypeField: typeParam,
		Amount: amount,
		AppliedTo: appliedTo,
	}
}

func (m *Discount) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *Discount) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// ShippingInfo represents a shippinginfo entity
type ShippingInfo struct {
	Carrier string `json:"carrier"`
	Service string `json:"service"`
	TrackingNumber *string `json:"trackingNumber"`
	EstimatedDelivery *time.Time `json:"estimatedDelivery"`
	Cost float64 `json:"cost"`
}

// NewShippingInfo creates a new ShippingInfo instance
func NewShippingInfo(carrier string, service string, cost float64) *ShippingInfo {
	return &ShippingInfo{
		Carrier: carrier,
		Service: service,
		Cost: cost,
	}
}

func (m *ShippingInfo) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *ShippingInfo) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// ProductListResponse represents a productlistresponse entity
type ProductListResponse struct {
	Products []Product `json:"products"`
	Pagination PaginationInfo `json:"pagination"`
	Filters FilterInfo `json:"filters"`
}

// NewProductListResponse creates a new ProductListResponse instance
func NewProductListResponse(products []Product, pagination PaginationInfo, filters FilterInfo) *ProductListResponse {
	return &ProductListResponse{
		Products: products,
		Pagination: pagination,
		Filters: filters,
	}
}

func (m *ProductListResponse) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *ProductListResponse) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// OrderListResponse represents a orderlistresponse entity
type OrderListResponse struct {
	Orders []Order `json:"orders"`
	Pagination PaginationInfo `json:"pagination"`
	Summary OrderSummary `json:"summary"`
}

// NewOrderListResponse creates a new OrderListResponse instance
func NewOrderListResponse(orders []Order, pagination PaginationInfo, summary OrderSummary) *OrderListResponse {
	return &OrderListResponse{
		Orders: orders,
		Pagination: pagination,
		Summary: summary,
	}
}

func (m *OrderListResponse) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *OrderListResponse) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// PaginationInfo represents a paginationinfo entity
type PaginationInfo struct {
	Page int32 `json:"page"`
	Limit int32 `json:"limit"`
	Total int64 `json:"total"`
	HasNext bool `json:"hasNext"`
	HasPrev bool `json:"hasPrev"`
}

// NewPaginationInfo creates a new PaginationInfo instance
func NewPaginationInfo(page int32, limit int32, total int64, hasNext bool, hasPrev bool) *PaginationInfo {
	return &PaginationInfo{
		Page: page,
		Limit: limit,
		Total: total,
		HasNext: hasNext,
		HasPrev: hasPrev,
	}
}

func (m *PaginationInfo) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *PaginationInfo) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// FilterInfo represents a filterinfo entity
type FilterInfo struct {
	Category *ProductCategory `json:"category"`
	Status *ProductStatus `json:"status"`
	PriceMin *float64 `json:"priceMin"`
	PriceMax *float64 `json:"priceMax"`
	InStock *bool `json:"inStock"`
}

// NewFilterInfo creates a new FilterInfo instance
func NewFilterInfo() *FilterInfo {
	return &FilterInfo{

	}
}

func (m *FilterInfo) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *FilterInfo) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// OrderSummary represents a ordersummary entity
type OrderSummary struct {
	TotalOrders int64 `json:"totalOrders"`
	TotalValue float64 `json:"totalValue"`
	AverageOrderValue float64 `json:"averageOrderValue"`
	Currency string `json:"currency"`
}

// NewOrderSummary creates a new OrderSummary instance
func NewOrderSummary(totalOrders int64, totalValue float64, averageOrderValue float64, currency string) *OrderSummary {
	return &OrderSummary{
		TotalOrders: totalOrders,
		TotalValue: totalValue,
		AverageOrderValue: averageOrderValue,
		Currency: currency,
	}
}

func (m *OrderSummary) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *OrderSummary) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// CreateProductRequest represents a createproductrequest entity
type CreateProductRequest struct {
	Sku string `json:"sku"`
	Name string `json:"name"`
	Description *string `json:"description"`
	Category ProductCategory `json:"category"`
	Pricing ProductPrice `json:"pricing"`
	Inventory ProductInventory `json:"inventory"`
	Attributes *ProductAttributes `json:"attributes"`
	Images *[]string `json:"images"`
	Tags *[]string `json:"tags"`
}

// NewCreateProductRequest creates a new CreateProductRequest instance
func NewCreateProductRequest(sku string, name string, category ProductCategory, pricing ProductPrice, inventory ProductInventory) *CreateProductRequest {
	return &CreateProductRequest{
		Sku: sku,
		Name: name,
		Category: category,
		Pricing: pricing,
		Inventory: inventory,
	}
}

func (m *CreateProductRequest) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *CreateProductRequest) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// UpdateProductRequest represents a updateproductrequest entity
type UpdateProductRequest struct {
	Name *string `json:"name"`
	Description *string `json:"description"`
	Status *ProductStatus `json:"status"`
	Pricing *ProductPrice `json:"pricing"`
	Inventory *ProductInventory `json:"inventory"`
	Attributes *ProductAttributes `json:"attributes"`
	Images *[]string `json:"images"`
	Tags *[]string `json:"tags"`
}

// NewUpdateProductRequest creates a new UpdateProductRequest instance
func NewUpdateProductRequest() *UpdateProductRequest {
	return &UpdateProductRequest{

	}
}

func (m *UpdateProductRequest) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *UpdateProductRequest) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// CreateOrderRequest represents a createorderrequest entity
type CreateOrderRequest struct {
	CustomerID int64 `json:"customerId"`
	Items []CreateOrderItem `json:"items"`
	ShippingAddress Address `json:"shippingAddress"`
	BillingAddress *Address `json:"billingAddress"`
	PaymentMethod *PaymentMethod `json:"paymentMethod"`
	DiscountCode *string `json:"discountCode"`
	Notes *string `json:"notes"`
}

// NewCreateOrderRequest creates a new CreateOrderRequest instance
func NewCreateOrderRequest(customerId int64, items []CreateOrderItem, shippingAddress Address) *CreateOrderRequest {
	return &CreateOrderRequest{
		CustomerID: customerId,
		Items: items,
		ShippingAddress: shippingAddress,
	}
}

func (m *CreateOrderRequest) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *CreateOrderRequest) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// CreateOrderItem represents a createorderitem entity
type CreateOrderItem struct {
	ProductID int64 `json:"productId"`
	Quantity int32 `json:"quantity"`
}

// NewCreateOrderItem creates a new CreateOrderItem instance
func NewCreateOrderItem(productId int64, quantity int32) *CreateOrderItem {
	return &CreateOrderItem{
		ProductID: productId,
		Quantity: quantity,
	}
}

func (m *CreateOrderItem) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *CreateOrderItem) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// OrderStatusUpdate represents a orderstatusupdate entity
type OrderStatusUpdate struct {
	Status OrderStatus `json:"status"`
	Notes *string `json:"notes"`
	TrackingInfo *ShippingInfo `json:"trackingInfo"`
}

// NewOrderStatusUpdate creates a new OrderStatusUpdate instance
func NewOrderStatusUpdate(status OrderStatus) *OrderStatusUpdate {
	return &OrderStatusUpdate{
		Status: status,
	}
}

func (m *OrderStatusUpdate) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *OrderStatusUpdate) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// ProcessPaymentRequest represents a processpaymentrequest entity
type ProcessPaymentRequest struct {
	PaymentMethod PaymentMethod `json:"paymentMethod"`
	Amount float64 `json:"amount"`
	Currency string `json:"currency"`
	Description *string `json:"description"`
}

// NewProcessPaymentRequest creates a new ProcessPaymentRequest instance
func NewProcessPaymentRequest(paymentMethod PaymentMethod, amount float64, currency string) *ProcessPaymentRequest {
	return &ProcessPaymentRequest{
		PaymentMethod: paymentMethod,
		Amount: amount,
		Currency: currency,
	}
}

func (m *ProcessPaymentRequest) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *ProcessPaymentRequest) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// PaymentResult represents a paymentresult entity
type PaymentResult struct {
	Success bool `json:"success"`
	TransactionID *string `json:"transactionId"`
	Status PaymentStatus `json:"status"`
	Amount float64 `json:"amount"`
	Currency string `json:"currency"`
	ProcessedAt time.Time `json:"processedAt"`
	FailureReason *string `json:"failureReason"`
}

// NewPaymentResult creates a new PaymentResult instance
func NewPaymentResult(success bool, status PaymentStatus, amount float64, currency string, processedAt time.Time) *PaymentResult {
	return &PaymentResult{
		Success: success,
		Status: status,
		Amount: amount,
		Currency: currency,
		ProcessedAt: processedAt,
	}
}

func (m *PaymentResult) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *PaymentResult) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

