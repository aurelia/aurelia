import { customElement } from '@aurelia/runtime';
import { wait } from '../utils';

@customElement({
  name: 'game', template:
    `<template>
  <div style="background-color: #ee0; padding: 20px;">
    <p style="background-color: #fff;">The game element, with the viewport 'game'.</p>
    <a href="board">Board</a>
    <a href="inventory">Inventory</a>
    <p style="background-color: #fff;">Now the footer is here!</p>
    <au-viewport name="game"></au-viewport>
  </div>
</template>
` })
export class Game {

  public async enter() {
    return wait(5000);
  }

}
