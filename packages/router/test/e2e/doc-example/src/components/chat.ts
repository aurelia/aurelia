import { customElement } from '@aurelia/runtime';

@customElement({
  name: 'chat', template: `<template>
<h3>Chat <a href="-@chat" class="close">X</a></h3>
<au-viewport name="chat-main" used-by="chat-users" default="chat-users" no-link></au-viewport>
<au-viewport name="chat-details" used-by="chat-user" no-link></au-viewport>
</template>` })
export class Chat { }
