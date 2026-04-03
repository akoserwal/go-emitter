# Architecture Evolution

Shows how the codebase evolved from monolithic script to clean architecture.

## 🔄 Evolution Timeline

### Stage 1: Single File (~100 lines)
```
simple-emitter.ts    # Everything in one file
├── parseModel()     # Regex parsing
├── generateStruct() # String template
└── main()          # File I/O
```

**Pros:** Simple, understandable, works
**Cons:** Will become unwieldy with more features

### Stage 2: Feature Addition (~300 lines)
```
simple-emitter.ts           # Still one file, but growing
├── parseModel()           # Basic models
├── parseEnum()            # Added enums
├── parseArrays()          # Added arrays
├── parseOptional()        # Added optional fields
├── generateStruct()       # More complex
├── generateEnum()         # Enum generation
└── main()                # More configuration
```

**Pros:** Still one file to understand
**Cons:** Starting to get complex, functions doing multiple things

### Stage 3: More Features (~600 lines)
```
simple-emitter.ts                    # Getting large
├── parseTypeSpecFile()              # Complex parsing
│   ├── parseModels()
│   ├── parseEnums()
│   ├── parseInterfaces()
│   └── parseUnions()
├── generateGoStruct()               # Many responsibilities
├── generateGoEnum()
├── generateGoInterface()
├── generateHttpClient()             # HTTP generation
├── generateValidation()             # Validation logic
├── generateBuilder()                # Builder pattern
└── main()                          # CLI + config
```

**Pros:** All features working
**Cons:** Single file hard to navigate, functions doing too much

### Stage 4: Clean Architecture (~600 lines, organized)

```
src/
├── types/index.ts                   # Type definitions
├── core/
│   ├── parser.ts                    # Pure parsing logic
│   ├── type-mapper.ts               # Type system mapping
│   └── emitter.ts                   # Orchestration
├── generators/                      # Single-purpose generators
│   ├── go-struct.ts                 # Struct generation only
│   ├── go-enum.ts                   # Enum generation only
│   ├── go-interface.ts              # Interface + HTTP clients
│   └── go-union.ts                  # Union generation only
└── cli/
    └── index.ts                     # CLI interface only
```

## 🎯 Key Refactoring Decisions

### Separation by Responsibility
```typescript
// Before: One function doing everything
function generateGoStruct(model, knownEnums, config) {
  // 1. Generate struct declaration
  // 2. Generate constructor
  // 3. Generate validation
  // 4. Generate JSON methods
  // 5. Generate builder pattern
  // 100+ lines in one function
}

// After: Composed of single-purpose functions
function generateGoStruct(model, knownEnums, config) {
  let code = generateStructDeclaration(model, knownEnums);
  code += generateConstructor(model, requiredFields, knownEnums);

  if (config.generateValidation) {
    code += generateValidation(model);
  }

  if (config.generateJSON) {
    code += generateJSONMethods(model);
  }

  return code;
}
```

### Clear Module Boundaries
```typescript
// parser.ts - Only parsing, no generation
export function parseTypeSpecFile(content: string): ParsedTypeSpec

// type-mapper.ts - Only type mapping
export function mapTypeSpecTypeToGo(type: string, knownEnums: string[]): string

// go-struct.ts - Only struct generation
export function generateGoStruct(model: ModelDef, knownEnums: string[], config: EmitterConfig): string
```

### Configuration Separation
```typescript
// Before: Config scattered throughout
const packageName = argv.package || 'main';
const generateValidation = true; // Hardcoded

// After: Explicit config objects
interface EmitterConfig {
  packageName: string;
  generateValidation: boolean;
  generateBuilders: boolean;
  // ...
}
```

## 📊 Metrics Comparison

| Metric | Monolithic | Clean Architecture |
|--------|------------|------------------|
| Largest file | 600 lines | 150 lines |
| Functions per file | 15+ | 3-5 |
| Responsibilities per module | Many | One |
| Test complexity | Hard to test | Easy to unit test |
| New feature difficulty | Modify large file | Add new module |

## 🧠 Architecture Benefits

### For Development
- **Single responsibility** - Each file has one job
- **Easy testing** - Test components in isolation
- **Clear interfaces** - Know what each module does
- **Easy extension** - Add new generators without touching existing code

### For Understanding
- **Progressive disclosure** - Understand one layer at a time
- **Clear dependencies** - See what depends on what
- **Documentation by code structure** - Architecture tells the story

### For Maintenance
- **Isolated changes** - Modify one concern without affecting others
- **Clear debugging** - Know which module handles what
- **Safe refactoring** - Change internal implementation without breaking interface

## 🎓 Refactoring Lessons

1. **Don't refactor too early** - Let patterns emerge from working code
2. **Refactor when adding becomes painful** - When functions get too long
3. **Preserve working behavior** - Refactor internals, keep interfaces
4. **Test before and after** - Ensure refactoring doesn't break functionality
5. **Clean architecture enables features** - New features become easier to add

## 📈 Future Evolution

The clean architecture enables:
- **Plugin system** - New generators as separate modules
- **Language targets** - Add TypeScript, Python generators
- **Advanced features** - Streaming parsers, language server integration
- **Community contributions** - Clear module boundaries for external contributions

**Key insight:** Start simple, refactor when patterns emerge, maintain working behavior throughout.