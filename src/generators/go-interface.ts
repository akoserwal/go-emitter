import { InterfaceDef, EmitterConfig } from '../types';
import { mapTypeSpecTypeToGo } from '../core/type-mapper';

export function generateGoInterface(
  interfaceDef: InterfaceDef,
  knownEnums: string[],
  config: EmitterConfig
): string {
  let goCode = generateInterfaceDeclaration(interfaceDef, knownEnums);

  if (config.generateHTTPClient) {
    goCode += generateHTTPClient(interfaceDef, knownEnums);
  }

  return goCode;
}

function generateInterfaceDeclaration(interfaceDef: InterfaceDef, knownEnums: string[]): string {
  return `// ${interfaceDef.interfaceName} defines the contract for ${interfaceDef.interfaceName.toLowerCase()} operations
type ${interfaceDef.interfaceName} interface {
${interfaceDef.methods
  .map((method) => {
    const params = method.params
      .map((param) => {
        const goType = mapTypeSpecTypeToGo(param.type, knownEnums);
        return `${param.name} ${goType}`;
      })
      .join(', ');

    let returnType = 'error';
    if (method.returnType !== 'void') {
      const goReturnType = mapTypeSpecTypeToGo(method.returnType, knownEnums);
      returnType = `(${goReturnType}, error)`;
    }

    const capitalizedName = method.name.charAt(0).toUpperCase() + method.name.slice(1);
    const paramsWithComma = params ? `, ${params}` : '';
    return `\t${capitalizedName}(ctx context.Context${paramsWithComma}) ${returnType}`;
  })
  .join('\n')}
}

`;
}

function generateHTTPClient(interfaceDef: InterfaceDef, knownEnums: string[]): string {
  return `// ${interfaceDef.interfaceName}Client implements ${interfaceDef.interfaceName} using HTTP requests
type ${interfaceDef.interfaceName}Client struct {
\tbaseURL string
\thttpClient *http.Client
}

// New${interfaceDef.interfaceName}Client creates a new HTTP client for ${interfaceDef.interfaceName}
func New${interfaceDef.interfaceName}Client(baseURL string) *${interfaceDef.interfaceName}Client {
\treturn &${interfaceDef.interfaceName}Client{
\t\tbaseURL: baseURL,
\t\thttpClient: &http.Client{},
\t}
}

${interfaceDef.methods.map((method) => generateHTTPMethod(interfaceDef.interfaceName, method, knownEnums)).join('\n\n')}

`;
}

function generateHTTPMethod(serviceName: string, method: any, knownEnums: string[]): string {
  const params = method.params
    .map((param: any) => {
      const goType = mapTypeSpecTypeToGo(param.type, knownEnums);
      return `${param.name} ${goType}`;
    })
    .join(', ');

  let returnType = 'error';
  let returnStmt = 'return nil';
  let resultDeclaration = '';
  if (method.returnType !== 'void') {
    const goReturnType = mapTypeSpecTypeToGo(method.returnType, knownEnums);
    returnType = `(${goReturnType}, error)`;
    returnStmt = `return result, nil`;
    resultDeclaration = `\tvar result ${goReturnType}\n`;
  }

  const capitalizedName = method.name.charAt(0).toUpperCase() + method.name.slice(1);

  // Simple HTTP method mapping
  let httpMethod = 'GET';
  const endpoint = `/${method.name}`;
  if (method.name.startsWith('create') || method.name.startsWith('add')) {
    httpMethod = 'POST';
  } else if (method.name.startsWith('update')) {
    httpMethod = 'PUT';
  } else if (method.name.startsWith('delete')) {
    httpMethod = 'DELETE';
  }

  let httpCode = `${resultDeclaration}\t// TODO: Implement HTTP ${httpMethod} request to ${endpoint}\n\t${returnStmt}`;

  // Generate actual HTTP code for common patterns
  if (httpMethod === 'GET' && method.returnType !== 'void') {
    httpCode = `\tvar result ${mapTypeSpecTypeToGo(method.returnType, knownEnums)}
\turl := fmt.Sprintf("%s${endpoint}", c.baseURL)
\treq, err := http.NewRequestWithContext(ctx, "${httpMethod}", url, nil)
\tif err != nil {
\t\treturn result, err
\t}
\treq.Header.Set("Accept", "application/json")

\tresp, err := c.httpClient.Do(req)
\tif err != nil {
\t\treturn result, err
\t}
\tdefer resp.Body.Close()

\tif resp.StatusCode != http.StatusOK {
\t\treturn result, fmt.Errorf("HTTP error: %d", resp.StatusCode)
\t}

\tif err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
\t\treturn result, err
\t}
\treturn result, nil`;
  }

  const paramsWithComma = params ? `, ${params}` : '';
  return `// ${capitalizedName} ${httpMethod}s ${method.name} via HTTP
func (c *${serviceName}Client) ${capitalizedName}(ctx context.Context${paramsWithComma}) ${returnType} {
${httpCode}
}`;
}
