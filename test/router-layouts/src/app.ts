import { customElement } from '@aurelia/runtime';
import * as deps from './components/index';

@customElement({
  name: 'app',
  template: `
    <div style="padding: 20px;">
      <p>A layout test, with game and lobby "layouts".</p>
      <a href="lobby">Lobby</a>
      <a href="game">Game</a>
      <a href="game+board">Game board</a>
      <au-viewport name="app" used-by="game,lobby"></au-viewport>
    </div>
  `,
  dependencies: [deps],
})
export class App { }
