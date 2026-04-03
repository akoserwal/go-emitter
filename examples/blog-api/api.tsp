// Blog API Example
// Demonstrates: Simple CRUD, user auth, content management

enum PostStatus {
  Draft,
  Published,
  Archived
}

enum UserRole {
  Admin,
  Editor,
  Author,
  Reader
}

model User {
  id: int64;
  username: string;
  email: string;
  role: UserRole;
  bio?: string;
  avatar?: string;
  createdAt: string;
}

model Category {
  id: int64;
  name: string;
  slug: string;
  description?: string;
}

model Tag {
  id: int64;
  name: string;
  color?: string;
}

model Post {
  id: int64;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: PostStatus;
  authorId: int64;
  author?: User;
  categoryId?: int64;
  category?: Category;
  tags?: Tag[];
  publishedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

model CreatePostRequest {
  title: string;
  content: string;
  excerpt?: string;
  status: PostStatus;
  categoryId?: int64;
  tagIds?: int64[];
}

interface BlogService {
  // Posts
  getPost(id: int64): Post;
  getPostBySlug(slug: string): Post;
  createPost(request: CreatePostRequest): Post;
  updatePost(id: int64, request: CreatePostRequest): Post;
  deletePost(id: int64): void;
  listPosts(status?: PostStatus, authorId?: int64): Post[];

  // Categories
  getCategory(id: int64): Category;
  listCategories(): Category[];

  // Users
  getUser(id: int64): User;
  getUserByUsername(username: string): User;
}