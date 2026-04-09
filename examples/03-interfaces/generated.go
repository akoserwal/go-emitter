package userservice

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
)

// UserRole represents the possible values for userrole
type UserRole int

// UserRole constants
const (
	UserRoleAdmin UserRole = iota
	UserRoleUser
)

// String returns the string representation of UserRole
func (e UserRole) String() string {
	switch e {
	case UserRoleAdmin:
		return "Admin"
	case UserRoleUser:
		return "User"
	default:
		return "Unknown"
	}
}

// UserRepository defines the contract for userrepository operations
type UserRepository interface {
	GetUser(ctx context.Context, id int64) (User, error)
	CreateUser(ctx context.Context, request CreateUserRequest) (User, error)
	UpdateUser(ctx context.Context, id int64, updates CreateUserRequest) (User, error)
	DeleteUser(ctx context.Context, id int64) error
	ListUsers(ctx context.Context) ([]User, error)
}

// UserRepositoryClient implements UserRepository using HTTP requests
type UserRepositoryClient struct {
	baseURL string
	httpClient *http.Client
}

// NewUserRepositoryClient creates a new HTTP client for UserRepository
func NewUserRepositoryClient(baseURL string) *UserRepositoryClient {
	return &UserRepositoryClient{
		baseURL: baseURL,
		httpClient: &http.Client{},
	}
}

// GetUser GETs getUser via HTTP
func (c *UserRepositoryClient) GetUser(ctx context.Context, id int64) (User, error) {
	var result User
	requestURL := fmt.Sprintf("%s/getUser", c.baseURL)
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

// CreateUser POSTs createUser via HTTP
func (c *UserRepositoryClient) CreateUser(ctx context.Context, request CreateUserRequest) (User, error) {
	var result User
	requestURL := fmt.Sprintf("%s/createUser", c.baseURL)
	req, err := http.NewRequestWithContext(ctx, "POST", requestURL, nil)
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
	if resp.StatusCode != http.StatusCreated {
		return result, fmt.Errorf("HTTP error: %d", resp.StatusCode)
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return result, err
	}
	return result, nil
}

// UpdateUser PUTs updateUser via HTTP
func (c *UserRepositoryClient) UpdateUser(ctx context.Context, id int64, updates CreateUserRequest) (User, error) {
	var result User
	requestURL := fmt.Sprintf("%s/updateUser", c.baseURL)
	req, err := http.NewRequestWithContext(ctx, "PUT", requestURL, nil)
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

// DeleteUser DELETEs deleteUser via HTTP
func (c *UserRepositoryClient) DeleteUser(ctx context.Context, id int64) error {

	requestURL := fmt.Sprintf("%s/deleteUser", c.baseURL)
	req, err := http.NewRequestWithContext(ctx, "DELETE", requestURL, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
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

// ListUsers GETs listUsers via HTTP
func (c *UserRepositoryClient) ListUsers(ctx context.Context) ([]User, error) {
	var result []User
	requestURL := fmt.Sprintf("%s/listUsers", c.baseURL)
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

// UserService defines the contract for userservice operations
type UserService interface {
	GetUser(ctx context.Context, id int64) (User, error)
	CreateUser(ctx context.Context, request CreateUserRequest) (User, error)
	UpdateUser(ctx context.Context, id int64, updates CreateUserRequest) (User, error)
	DeleteUser(ctx context.Context, id int64) error
}

// UserServiceClient implements UserService using HTTP requests
type UserServiceClient struct {
	baseURL string
	httpClient *http.Client
}

// NewUserServiceClient creates a new HTTP client for UserService
func NewUserServiceClient(baseURL string) *UserServiceClient {
	return &UserServiceClient{
		baseURL: baseURL,
		httpClient: &http.Client{},
	}
}

// GetUser GETs getUser via HTTP
func (c *UserServiceClient) GetUser(ctx context.Context, id int64) (User, error) {
	var result User
	requestURL := fmt.Sprintf("%s/getUser", c.baseURL)
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

// CreateUser POSTs createUser via HTTP
func (c *UserServiceClient) CreateUser(ctx context.Context, request CreateUserRequest) (User, error) {
	var result User
	requestURL := fmt.Sprintf("%s/createUser", c.baseURL)
	req, err := http.NewRequestWithContext(ctx, "POST", requestURL, nil)
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
	if resp.StatusCode != http.StatusCreated {
		return result, fmt.Errorf("HTTP error: %d", resp.StatusCode)
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return result, err
	}
	return result, nil
}

// UpdateUser PUTs updateUser via HTTP
func (c *UserServiceClient) UpdateUser(ctx context.Context, id int64, updates CreateUserRequest) (User, error) {
	var result User
	requestURL := fmt.Sprintf("%s/updateUser", c.baseURL)
	req, err := http.NewRequestWithContext(ctx, "PUT", requestURL, nil)
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

// DeleteUser DELETEs deleteUser via HTTP
func (c *UserServiceClient) DeleteUser(ctx context.Context, id int64) error {

	requestURL := fmt.Sprintf("%s/deleteUser", c.baseURL)
	req, err := http.NewRequestWithContext(ctx, "DELETE", requestURL, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
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

// User represents a user entity
type User struct {
	ID int64 `json:"id"`
	Name string `json:"name"`
	Email string `json:"email"`
	Role UserRole `json:"role"`
}

// NewUser creates a new User instance
func NewUser(id int64, name string, email string, role UserRole) *User {
	return &User{
		ID: id,
		Name: name,
		Email: email,
		Role: role,
	}
}

func (m *User) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *User) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// CreateUserRequest represents a createuserrequest entity
type CreateUserRequest struct {
	Name string `json:"name"`
	Email string `json:"email"`
	Role UserRole `json:"role"`
}

// NewCreateUserRequest creates a new CreateUserRequest instance
func NewCreateUserRequest(name string, email string, role UserRole) *CreateUserRequest {
	return &CreateUserRequest{
		Name: name,
		Email: email,
		Role: role,
	}
}

func (m *CreateUserRequest) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *CreateUserRequest) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

