import { customElement } from '@aurelia/runtime';

@customElement({
  name: 'lobby', template:
    `<template>
  <p style="background-color: #eee;">The lobby layout, with the viewport 'lobby'.</p>
  <a href="about">About</a>
  <a href="contacts">Contacts</a>
  <au-viewport name="lobby"></au-viewport>
  <p style="background-color: #eee;">And some footer of some kind.</p>
</template>
` })
export class Lobby { }
