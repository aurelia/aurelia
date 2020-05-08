import { inject } from '@aurelia/kernel';
import { Router } from '@aurelia/router';
import { customElement } from '@aurelia/runtime';

@inject(Router)
@customElement({
  name: 'app', template:
    `<template>
  <div style="padding: 20px;">
    <p>A layout test, with game and lobby "layouts".</p>
    <a href="lobby">Lobby</a>
    <a href="game">Game</a>
    <a href="game+board">Game board</a>
    <au-viewport name="app" used-by="game,lobby"></au-viewport>
  </div>
</template>
` })
export class App {
  public constructor(private readonly router: Router) {
    this.router.activate().catch((error: Error) => { throw error; });
  }
}
