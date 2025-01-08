
declare module '*.html' {
  import { PartialBindableDefinition } from '@aurelia/runtime-html';

  export const name: string;
  export const template: string;
  export default template;
  export const dependencies: string[];
  export const containerless: boolean | undefined;
  export const bindables: (string | PartialBindableDefinition & { name: string })[];
  export const shadowOptions: { mode: 'open' | 'closed'} | undefined;
}

declare module '*.css'
