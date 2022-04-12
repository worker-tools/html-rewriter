#!/usr/bin/env -S deno run -A

import { resolve } from "https://deno.land/std@0.133.0/path/mod.ts";

const td = new TextDecoder();
const decode = td.decode.bind(td);

const te = new TextEncoder();
const encode = te.encode.bind(te);

async function read(stream: ReadableStream<Uint8Array>) {
  const chunks = [];
  for await (const chunk of stream.pipeThrough(new TextDecoderStream())) chunks.push(chunk); 
  return chunks.join();
}

function insert(str: string, index: number, value: string) {
  return str.substring(0, index) + value + str.substring(index);
}

try {
  const [regex, o] = Deno.args;
  const [stdin, a] = await Promise.all([
    read(Deno.stdin.readable), 
    Deno.readFile(resolve(o)).then(decode)
  ]);
  const m = new RegExp(regex).exec(a);
  if (m) {
    const c = insert(a, m.index + m[0].length, stdin);
    await Deno.writeFile(resolve(o), encode(c));
    Deno.exit(0);
  }
  console.error('not found regex');
  Deno.exit(1); //????
} catch (e) {
  console.error(e.message);
  Deno.exit(1);
}
