import { customElement } from '@aurelia/runtime';

@customElement({ name: 'about-authors', template: `<template>
<h3>About authors</h3>
<p>Authors write books. Books are good for you. End of story.</p>
</template>` })
export class AboutAuthors {
  public canEnter() {
    return false;
  }
}
