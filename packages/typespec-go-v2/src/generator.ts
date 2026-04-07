/**
 * Go Code Generator using TypeSpec AST
 * Proper semantic analysis and type resolution
 */

import {
  Program,
  Model,
  Enum,
  Interface,
  Type,
  ModelProperty,
  Operation,
  getDoc,
  getTypeName,
  isArrayModelType,
} from "@typespec/compiler";

import {
  getHttpService,
  getHttpOperation,
  getRoute,
  HttpOperation,
} from "@typespec/http";

import { GoEmitterOptions } from "./types.js";

export class GoCodeGenerator {
  private packageName: string;
  private generateHttpClient: boolean;
  private generateValidation: boolean;

  constructor(
    private program: Program,
    private options: GoEmitterOptions
  ) {
    this.packageName = options["package-name"] ?? "generated";
    this.generateHttpClient = options["generate-http-client"] ?? true;
    this.generateValidation = options["generate-validation"] ?? false;
  }

  emitModel(model: Model): string {
    const name = getTypeName(model);
    const doc = getDoc(this.program, model);

    let code = this.emitPackageHeader();
    code += this.emitModelStruct(model, name, doc);

    if (this.options["generate-constructors"] !== false) {
      code += this.emitModelConstructor(model, name);
    }

    if (this.generateValidation) {
      code += this.emitModelValidation(model, name);
    }

    return code;
  }

  emitEnum(enumType: Enum): string {
    const name = getTypeName(enumType);
    const doc = getDoc(this.program, enumType);

    let code = this.emitPackageHeader();
    code += this.emitEnumType(enumType, name, doc);
    code += this.emitEnumConstants(enumType, name);
    code += this.emitEnumStringMethod(enumType, name);

    return code;
  }

  emitInterface(iface: Interface): string {
    const name = getTypeName(iface);
    const doc = getDoc(this.program, iface);

    let code = this.emitPackageHeader();
    code += this.emitInterfaceDeclaration(iface, name, doc);

    if (this.generateHttpClient) {
      const httpService = getHttpService(this.program, iface);
      if (httpService) {
        code += this.emitHttpClient(iface, name);
      }
    }

    return code;
  }

  private emitPackageHeader(): string {
    const imports = new Set<string>();

    // Always need these for HTTP clients
    if (this.generateHttpClient) {
      imports.add("context");
      imports.add("encoding/json");
      imports.add("fmt");
      imports.add("net/http");
    }

    // Add time for datetime types
    imports.add("time");

    const importList = Array.from(imports).sort();
    const importBlock = importList.length > 1
      ? `import (\n${importList.map(imp => `\t"${imp}"`).join('\n')}\n)\n\n`
      : importList.length === 1
        ? `import "${importList[0]}"\n\n`
        : '';

    return `package ${this.packageName}\n\n${importBlock}`;
  }

  private emitModelStruct(model: Model, name: string, doc?: string): string {
    let code = `// ${name} ${doc || `represents a ${name.toLowerCase()} entity`}\n`;
    code += `type ${name} struct {\n`;

    for (const [propName, property] of model.properties) {
      const fieldName = this.toGoFieldName(propName);
      const fieldType = this.emitType(property.type);
      const jsonTag = `\`json:"${propName}"\``;
      const optional = property.optional ? "*" : "";

      code += `\t${fieldName} ${optional}${fieldType} ${jsonTag}\n`;
    }

    code += "}\n\n";
    return code;
  }

  private emitModelConstructor(model: Model, name: string): string {
    const requiredProps = Array.from(model.properties.values()).filter(p => !p.optional);

    if (requiredProps.length === 0) {
      return `// New${name} creates a new ${name} instance\nfunc New${name}() *${name} {\n\treturn &${name}{}\n}\n\n`;
    }

    const params = requiredProps
      .map(prop => {
        const paramName = this.toGoParamName(prop.name);
        const paramType = this.emitType(prop.type);
        return `${paramName} ${paramType}`;
      })
      .join(", ");

    const assignments = requiredProps
      .map(prop => {
        const fieldName = this.toGoFieldName(prop.name);
        const paramName = this.toGoParamName(prop.name);
        return `\t\t${fieldName}: ${paramName},`;
      })
      .join("\n");

    return `// New${name} creates a new ${name} instance
func New${name}(${params}) *${name} {
\treturn &${name}{
${assignments}
\t}
}

`;
  }

  private emitType(type: Type): string {
    switch (type.kind) {
      case "Model":
        if (isArrayModelType(this.program, type)) {
          const elementType = this.emitType(type.indexer!.value!);
          return `[]${elementType}`;
        }
        return getTypeName(type);

      case "Scalar":
        return this.mapScalarType(type.name);

      case "Union":
        // For now, use interface{} for unions
        return "interface{}";

      default:
        return "interface{}";
    }
  }

  private mapScalarType(scalarName: string): string {
    const typeMap: Record<string, string> = {
      "string": "string",
      "int32": "int32",
      "int64": "int64",
      "float32": "float32",
      "float64": "float64",
      "boolean": "bool",
      "utcDateTime": "time.Time",
      "bytes": "[]byte",
    };

    return typeMap[scalarName] || "interface{}";
  }

  private emitEnumType(enumType: Enum, name: string, doc?: string): string {
    return `// ${name} ${doc || `represents the possible values for ${name.toLowerCase()}`}\ntype ${name} int\n\n`;
  }

  private emitEnumConstants(enumType: Enum, name: string): string {
    let code = `// ${name} constants\nconst (\n`;

    let index = 0;
    for (const [memberName] of enumType.members) {
      const constName = `${name}${memberName}`;
      if (index === 0) {
        code += `\t${constName} ${name} = iota\n`;
      } else {
        code += `\t${constName}\n`;
      }
      index++;
    }

    code += ")\n\n";
    return code;
  }

  private emitEnumStringMethod(enumType: Enum, name: string): string {
    let code = `// String returns the string representation of ${name}\n`;
    code += `func (e ${name}) String() string {\n\tswitch e {\n`;

    for (const [memberName] of enumType.members) {
      const constName = `${name}${memberName}`;
      code += `\tcase ${constName}:\n\t\treturn "${memberName}"\n`;
    }

    code += `\tdefault:\n\t\treturn "Unknown"\n\t}\n}\n\n`;
    return code;
  }

  private emitInterfaceDeclaration(iface: Interface, name: string, doc?: string): string {
    let code = `// ${name} ${doc || `defines the contract for ${name.toLowerCase()} operations`}\n`;
    code += `type ${name} interface {\n`;

    for (const [opName, operation] of iface.operations) {
      const methodName = this.toGoMethodName(opName);
      const params = this.emitOperationParameters(operation);
      const returnType = this.emitOperationReturnType(operation);

      code += `\t${methodName}(ctx context.Context${params}) ${returnType}\n`;
    }

    code += "}\n\n";
    return code;
  }

  private emitHttpClient(iface: Interface, name: string): string {
    const clientName = `${name}Client`;

    let code = `// ${clientName} implements ${name} using HTTP requests\n`;
    code += `type ${clientName} struct {\n\tbaseURL string\n\thttpClient *http.Client\n}\n\n`;

    code += `// New${clientName} creates a new HTTP client for ${name}\n`;
    code += `func New${clientName}(baseURL string) *${clientName} {\n`;
    code += `\treturn &${clientName}{\n\t\tbaseURL: baseURL,\n\t\thttpClient: &http.Client{},\n\t}\n}\n\n`;

    for (const [opName, operation] of iface.operations) {
      code += this.emitHttpMethod(operation, name, opName);
    }

    return code;
  }

  private emitHttpMethod(operation: Operation, serviceName: string, operationName: string): string {
    const methodName = this.toGoMethodName(operationName);
    const params = this.emitOperationParameters(operation);
    const returnType = this.emitOperationReturnType(operation);

    const httpOp = getHttpOperation(this.program, operation);
    const method = httpOp?.verb.toUpperCase() || "GET";
    const path = httpOp?.path || `/${operationName}`;

    return `// ${methodName} ${method}s ${path} via HTTP
func (c *${serviceName}Client) ${methodName}(ctx context.Context${params}) ${returnType} {
\t// TODO: Implement HTTP ${method} request to ${path}
\tpanic("not implemented")
}

`;
  }

  private emitOperationParameters(operation: Operation): string {
    const params: string[] = [];

    for (const [paramName, param] of operation.parameters.properties) {
      const goName = this.toGoParamName(paramName);
      const goType = this.emitType(param.type);
      params.push(`${goName} ${goType}`);
    }

    return params.length > 0 ? `, ${params.join(", ")}` : "";
  }

  private emitOperationReturnType(operation: Operation): string {
    if (operation.returnType.kind === "Model" && operation.returnType.name === "void") {
      return "error";
    }

    const returnType = this.emitType(operation.returnType);
    return `(${returnType}, error)`;
  }

  private emitModelValidation(model: Model, name: string): string {
    let code = `// Validate validates the ${name} struct\n`;
    code += `func (m *${name}) Validate() error {\n`;

    // Simple validation for required string fields
    for (const [propName, property] of model.properties) {
      if (!property.optional && property.type.kind === "Scalar" && property.type.name === "string") {
        const fieldName = this.toGoFieldName(propName);
        code += `\tif m.${fieldName} == "" {\n`;
        code += `\t\treturn fmt.Errorf("${propName} is required")\n`;
        code += `\t}\n\n`;
      }
    }

    code += `\treturn nil\n}\n\n`;
    return code;
  }

  private toGoFieldName(fieldName: string): string {
    // Handle Go reserved keywords
    const goKeywords = ['type', 'interface', 'struct', 'func', 'var', 'const', 'package', 'import'];
    if (goKeywords.includes(fieldName.toLowerCase())) {
      fieldName = fieldName + 'Field';
    }

    // Handle ID patterns
    if (fieldName === 'id') return 'ID';
    if (fieldName.endsWith('Id')) {
      const prefix = fieldName.slice(0, -2);
      return prefix.charAt(0).toUpperCase() + prefix.slice(1) + 'ID';
    }

    // Standard field name conversion
    return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  }

  private toGoParamName(paramName: string): string {
    // Handle Go reserved keywords for parameters
    const goKeywords = ['type', 'interface', 'struct', 'func', 'var', 'const', 'package', 'import'];
    if (goKeywords.includes(paramName.toLowerCase())) {
      return paramName + 'Param';
    }
    return paramName;
  }

  private toGoMethodName(methodName: string): string {
    return methodName.charAt(0).toUpperCase() + methodName.slice(1);
  }
}