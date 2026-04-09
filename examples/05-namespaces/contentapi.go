package contentapi

import "time"

// PostStatus represents the possible values for poststatus
type PostStatus int

// PostStatus constants
const (
	PostStatusDraft PostStatus = iota
	PostStatusPublished
	PostStatusArchived
	PostStatusDeleted
)

// String returns the string representation of PostStatus
func (e PostStatus) String() string {
	switch e {
	case PostStatusDraft:
		return "Draft"
	case PostStatusPublished:
		return "Published"
	case PostStatusArchived:
		return "Archived"
	case PostStatusDeleted:
		return "Deleted"
	default:
		return "Unknown"
	}
}

// ContentService defines the contract for contentservice operations
type ContentService interface {
	GetPost(ctx context.Context, postId int64) (Post, error)
	GetUserPosts(ctx context.Context, userId int64) ([]Post, error)
	CreatePost(ctx context.Context, request CreatePostRequest) (Post, error)
}

// Post represents a post entity
type Post struct {
	ID int64 `json:"id"`
	Title string `json:"title"`
	Content string `json:"content"`
	AuthorID int64 `json:"authorId"`
	Status PostStatus `json:"status"`
	Tags []string `json:"tags"`
	PublishedAt *time.Time `json:"publishedAt"`
}

// NewPost creates a new Post instance
func NewPost(id int64, title string, content string, authorId int64, status PostStatus, tags []string) *Post {
	return &Post{
		ID: id,
		Title: title,
		Content: content,
		AuthorID: authorId,
		Status: status,
		Tags: tags,
	}
}

// Comment represents a comment entity
type Comment struct {
	ID int64 `json:"id"`
	PostID int64 `json:"postId"`
	AuthorID int64 `json:"authorId"`
	Content string `json:"content"`
	CreatedAt time.Time `json:"createdAt"`
}

// NewComment creates a new Comment instance
func NewComment(id int64, postId int64, authorId int64, content string, createdAt time.Time) *Comment {
	return &Comment{
		ID: id,
		PostID: postId,
		AuthorID: authorId,
		Content: content,
		CreatedAt: createdAt,
	}
}

// CreatePostRequest represents a createpostrequest entity
type CreatePostRequest struct {
	Title string `json:"title"`
	Content string `json:"content"`
	AuthorID int64 `json:"authorId"`
	Tags *[]string `json:"tags"`
}

// NewCreatePostRequest creates a new CreatePostRequest instance
func NewCreatePostRequest(title string, content string, authorId int64) *CreatePostRequest {
	return &CreatePostRequest{
		Title: title,
		Content: content,
		AuthorID: authorId,
	}
}

