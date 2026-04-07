# @typespec/go (v2)

**Proper TypeSpec Emitter for Go Code Generation**

This is v2 of the Go emitter, built using proper TypeSpec compiler APIs with full semantic analysis.

## Installation

```bash
npm install @typespec/go
```

## Usage

```bash
# Create a TypeSpec file
echo 'model User { id: string; name: string; }' > main.tsp

# Compile with Go emitter
tsp compile main.tsp --emit @typespec/go
```

## Configuration

```yaml
# tspconfig.yaml
emit:
  - "@typespec/go"
options:
  "@typespec/go":
    package-name: "myapi"
    generate-http-client: true
    generate-validation: true
    output-dir: "./generated"
```

## Features

- ✅ **Full AST Support** - Uses TypeSpec compiler APIs
- ✅ **Decorator Support** - `@route`, `@doc`, `@header`, etc.
- ✅ **HTTP Semantics** - Proper REST client generation
- ✅ **Type Resolution** - Complex types, generics, unions
- ✅ **Error Reporting** - Rich diagnostics with source locations
- ✅ **Standard Libraries** - Integration with `@typespec/http`, `@typespec/rest`

## Comparison with V1

| Feature | V1 (Regex) | V2 (AST) |
|---------|------------|----------|
| **TypeSpec Support** | Basic | Full |
| **Decorators** | ❌ | ✅ |
| **Error Reporting** | ❌ | ✅ |
| **Type Resolution** | Basic | Semantic |
| **HTTP Semantics** | Basic | Full |
| **Maintainability** | Simple | Professional |

## Migration from V1

V1 users can migrate gradually:

```bash
# V1 (continues to work for simple cases)
go-emitter api.tsp output.go

# V2 (for full TypeSpec support)
tsp compile api.tsp --emit @typespec/go
```

V2 generates more accurate, feature-complete Go code but requires proper TypeSpec project setup.