export type AnchorErrorCode =
  | 'DUPLICATE_HASH'
  | 'INVALID_HASH'
  | 'UNAUTHORIZED'
  | 'RATE_LIMITED'
  | 'UNKNOWN';

export class AnchorError extends Error {
  readonly code: AnchorErrorCode;
  readonly statusCode: number;
  readonly retryAfter?: number;

  constructor(
    code: AnchorErrorCode,
    statusCode: number,
    message: string,
    retryAfter?: number,
  ) {
    super(message);
    this.name = 'AnchorError';
    this.code = code;
    this.statusCode = statusCode;
    this.retryAfter = retryAfter;
  }
}
