# TypeSpec Go Examples

This directory contains real-world examples demonstrating various features of the TypeSpec Go emitter.

## Examples

### 🛒 E-commerce API (`ecommerce/`)
**Features:** Complex nested models, multiple enums, validation
```bash
cd ecommerce
npx @akoserwal/go-emitter api.tsp client.go config.json
```

**Demonstrates:**
- Product catalog management
- Order processing workflow
- Address and payment handling
- Complex validation rules

### 📝 Blog API (`blog-api/`)
**Features:** Simple CRUD operations, content management
```bash
cd blog-api
npx @akoserwal/go-emitter api.tsp client.go
```

**Demonstrates:**
- User authentication
- Post management (CRUD)
- Categories and tags
- Content publishing workflow

### 👥 User Management (`user-management/`)
**Features:** Authentication, role-based permissions
```bash
cd user-management
npx @akoserwal/go-emitter api.tsp client.go
```

**Demonstrates:**
- JWT authentication flow
- Role-based access control (RBAC)
- User profile management
- Permission system

## Running Examples

1. **Install the emitter**:
   ```bash
   npm install -g @akoserwal/go-emitter
   ```

2. **Generate Go code**:
   ```bash
   cd examples/ecommerce
   go-emitter api.tsp client.go config.json
   ```

3. **Test generated code**:
   ```bash
   go mod init example
   go mod tidy
   go test ./...
   ```

## Generated Output

Each example generates:
- **`client.go`** - Main Go code with types and HTTP clients
- **`client_test.go`** - Comprehensive test suite
- **`client_README.md`** - Usage documentation

## Configuration

Examples include different configuration options:
- **E-commerce**: Full features (validation, builders, tests, docs)
- **Blog**: Standard setup with HTTP clients
- **User Management**: Focus on authentication patterns

## Integration

The generated Go clients can be integrated into any Go application:

```go
package main

import (
    "context"
    "log"

    "your-project/client"
)

func main() {
    // Initialize client
    orderService := client.NewOrderServiceClient("https://api.example.com")

    // Use generated types
    address := client.NewAddress("123 Main St", "City", "State", "12345", "US")

    // Make API calls
    orders, err := orderService.ListOrders(context.Background())
    if err != nil {
        log.Fatal(err)
    }

    log.Printf("Found %d orders", len(orders))
}
```

---

**More examples coming soon!** Submit an issue to request specific use cases.