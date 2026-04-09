// HTTP Decorators Test Cases for Phase 5

// Headers
model AuthHeaders {
  @header authorization: string;
  @header("X-API-Key") apiKey: string;
  @header("User-Agent") userAgent?: string;
}

// Query parameters
model SearchParams {
  @query q: string;
  @query page?: int32;
  @query limit?: int32;
  @query("sort_by") sortBy?: string;
  @query("order") sortOrder?: string;
}

// Path parameters
model UserParams {
  @path userId: int64;
  @path("org_id") orgId: string;
}

// Request body
model CreateUserRequest {
  @body user: UserData;
}

model UserData {
  name: string;
  email: string;
  role: string;
}

// Response body
model UserResponse {
  @body user: User;
  @header("X-Total-Count") totalCount: string;
}

model User {
  id: int64;
  name: string;
  email: string;
  role: string;
  createdAt: utcDateTime;
}

// Mixed decorators in interface
interface UserService {
  // GET /users/{userId}
  @get
  getUser(
    @path userId: int64,
    @header authorization: string,
    @query include?: string[]
  ): User;

  // POST /users
  @post
  createUser(
    @header authorization: string,
    @body userData: UserData
  ): User;

  // GET /users
  @get
  listUsers(
    @header authorization: string,
    @query page?: int32,
    @query limit?: int32,
    @query("search") q?: string
  ): User[];

  // PUT /users/{userId}
  @put
  updateUser(
    @path userId: int64,
    @header authorization: string,
    @body updates: UpdateUserRequest
  ): User;

  // DELETE /users/{userId}
  @delete
  deleteUser(
    @path userId: int64,
    @header authorization: string
  ): void;
}

model UpdateUserRequest {
  name?: string;
  email?: string;
  role?: string;
}

// Advanced: Multiple headers, complex queries
interface ProductService {
  @get
  searchProducts(
    @header authorization: string,
    @header("Accept-Language") language?: string,
    @query category?: string,
    @query("min_price") minPrice?: float64,
    @query("max_price") maxPrice?: float64,
    @query tags?: string[],
    @query("in_stock") inStock?: boolean
  ): ProductSearchResult;
}

model ProductSearchResult {
  products: Product[];
  total: int32;
  page: int32;
  hasMore: boolean;
}

model Product {
  id: int64;
  name: string;
  category: string;
  price: float64;
  inStock: boolean;
  tags: string[];
}