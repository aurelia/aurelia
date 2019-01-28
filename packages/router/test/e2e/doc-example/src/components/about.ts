import { inject } from '@aurelia/kernel';
import { customElement, ICustomElement } from '@aurelia/runtime';
import { State } from '../state';
import { wait } from '../utils';

@customElement({
  name: 'about', template: `<template>
<h3>Basic routing example: authors and books</h3>
<p>This application lists authors and books and shows their details.</p>
<p>This About component is displayed at application start and when navigating to Authors or Books lists in the navbar above.</p>
</template>` })
@inject(State)
export class About {
  constructor(private state: State) { }

  public enter() {
    return wait(this.state.noDelay ? 0 : 4000);
  }
}
export interface About extends ICustomElement<HTMLElement> { }
