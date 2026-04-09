// Namespace Generation Example
// Shows multi-package organization with cross-references

// Global types (backward compatibility)
enum GlobalStatus {
  Active,
  Inactive,
  Archived
}

model GlobalConfig {
  version: string;
  environment: string;
  status: GlobalStatus;
}

// User management namespace
namespace UserAPI {
  enum UserRole {
    Admin: "admin",
    Moderator: "moderator",
    User: "user"
  }

  model User {
    id: int64;
    username: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    profile?: UserProfile;
  }

  model UserProfile {
    firstName: string;
    lastName: string;
    bio?: string;
    avatar?: string;
  }

  interface UserService {
    @get
    getUser(@path userId: int64): User;

    @post
    createUser(@body request: CreateUserRequest): User;
  }

  model CreateUserRequest {
    username: string;
    email: string;
    role: UserRole;
    profile?: UserProfile;
  }
}

// Content management namespace
namespace ContentAPI {
  enum PostStatus {
    Draft,
    Published,
    Archived,
    Deleted
  }

  model Post {
    id: int64;
    title: string;
    content: string;
    authorId: int64;  // References UserAPI.User
    status: PostStatus;
    tags: string[];
    publishedAt?: utcDateTime;
  }

  model Comment {
    id: int64;
    postId: int64;    // References Post
    authorId: int64;  // References UserAPI.User
    content: string;
    createdAt: utcDateTime;
  }

  interface ContentService {
    @get
    getPost(@path postId: int64): Post;

    @get
    getUserPosts(@path userId: int64): Post[];

    @post
    createPost(@body request: CreatePostRequest): Post;
  }

  model CreatePostRequest {
    title: string;
    content: string;
    authorId: int64;
    tags?: string[];
  }
}