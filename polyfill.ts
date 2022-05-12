import { HTMLRewriter as HTMLRewriterImpl } from './index.ts'
import type * as types from './index.ts'

declare global {
  const HTMLRewriter: typeof HTMLRewriterImpl
  interface Window {
    HTMLRewriter: typeof HTMLRewriterImpl;
  }
  interface WorkerGlobalScope {
    HTMLRewriter: typeof HTMLRewriterImpl;
  }
  type ContentTypeOptions = types.ContentTypeOptions;
  type Element = types.Element;
  type EndTag = types.EndTag;
  type Comment = types.Comment;
  type TextChunk = types.TextChunk;
  type Doctype = types.Doctype;
  type DocumentEnd = types.DocumentEnd;
  type ElementHandlers = types.ElementHandlers;
  type DocumentHandlers = types.DocumentHandlers;
}

if (!('HTMLRewriter' in self)) {
  Object.defineProperty(self, 'HTMLRewriter', {
    value: HTMLRewriterImpl,
    writable: false,
    enumerable: false,
    configurable: false,
  })
}

// Trigger WASM initialization
new HTMLRewriterImpl()

export {}