import { AnchorError } from './errors';
import type { VerifyOptions, VerifyResult } from './anchor';

const DEFAULT_BASE_URL = 'https://core.umarise.com';
const DEFAULT_TIMEOUT = 12_000;

export async function verify(
  hash: string,
  options?: VerifyOptions,
): Promise<VerifyResult | null> {
  const base = options?.baseUrl ?? DEFAULT_BASE_URL;
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${base}/v1-core-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash }),
      signal: controller.signal,
    });

    if (res.status === 404) return null;

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new AnchorError('UNKNOWN', res.status, body.error ?? res.statusText);
    }

    const data = await res.json();
    return {
      originId: data.origin_id,
      hash: data.hash,
      capturedAt: data.captured_at,
      proofStatus: data.proof_status ?? 'pending',
      proofUrl: data.proof_url ?? '',
    };
  } finally {
    clearTimeout(timer);
  }
}
