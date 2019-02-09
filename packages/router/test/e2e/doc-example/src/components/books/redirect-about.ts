import { customElement } from '@aurelia/runtime';

@customElement({
  name: 'redirect-about', template: `<template>
<p>This just redirects to content about.</p>
</template>` })
export class RedirectAbout {
  public canEnter() {
    return [{ component: 'about', viewport: 'content' }, { component: 'authors', viewport: 'lists' }];
  }
}
