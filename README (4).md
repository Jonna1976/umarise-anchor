# @umarise/anchor

Minimal SDK for the Umarise Core v1 Anchoring API.
Zero dependencies. <4 KB gzipped.

## Install

```
npm install @umarise/anchor
```

## Usage

```typescript
import { anchor, hashBuffer } from '@umarise/anchor';
import { readFileSync } from 'fs';

const hash = await hashBuffer(readFileSync('contract.pdf'));
const result = await anchor(hash, { apiKey: process.env.UMARISE_API_KEY });
console.log(`Origin: ${result.originId}`);
```

## API

- **anchor(hash, options)** — Register a hash. Requires API key. Returns originId.
- **verify(hash)** — Check if a hash exists. No API key needed.
- **proof(originId)** — Download .ots proof. No API key needed.
- **hashBuffer(buffer)** — SHA-256 hash a buffer (async, Web Crypto).

Full reference: https://umarise.com/api-reference

## License

Unlicense — Public Domain
