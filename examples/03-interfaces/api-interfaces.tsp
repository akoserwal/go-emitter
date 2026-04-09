// Interface Generation Example
// Shows basic interfaces and HTTP method generation

enum UserRole {
  Admin: "admin",
  User: "user"
}

model User {
  id: int64;
  name: string;
  email: string;
  role: UserRole;
}

model CreateUserRequest {
  name: string;
  email: string;
  role: UserRole;
}

// Basic interface without decorators
interface UserRepository {
  getUser(id: int64): User;
  createUser(request: CreateUserRequest): User;
  updateUser(id: int64, updates: CreateUserRequest): User;
  deleteUser(id: int64): void;
  listUsers(): User[];
}

// Interface with simple HTTP decorators
interface UserService {
  @get
  getUser(id: int64): User;

  @post
  createUser(request: CreateUserRequest): User;

  @put
  updateUser(id: int64, updates: CreateUserRequest): User;

  @delete
  deleteUser(id: int64): void;
}