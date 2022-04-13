#!/usr/bin/env -S deno run -A

import * as base64 from 'https://deno.land/std@0.134.0/encoding/base64.ts'

const regex = /[A-Za-z0-9+=/][A-Za-z0-9+=/\n]{118,}[A-Za-z0-9+=/]/;

const [wasm, target] = await Promise.all([
  Deno.readFile('./vendor/html_rewriter_bg.wasm'),
  Deno.readTextFile('./html-rewriter-64.ts'),
]);
const fold = (w: number, s: string) => s.match(new RegExp(`.{1,${w}}`, 'g'))!.join('\n')
const content = target.replace(regex, fold(120, base64.encode(wasm)));
await Deno.writeTextFile('./html-rewriter-64.ts', content);
