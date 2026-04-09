package main

import "time"

// User represents a user entity
type User struct {
	ID int64 `json:"id"`
	Name string `json:"name"`
	Email string `json:"email"`
	IsActive bool `json:"isActive"`
	Score float64 `json:"score"`
	CreatedAt time.Time `json:"createdAt"`
}

// NewUser creates a new User instance
func NewUser(id int64, name string, email string, isActive bool, score float64, createdAt time.Time) *User {
	return &User{
		ID: id,
		Name: name,
		Email: email,
		IsActive: isActive,
		Score: score,
		CreatedAt: createdAt,
	}
}

// Profile represents a profile entity
type Profile struct {
	UserID int64 `json:"userId"`
	Bio *string `json:"bio"`
	AvatarUrl *string `json:"avatarUrl"`
	BirthDate *time.Time `json:"birthDate"`
	Settings *UserSettings `json:"settings"`
}

// NewProfile creates a new Profile instance
func NewProfile(userId int64) *Profile {
	return &Profile{
		UserID: userId,
	}
}

// UserSettings represents a usersettings entity
type UserSettings struct {
	Theme string `json:"theme"`
	Language string `json:"language"`
	Notifications bool `json:"notifications"`
}

// NewUserSettings creates a new UserSettings instance
func NewUserSettings(theme string, language string, notifications bool) *UserSettings {
	return &UserSettings{
		Theme: theme,
		Language: language,
		Notifications: notifications,
	}
}

// Post represents a post entity
type Post struct {
	ID int64 `json:"id"`
	Title string `json:"title"`
	Content string `json:"content"`
	Tags []string `json:"tags"`
	Categories []string `json:"categories"`
}

// NewPost creates a new Post instance
func NewPost(id int64, title string, content string, tags []string, categories []string) *Post {
	return &Post{
		ID: id,
		Title: title,
		Content: content,
		Tags: tags,
		Categories: categories,
	}
}

