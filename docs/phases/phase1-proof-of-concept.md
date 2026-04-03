# Phase 1: Proof of Concept

**Goal:** Build the simplest possible TypeSpec → Go converter that works

## 🎯 Success Criteria

- Parse one TypeSpec model: `model User { name: string; age: int32; }`
- Generate valid Go struct with JSON tags
- Include constructor function
- ~100 lines of readable TypeScript

## 📝 Implementation

### Core Insight
Use regex to parse TypeSpec syntax + string templates to generate Go code.

```typescript
// Dead simple approach - no AST, no complex parsing
const modelRegex = /model\s+(\w+)\s*\{\s*(.*?)\s*\}/s;
const fieldRegex = /(\w+):\s*(\w+)\s*;/g;

// String template generation
const goStruct = `type ${modelName} struct {
${fields.map(field => `\t${capitalize(field.name)} ${mapType(field.type)} \`json:"${field.name}"\``).join('\n')}
}`;
```

### Type Mapping
Start with minimal mapping:
```typescript
const typeMap = {
  'string': 'string',
  'int32': 'int32',
  'int64': 'int64',
  'boolean': 'bool',
  'float64': 'float64'
};
```

### Test Case
```typescript
// Input
model User {
  name: string;
  age: int32;
  email: string;
}

// Generated Output
package main

type User struct {
    Name  string `json:"name"`
    Age   int32  `json:"age"`
    Email string `json:"email"`
}

func NewUser(name string, age int32, email string) *User {
    return &User{
        Name:  name,
        Age:   age,
        Email: email,
    }
}
```

## ✅ Results

- **Lines of code:** ~80 TypeScript
- **Time to working:** 2 hours
- **Go code compiles:** Yes
- **JSON marshaling works:** Yes

## 🧠 Key Learnings

1. **Regex is sufficient** for TypeSpec's simple grammar
2. **String concatenation** beats complex templating engines
3. **Type mapping** is straightforward dictionary lookup
4. **JSON tags** are essential for real-world use
5. **Constructor functions** make generated code usable

## 🚀 What This Proved

You can build a working code generator with:
- No parsing libraries
- No templating engines
- No complex abstractions
- Just regex + string manipulation

**This foundation supports all future complexity.**

## 📈 Next Phase

With proof of concept working, Phase 2 adds:
- Array types (`string[]`)
- Optional fields (`email?: string`)
- Enums with proper Go constants

The regex approach scales to handle these incremental additions.