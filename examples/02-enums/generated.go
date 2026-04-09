package main

// Status represents the possible values for status
type Status int

// Status constants
const (
	StatusActive Status = iota
	StatusInactive
	StatusPending
	StatusSuspended
)

// String returns the string representation of Status
func (e Status) String() string {
	switch e {
	case StatusActive:
		return "Active"
	case StatusInactive:
		return "Inactive"
	case StatusPending:
		return "Pending"
	case StatusSuspended:
		return "Suspended"
	default:
		return "Unknown"
	}
}

// UserRole represents the possible values for userrole
type UserRole int

// UserRole constants
const (
	UserRoleAdmin UserRole = iota
	UserRoleManager
	UserRoleDeveloper
	UserRoleUser
	UserRoleGuest
)

// String returns the string representation of UserRole
func (e UserRole) String() string {
	switch e {
	case UserRoleAdmin:
		return "Admin"
	case UserRoleManager:
		return "Manager"
	case UserRoleDeveloper:
		return "Developer"
	case UserRoleUser:
		return "User"
	case UserRoleGuest:
		return "Guest"
	default:
		return "Unknown"
	}
}

// OrderStatus represents the possible values for orderstatus
type OrderStatus int

// OrderStatus constants
const (
	OrderStatusCreated OrderStatus = iota
	OrderStatusProcessing
	OrderStatusShipped
	OrderStatusDelivered
	OrderStatusCancelled
	OrderStatusRefunded
)

// String returns the string representation of OrderStatus
func (e OrderStatus) String() string {
	switch e {
	case OrderStatusCreated:
		return "Created"
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

// User represents a user entity
type User struct {
	ID int64 `json:"id"`
	Name string `json:"name"`
	Status Status `json:"status"`
	Role UserRole `json:"role"`
}

// NewUser creates a new User instance
func NewUser(id int64, name string, status Status, role UserRole) *User {
	return &User{
		ID: id,
		Name: name,
		Status: status,
		Role: role,
	}
}

// Order represents a order entity
type Order struct {
	ID int64 `json:"id"`
	UserID int64 `json:"userId"`
	Status OrderStatus `json:"status"`
	Total float64 `json:"total"`
}

// NewOrder creates a new Order instance
func NewOrder(id int64, userId int64, status OrderStatus, total float64) *Order {
	return &Order{
		ID: id,
		UserID: userId,
		Status: status,
		Total: total,
	}
}

