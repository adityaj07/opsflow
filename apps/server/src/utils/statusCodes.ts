export const StatusCodes = {
  // 1xx Informational
  CONTINUE: { code: 100, label: 'CONTINUE' },
  SWITCHING_PROTOCOLS: { code: 101, label: 'SWITCHING_PROTOCOLS' },
  PROCESSING: { code: 102, label: 'PROCESSING' },
  EARLY_HINTS: { code: 103, label: 'EARLY_HINTS' },

  // 2xx Success
  OK: { code: 200, label: 'OK' },
  CREATED: { code: 201, label: 'CREATED' },
  ACCEPTED: { code: 202, label: 'ACCEPTED' },
  NON_AUTHORITATIVE_INFORMATION: {
    code: 203,
    label: 'NON_AUTHORITATIVE_INFORMATION',
  },
  NO_CONTENT: { code: 204, label: 'NO_CONTENT' },
  RESET_CONTENT: { code: 205, label: 'RESET_CONTENT' },
  PARTIAL_CONTENT: { code: 206, label: 'PARTIAL_CONTENT' },
  MULTI_STATUS: { code: 207, label: 'MULTI_STATUS' },
  ALREADY_REPORTED: { code: 208, label: 'ALREADY_REPORTED' },
  IM_USED: { code: 226, label: 'IM_USED' },

  // 3xx Redirection
  MULTIPLE_CHOICES: { code: 300, label: 'MULTIPLE_CHOICES' },
  MOVED_PERMANENTLY: { code: 301, label: 'MOVED_PERMANENTLY' },
  FOUND: { code: 302, label: 'FOUND' },
  SEE_OTHER: { code: 303, label: 'SEE_OTHER' },
  NOT_MODIFIED: { code: 304, label: 'NOT_MODIFIED' },
  USE_PROXY: { code: 305, label: 'USE_PROXY' },
  TEMPORARY_REDIRECT: { code: 307, label: 'TEMPORARY_REDIRECT' },
  PERMANENT_REDIRECT: { code: 308, label: 'PERMANENT_REDIRECT' },

  // 4xx Client Error
  BAD_REQUEST: { code: 400, label: 'BAD_REQUEST' },
  UNAUTHORIZED: { code: 401, label: 'UNAUTHORIZED' },
  PAYMENT_REQUIRED: { code: 402, label: 'PAYMENT_REQUIRED' },
  FORBIDDEN: { code: 403, label: 'FORBIDDEN' },
  NOT_FOUND: { code: 404, label: 'NOT_FOUND' },
  METHOD_NOT_ALLOWED: { code: 405, label: 'METHOD_NOT_ALLOWED' },
  NOT_ACCEPTABLE: { code: 406, label: 'NOT_ACCEPTABLE' },
  PROXY_AUTHENTICATION_REQUIRED: {
    code: 407,
    label: 'PROXY_AUTHENTICATION_REQUIRED',
  },
  REQUEST_TIMEOUT: { code: 408, label: 'REQUEST_TIMEOUT' },
  CONFLICT: { code: 409, label: 'CONFLICT' },
  GONE: { code: 410, label: 'GONE' },
  LENGTH_REQUIRED: { code: 411, label: 'LENGTH_REQUIRED' },
  PRECONDITION_FAILED: { code: 412, label: 'PRECONDITION_FAILED' },
  PAYLOAD_TOO_LARGE: { code: 413, label: 'PAYLOAD_TOO_LARGE' },
  URI_TOO_LONG: { code: 414, label: 'URI_TOO_LONG' },
  UNSUPPORTED_MEDIA_TYPE: { code: 415, label: 'UNSUPPORTED_MEDIA_TYPE' },
  RANGE_NOT_SATISFIABLE: { code: 416, label: 'RANGE_NOT_SATISFIABLE' },
  EXPECTATION_FAILED: { code: 417, label: 'EXPECTATION_FAILED' },
  IM_A_TEAPOT: { code: 418, label: "I'M_A_TEAPOT" }, // Easter egg, still relevant in fun APIs
  MISDIRECTED_REQUEST: { code: 421, label: 'MISDIRECTED_REQUEST' },
  UNPROCESSABLE_ENTITY: { code: 422, label: 'UNPROCESSABLE_ENTITY' },
  LOCKED: { code: 423, label: 'LOCKED' },
  FAILED_DEPENDENCY: { code: 424, label: 'FAILED_DEPENDENCY' },
  TOO_EARLY: { code: 425, label: 'TOO_EARLY' },
  UPGRADE_REQUIRED: { code: 426, label: 'UPGRADE_REQUIRED' },
  PRECONDITION_REQUIRED: { code: 428, label: 'PRECONDITION_REQUIRED' },
  TOO_MANY_REQUESTS: { code: 429, label: 'TOO_MANY_REQUESTS' },
  REQUEST_HEADER_FIELDS_TOO_LARGE: {
    code: 431,
    label: 'REQUEST_HEADER_FIELDS_TOO_LARGE',
  },
  UNAVAILABLE_FOR_LEGAL_REASONS: {
    code: 451,
    label: 'UNAVAILABLE_FOR_LEGAL_REASONS',
  },

  // 5xx Server Error
  INTERNAL_SERVER_ERROR: { code: 500, label: 'INTERNAL_SERVER_ERROR' },
  NOT_IMPLEMENTED: { code: 501, label: 'NOT_IMPLEMENTED' },
  BAD_GATEWAY: { code: 502, label: 'BAD_GATEWAY' },
  SERVICE_UNAVAILABLE: { code: 503, label: 'SERVICE_UNAVAILABLE' },
  GATEWAY_TIMEOUT: { code: 504, label: 'GATEWAY_TIMEOUT' },
  HTTP_VERSION_NOT_SUPPORTED: {
    code: 505,
    label: 'HTTP_VERSION_NOT_SUPPORTED',
  },
  VARIANT_ALSO_NEGOTIATES: { code: 506, label: 'VARIANT_ALSO_NEGOTIATES' },
  INSUFFICIENT_STORAGE: { code: 507, label: 'INSUFFICIENT_STORAGE' },
  LOOP_DETECTED: { code: 508, label: 'LOOP_DETECTED' },
  NOT_EXTENDED: { code: 510, label: 'NOT_EXTENDED' },
  NETWORK_AUTHENTICATION_REQUIRED: {
    code: 511,
    label: 'NETWORK_AUTHENTICATION_REQUIRED',
  },
} as const;

export type StatusCodeKey = keyof typeof StatusCodes;
export type StatusCode = (typeof StatusCodes)[StatusCodeKey];
