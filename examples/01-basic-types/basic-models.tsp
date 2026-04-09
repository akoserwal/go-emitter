// Basic Model Generation Example
// Shows fundamental TypeSpec to Go struct conversion

// Simple model with basic types
model User {
  id: int64;
  name: string;
  email: string;
  isActive: boolean;
  score: float64;
  createdAt: utcDateTime;
}

// Model with optional fields
model Profile {
  userId: int64;
  bio?: string;            // Optional string becomes *string in Go
  avatarUrl?: string;      // Optional fields use pointer types
  birthDate?: utcDateTime; // Optional datetime becomes *time.Time
  settings?: UserSettings; // Optional nested model
}

// Nested models
model UserSettings {
  theme: string;
  language: string;
  notifications: boolean;
}

// Model with arrays
model Post {
  id: int64;
  title: string;
  content: string;
  tags: string[];          // Array becomes []string in Go
  categories: string[];    // Multiple arrays supported
  metadata: Record<string>; // Maps to map[string]string
}