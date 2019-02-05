import { inject } from '@aurelia/kernel';
import { customElement } from '@aurelia/runtime';
import { State } from '../../state';

@customElement({
  name: 'about-authors', template: `<template>
<div>
<h3>About authors</h3>
<p>Authors write books. Books are good for you. End of story.</p>
<div class="scrollbox">Space out!</div>
</div>
</template>` })
@inject(State)
export class AboutAuthors {
  constructor(private readonly state: State) { }

  public canEnter() {
    return this.state.allowEnterAuthorDetails;
  }
}
