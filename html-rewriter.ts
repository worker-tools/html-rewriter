// FIXME: replace multiple 1 import from skypack!?
import type {
  HTMLRewriter as BaseHTMLRewriter,
  ContentTypeOptions,
  Element,
  EndTag,
  Comment,
  TextChunk,
  Doctype,
  DocumentEnd,
  ElementHandlers,
  DocumentHandlers,
  HTMLRewriterOptions,
} from "./vendor/html_rewriter.d.ts";
import * as _module from './vendor/html_rewriter.js'
const { default: initWASM } = _module;
const module: typeof import("./vendor/html_rewriter.d.ts") = _module;

export type { 
  ContentTypeOptions,
  Element,
  EndTag,
  Comment,
  TextChunk,
  Doctype,
  DocumentEnd,
  ElementHandlers,
  DocumentHandlers,
  HTMLRewriterOptions,
}

type SelectorElementHandlers = [selector: string, handlers: ElementHandlers];

const kEnableEsiTags = Symbol("kEnableEsiTags");

const toWASMResponse = (response: Response) => {
  if (response.headers.get('content-type')?.startsWith('application/wasm')) return response;
  const { body, headers: hs, ...props } = response
  const headers = new Headers(hs)
  headers.set('content-type', 'application/wasm')
  return new Response(body, { ...props, headers })
}

let initialized = false;

export class HTMLRewriter {
  readonly #elementHandlers: SelectorElementHandlers[] = [];
  readonly #documentHandlers: DocumentHandlers[] = [];
  [kEnableEsiTags] = false;

  on(selector: string, handlers: ElementHandlers): this {
    this.#elementHandlers.push([selector, handlers]);
    return this;
  }

  onDocument(handlers: DocumentHandlers): this {
    this.#documentHandlers.push(handlers);
    return this;
  }

  transform(response: Response): Response {
    const body = response.body as ReadableStream<Uint8Array> | null;
    // HTMLRewriter doesn't run the end handler if the body is null, so it's
    // pointless to setup the transform stream.
    if (body === null) return new Response(body, response);

    if (response instanceof Response) {
      // Make sure we validate chunks are BufferSources and convert them to
      // Uint8Arrays as required by the Rust glue code.
      response = new Response(response.body, response);
    }

    let rewriter: BaseHTMLRewriter;
    const transformStream = new TransformStream<Uint8Array, Uint8Array>({
      start: async (controller) => {
        // Create a rewriter instance for this transformation that writes its
        // output to the transformed response's stream. Note that each
        // BaseHTMLRewriter can only be used once. Importing html-rewriter-wasm
        // will also synchronously compile a WebAssembly module, so delay doing
        // this until we really need it.
        if (!initialized) {
          await initWASM(fetch(new URL("./vendor/html_rewriter_bg.wasm", import.meta.url).href).then(toWASMResponse))
          initialized = true;
        }
        rewriter = new module.HTMLRewriter(
          (output) => {
            // enqueue will throw on empty chunks
            if (output.length !== 0) controller.enqueue(output);
          },
          { enableEsiTags: this[kEnableEsiTags] }
        );
        // Add all registered handlers
        for (const [selector, handlers] of this.#elementHandlers) {
          rewriter.on(selector, handlers);
        }
        for (const handlers of this.#documentHandlers) {
          rewriter.onDocument(handlers);
        }
      },
      // The finally() below will ensure the rewriter is always freed.
      // chunk is guaranteed to be a Uint8Array as we're using the
      // @miniflare/core Response class, which transforms to a byte stream.
      transform: (chunk) => rewriter.write(chunk),
      flush: () => rewriter.end(),
    });
    const promise = body.pipeTo(transformStream.writable);
    promise.catch(() => {}).finally(() => rewriter?.free());

    // Return a response with the transformed body, copying over headers, etc
    const res = new Response(transformStream.readable, response);
    // If Content-Length is set, it's probably going to be wrong, since we're
    // rewriting content, so remove it
    res.headers.delete("Content-Length");
    return res;
  }
}

// queueMicrotask(async () => {
//   console.log(await new HTMLRewriter()
//     .on("p", {
//       element(element) { element.tagName = "h1" },
//     })
//     .transform(new Response('<p class="red">test</p>'))
//     .text())

//   console.log(await new HTMLRewriter()
//     .on("p", {
//       element(element) { element.tagName = "h2" },
//     })
//     .transform(new Response('<p class="red">test</p>'))
//     .text())
// })

export function withEnableEsiTags(rewriter: HTMLRewriter): HTMLRewriter {
  rewriter[kEnableEsiTags] = true;
  return rewriter;
}