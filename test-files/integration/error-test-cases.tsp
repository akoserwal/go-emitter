// Invalid TypeSpec syntax tests
malformed enum {
  InvalidEnum
}

model MissingBraces
  field: string;

interface BadInterface {
  method(param: unknown_type): void;

// Missing closing brace
model IncompleteModel {
  field: string

// Reserved Go keywords
model Go {
  type: string;
  interface: string;
  struct: string;
  func: string;
}

// Circular references
model A {
  b: B;
}

model B {
  a: A;
}

// Deeply nested types
model VeryComplexNested {
  level1: {
    level2: {
      level3: {
        level4: {
          level5: string;
        }
      }
    }
  };
}

// Unicode and special characters
model UnicodeTest {
  emoji: string; // 🚀
  chinese: string; // 中文
  arabic: string; // العربية
  special_chars: string; // !@#$%^&*()
}

// Very long lines
model LongLineTest {
  reallyReallyReallyReallyReallyReallyReallyReallyReallyReallyReallyReallyReallyLongFieldName: string;
}