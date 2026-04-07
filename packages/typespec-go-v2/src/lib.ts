/**
 * TypeSpec Go Emitter v2 - Proper TypeSpec Implementation
 * Uses TypeSpec compiler APIs for full semantic analysis
 */

import { createTypeSpecLibrary, paramMessage } from "@typespec/compiler";

export const $lib = createTypeSpecLibrary({
  name: "go",
  diagnostics: {
    "unsupported-type": {
      severity: "error",
      messages: {
        default: paramMessage`Go emitter doesn't support type: ${"typeName"}`,
      },
    },
    "invalid-go-identifier": {
      severity: "error",
      messages: {
        default: paramMessage`Invalid Go identifier: ${"name"}`,
      },
    },
    "missing-http-metadata": {
      severity: "warning",
      messages: {
        default: "Interface missing HTTP metadata - generating basic interface",
      },
    },
    "reserved-keyword": {
      severity: "warning",
      messages: {
        default: paramMessage`Go reserved keyword '${"keyword"}' renamed to '${"newName"}'`,
      },
    },
  },
  requireImports: [
    // Require these for HTTP semantics
    "@typespec/http",
    "@typespec/rest",
  ],
});

export { $onEmit } from "./emitter.js";

// Export useful types for external consumers
export type { GoEmitterOptions } from "./types.js";