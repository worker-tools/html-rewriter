#!/usr/bin/env -S deno run --allow-read --allow-write=./,/Users/qwtel/Library/Caches/deno --allow-net --allow-env=HOME,DENO_AUTH_TOKENS,DENO_DIR --allow-run=git,pnpm

// ex. scripts/build_npm.ts
import { basename, extname } from "https://deno.land/std@0.133.0/path/mod.ts";
import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

import { 
  latestVersion, copyMdFiles, getDescription, getGHTopics, getGHLicense, getGHHomepage,
} from 'https://gist.githubusercontent.com/qwtel/ecf0c3ba7069a127b3d144afc06952f5/raw/latest-version.ts'

await emptyDir("./npm/vendor");

const name = basename(Deno.cwd())

await Deno.copyFile('./vendor/html_rewriter_bg.wasm', './npm/vendor/html_rewriter_bg.wasm');

await build({
  entryPoints: ["./html-rewriter.ts", {
    name: './html-rewriter-64',
    path: './html-rewriter-64.ts'
  }, {
    name: './polyfill',
    path: './polyfill.ts'
  }, {
    name: './polyfill-64',
    path: './polyfill-64.ts'
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
    scripts: {
      postinstall: "cp vendor/* esm/vendor && cp vendor/* script/vendor && cp vendor/* src/vendor",
    },
  },
  packageManager: 'pnpm',
  compilerOptions: {
    sourceMap: true,
    target: 'ES2019',
  },
});

// post build steps
await copyMdFiles()
