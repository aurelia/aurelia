# WebSockets + Aurelia

## Overview
WebSockets enable real-time bidirectional communication between clients and servers. Unlike HTTP polling, WebSockets keep a persistent connection open, allowing instant updates. This guide walks through integrating WebSockets into an Aurelia 2 application.

---

## 1. Installing WebSocket Server (Optional)
If you do not already have a WebSocket server, you can set up a simple Node.js WebSocket server.

```bash
npm install ws
```

Create `server.js`:

```javascript
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log('Received:', message);
    ws.send(`Server response: ${message}`);
  });

  ws.on('close', () => console.log('Client disconnected'));
});

console.log('WebSocket server running on ws://localhost:8080');
```

Run it with:

```bash
node server.js
```

---

## 2. Create a WebSocket Service in Aurelia
Create a WebSocket service to manage connections.

```typescript
// src/services/websocket-service.ts
export class WebSocketService {
  private socket: WebSocket;

  constructor(private url: string) {
    this.socket = new WebSocket(url);
  }

  connect(onMessage: (data: string) => void) {
    this.socket.onmessage = (event) => onMessage(event.data);
    this.socket.onopen = () => console.log('WebSocket connected');
    this.socket.onclose = () => console.log('WebSocket closed');
    this.socket.onerror = (err) => console.error('WebSocket error:', err);
  }

  sendMessage(message: string) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      console.warn('WebSocket is not open');
    }
  }
}
```

---

## 3. Register the Service in `main.ts`
```typescript
import Aurelia from 'aurelia';
import { WebSocketService } from './services/websocket-service';
import { MyApp } from './my-app';

Aurelia
  .register(WebSocketService)
  .app(MyApp)
  .start();
```

---

## 4. Implement WebSockets in a Component
Create a simple real-time chat interface.

```typescript
// src/components/chat.ts
import { customElement } from 'aurelia';
import { WebSocketService } from '../services/websocket-service';

@customElement({
  name: 'chat',
  template: `
    <input type="text" value.bind="message" placeholder="Type a message..." />
    <button click.trigger="sendMessage()">Send</button>
    <ul>
      <li repeat.for="msg of messages">${msg}</li>
    </ul>
  `
})
export class Chat {
  message = '';
  messages: string[] = [];
  private webSocketService = new WebSocketService('ws://localhost:8080');

  constructor() {
    this.webSocketService.connect((data) => {
      this.messages.push(`Server: ${data}`);
    });
  }

  sendMessage() {
    if (this.message.trim()) {
      this.messages.push(`You: ${this.message}`);
      this.webSocketService.sendMessage(this.message);
      this.message = '';
    }
  }
}
```

---

## 5. Add the Chat Component to the App
```html
<!-- src/my-app.html -->
<template>
  <h1>Real-Time Chat</h1>
  <chat></chat>
</template>
```

---

## Key Features
- Persistent WebSocket connection for real-time updates.
- No polling required, reducing unnecessary HTTP requests.
- Works with any WebSocket server, including GraphQL subscriptions and Firebase real-time database.
- Easily extendable for authentication, user presence, and additional real-time interactions.

---

## Next Steps
- Implement server-side authentication for secure WebSocket connections.
- Use GraphQL subscriptions instead of raw WebSockets.
- Add presence indicators (e.g., "User is typing...").
- Extend functionality to support binary data transfer (images, files, etc.).
