import { inject } from '../../../../../kernel';
import { Router } from '../../../../../router';
import { customElement } from '../../../../../runtime';

@inject(Router)
@customElement({
  name: 'app', template:
    `<template>
  <div style="padding: 20px;">
    <p>A layout test, with game and lobby "layouts".</p>
    <a href="lobby">Lobby</a>
    <a href="game">Game</a>
    <a href="lobby@app+contacts@lobby+contact@contact=123">Lobby + contacts + 123</a>
    <a href="lobby@app+contact@contact=123+contacts@lobby">Lobby + 123 + contacts</a>
    <a href="game+board">Game board (5 + 5, parent-child)</a>
    <a href="game+delayed">Game + delayed (5 + 5, siblings)</a>
    <au-viewport name="app" used-by="game,lobby"></au-viewport>
    <au-viewport name="delayed" used-by="delayed"></au-viewport>
  </div>
</template>
` })
export class App {
  constructor(private router: Router) { }

  public attached() {
    this.router.activate();
  }
}
