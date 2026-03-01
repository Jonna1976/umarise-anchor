import { AnchorError } from './errors';

const DEFAULT_BASE_URL = 'https://core.umarise.com';
const DEFAULT_TIMEOUT = 12_000;

export interface AnchorOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export interface AnchorResult {
  originId: string;
  hash: string;
  capturedAt: string;
  proofStatus: 'pending';
}

export interface VerifyOptions {
  baseUrl?: string;
  timeout?: number;
}

export interface VerifyResult {
  originId: string;
  hash: string;
  capturedAt: string;
  proofStatus: 'pending' | 'anchored';
  proofUrl: string;
}

export interface ProofOptions {
  baseUrl?: string;
  timeout?: number;
}

export interface ProofResult {
  originId: string;
  status: 'anchored' | 'pending' | 'not_found';
  data: Uint8Array | null;
  bitcoinBlockHeight: number | null;
  anchoredAt: string | null;
}

function normalizeHash(input: string): string {
  const raw = input.startsWith('sha256:') ? input.slice(7) : input;
  if (!/^[a-f0-9]{64}$/i.test(raw)) {
    throw new AnchorError('INVALID_HASH', 400, 'Not a valid SHA-256 hash');
  }
  return `sha256:${raw.toLowerCase()}`;
}

export async function anchor(
  hash: string,
  options: AnchorOptions,
): Promise<AnchorResult> {
  const normalized = normalizeHash(hash);
  const base = options.baseUrl ?? DEFAULT_BASE_URL;
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${base}/v1-core-origins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': options.apiKey,
      },
      body: JSON.stringify({ hash: normalized }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const code =
        res.status === 409 ? 'DUPLICATE_HASH' :
        res.status === 401 ? 'UNAUTHORIZED' :
        res.status === 429 ? 'RATE_LIMITED' :
        res.status === 400 ? 'INVALID_HASH' : 'UNKNOWN';
      const retryAfter =
        res.status === 429
          ? Number(res.headers.get('retry-after') ?? body.retryAfter ?? 60)
          : undefined;
      throw new AnchorError(code, res.status, body.error ?? res.statusText, retryAfter);
    }

    const data = await res.json();
    return {
      originId: data.origin_id,
      hash: normalized,
      capturedAt: data.captured_at,
      proofStatus: 'pending',
    };
  } finally {
    clearTimeout(timer);
  }
}
