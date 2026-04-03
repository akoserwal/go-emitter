// User Management API Example
// Demonstrates: Authentication, permissions, complex relationships

enum UserStatus {
  Active,
  Inactive,
  Suspended,
  Banned
}

enum PermissionType {
  Read,
  Write,
  Delete,
  Admin
}

model Permission {
  id: int64;
  name: string;
  type: PermissionType;
  resource: string;
  description?: string;
}

model Role {
  id: int64;
  name: string;
  description?: string;
  permissions: Permission[];
}

model Profile {
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  preferences?: Record<string, string>;
}

model User {
  id: int64;
  email: string;
  username: string;
  status: UserStatus;
  profile?: Profile;
  roles: Role[];
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

model LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

model AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: int64;
  tokenType: string;
}

model CreateUserRequest {
  email: string;
  username: string;
  password: string;
  profile?: Profile;
  roleIds?: int64[];
}

interface AuthService {
  login(request: LoginRequest): AuthToken;
  refresh(refreshToken: string): AuthToken;
  logout(token: string): void;
  validateToken(token: string): User;
}

interface UserService {
  getUser(id: int64): User;
  getUserByEmail(email: string): User;
  createUser(request: CreateUserRequest): User;
  updateUser(id: int64, updates: CreateUserRequest): User;
  deleteUser(id: int64): void;
  listUsers(status?: UserStatus, roleId?: int64): User[];
  assignRole(userId: int64, roleId: int64): void;
  removeRole(userId: int64, roleId: int64): void;
}

interface RoleService {
  getRole(id: int64): Role;
  listRoles(): Role[];
  createRole(name: string, permissionIds: int64[]): Role;
}