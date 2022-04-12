import { HTMLRewriter } from './html-rewriter.ts';

if (!('HTMLRewriter' in self)) {
  Object.defineProperty(self, 'HTMLRewriter', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: HTMLRewriter
  })
}
