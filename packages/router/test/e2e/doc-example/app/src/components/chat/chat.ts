import { customElement } from '@aurelia/runtime';

@customElement({
  name: 'chat', template: `<template>
<h3>Chat <a href="-@chat" class="close">X</a></h3>
<au-viewport name="chat-main" used-by="chat-users" default="chat-users" no-link no-history></au-viewport>
<au-viewport name="chat-details" used-by="chat-user" no-link no-history stateful></au-viewport>
</template>` })
export class Chat { }
