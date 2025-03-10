// src/errors.ts
export enum SDKErrorType {
  Unauthorized = "unauthorized",
  NotFound = "not_found",
  BadRequest = "bad_request",
  ApiError = "api_error",
  Unknown = "unknown",
  RateLimitExceeded = "rate_limit_exceeded",
  PaymentRequired = "payment_required",
  ValidationError = "validation_error",
}

export class SDKError extends Error {
  type: SDKErrorType;

  constructor(type: SDKErrorType, message?: string) {
    super(message);
    this.name = "UtopianLabsError";
    this.type = type;

    // This is needed to make instanceof work correctly in TypeScript
    Object.setPrototypeOf(this, SDKError.prototype);
  }

  static isSDKError(error: any): error is SDKError {
    return error instanceof SDKError;
  }
}
