import { AnchorError } from './errors';

const DEFAULT_BASE_URL = 'https://core.umarise.com';
const DEFAULT_TIMEOUT = 30_000;

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

export async function proof(
  originId: string,
  options?: ProofOptions,
): Promise<ProofResult> {
  const base = options?.baseUrl ?? DEFAULT_BASE_URL;
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(
      `${base}/v1-core-proof?origin_id=${encodeURIComponent(originId)}`,
      { signal: controller.signal },
    );

    if (res.status === 404) {
      return { originId, status: 'not_found', data: null, bitcoinBlockHeight: null, anchoredAt: null };
    }
    if (res.status === 202) {
      return { originId, status: 'pending', data: null, bitcoinBlockHeight: null, anchoredAt: null };
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new AnchorError('UNKNOWN', res.status, body.error ?? res.statusText);
    }

    const buffer = await res.arrayBuffer();
    const blockHeight = res.headers.get('x-bitcoin-block-height');
    const anchoredAt = res.headers.get('x-anchored-at');

    return {
      originId,
      status: 'anchored',
      data: new Uint8Array(buffer),
      bitcoinBlockHeight: blockHeight ? Number(blockHeight) : null,
      anchoredAt: anchoredAt ?? null,
    };
  } finally {
    clearTimeout(timer);
  }
}
