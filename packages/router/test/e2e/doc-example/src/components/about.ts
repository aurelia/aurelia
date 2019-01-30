import { inject } from '@aurelia/kernel';
import { customElement, ICustomElement } from '@aurelia/runtime';
import { State } from '../state';
import { wait } from '../utils';

@customElement({
  name: 'about', template: `<template>
<h3>Basic routing example: authors and books</h3>
<p>This application lists authors and books and shows their details.</p>
<p>This About component is displayed at application start and when navigating to Authors or Books lists in the navbar above.</p>
<p style="color: blue;">Scroll the text below and type something in the input. Then navigate to Books, select a book and after that navigate to About. Also: write different things in the different chat inputs and switch between them.</p>
<div style="height: 200px; overflow: auto;" id="scrolled"><pre>
Scroll me to the moon
Let me play among the stars
Let me see what spring is like
On a-Jupiter and Mars
In other words, hold my hand
In other words, baby, kiss me
Fill my heart with song and
Let me sing forever more
You are all I long for
All I worship and adore
In other words, please be true
In other words, I scroll you
Fill my heart with song
Let me sing forever more
You are all I long for
All I worship and I adore
In other words, please be true
In other words
In other words, I scroll you
</pre></div>
<br>
<input>
</template>` })
@inject(State)
export class About {
  constructor(private state: State) { }

  public enter() {
    return wait(this.state.noDelay ? 0 : 4000);
  }
}
export interface About extends ICustomElement<HTMLElement> { }
