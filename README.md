# TypeSpec Go Emitter

[![npm version](https://badge.fury.io/js/@typespec%2Fgo-emitter.svg)](https://www.npmjs.com/package/@typespec/go-emitter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Go code generator for TypeSpec definitions.

## 📦 Installation

```bash
npm install -g @typespec/go-emitter
```

## 🚀 Quick Start

```bash
# Generate Go code from TypeSpec
go-emitter api.tsp client.go

# With configuration
go-emitter api.tsp client.go -c config/client.json

# Watch mode
go-emitter api.tsp client.go -w
```

## 🏗️ Architecture

```
src/
├── types/           # Type definitions
├── core/
│   ├── parser.ts    # TypeSpec parsing (regex-based)
│   ├── type-mapper.ts   # Type system mapping
│   └── emitter.ts   # Main orchestration
├── generators/
│   ├── go-struct.ts     # Go struct generation
│   ├── go-enum.ts       # Go enum generation
│   ├── go-interface.ts  # Go interface generation
│   └── go-union.ts      # Go union generation
└── cli/
    └── index.ts     # Command-line interface
```

## 📝 Example

**Input (`api.tsp`):**
```typescript
enum Status { Active, Inactive }

model User {
  id: int64;
  name: string;
  email?: string;
  status: Status;
}

interface UserService {
  getUser(id: int64): User;
  createUser(user: User): User;
}
```

**Output (`client.go`):**
```go
package client

import (
    "fmt"
    "encoding/json"
    "net/http"
    "context"
)

type Status int

const (
    StatusActive Status = iota
    StatusInactive
)

func (e Status) String() string {
    switch e {
    case StatusActive: return "Active"
    case StatusInactive: return "Inactive"
    default: return "Unknown"
    }
}

type UserService interface {
    GetUser(ctx context.Context, id int64) (User, error)
    CreateUser(ctx context.Context, user User) (User, error)
}

// HTTP client implementation
type UserServiceClient struct {
    baseURL string
    httpClient *http.Client
}

func NewUserServiceClient(baseURL string) *UserServiceClient {
    return &UserServiceClient{
        baseURL: baseURL,
        httpClient: &http.Client{},
    }
}

// Real HTTP implementations generated...
```

## ⚙️ Configuration

**Presets available:**
- `config/default.json` - Minimal setup
- `config/client.json` - HTTP clients with validation
- `config/models.json` - Models with builders

**Custom config:**
```json
{
  "packageName": "myapi",
  "imports": ["fmt", "encoding/json"],
  "generateValidation": true,
  "generateHTTPClient": true,
  "generateTests": true
}
```

## 🎨 Features

| Feature | Status | Example |
|---------|--------|---------|
| **Enums** | ✅ | `enum Status { Active }` → `const StatusActive = iota` |
| **Models** | ✅ | `model User { name: string }` → `type User struct` |
| **Arrays** | ✅ | `tags: string[]` → `Tags []string` |
| **Maps** | ✅ | `Record<string, int>` → `map[string]int` |
| **Optionals** | ✅ | `email?: string` → `Email *string` |
| **Interfaces** | ✅ | `interface API {}` → Go interfaces |
| **HTTP Clients** | ✅ | Real REST client implementations |
| **Validation** | ✅ | `Validate() error` methods |
| **JSON** | ✅ | `ToJSON()` / `FromJSON()` helpers |

## 📊 Development

```bash
# Build
npm run build

# Test
npm test

# Format
npm run format

# Lint
npm run lint

# Quality check
npm run quality
```

## 📁 Examples

See `examples/` for real-world TypeSpec definitions:
- **E-commerce API** - Complex models, validation
- **Blog API** - CRUD operations
- **User Management** - Authentication, RBAC

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code quality standards
- Architecture decisions
- Development workflow

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

---
