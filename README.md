# HTML Rewriter

WASM-based implementation of Cloudflare's HTML Rewriter for use in Deno, browsers, etc. 

It uses `lol-html` under the hood, the same implementation used by Cloudflare Workers. It is based on [Miniflare's WASM build](https://github.com/mrbbot/html-rewriter-wasm).

## Installation
This package includes 2 versions of HTML Rewriter. 

`index.ts` loads the WASM that is co-located with this module via fetch and (streaming-) instantiates the module that way. In Deno, this works via file system (if you've downloaded the module) and web (when loading from deno.land/x or even githubusercontent.com). 
However, if you are using this version with other tooling, depending on the bundler and configuration the WASM source may or may not be included...

`base64.ts` has the required WASM inlined as compressed base64. The total size is 447K (345K gzipped). 
This ensures that HTML Rewriter is working properly when bundled, offline, etc. 
The "hackyness" of ~400K of inlined WASM and relying on [`DecompressionStream`][dcs] is significant (without compression, the file size would be 1.2MB), but its simplicity makes it easier to get it to work with various bundlers (including Deno's own, as of this writing).

[dcs]: https://developer.mozilla.org/en-US/docs/Web/API/DecompressionStream

### Use in Browser
For use in the browser it's best to install the "node-ified" package from npm and use it with a bundler.

```sh
npm install @worker-tools/html-rewriter
```

Which version of HTML Rewriter to pick depends on which bundler you are using:

For **Webpack 4**, it's best to use the non-ESM base64 version via its full path: `@worker-tools/html-rewriter/script/base64`. 

**Webpack 5** treats the regular version correctly by default, which can be imported as `@worker-tools/html-rewriter`. 

For **esbuild** it's best to use the base64-version via `@worker-tools/html-rewriter/base64`. 

You can explore the full contents of the npm package [here](https://unpkg.com/browse/@worker-tools/html-rewriter/).

## Usage

```ts
import { 
  HTMLRewriter 
} from 'https://ghuc.cc/worker-tools/html-rewriter/index.ts'

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

--------

<p align="center"><a href="https://workers.tools"><img src="https://workers.tools/assets/img/logo.svg" width="100" height="100" /></a>
<p align="center">This module is part of the Worker Tools collection<br/>⁕

[Worker Tools](https://workers.tools) are a collection of TypeScript libraries for writing web servers in [Worker Runtimes](https://workers.js.org) such as Cloudflare Workers, Deno Deploy and Service Workers in the browser. 

If you liked this module, you might also like:

- 🧭 [__Worker Router__][router] --- Complete routing solution that works across CF Workers, Deno and Service Workers
- 🔋 [__Worker Middleware__][middleware] --- A suite of standalone HTTP server-side middleware with TypeScript support
- 📄 [__Worker HTML__][html] --- HTML templating and streaming response library
- 📦 [__Storage Area__][kv-storage] --- Key-value store abstraction across [Cloudflare KV][cloudflare-kv-storage], [Deno][deno-kv-storage] and browsers.
- 🆗 [__Response Creators__][response-creators] --- Factory functions for responses with pre-filled status and status text
- 🎏 [__Stream Response__][stream-response] --- Use async generators to build streaming responses for SSE, etc...
- 🥏 [__JSON Fetch__][json-fetch] --- Drop-in replacements for Fetch API classes with first class support for JSON.
- 🦑 [__JSON Stream__][json-stream] --- Streaming JSON parser/stingifier with first class support for web streams.

Worker Tools also includes a number of polyfills that help bridge the gap between Worker Runtimes:
- ✏️ [__HTML Rewriter__][html-rewriter] --- Cloudflare's HTML Rewriter for use in Deno, browsers, etc...
- 📍 [__Location Polyfill__][location-polyfill] --- A `Location` polyfill for Cloudflare Workers.
- 🦕 [__Deno Fetch Event Adapter__][deno-fetch-event-adapter] --- Dispatches global `fetch` events using Deno’s native HTTP server.

[router]: https://workers.tools/router
[middleware]: https://workers.tools/middleware
[html]: https://workers.tools/html
[kv-storage]: https://workers.tools/kv-storage
[cloudflare-kv-storage]: https://workers.tools/cloudflare-kv-storage
[deno-kv-storage]: https://workers.tools/deno-kv-storage
[kv-storage-polyfill]: https://workers.tools/kv-storage-polyfill
[response-creators]: https://workers.tools/response-creators
[stream-response]: https://workers.tools/stream-response
[json-fetch]: https://workers.tools/json-fetch
[json-stream]: https://workers.tools/json-stream
[request-cookie-store]: https://workers.tools/request-cookie-store
[extendable-promise]: https://workers.tools/extendable-promise
[html-rewriter]: https://workers.tools/html-rewriter
[location-polyfill]: https://workers.tools/location-polyfill
[deno-fetch-event-adapter]: https://workers.tools/deno-fetch-event-adapter

Fore more visit [workers.tools](https://workers.tools).
