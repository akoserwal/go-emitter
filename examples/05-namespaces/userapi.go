package userapi

import "time"

// UserRole represents the possible values for userrole
type UserRole int

// UserRole constants
const (
	UserRoleAdmin UserRole = iota
	UserRoleModerator
	UserRoleUser
)

// String returns the string representation of UserRole
func (e UserRole) String() string {
	switch e {
	case UserRoleAdmin:
		return "Admin"
	case UserRoleModerator:
		return "Moderator"
	case UserRoleUser:
		return "User"
	default:
		return "Unknown"
	}
}

// UserService defines the contract for userservice operations
type UserService interface {
	GetUser(ctx context.Context, userId int64) (User, error)
	CreateUser(ctx context.Context, request CreateUserRequest) (User, error)
}

// User represents a user entity
type User struct {
	ID int64 `json:"id"`
	Username string `json:"username"`
	Email string `json:"email"`
	Role UserRole `json:"role"`
	IsActive bool `json:"isActive"`
	Profile *UserProfile `json:"profile"`
}

// NewUser creates a new User instance
func NewUser(id int64, username string, email string, role UserRole, isActive bool) *User {
	return &User{
		ID: id,
		Username: username,
		Email: email,
		Role: role,
		IsActive: isActive,
	}
}

// UserProfile represents a userprofile entity
type UserProfile struct {
	FirstName string `json:"firstName"`
	LastName string `json:"lastName"`
	Bio *string `json:"bio"`
	Avatar *string `json:"avatar"`
}

// NewUserProfile creates a new UserProfile instance
func NewUserProfile(firstName string, lastName string) *UserProfile {
	return &UserProfile{
		FirstName: firstName,
		LastName: lastName,
	}
}

// CreateUserRequest represents a createuserrequest entity
type CreateUserRequest struct {
	Username string `json:"username"`
	Email string `json:"email"`
	Role UserRole `json:"role"`
	Profile *UserProfile `json:"profile"`
}

// NewCreateUserRequest creates a new CreateUserRequest instance
func NewCreateUserRequest(username string, email string, role UserRole) *CreateUserRequest {
	return &CreateUserRequest{
		Username: username,
		Email: email,
		Role: role,
	}
}

