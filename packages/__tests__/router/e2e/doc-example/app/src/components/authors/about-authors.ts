import { inject } from '@aurelia/kernel';
import { customElement } from '@aurelia/runtime';
import { State } from '../../state';

@customElement({
  name: 'about-authors', template: `<template>
<div>
<h3>About authors [Entry: \${entries}]
[
  Reentry behavior:
  <label repeat.for="behavior of reentryBehaviors">
    <input type="radio" name="reentry" model.bind="behavior" checked.two-way="reentryBehavior">\${behavior}
  </label>
]</h3>
<p>Authors write books. Books are good for you. End of story.</p>
<div class="scrollbox">Space out!</div>
</div>
</template>` })
@inject(State)
export class AboutAuthors {
  public reentryBehaviors = ['default', 'disallow', 'refresh', 'enter'];
  public reentryBehavior: string = 'default';
  public entries = 0;

  public constructor(private readonly state: State) { }

  public canEnter() {
    console.log('### about-authors: canEnter');
    return this.state.allowEnterAuthorDetails;
  }
  public enter() {
    this.entries++;
    console.log('### about-authors: enter');
  }
  public canLeave() {
    console.log('### about-authors: canLeave');
    return true;
  }
  public leave() {
    console.log('### about-authors: leave');
  }
}
