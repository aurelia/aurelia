# Integrating SignalR with Aurelia 2

SignalR provides real-time bidirectional communication between clients and servers. This guide shows how to connect an Aurelia 2 + Vite frontend to an ASP.NET Core SignalR hub, handle reconnection, and keep your UI state in sync with hub messages.

---

## Prerequisites

- Aurelia 2 project (create one with `npx makes aurelia`)
- ASP.NET Core 8+ SDK if you are hosting the SignalR hub yourself
- `@microsoft/signalr` installed in the Aurelia project

---

## 1. Server-side hub (ASP.NET Core)

Add a hub that broadcasts messages to every connected client:

```csharp
// Hubs/ChatHub.cs
using Microsoft.AspNetCore.SignalR;

public sealed class ChatHub : Hub
{
    public async Task SendMessage(string user, string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }
}
```

Register SignalR and map the hub (in `Program.cs` for .NET 8 templates):

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSignalR();

var app = builder.Build();
app.MapHub<ChatHub>("/chatHub");
app.Run();
```

Deploy this app to any host (Kestrel, IIS, Azure App Service, etc.). The client will connect to `/chatHub`.

---

## 2. Install the SignalR JavaScript client

```bash
npm install @microsoft/signalr
```

SignalR’s JS client lets you configure transports, invoke server methods, and enable automatic reconnection via `withAutomaticReconnect`.

---

## 3. Expose the hub URL via environment variables

`import.meta.env` (Vite) reads variables that start with `VITE_`. Add the hub URL to `.env.local`:

```dotenv
VITE_SIGNALR_URL=https://localhost:5001/chatHub
```

---

## 4. Create a reusable SignalR service

```ts
// src/services/signalr-service.ts
import { DI, Registration } from '@aurelia/kernel';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';

export interface ISignalRService {
  start(): Promise<void>;
  stop(): Promise<void>;
  on(event: string, handler: (...args: any[]) => void): void;
  send(method: string, ...args: unknown[]): Promise<void>;
  state(): HubConnectionState;
}

export const ISignalR = DI.createInterface<ISignalRService>('ISignalR');

export class SignalRService implements ISignalRService {
  private connection: HubConnection;
  private readonly url = import.meta.env.VITE_SIGNALR_URL as string;

  public constructor() {
    this.connection = new HubConnectionBuilder()
      .withUrl(this.url)
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(LogLevel.Information)
      .build();

    this.connection.onreconnecting(error => console.warn('SignalR reconnecting', error));
    this.connection.onreconnected(connectionId => console.info('SignalR reconnected', connectionId));
    this.connection.onclose(error => console.error('SignalR closed', error));
  }

  public start(): Promise<void> {
    if (this.connection.state === HubConnectionState.Connected || this.connection.state === HubConnectionState.Connecting) {
      return Promise.resolve();
    }
    return this.connection.start();
  }

  public stop(): Promise<void> {
    if (this.connection.state === HubConnectionState.Disconnected) {
      return Promise.resolve();
    }
    return this.connection.stop();
  }

  public on(event: string, handler: (...args: any[]) => void): void {
    this.connection.on(event, handler);
  }

  public send(method: string, ...args: unknown[]): Promise<void> {
    return this.connection.invoke(method, ...args);
  }

  public state(): HubConnectionState {
    return this.connection.state;
  }
}

export const SignalRRegistration = Registration.singleton(ISignalR, SignalRService);
```

`withAutomaticReconnect([0, 2000, 10000, 30000])` retries immediately, then after 2, 10, and 30 seconds.

Register the service in `main.ts`:

```ts
import { Aurelia, StandardConfiguration } from '@aurelia/runtime-html';
import { SignalRRegistration } from './services/signalr-service';
import { MyApp } from './my-app';

await new Aurelia()
  .register(StandardConfiguration, SignalRRegistration)
  .app({ host: document.querySelector('my-app')!, component: MyApp })
  .start();
```

---

## 5. Build a chat component

```ts
// src/components/chat.ts
import { customElement } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';
import { ISignalRService } from '../services/signalr-service';

type ChatMessage = { user: string; body: string };

@customElement({
  name: 'chat-panel',
  template: `\
<section class="chat">
  <ul>
    <li repeat.for="msg of messages">
      <strong>${msg.user}:</strong> ${msg.body}
    </li>
  </ul>
  <form submit.trigger="send()">
    <input value.two-way="draft" placeholder="Say something…" autocomplete="off" />
    <button type="submit" disabled.bind="!draft.trim()">Send</button>
  </form>
</section>`
})
export class ChatPanel {
  draft = '';
  messages: ChatMessage[] = [];
  private readonly signalR = resolve(ISignalRService);

  binding() {
    this.signalR.on('ReceiveMessage', (user: string, body: string) => {
      this.messages = [...this.messages, { user, body }];
    });

    void this.signalR.start().catch(err => console.error('SignalR start failed', err));
  }

  detaching() {
    void this.signalR.stop();
  }

  async send() {
    if (!this.draft.trim()) return;
    await this.signalR.send('SendMessage', 'Anonymous', this.draft.trim());
    this.draft = '';
  }
}
```

Include it in `my-app.html`:

```html
<template>
  <h1>Real-time chat</h1>
  <chat-panel></chat-panel>
</template>
```

---

## 6. Resilience tips

- **Handle reconnect events**: show a banner while `HubConnectionState.Reconnecting` so users know the app is trying to recover.
- **Backpressure**: if the hub pushes high-volume messages, throttle UI updates or offload work to a Web Worker.
- **Authentication**: pass an access token via `withUrl(url, { accessTokenFactory: () => token })`.
- **Stateful reconnection**: ASP.NET Core 8 supports buffering short disconnects—enable it if your scenario requires guaranteed delivery.
- **Server restarts**: wrap `connection.onclose` with retry logic so users reconnect automatically after redeployments.

---

## Summary

1. Host a SignalR hub (ASP.NET Core) at `/chatHub`.
2. Install `@microsoft/signalr` and expose the hub URL via `VITE_SIGNALR_URL`.
3. Register a singleton SignalR service that builds a `HubConnection`, enables `withAutomaticReconnect`, and exposes `start/stop/on/send` helpers.
4. Consume the service from Aurelia components to push and display messages in real time.
5. Add resilience (reconnect banners, authentication, buffering) to keep the UI responsive when the network misbehaves.

With this setup you can extend the same service to broadcast notifications, synchronize dashboards, or coordinate collaborative UIs.
