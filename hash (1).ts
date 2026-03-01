/**
 * Hash a buffer using SHA-256. Always async (Web Crypto API).
 * Works in Node.js 18+, Bun, Deno, and browsers.
 */
export async function hashBuffer(
  buffer: ArrayBuffer | Uint8Array | Buffer,
): Promise<string> {
  const data = buffer instanceof ArrayBuffer
    ? buffer
    : (buffer as Uint8Array).buffer.slice(
        (buffer as Uint8Array).byteOffset,
        (buffer as Uint8Array).byteOffset + (buffer as Uint8Array).byteLength,
      );

  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(digest);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return `sha256:${hex}`;
}
