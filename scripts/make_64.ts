#!/usr/bin/env -S deno run -A

import * as base64 from 'https://deno.land/std@0.134.0/encoding/base64.ts'
import { concat } from 'https://deno.land/std@0.134.0/bytes/mod.ts'

const regex = /[A-Za-z0-9+=/][A-Za-z0-9+=/\n]{118,}[A-Za-z0-9+=/]/;

const bufferStream = async (s: ReadableStream<Uint8Array>) => {
  const chunks: Uint8Array[] = []; 
  for await (const chunk of s) chunks.push(chunk);
  return concat(...chunks);
}

const fold = (w: number, s: string) => s.match(new RegExp(`.{1,${w}}`, 'g'))!.join('\n')

const [wasm, target, target_gzip] = await Promise.all([
  Deno.open('./vendor/html_rewriter_bg.wasm'),
  Deno.readTextFile('./html-rewriter-base64.ts'),
  Deno.readTextFile('./html-rewriter-base64-gzip.ts'),
]);

const [a, b] = wasm.readable.tee()
const bytes = await bufferStream(a);
const bytes_gzip = await bufferStream(b.pipeThrough(new CompressionStream('gzip')))

const content = target.replace(regex, fold(120, base64.encode(bytes)));
const content_gzip = target_gzip.replace(regex, fold(120, base64.encode(bytes_gzip)));

await Deno.writeTextFile('./html-rewriter-base64.ts', content);
await Deno.writeTextFile('./html-rewriter-base64-gzip.ts', content_gzip);
