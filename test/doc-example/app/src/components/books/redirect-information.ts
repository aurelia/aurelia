import { customElement } from '@aurelia/runtime';

@customElement({ name: 'redirect-information', template: `<template>
<p>This just redirects to information.</p>
</template>` })
export class RedirectInformation {
  public canEnter() {
    return 'information';
  }
}
