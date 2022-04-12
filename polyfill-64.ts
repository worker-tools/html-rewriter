import { HTMLRewriter } from './html-rewriter-64.ts';

if (!('HTMLRewriter' in self)) {
  Object.defineProperty(self, 'HTMLRewriter', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: HTMLRewriter
  })
}
