# WebSockets + Aurelia 2 (Vite)

WebSockets keep a persistent connection open so your Aurelia components can react to server-side events instantly—no polling necessary. The Vite-powered Aurelia 2 starter already ships with everything you need to consume WebSockets from the browser; you only need a small client service and (optionally) a Node-based development server to broadcast messages while you iterate.

---

## 1. Optional: spin up a tiny WebSocket server

If you don’t already have a backend, you can scaffold a development server with the popular [`ws`](https://github.com/websockets/ws) package:

```bash
npm install ws --save-dev
```

```js
// scripts/dev-websocket-server.mjs
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (socket) => {
  console.log('Client connected');
  socket.send(JSON.stringify({ type: 'server-ready', timestamp: Date.now() }));

  socket.on('message', (data) => {
    // echo message to everyone (simple chat)
    wss.clients.forEach(client => {
      if (client.readyState === 1 /* WebSocket.OPEN */) {
        client.send(JSON.stringify({
          type: 'message',
          text: data.toString(),
          timestamp: Date.now(),
        }));
      }
    });
  });
});

console.log('WebSocket server listening on ws://localhost:8080');
```

Run it alongside `npm run dev` so both the Vite dev server and the WebSocket server stay active.

---

## 2. Configure an environment variable for the WebSocket URL

Keep the WebSocket endpoint in `.env.local` so you can point the frontend at different servers per environment:

```dotenv
# .env.local
VITE_WS_URL=ws://localhost:8080
```

Vite exposes variables prefixed with `VITE_` via `import.meta.env`, letting you inject the URL without hard-coding it in source control.

---

## 3. Create a WebSocket client service

```ts
// src/services/websocket-client.ts
import { DI, Registration } from '@aurelia/kernel';
import { IDisposable } from '@aurelia/kernel';

export interface ChatMessage {
  type: string;
  text?: string;
  timestamp: number;
}

export const IWebSocketClient = DI.createInterface<IWebSocketClient>('IWebSocketClient');

export interface IWebSocketClient extends IDisposable {
  connect(url: string, listener: (msg: ChatMessage) => void): void;
  send(payload: Record<string, unknown>): void;
  readyState(): number;
}

export class WebSocketClient implements IWebSocketClient {
  private socket: WebSocket | null = null;
  private listener: ((msg: ChatMessage) => void) | null = null;

  connect(url: string, listener: (msg: ChatMessage) => void): void {
    this.dispose();
    this.listener = listener;

    const socket = new WebSocket(url);
    socket.onopen = () => console.info('WebSocket connected');
    socket.onclose = (event) => {
      console.info('WebSocket closed', event.reason);
      this.socket = null;
    };
    socket.onerror = (err) => console.error('WebSocket error', err);
    socket.onmessage = (event: MessageEvent<string>) => {
      try {
        const data = JSON.parse(event.data) as ChatMessage;
        this.listener?.(data);
      } catch (error) {
        console.warn('Unparseable message', error, event.data);
      }
    };

    this.socket = socket;
  }

  send(payload: Record<string, unknown>): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    } else {
      console.warn('WebSocket not connected yet');
    }
  }

  readyState(): number {
    return this.socket?.readyState ?? WebSocket.CLOSED;
  }

  dispose(): void {
    this.socket?.close();
    this.socket = null;
    this.listener = null;
  }
}

export const WebSocketClientRegistration = Registration.singleton(IWebSocketClient, WebSocketClient);
```

This service encapsulates connection lifecycle, JSON parsing, and basic logging. Because it’s registered as a singleton, every component that resolves `IWebSocketClient` shares the same connection.

---

## 4. Register the service when bootstrapping Aurelia

```ts
// src/main.ts
import { Aurelia, StandardConfiguration } from '@aurelia/runtime-html';
import { WebSocketClientRegistration } from './services/websocket-client';
import { MyApp } from './my-app';

await new Aurelia()
  .register(StandardConfiguration, WebSocketClientRegistration)
  .app({ host: document.querySelector('my-app')!, component: MyApp })
  .start();
```

---

## 5. Build a chat component on top of the service

```ts
// src/components/chat.ts
import { customElement } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';
import { IWebSocketClient, ChatMessage } from '../services/websocket-client';

@customElement({
  name: 'chat',
  template: `
    <div class="chat">
      <ul>
        <li repeat.for="message of messages">
          <strong>${message.type}:</strong> ${message.text}
          <span class="timestamp">\${new Date(message.timestamp).toLocaleTimeString()}</span>
        </li>
      </ul>

      <form submit.trigger="send()">
        <input value.bind="draft" autocomplete="off" placeholder="Type a message…" />
        <button type="submit" disabled.bind="!draft.trim()">Send</button>
      </form>
    </div>
  `,
})
export class Chat {
  draft = '';
  messages: ChatMessage[] = [];
  private readonly ws = resolve(IWebSocketClient);
  private readonly url = import.meta.env.VITE_WS_URL as string;

  binding() {
    this.ws.connect(this.url, (message) => {
      this.messages = [...this.messages, message];
    });
  }

  detaching() {
    this.ws.dispose(); // or keep alive if other components rely on it
  }

  send() {
    if (!this.draft.trim()) return;
    this.ws.send({ type: 'message', text: this.draft.trim(), timestamp: Date.now() });
    this.draft = '';
  }
}
```

The single `chat` element now reflects server updates in real time and can safely send messages through the shared connection.

---

## 6. Tips & extensions

- **Reconnect logic:** wrap the `WebSocket` instantiation in a helper that backs off and retries on `close` events when `event.wasClean` is `false`.
- **Binary data:** switch to `socket.binaryType = 'arraybuffer'` and send typed arrays when transferring files or images.
- **Authentication:** include JWTs or session tokens in the initial connection URL (e.g., `ws://host?token=...`) or upgrade request headers depending on your backend.
- **State integration:** dispatch incoming messages into `@aurelia/state` or another store so multiple components can react without each subscribing to the socket.

With the connection wrapped in a DI-friendly service and the endpoint stored in environment variables, swapping between local, staging, and production WebSocket servers becomes trivial—and you avoid the legacy webpack-specific loader configuration entirely.
