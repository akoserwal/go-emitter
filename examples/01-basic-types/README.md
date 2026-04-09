# Basic Types Example

This example demonstrates the foundation of TypeSpec to Go conversion: basic models, optional fields, arrays, and nested structures.

## 📋 What's Demonstrated

- **Basic types**: `string`, `int64`, `boolean`, `float64`, `utcDateTime`
- **Optional fields**: `bio?: string` → `Bio *string` in Go
- **Arrays**: `tags: string[]` → `Tags []string` in Go
- **Maps**: `metadata: Record<string>` → `Metadata map[string]string` in Go
- **Nested models**: Models referencing other models
- **JSON serialization**: Automatic `json` struct tags

## 🔄 Generate

```bash
npx ts-node src/cli/index.ts basic-models.tsp --output generated.go
```

## 🧪 Test

```bash
go build generated.go
```

## 📊 Generated Code

- **4 structs** with proper Go naming conventions
- **4 constructors** (`NewUser`, `NewProfile`, etc.)
- **JSON tags** for all fields
- **Pointer types** for optional fields
- **Time handling** with `time.Time` import

Perfect starting point for understanding TypeSpec → Go conversion!