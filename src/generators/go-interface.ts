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
      .map((param: any) => {
        let goType = mapTypeSpecTypeToGo(param.type, knownEnums);
        // Make optional parameters pointer types (but not for arrays)
        if (param.optional && !goType.startsWith('*') && !goType.startsWith('[]')) {
          goType = `*${goType}`;
        } else if (param.optional && goType.startsWith('[]')) {
          // Optional arrays become pointers to arrays
          goType = `*${goType}`;
        }
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
  const capitalizedName = method.name.charAt(0).toUpperCase() + method.name.slice(1);

  // Extract decorator information
  const pathParams: any[] = [];
  const queryParams: any[] = [];
  const headerParams: any[] = [];
  let bodyParam: any = null;
  const regularParams: any[] = [];

  method.params.forEach((param: any) => {
    if (param.decorator) {
      switch (param.decorator.type) {
        case 'path':
          pathParams.push(param);
          break;
        case 'query':
          queryParams.push(param);
          break;
        case 'header':
          headerParams.push(param);
          break;
        case 'body':
          bodyParam = param;
          break;
      }
    } else {
      regularParams.push(param);
    }
  });

  // Build Go function parameters
  const allParams = [...pathParams, ...headerParams, ...queryParams, ...regularParams];
  if (bodyParam) allParams.push(bodyParam);

  const params = allParams
    .map((param: any) => {
      let goType = mapTypeSpecTypeToGo(param.type, knownEnums);
      // Make optional parameters pointer types (but not for arrays)
      if (param.optional && !goType.startsWith('*') && !goType.startsWith('[]')) {
        goType = `*${goType}`;
      } else if (param.optional && goType.startsWith('[]')) {
        // Optional arrays become pointers to arrays
        goType = `*${goType}`;
      }
      return `${param.name} ${goType}`;
    })
    .join(', ');

  let returnType = 'error';
  let resultDeclaration = '';
  const hasReturnValue = method.returnType !== 'void';

  if (hasReturnValue) {
    const goReturnType = mapTypeSpecTypeToGo(method.returnType, knownEnums);
    returnType = `(${goReturnType}, error)`;
    resultDeclaration = `\tvar result ${goReturnType}`;
  }

  // HTTP method from decorator or fallback
  let httpMethod = method.httpMethod || 'GET';
  if (!method.httpMethod) {
    if (method.name.startsWith('create') || method.name.startsWith('add')) {
      httpMethod = 'POST';
    } else if (method.name.startsWith('update')) {
      httpMethod = 'PUT';
    } else if (method.name.startsWith('delete')) {
      httpMethod = 'DELETE';
    }
  }

  // Generate the HTTP client implementation
  const httpCode = generateHTTPImplementation(
    method,
    httpMethod,
    pathParams,
    queryParams,
    headerParams,
    bodyParam,
    hasReturnValue,
    knownEnums
  );

  const paramsWithComma = params ? `, ${params}` : '';
  return `// ${capitalizedName} ${httpMethod}s ${method.name} via HTTP
func (c *${serviceName}Client) ${capitalizedName}(ctx context.Context${paramsWithComma}) ${returnType} {
${resultDeclaration}
${httpCode}
}`;
}

function generateHTTPImplementation(
  method: any,
  httpMethod: string,
  pathParams: any[],
  queryParams: any[],
  headerParams: any[],
  bodyParam: any,
  hasReturnValue: boolean,
  knownEnums: string[]
): string {
  const lines: string[] = [];

  // Build URL with path parameters
  lines.push(buildURLConstruction(method.name, pathParams));

  // Add query parameters
  if (queryParams.length > 0) {
    lines.push(buildQueryParameters(queryParams));
  }

  // Build request body
  let requestBody = 'nil';
  if (bodyParam) {
    lines.push(buildRequestBody(bodyParam, knownEnums));
    requestBody = 'reqBody';
  }

  // Create HTTP request
  lines.push(
    `\treq, err := http.NewRequestWithContext(ctx, "${httpMethod}", requestURL, ${requestBody})`
  );
  lines.push(`\tif err != nil {`);
  if (hasReturnValue) {
    lines.push(`\t\treturn result, err`);
  } else {
    lines.push(`\t\treturn err`);
  }
  lines.push(`\t}`);

  // Set headers
  lines.push(`\treq.Header.Set("Content-Type", "application/json")`);
  lines.push(`\treq.Header.Set("Accept", "application/json")`);

  // Add custom headers
  headerParams.forEach((header) => {
    const headerName = header.decorator?.name || header.name;
    if (header.optional) {
      lines.push(`\tif ${header.name} != nil {`);
      lines.push(`\t\treq.Header.Set("${headerName}", *${header.name})`);
      lines.push(`\t}`);
    } else {
      lines.push(`\treq.Header.Set("${headerName}", ${header.name})`);
    }
  });

  // Execute request
  lines.push(`\tresp, err := c.httpClient.Do(req)`);
  lines.push(`\tif err != nil {`);
  if (hasReturnValue) {
    lines.push(`\t\treturn result, err`);
  } else {
    lines.push(`\t\treturn err`);
  }
  lines.push(`\t}`);
  lines.push(`\tdefer resp.Body.Close()`);

  // Handle response
  lines.push(buildResponseHandling(httpMethod, hasReturnValue));

  return lines.join('\n');
}

function buildURLConstruction(methodName: string, pathParams: any[]): string {
  if (pathParams.length === 0) {
    return `\trequestURL := fmt.Sprintf("%s/${methodName}", c.baseURL)`;
  }

  // Build URL template with path parameters
  let urlTemplate = `%s/${methodName}`;
  const formatArgs = ['c.baseURL'];

  pathParams.forEach((param) => {
    urlTemplate += `/%v`;
    formatArgs.push(param.name);
  });

  return `\trequestURL := fmt.Sprintf("${urlTemplate}", ${formatArgs.join(', ')})`;
}

function buildQueryParameters(queryParams: any[]): string {
  const lines: string[] = [];
  lines.push(`\tqueryParams := url.Values{}`);

  queryParams.forEach((param) => {
    const queryName = param.decorator?.name || param.name;
    const isOptional = param.optional;
    const isArrayType = param.type.endsWith('[]') || param.type.includes('[]');

    if (isOptional) {
      lines.push(`\tif ${param.name} != nil {`);
      if (isArrayType) {
        lines.push(`\t\tfor _, v := range *${param.name} {`);
        lines.push(`\t\t\tqueryParams.Add("${queryName}", fmt.Sprintf("%v", v))`);
        lines.push(`\t\t}`);
      } else {
        lines.push(`\t\tqueryParams.Set("${queryName}", fmt.Sprintf("%v", *${param.name}))`);
      }
      lines.push(`\t}`);
    } else {
      if (isArrayType) {
        lines.push(`\tfor _, v := range ${param.name} {`);
        lines.push(`\t\tqueryParams.Add("${queryName}", fmt.Sprintf("%v", v))`);
        lines.push(`\t}`);
      } else {
        lines.push(`\tqueryParams.Set("${queryName}", fmt.Sprintf("%v", ${param.name}))`);
      }
    }
  });

  lines.push(`\tif len(queryParams) > 0 {`);
  lines.push(`\t\trequestURL += "?" + queryParams.Encode()`);
  lines.push(`\t}`);

  return lines.join('\n');
}

function buildRequestBody(bodyParam: any, knownEnums: string[]): string {
  return `\treqBodyBytes, err := json.Marshal(${bodyParam.name})
\tif err != nil {
\t\treturn ${bodyParam.type === 'void' ? '' : 'result, '}err
\t}
\treqBody := bytes.NewBuffer(reqBodyBytes)`;
}

function buildResponseHandling(httpMethod: string, hasReturnValue: boolean): string {
  const lines: string[] = [];

  // Determine expected status codes
  const expectedStatus = getExpectedStatusCode(httpMethod);
  lines.push(`\tif resp.StatusCode != ${expectedStatus} {`);
  if (hasReturnValue) {
    lines.push(`\t\treturn result, fmt.Errorf("HTTP error: %d", resp.StatusCode)`);
  } else {
    lines.push(`\t\treturn fmt.Errorf("HTTP error: %d", resp.StatusCode)`);
  }
  lines.push(`\t}`);

  // Handle response body for methods that return data
  if (hasReturnValue && httpMethod !== 'DELETE') {
    lines.push(`\tif err := json.NewDecoder(resp.Body).Decode(&result); err != nil {`);
    lines.push(`\t\treturn result, err`);
    lines.push(`\t}`);
    lines.push(`\treturn result, nil`);
  } else {
    lines.push(`\treturn nil`);
  }

  return lines.join('\n');
}

function getExpectedStatusCode(httpMethod: string): string {
  switch (httpMethod) {
    case 'POST':
      return 'http.StatusCreated';
    case 'DELETE':
      return 'http.StatusNoContent';
    case 'PUT':
    case 'PATCH':
      return 'http.StatusOK';
    default:
      return 'http.StatusOK';
  }
}
