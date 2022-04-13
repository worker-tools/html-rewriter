# HTML Rewriter

WASM-based implementation of Cloudflare's HTML Rewriter for use in Deno, browsers, etc. 

It uses `lol-html` under the hood, the same implementation used by Cloudflare Workers and is based on [Miniflare's implementation](https://github.com/mrbbot/html-rewriter-wasm).

## Installation
This package includes 2 versions of HTML Rewriter. 

`html-rewriter.ts` loads the WASM that is co-located with this module via fetch and instantiates (streaming) the module that way. In Deno, this works via file system (if you've downloaded the module) and web (when loading from deno.land/x or even githubusercontent.com). 
However, if you bundle your application, the WASM will not be included.

`html-rewriter-base64.ts` has the required WASM inlined as gzipped base64. The total size is 447K (345K gzipped). 
This ensures that HTML Rewriter is working properly when bundled, offline, etc. 
Generally this is the "safer" version, but the hackyness of ~400K of base64 WASM and relying on [`DecompressionStream`][dcs] can't be overstated. 
It is however quite awesome that it works.

[dcs]: https://developer.mozilla.org/en-US/docs/Web/API/DecompressionStream


## Usage

```ts
import { 
  HTMLRewriter 
} from 'https://ghuc.cc/worker-tools/html-rewriter/html-rewriter.ts'

new HTMLRewriter()
  .on("p", {
    element(element) { 
      element.tagName = "h1" 
    },
  })
  .transform(new Response('<p class="red">test</p>'))
  .text().then(x => console.log(x))
```

For more on how to use HTMLRewriter, see the [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/runtime-apis/html-rewriter/).


## Building

Make sure you've initialized all git submodules. It is 2 levels deep.

```sh
git submodule update --init --recursive
```

Make sure you have `rustup` installed. Then run

```sh
make dist
```

This will build a custom version of `wasm-pack` first, then use it to compile `lol-html` to WASM. Please see the submodules for details on why this is necessary.

