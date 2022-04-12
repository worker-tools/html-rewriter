#!/usr/bin/env -S deno run -A

import { resolve } from "https://deno.land/std@0.133.0/path/mod.ts";
import Base128 from 'https://cdn.skypack.dev/base128-encoding';
// import { concatUint8Arrays } from 'https://ghuc.cc/qwtel/typed-array-utils/index.ts';

try {
  const file = await Deno.readFile(resolve(Deno.args[0]))
  const encoded = Base128.encode(file);
  const writer = Deno.stdout.writable.getWriter()
  await writer.write(new TextEncoder().encode(encoded));
  Deno.exit(0);
} catch (e) {
  console.error(e.message);
  Deno.exit(1);
}
