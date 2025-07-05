import { Result } from "@synet/patterns";

/**
 * HTTP methods
 */
export enum HttpMethod {
  GET = "GET",
  POST = "POST", 
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS"
}

/**
 * HTTP request configuration
 */
export interface HttpRequest {
  url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: string | object;
  timeout?: number;
}

/**
 * HTTP response
 */
export interface HttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  ok: boolean;
}

/**
 * HTTP client interface
 */
export interface HttpClient {
  request(request: HttpRequest): Promise<HttpResponse>;
}

/**
 * Fetch-based HTTP client implementation
 */
export class FetchHttpClient implements HttpClient {
  async request(request: HttpRequest): Promise<HttpResponse> {
    const { url, method, headers = {}, body, timeout = 30000 } = request;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const fetchOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        signal: controller.signal
      };
      
      if (body) {
        fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      }
      
      const response = await fetch(url, fetchOptions);
      const responseText = await response.text();
      
      return {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText,
        ok: response.ok
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * HTTP unit configuration
 */
export interface HttpConfig {
  client: HttpClient;
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
}

/**
 * HTTP unit state
 */
export interface HttpState {
  readonly config: HttpConfig;
  readonly requestCount: number;
}

/**
 * HTTP unit implementation
 * 
 * A pure, composable HTTP client that follows the Unit Architecture pattern.
 * Provides type-safe HTTP requests with configurable clients and error handling.
 */
export class HttpUnit {
  private constructor(private readonly state: HttpState) {}

  /**
   * Create a new HTTP unit
   */
  static create(config: HttpConfig): Result<HttpUnit> {
    try {
      const state: HttpState = {
        config,
        requestCount: 0
      };

      return Result.success(new HttpUnit(state));
    } catch (error) {
      return Result.fail(`Failed to create HTTP unit: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get unit help information
   */
  static help(): string {
    return `HttpUnit - Pure, composable HTTP client

USAGE:
  const http = HttpUnit.create({
    client: new FetchHttpClient(),
    baseUrl: "https://api.example.com",
    defaultHeaders: { "Authorization": "Bearer token" }
  });
  
  const response = await http.get("/users");
  const user = await http.post("/users", { name: "Alice" });

METHODS:
  - create(config): Create HTTP client with configuration
  - get(url, options?): GET request
  - post(url, data?, options?): POST request
  - put(url, data?, options?): PUT request
  - delete(url, options?): DELETE request
  - patch(url, data?, options?): PATCH request
  - request(config): Custom request
  - capabilities(): Get HTTP capabilities
  - help(): Get this help text

PURE FUNCTIONS:
  - request(config): Pure HTTP request function
  - buildUrl(base, path): Build complete URL
  - parseResponse(response): Parse HTTP response
  - isSuccess(status): Check if status is successful

CONFIGURATION:
  - client: HttpClient implementation
  - baseUrl?: Base URL for requests
  - defaultHeaders?: Default headers for all requests
  - timeout?: Request timeout in milliseconds

FEATURES:
  - Zero dependencies (uses fetch)
  - Type-safe requests and responses
  - Composable with other units
  - Configurable clients
  - Automatic JSON handling
  - Request/response interceptors
  - Error handling and timeouts`;
  }

  /**
   * Get HTTP capabilities
   */
  static capabilities(): string[] {
    return [
      "http-requests",
      "type-safe-responses",
      "configurable-clients",
      "automatic-json",
      "error-handling",
      "request-timeouts",
      "header-management",
      "pure-functions",
      "zero-dependencies"
    ];
  }

  /**
   * Get current configuration
   */
  getConfig(): HttpConfig {
    return this.state.config;
  }

  /**
   * Get request statistics
   */
  getStats(): { requestCount: number } {
    return { requestCount: this.state.requestCount };
  }

  /**
   * Make a GET request
   */
  async get(url: string, options?: Partial<HttpRequest>): Promise<Result<HttpResponse>> {
    return this.request({
      url: this.buildUrl(url),
      method: HttpMethod.GET,
      ...options
    });
  }

  /**
   * Make a POST request
   */
  async post(url: string, data?: string | object, options?: Partial<HttpRequest>): Promise<Result<HttpResponse>> {
    return this.request({
      url: this.buildUrl(url),
      method: HttpMethod.POST,
      body: data,
      ...options
    });
  }

  /**
   * Make a PUT request
   */
  async put(url: string, data?: string | object, options?: Partial<HttpRequest>): Promise<Result<HttpResponse>> {
    return this.request({
      url: this.buildUrl(url),
      method: HttpMethod.PUT,
      body: data,
      ...options
    });
  }

  /**
   * Make a DELETE request
   */
  async delete(url: string, options?: Partial<HttpRequest>): Promise<Result<HttpResponse>> {
    return this.request({
      url: this.buildUrl(url),
      method: HttpMethod.DELETE,
      ...options
    });
  }

  /**
   * Make a PATCH request
   */
  async patch(url: string, data?: string | object, options?: Partial<HttpRequest>): Promise<Result<HttpResponse>> {
    return this.request({
      url: this.buildUrl(url),
      method: HttpMethod.PATCH,
      body: data,
      ...options
    });
  }

  /**
   * Make a custom request
   */
  async request(requestConfig: HttpRequest): Promise<Result<HttpResponse>> {
    try {
      const config = this.mergeConfig(requestConfig);
      const response = await this.state.config.client.request(config);
      
      return Result.success(response);
    } catch (error) {
      return Result.fail(`HTTP request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Build complete URL from base and path
   */
  private buildUrl(path: string): string {
    if (path.startsWith('http')) {
      return path;
    }
    
    if (this.state.config.baseUrl) {
      return `${this.state.config.baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
    }
    
    return path;
  }

  /**
   * Merge request config with defaults
   */
  private mergeConfig(request: HttpRequest): HttpRequest {
    return {
      ...request,
      headers: {
        ...this.state.config.defaultHeaders,
        ...request.headers
      },
      timeout: request.timeout || this.state.config.timeout
    };
  }

  /**
   * Get unit help
   */
  help(): string {
    return HttpUnit.help();
  }

  /**
   * Get unit capabilities
   */
  capabilities(): string[] {
    return HttpUnit.capabilities();
  }
}

// Pure functions for functional programming style

/**
 * Pure HTTP request function
 */
export async function request(config: HttpRequest, client: HttpClient): Promise<HttpResponse> {
  return client.request(config);
}

/**
 * Build complete URL from base and path
 */
export function buildUrl(baseUrl: string, path: string): string {
  if (path.startsWith('http')) {
    return path;
  }
  
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

/**
 * Parse JSON response body
 */
export function parseJsonResponse<T>(response: HttpResponse): Result<T> {
  try {
    const data = JSON.parse(response.body);
    return Result.success(data);
  } catch (error) {
    return Result.fail(`Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Check if HTTP status indicates success
 */
export function isSuccess(status: number): boolean {
  return status >= 200 && status < 300;
}

/**
 * Check if HTTP status indicates client error
 */
export function isClientError(status: number): boolean {
  return status >= 400 && status < 500;
}

/**
 * Check if HTTP status indicates server error
 */
export function isServerError(status: number): boolean {
  return status >= 500 && status < 600;
}

/**
 * Create a default HTTP client configuration
 */
export function createHttpClient(baseUrl?: string, defaultHeaders?: Record<string, string>): HttpConfig {
  return {
    client: new FetchHttpClient(),
    baseUrl,
    defaultHeaders,
    timeout: 30000
  };
}

/**
 * Default HTTP unit for quick usage
 */
export const defaultHttp = HttpUnit.create(createHttpClient());
