#!/usr/bin/env -S deno run --allow-read --allow-write=./,/Users/qwtel/Library/Caches/deno --allow-net --allow-env=HOME,DENO_AUTH_TOKENS,DENO_DIR --allow-run=git,pnpm,patch

// ex. scripts/build_npm.ts
import { basename, extname, resolve } from "https://deno.land/std@0.133.0/path/mod.ts";
import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

import { 
  latestVersion, copyMdFiles, getDescription, getGHTopics, getGHLicense, getGHHomepage,
} from 'https://gist.githubusercontent.com/qwtel/ecf0c3ba7069a127b3d144afc06952f5/raw/latest-version.ts'

import { ExtendablePromise } from 'https://ghuc.cc/worker-tools/extendable-promise/index.ts'

const patch = async (file: string, patch: string) => {
  const p = Deno.run({ cmd: ['patch', '-uN', file], stdin: 'piped' });
  await (await Deno.open(patch)).readable.pipeTo(p.stdin.writable)
  await p.status();
}

await emptyDir("./npm/vendor");

const name = basename(Deno.cwd())

await build({
  entryPoints: ["./html-rewriter.ts", {
    name: './html-rewriter-base64',
    path: './html-rewriter-base64.ts'
  }, {
    name: './html-rewriter-base64-gzip',
    path: './html-rewriter-base64-gzip.ts'
  }],
  outDir: "./npm",
  shims: {},
  test: false,
  typeCheck: false,
  package: {
    // package.json properties
    name: `@worker-tools/${name}`,
    version: await latestVersion(),
    description: await getDescription(),
    license: await getGHLicense(name).catch(() => null) ?? 'MIT',
    publishConfig: {
      access: "public"
    },
    author: "Florian Klampfer <mail@qwtel.com> (https://qwtel.com/)",
    repository: {
      type: "git",
      url: `git+https://github.com/worker-tools/${name}.git`,
    },
    bugs: {
      url: `https://github.com/worker-tools/${name}/issues`,
    },
    homepage: await getGHHomepage(name).catch(() => null) ?? `https://github.com/worker-tools/${name}#readme`,
    keywords: await getGHTopics(name).catch(() => null) ?? [],
    // scripts: {
    //   postinstall: "mkdir -p esm/vendor script/vendor src/vendor && cp vendor/* esm/vendor && cp vendor/* script/vendor && cp vendor/* src/vendor",
    // },
  },
  mappings: {
    'https://cdn.skypack.dev/@stardazed/streams-compression@1.0.0': {
      name: '@stardazed/streams-compression',
      version: '^1.0.0',
    },
  },
  packageManager: 'pnpm',
  compilerOptions: {
    sourceMap: true,
    target: 'ES2019',
  },
});

// post build steps
const e = new ExtendablePromise()

e.waitUntil(copyMdFiles());

e.waitUntil(Deno.copyFile('./vendor/html_rewriter_bg.wasm', './npm/esm/vendor/html_rewriter_bg.wasm'))
e.waitUntil(Deno.copyFile('./vendor/html_rewriter_bg.wasm', './npm/scripts/vendor/html_rewriter_bg.wasm'))
e.waitUntil(Deno.copyFile('./vendor/html_rewriter_bg.wasm', './npm/src/vendor/html_rewriter_bg.wasm'))

e.waitUntil(patch('./npm/src/html-rewriter.ts', './patches/html-rewriter.ts.patch'))
e.waitUntil(patch('./npm/src/html-rewriter-base64.ts', './patches/html-rewriter-base64.ts.patch'))
e.waitUntil(patch('./npm/src/html-rewriter-base64-gzip.ts', './patches/html-rewriter-base64.ts.patch'))

await e;

for await (const f of Deno.readDir('./npm/src')) 
  if (extname(f.name) === '.orig') 
    await Deno.remove(resolve('./npm/src', f.name))
