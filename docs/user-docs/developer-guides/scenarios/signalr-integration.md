# Integrating SignalR with Aurelia 2

SignalR is a library that enables real-time web functionality in your applications. This guide will show you how to integrate SignalR with an Aurelia 2 application to create interactive, real-time features.

## Prerequisites

- An existing Aurelia 2 project (you can create one using `npx makes aurelia`)
- .NET Core SDK installed if you're setting up a SignalR server
- SignalR client library installed in your Aurelia project

## Setting Up the SignalR Server

If you don't have a SignalR server, create a new hub in your ASP.NET Core project:

```csharp
using Microsoft.AspNetCore.SignalR;

public class ChatHub : Hub
{
    public async Task SendMessage(string user, string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }
}
```

Register the SignalR service and map the hub in `Startup.cs`:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddSignalR();
}

public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    // ... other configurations ...

    app.UseEndpoints(endpoints =>
    {
        endpoints.MapHub<ChatHub>("/chatHub");
    });
}
```

## Installing the SignalR Client Library

Install the SignalR client package:

```bash
npm install @microsoft/signalr
```

or

```bash
yarn add @microsoft/signalr
```

## Creating the SignalR Service in Aurelia 2

Define an interface for the SignalR service using the `DI.createInterface` function:

```typescript
// src/signalr-service.ts
import { DI } from '@aurelia/kernel';
import * as signalR from '@microsoft/signalr';

export const ISignalRService = DI.createInterface<ISignalRService>('ISignalRService', x => x.singleton(SignalRService));

export interface ISignalRService {
  start(): Promise<void>;
  stop(): Promise<void>;
  sendMessage(user: string, message: string): Promise<void>;
}

export class SignalRService implements ISignalRService {
  private connection: signalR.HubConnection;

  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('YOUR_SERVER/chatHub')
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.connection.onclose(async () => {
      await this.start();
    });
  }

  async start(): Promise<void> {
    try {
      await this.connection.start();
      console.log('SignalR Connected.');
    } catch (err) {
      console.error('SignalR Connection failed: ', err);
      setTimeout(() => this.start(), 5000);
    }
  }

  async stop(): Promise<void> {
    await this.connection.stop();
    console.log('SignalR Disconnected.');
  }

  async sendMessage(user: string, message: string): Promise<void> {
    await this.connection.invoke('SendMessage', user, message);
  }
}
```

## Using the SignalR Service in an Aurelia 2 Component

Inject the SignalR service into your Aurelia component and use it to send and receive messages:

```typescript
// src/chat-component.ts
import { ISignalRService } from './signalr-service';
import { inject } from '@aurelia/kernel';

@inject(ISignalRService)
export class ChatComponent {
  public message: string = '';
  public messages: { user: string; message: string }[] = [];

  constructor(@ISignalRService private signalR: ISignalRService) {
    this.signalR.connection.on('ReceiveMessage', (user: string, message: string) => {
      this.messages.push({ user, message });
    });
  }

  public bound(): void {
    this.signalR.start();
  }

  public unbound(): void {
    this.signalR.stop();
  }

  public sendMessage(): void {
    this.signalR.sendMessage('User1', this.message);
    this.message = '';
  }
}
```

And the corresponding HTML template:

```html
<!-- src/chat-component.html -->
<template>
  <ul>
    <li repeat.for="msg of messages">${msg.user}: ${msg.message}</li>
  </ul>
  <input type="text" value.two-way="message" placeholder="Type a message...">
  <button click.trigger="sendMessage()">Send</button>
</template>
```

## Conclusion

You have now successfully integrated SignalR with an Aurelia 2 application, enabling real-time communication between the server and clients. This example can be expanded to include more sophisticated real-time features, such as notifications, live updates, and collaborative environments.

Remember that managing the SignalR connection's lifecycle is crucial, especially in production environments, to ensure a stable and responsive user experience.
