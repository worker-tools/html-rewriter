import { HTMLRewriter as HTMLRewriterImpl } from './base64.ts'
import type * as types from './base64.ts'

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

self.HTMLRewriter = HTMLRewriterImpl;

// Trigger WASM initialization
new HTMLRewriterImpl()

export {}