#!/usr/bin/env -S deno run -A

import { encode } from 'https://deno.land/std/encoding/base64.ts'

const regex = /[A-Za-z0-9+=/][A-Za-z0-9+=/\n]{118,}[A-Za-z0-9+=/]/;

const [wasm, target] = await Promise.all([
  Deno.readFile('./src/wasm/html_rewriter_bg.wasm'),
  Deno.readTextFile('./src/html-rewriter-64.ts'),
]);
const fold = (w: number) => (s: string) => s.match(new RegExp(`.{1,${w}}`, 'g'))!.join('\n')
const content = target.replace(regex, fold(120)(encode(wasm)));
await Deno.writeTextFile('./src/html-rewriter-64.ts', content);
