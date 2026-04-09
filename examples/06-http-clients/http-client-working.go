package userapi

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"
)

// UserRole represents the possible values for userrole
type UserRole int

// UserRole constants
const (
	UserRoleAdmin UserRole = iota
	UserRoleUser
	UserRoleGuest
)

// String returns the string representation of UserRole
func (e UserRole) String() string {
	switch e {
	case UserRoleAdmin:
		return "Admin"
	case UserRoleUser:
		return "User"
	case UserRoleGuest:
		return "Guest"
	default:
		return "Unknown"
	}
}

// UserAPI defines the contract for userapi operations
type UserAPI interface {
	GetUser(ctx context.Context, userId int64) (User, error)
	ListUsers(ctx context.Context, page *int32, limit *int32, role *UserRole, active *bool) ([]User, error)
	SearchUsers(ctx context.Context, authToken string, searchTerm string, tags *[]string) (UserSearchResult, error)
	CreateUser(ctx context.Context, authToken string, requestId *string, request CreateUserRequest) (User, error)
	UpdateUser(ctx context.Context, userId int64, authToken string, updates UpdateUserRequest) (User, error)
	DeleteUser(ctx context.Context, userId int64, authToken string) error
	ActivateUser(ctx context.Context, userId int64, apiKey string) (User, error)
}

// UserAPIClient implements UserAPI using HTTP requests
type UserAPIClient struct {
	baseURL string
	httpClient *http.Client
}

// NewUserAPIClient creates a new HTTP client for UserAPI
func NewUserAPIClient(baseURL string) *UserAPIClient {
	return &UserAPIClient{
		baseURL: baseURL,
		httpClient: &http.Client{},
	}
}

// GetUser GETs getUser via HTTP
func (c *UserAPIClient) GetUser(ctx context.Context, userId int64) (User, error) {
	var result User
	requestURL := fmt.Sprintf("%s/getUser/%v", c.baseURL, userId)
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

// ListUsers GETs listUsers via HTTP
func (c *UserAPIClient) ListUsers(ctx context.Context, page *int32, limit *int32, role *UserRole, active *bool) ([]User, error) {
	var result []User
	requestURL := fmt.Sprintf("%s/listUsers", c.baseURL)
	queryParams := url.Values{}
	if page != nil {
		queryParams.Set("page", fmt.Sprintf("%v", *page))
	}
	if limit != nil {
		queryParams.Set("limit", fmt.Sprintf("%v", *limit))
	}
	if role != nil {
		queryParams.Set("role", fmt.Sprintf("%v", *role))
	}
	if active != nil {
		queryParams.Set("active", fmt.Sprintf("%v", *active))
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

// SearchUsers GETs searchUsers via HTTP
func (c *UserAPIClient) SearchUsers(ctx context.Context, authToken string, searchTerm string, tags *[]string) (UserSearchResult, error) {
	var result UserSearchResult
	requestURL := fmt.Sprintf("%s/searchUsers", c.baseURL)
	queryParams := url.Values{}
	queryParams.Set("q", fmt.Sprintf("%v", searchTerm))
	if tags != nil {
		for _, v := range *tags {
			queryParams.Add("tags", fmt.Sprintf("%v", v))
		}
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
	req.Header.Set("Authorization", authToken)
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
func (c *UserAPIClient) CreateUser(ctx context.Context, authToken string, requestId *string, request CreateUserRequest) (User, error) {
	var result User
	requestURL := fmt.Sprintf("%s/createUser", c.baseURL)
	reqBodyBytes, err := json.Marshal(request)
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
	req.Header.Set("Authorization", authToken)
	if requestId != nil {
		req.Header.Set("X-Request-ID", *requestId)
	}
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
func (c *UserAPIClient) UpdateUser(ctx context.Context, userId int64, authToken string, updates UpdateUserRequest) (User, error) {
	var result User
	requestURL := fmt.Sprintf("%s/updateUser/%v", c.baseURL, userId)
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
	req.Header.Set("Authorization", authToken)
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
func (c *UserAPIClient) DeleteUser(ctx context.Context, userId int64, authToken string) error {

	requestURL := fmt.Sprintf("%s/deleteUser/%v", c.baseURL, userId)
	req, err := http.NewRequestWithContext(ctx, "DELETE", requestURL, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", authToken)
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

// ActivateUser PATCHs activateUser via HTTP
func (c *UserAPIClient) ActivateUser(ctx context.Context, userId int64, apiKey string) (User, error) {
	var result User
	requestURL := fmt.Sprintf("%s/activateUser/%v", c.baseURL, userId)
	req, err := http.NewRequestWithContext(ctx, "PATCH", requestURL, nil)
	if err != nil {
		return result, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("X-API-Key", apiKey)
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

// User represents a user entity
type User struct {
	ID int64 `json:"id"`
	Email string `json:"email"`
	Name string `json:"name"`
	Role UserRole `json:"role"`
	IsActive bool `json:"isActive"`
	LastLogin *time.Time `json:"lastLogin"`
}

// NewUser creates a new User instance
func NewUser(id int64, email string, name string, role UserRole, isActive bool) *User {
	return &User{
		ID: id,
		Email: email,
		Name: name,
		Role: role,
		IsActive: isActive,
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
	Email string `json:"email"`
	Name string `json:"name"`
	Role UserRole `json:"role"`
}

// NewCreateUserRequest creates a new CreateUserRequest instance
func NewCreateUserRequest(email string, name string, role UserRole) *CreateUserRequest {
	return &CreateUserRequest{
		Email: email,
		Name: name,
		Role: role,
	}
}

func (m *CreateUserRequest) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *CreateUserRequest) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// UpdateUserRequest represents a updateuserrequest entity
type UpdateUserRequest struct {
	Name *string `json:"name"`
	Role *UserRole `json:"role"`
	IsActive *bool `json:"isActive"`
}

// NewUpdateUserRequest creates a new UpdateUserRequest instance
func NewUpdateUserRequest() *UpdateUserRequest {
	return &UpdateUserRequest{

	}
}

func (m *UpdateUserRequest) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *UpdateUserRequest) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

// UserSearchResult represents a usersearchresult entity
type UserSearchResult struct {
	Users []User `json:"users"`
	Total int32 `json:"total"`
	Page int32 `json:"page"`
	Limit int32 `json:"limit"`
}

// NewUserSearchResult creates a new UserSearchResult instance
func NewUserSearchResult(users []User, total int32, page int32, limit int32) *UserSearchResult {
	return &UserSearchResult{
		Users: users,
		Total: total,
		Page: page,
		Limit: limit,
	}
}

func (m *UserSearchResult) ToJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (m *UserSearchResult) FromJSON(data []byte) error {
	return json.Unmarshal(data, m)
}

