import { inject } from '../../../../../kernel';
import { customElement } from '../../../../../runtime';
import { Router } from '../../../../../router';

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
  constructor(private router: Router) {
    this.router.activate();
  }
}
