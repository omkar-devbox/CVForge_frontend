/* ================================================================
 * Types
 * ================================================================ */

// Defines supported HTTP request header formats.
export type HeadersInit = Headers | [string, string][] | Record<string, string>;

// Defines configurable options for API requests.
export interface RequestOptions extends Omit<globalThis.RequestInit, "body" | "headers"> {
  body?: BodyInit | Record<string, unknown> | unknown;
  params?: Record<
    string,
    string | number | boolean | null | undefined
  >;
  headers?: HeadersInit;
  timeout?: number;
}

// Defines the normalized API response structure.
export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  ok: boolean;
  headers: Headers;
}

// Defines supported API error categories.
export type ApiErrorType =
  | "HTTP_ERROR"
  | "NETWORK_ERROR"
  | "TIMEOUT_ERROR"
  | "ABORT_ERROR"
  | "UNKNOWN_ERROR";

// Represents a standardized API error.
export class ApiError<T = unknown> extends Error {
  readonly status: number;
  readonly data?: T;
  readonly type: ApiErrorType;

  constructor(
    message: string,
    status = 0,
    data?: T,
    type: ApiErrorType = "HTTP_ERROR"
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.type = type;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/* ================================================================
 * Configuration
 * ================================================================ */

// Defines the default request timeout.
const DEFAULT_TIMEOUT = 30_000;

// Resolves and normalizes the API base URL from environment configuration.
const getBaseUrl = (): string => {
  const envUrl = import.meta.env?.VITE_API_URL;

  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }

  return "http://localhost:8000/api/v1";
};

/* ================================================================
 * URL Builder
 * ================================================================ */

// Checks whether the endpoint is already an absolute URL.
function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

// Builds the final request URL with optional query parameters.
function buildUrl(
  endpoint: string,
  params?: RequestOptions["params"]
): string {
  const baseUrl = getBaseUrl();

  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const rawUrl = isAbsoluteUrl(endpoint)
    ? endpoint
    : `${baseUrl}${normalizedEndpoint}`;

  const url = new URL(rawUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

/* ================================================================
 * Body Helpers
 * ================================================================ */

// Checks whether the body is already a native fetch BodyInit value.
function isBodyInit(body: unknown): body is BodyInit {
  return (
    typeof body === "string" ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body)
  );
}

// Converts plain objects to JSON while preserving native body types.
function prepareBody(
  body: unknown,
  headers: Headers
): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (isBodyInit(body)) {
    return body;
  }

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return JSON.stringify(body);
}

/* ================================================================
 * Response Parsing
 * ================================================================ */

// Parses the response based on its status and content type.
async function parseResponse(
  response: Response
): Promise<unknown> {
  if (response.status === 204 || response.status === 205) {
    return null;
  }

  const contentLength = response.headers.get("content-length");
  if (contentLength === "0") {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      return await response.json();
    }

    if (
      contentType.includes("application/octet-stream") ||
      contentType.includes("application/vnd.") ||
      contentType.includes("application/zip") ||
      contentType.includes("application/pdf")
    ) {
      return await response.blob();
    }

    return await response.text();
  } catch {
    return null;
  }
}

/* ================================================================
 * Error Message Extraction
 * ================================================================ */

// Extracts a meaningful error message from the API response.
function getErrorMessage(
  data: unknown,
  response: Response
): string {
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;

    if (typeof obj.message === "string") {
      return obj.message;
    }

    if (typeof obj.error === "string") {
      return obj.error;
    }

    if (typeof obj.detail === "string") {
      return obj.detail;
    }
  }

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return (
    response.statusText ||
    `Request failed with status ${response.status}`
  );
}

/* ================================================================
 * Abort / Timeout Helper
 * ================================================================ */

// Defines the internal abort controller configuration.
interface AbortConfig {
  signal: AbortSignal;
  cleanup: () => void;
  timedOut: () => boolean;
}

// Combines external cancellation with an internal request timeout.
function createAbortSignal(
  externalSignal: AbortSignal | null | undefined,
  timeout: number
): AbortConfig {
  const controller = new AbortController();
  let timeoutTriggered = false;

  const timeoutId = window.setTimeout(() => {
    timeoutTriggered = true;
    controller.abort();
  }, timeout);

  const abortFromExternalSignal = () => {
    controller.abort();
  };

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener(
        "abort",
        abortFromExternalSignal,
        { once: true }
      );
    }
  }

  return {
    signal: controller.signal,

    timedOut: () => timeoutTriggered,

    cleanup: () => {
      window.clearTimeout(timeoutId);

      externalSignal?.removeEventListener(
        "abort",
        abortFromExternalSignal
      );
    },
  };
}

/* ================================================================
 * Core API Request
 * ================================================================ */

// Executes an HTTP request and returns a normalized API response.
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    body,
    params,
    headers,
    timeout = DEFAULT_TIMEOUT,
    signal: externalSignal,
    ...requestConfig
  } = options;

  const url = buildUrl(endpoint, params);
  const requestHeaders = new Headers(headers);

  // Sets a default response format when no Accept header is provided.
  if (!requestHeaders.has("Accept")) {
    requestHeaders.set("Accept", "application/json");
  }

  const formattedBody = prepareBody(body, requestHeaders);
  const abortConfig = createAbortSignal(externalSignal, timeout);

  const config: globalThis.RequestInit = {
    ...requestConfig,
    method: requestConfig.method ?? "GET",
    headers: requestHeaders,
    body: formattedBody,
    signal: abortConfig.signal,
  };

  try {
    const response = await fetch(url, config);
    const responseData = await parseResponse(response);

    // Convert non-2xx responses into standardized API errors.
    if (!response.ok) {
      throw new ApiError(
        getErrorMessage(responseData, response),
        response.status,
        responseData,
        "HTTP_ERROR"
      );
    }

    return {
      data: responseData as T,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: response.headers,
    };
  } catch (error) {
    // Preserve already normalized API errors.
    if (error instanceof ApiError) {
      throw error;
    }

    // Convert aborted requests into timeout or cancellation errors.
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      if (abortConfig.timedOut()) {
        throw new ApiError(
          `Request timed out after ${timeout}ms`,
          0,
          error,
          "TIMEOUT_ERROR"
        );
      }

      throw new ApiError(
        "Request was cancelled",
        0,
        error,
        "ABORT_ERROR"
      );
    }

    // Convert fetch connection failures into network errors.
    if (error instanceof TypeError) {
      throw new ApiError(
        "Unable to connect to the server",
        0,
        error,
        "NETWORK_ERROR"
      );
    }

    // Normalize any unexpected errors.
    throw new ApiError(
      error instanceof Error
        ? error.message
        : "Unknown API error occurred",
      0,
      error,
      "UNKNOWN_ERROR"
    );
  } finally {
    // Always release timeout and abort listeners after the request completes.
    abortConfig.cleanup();
  }
}

/* ================================================================
 * HTTP Convenience Methods
 * ================================================================ */

// Provides simplified wrappers for common HTTP methods.
export const apiClient = {
  // Sends a GET request.
  get<T = unknown>(
    endpoint: string,
    options?: RequestOptions
  ) {
    return apiRequest<T>(endpoint, {
      ...options,
      method: "GET",
    });
  },

  // Sends a POST request with an optional request body.
  post<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ) {
    return apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body,
    });
  },

  // Sends a PUT request with an optional request body.
  put<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ) {
    return apiRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body,
    });
  },

  // Sends a PATCH request with an optional request body.
  patch<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ) {
    return apiRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      body,
    });
  },

  // Sends a DELETE request.
  delete<T = unknown>(
    endpoint: string,
    options?: RequestOptions
  ) {
    return apiRequest<T>(endpoint, {
      ...options,
      method: "DELETE",
    });
  },
};

export default apiClient;