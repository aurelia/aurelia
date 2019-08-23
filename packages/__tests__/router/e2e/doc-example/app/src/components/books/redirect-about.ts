import { customElement } from '@aurelia/runtime';
import { ViewportInstruction } from '@aurelia/router';

@customElement({
  name: 'redirect-about', template: `<template>
<p>This just redirects to content about.</p>
</template>` })
export class RedirectAbout {
  public canEnter() {
    return [new ViewportInstruction('about', 'content'), new ViewportInstruction('authors', 'lists')];
  }
}
