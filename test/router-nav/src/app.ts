import { customElement } from '@aurelia/runtime-html';
import * as deps from './components/index';

@customElement({
  name: 'app',
  template: `
    <div style="padding: 20px;">
      <p>A layout test, with game and lobby "layouts".</p>
      <a href="lobby">Lobby</a>
      <a href="game">Game</a>
      <a href="lobby@app+contacts@lobby+contact@contact(123)">Lobby + contacts + 123</a>
      <a href="lobby@app+contact@contact(123)+contacts@lobby">Lobby + 123 + contacts</a>
      <a href="game+board@game">Game + board (5 + 5, parent-child)</a>
      <a href="game+delayed">Game + delayed (5 + 5, siblings)</a>
      <a href="cancel">Cancel</a>
      <au-viewport name="app" used-by="game,lobby,cancel"></au-viewport>
      <au-viewport name="delayed" used-by="delayed"></au-viewport>
    </div>
  `,
  dependencies: [deps],
})
export class App { }
