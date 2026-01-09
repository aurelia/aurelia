---
description: Learn how to build a ChatGPT-inspired application with Aurelia 2, Node.js, and the OpenAI GPT-4o API.
---

# Building a ChatGPT-Inspired App with Aurelia 2, Node.js, and OpenAI GPT-4o API

This tutorial will guide you through creating a ChatGPT-like application using Aurelia 2 for the frontend, Node.js + Express for the backend, and OpenAI's GPT-4o API to generate responses. We'll demonstrate modern Aurelia 2 patterns, proper dependency injection, TypeScript types, error handling, and responsive design.

---

## Prerequisites

Before you begin, ensure you have the following:

- [Node.js](https://nodejs.org/) (latest LTS version recommended)
- [OpenAI API Key](https://platform.openai.com/signup) - You'll need to add credits to your account
- Basic familiarity with TypeScript and Aurelia 2 concepts

---

## 1. Setting Up the Aurelia 2 Frontend

### Create a New Aurelia Project

Run the following command to scaffold a new Aurelia 2 project with Vite:

```bash
npx makes aurelia
```

Select "Default TypeScript App" and "Vite" when prompted. Name your project `chatgpt-clone`.

### Install Dependencies

Navigate to your project directory and install dependencies:

```bash
cd chatgpt-clone
npm install
```

---

## 2. Setting Up the Node.js Backend

### Initialize the Backend Project

Create a new directory for the backend and initialize a Node.js project:

```bash
mkdir server
cd server
npm init -y
```

### Install Required Packages

Install Express and the official OpenAI Node.js client:

```bash
npm install express openai cors body-parser dotenv
npm install -D @types/express @types/cors nodemon
```

### Create the Express Server

Create an `server.js` file inside the `server` directory:

```javascript
const express = require('express');
const { OpenAI } = require('openai');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('public'));

// OpenAI client initialization
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Validate environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY environment variable');
  process.exit(1);
}

// Chat endpoint with conversation history support
app.post('/api/chat', async (req, res) => {
  const { messages, model = 'gpt-4o-mini' } = req.body;

  // Validate request
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ 
      error: 'Invalid request: messages array is required' 
    });
  }

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      max_tokens: 1000,
      temperature: 0.7,
      stream: false,
    });

    const reply = completion.choices[0]?.message?.content;
    if (!reply) {
      throw new Error('No response generated');
    }

    res.json({ 
      reply,
      usage: completion.usage,
      model: completion.model
    });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    if (error.status === 401) {
      res.status(401).json({ error: 'Invalid API key' });
    } else if (error.status === 429) {
      res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    } else if (error.status === 402) {
      res.status(402).json({ error: 'Insufficient credits. Please check your OpenAI account.' });
    } else {
      res.status(500).json({ error: 'An error occurred while processing your request' });
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
  console.log(`📡 API endpoint: http://localhost:${port}/api/chat`);
});
```

### Configure Environment Variables

Create a `.env` file in the `server` directory:

```env
# Required: Your OpenAI API key
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Server port (defaults to 3001)
PORT=3001

# Optional: Node environment
NODE_ENV=development
```

Replace `your_openai_api_key_here` with your actual OpenAI API key. **Important:** Keep this file secure and never commit it to version control.

### Add Package.json Scripts

Update your `server/package.json` to include development scripts:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

---

## 3. Connecting Frontend and Backend

### Create Type Definitions

First, create type definitions for better TypeScript support. Create `src/types/chat.ts`:

```typescript
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  id: string;
}

export interface ChatResponse {
  reply: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

export interface ChatError {
  error: string;
}

export type ChatApiResponse = ChatResponse | ChatError;
```

### Create Chat Service

Create a dedicated service for API communication. Create `src/services/chat-service.ts`:

```typescript
import { DI, ILogger, resolve } from '@aurelia/kernel';
import { IHttpClient } from '@aurelia/fetch-client';
import { ChatMessage, ChatApiResponse, ChatResponse } from '../types/chat';

export const IChatService = DI.createInterface<IChatService>('IChatService', x => x.singleton(ChatService));
export interface IChatService extends ChatService {}

export class ChatService {
  private readonly baseUrl = 'http://localhost:3001/api';
  private readonly http = resolve(IHttpClient);
  private readonly logger = resolve(ILogger).scopeTo('ChatService');

  async sendMessage(messages: ChatMessage[]): Promise<ChatResponse> {
    this.logger.debug('Sending chat message', { messageCount: messages.length });

    try {
      const payload = {
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        model: 'gpt-4o-mini' // Using the more cost-effective model
      };

      const response = await this.http.post(`${this.baseUrl}/chat`, JSON.stringify(payload), {
        headers: { 'Content-Type': 'application/json' }
      });
      const data: ChatApiResponse = await response.json();

      if ('error' in data) {
        throw new Error(data.error);
      }

      this.logger.debug('Received chat response', { 
        usage: data.usage,
        model: data.model 
      });

      return data;
    } catch (error) {
      this.logger.error('Failed to send chat message', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.http.get(`${this.baseUrl}/health`);
      return true;
    } catch {
      return false;
    }
  }
}
```

### Create the Chat Component

Create `src/components/chat.ts`:

```typescript
import { bindable } from '@aurelia/runtime-html';
import { ILogger, resolve } from '@aurelia/kernel';
import { IChatService } from '../services/chat-service';
import { ChatMessage } from '../types/chat';

export class Chat {
  private readonly chatService = resolve(IChatService);
  private readonly logger = resolve(ILogger).scopeTo('Chat');

  @bindable public title: string = 'AI Chat Assistant';

  public userMessage = '';
  public messages: ChatMessage[] = [];
  public isLoading = false;
  public isTyping = false;
  public error: string | null = null;
  public isConnected = true;

  private messagesContainer?: HTMLElement;

  constructor() {
    this.checkConnection();
  }

  public attached(): void {
    this.messagesContainer = document.querySelector('.chat-messages');
    this.addWelcomeMessage();
  }

  private addWelcomeMessage(): void {
    this.messages.push({
      id: this.generateId(),
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date()
    });
  }

  public async sendMessage(): Promise<void> {
    const message = this.userMessage.trim();
    if (!message || this.isLoading) return;

    this.error = null;
    this.isLoading = true;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: this.generateId(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    this.messages.push(userMessage);
    this.userMessage = '';
    
    this.scrollToBottom();
    this.showTypingIndicator();

    try {
      const response = await this.chatService.sendMessage(this.messages);
      
      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: this.generateId(),
        role: 'assistant',
        content: response.reply,
        timestamp: new Date()
      };
      this.messages.push(assistantMessage);

      this.logger.debug('Message sent successfully', {
        tokensUsed: response.usage?.total_tokens,
        model: response.model
      });
    } catch (error) {
      this.logger.error('Failed to send message', error);
      this.error = error instanceof Error ? error.message : 'Failed to send message';
      
      // Add error message
      this.messages.push({
        id: this.generateId(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      });
    } finally {
      this.isLoading = false;
      this.hideTypingIndicator();
      this.scrollToBottom();
    }
  }

  public handleKeyPress(event: KeyboardEvent): boolean {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void this.sendMessage();
      return false;
    }
    return true;
  }

  public clearChat(): void {
    this.messages = [];
    this.error = null;
    this.addWelcomeMessage();
  }

  private async checkConnection(): Promise<void> {
    try {
      this.isConnected = await this.chatService.healthCheck();
    } catch {
      this.isConnected = false;
    }
  }

  private showTypingIndicator(): void {
    this.isTyping = true;
  }

  private hideTypingIndicator(): void {
    this.isTyping = false;
  }

  private scrollToBottom(): void {
    // Use setTimeout to ensure DOM is updated
    setTimeout(() => {
      this.messagesContainer?.scrollTo({
        top: this.messagesContainer.scrollHeight,
        behavior: 'smooth'
      });
    }, 100);
  }

  private generateId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public formatTimestamp(timestamp: Date): string {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}
```

### Create the Chat Component View

Create `src/components/chat.html`:

```html
<template>
  <div class="chat-container">
    <!-- Header -->
    <div class="chat-header">
      <h2 class="chat-title">${title}</h2>
      <div class="chat-status">
        <span class="status-indicator ${isConnected ? 'connected' : 'disconnected'}"></span>
        <span class="status-text">${isConnected ? 'Connected' : 'Disconnected'}</span>
        <button class="clear-btn" click.trigger="clearChat()" title="Clear conversation">
          🗑️
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div class="error-message" if.bind="error">
      <span class="error-icon">⚠️</span>
      ${error}
    </div>

    <!-- Messages -->
    <div class="chat-messages" ref="messagesContainer">
      <div 
        repeat.for="message of messages" 
        class="message ${message.role}"
        data-message-id="${message.id}"
      >
        <div class="message-content">
          <div class="message-text">${message.content}</div>
          <div class="message-time">${formatTimestamp(message.timestamp)}</div>
        </div>
      </div>
      
      <!-- Typing Indicator -->
      <div class="message assistant typing-indicator" if.bind="isTyping">
        <div class="message-content">
          <div class="typing-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Form -->
    <form class="chat-input-form" submit.trigger="sendMessage()">
      <div class="input-container">
        <textarea
          class="message-input"
          value.bind="userMessage"
          placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
          keydown.trigger="handleKeyPress($event)"
          disabled.bind="isLoading || !isConnected"
          rows="1"
        ></textarea>
        <button 
          type="submit" 
          class="send-button ${isLoading ? 'loading' : ''}"
          disabled.bind="isLoading || !userMessage.trim() || !isConnected"
          title="Send message"
        >
          <span if.bind="!isLoading">Send</span>
          <span if.bind="isLoading" class="loading-spinner">⌛</span>
        </button>
      </div>
    </form>
  </div>
</template>
```

### Apply Modern CSS Styling

Replace the content of `src/my-app.css` with modern, responsive styles:

```css
/* Reset and base styles */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.my-app {
  padding: 20px;
  max-width: 100%;
}

/* Chat Container */
.chat-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 90vh;
  min-height: 600px;
}

/* Header */
.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.chat-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ade80;
}

.status-indicator.disconnected {
  background: #f87171;
}

.clear-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Error Message */
.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 12px 20px;
  border-left: 4px solid #dc2626;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Messages */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scroll-behavior: smooth;
}

.message {
  display: flex;
  max-width: 80%;
  animation: messageSlideIn 0.3s ease-out;
}

.message.user {
  align-self: flex-end;
}

.message.assistant {
  align-self: flex-start;
}

.message-content {
  background: #f1f5f9;
  border-radius: 18px;
  padding: 12px 16px;
  position: relative;
  word-wrap: break-word;
  max-width: 100%;
}

.message.user .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message.assistant .message-content {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.message-text {
  line-height: 1.4;
  white-space: pre-wrap;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 4px;
  text-align: right;
}

.message.assistant .message-time {
  text-align: left;
}

/* Typing Indicator */
.typing-indicator .message-content {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.typing-dots {
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #94a3b8;
  animation: typingDot 1.4s infinite both;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

/* Input Form */
.chat-input-form {
  padding: 20px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.input-container {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  padding: 12px 16px;
  font-size: 16px;
  font-family: inherit;
  resize: none;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  min-height: 44px;
  max-height: 120px;
}

.message-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.message-input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.send-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.send-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.send-button.loading {
  animation: buttonPulse 1s infinite;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

/* Animations */
@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes typingDot {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes buttonPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .my-app {
    padding: 10px;
  }
  
  .chat-container {
    height: 100vh;
    border-radius: 0;
  }
  
  .chat-header {
    padding: 15px;
  }
  
  .chat-title {
    font-size: 1.25rem;
  }
  
  .message {
    max-width: 90%;
  }
  
  .chat-messages {
    padding: 15px;
  }
  
  .chat-input-form {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .message {
    max-width: 95%;
  }
  
  .input-container {
    gap: 8px;
  }
  
  .send-button {
    width: 40px;
    height: 40px;
    font-size: 12px;
  }
}

/* Scrollbar Styling */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
```

### Update the Main App Component

Update `src/my-app.ts` to include the chat component:

```typescript
export class MyApp {
  public message = 'Welcome to your AI Chat Assistant!';
}
```

Update `src/my-app.html`:

```html
<template>
  <require from="./components/chat"></require>
  <div class="my-app">
    <chat title="AI Chat Assistant"></chat>
  </div>
</template>
```

---

## 4. Running the Application

### Start the Backend Server

Navigate to the `server` directory and run:

```bash
# For development with auto-restart
npm run dev

# Or for production
npm start
```

You should see:
```
Server is running on http://localhost:3001
API endpoint: http://localhost:3001/api/chat
```

### Start the Aurelia Frontend

In a new terminal, navigate to your Aurelia project directory and run:

```bash
npm run dev
```

Your browser should automatically open to `http://localhost:8080` with the chat application.

---

## 5. Features Implemented

Our ChatGPT-inspired app includes:

### Core Features
- **Modern Aurelia 2 Architecture**: Proper dependency injection, services, and TypeScript types
- **Real-time Chat Interface**: Smooth messaging experience with loading states
- **Error Handling**: Comprehensive error handling for API failures, rate limits, and network issues
- **Responsive Design**: Mobile-friendly layout that works on all screen sizes
- **Connection Status**: Visual indicator showing server connectivity
- **Message Persistence**: Chat history maintained during the session
- **Typing Indicators**: Visual feedback when the AI is generating a response
- **Accessibility**: Keyboard navigation and screen reader support

### UI/UX Enhancements
- **Modern Design**: Clean, modern interface inspired by popular chat applications
- **Smooth Animations**: Message slide-ins and loading animations
- **Message Timestamps**: Each message includes a timestamp
- **Auto-scroll**: Messages automatically scroll to the bottom
- **Clear Chat**: Option to clear conversation history

## 6. Advanced Enhancements (Optional)

To further enhance your application, consider adding:

### Streaming Responses
Implement OpenAI's streaming API for real-time text generation:

```typescript
// In your chat service
async sendStreamingMessage(messages: ChatMessage[]): Promise<ReadableStream> {
  const response = await fetch(`${this.baseUrl}/chat-stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, stream: true })
  });
  return response.body;
}
```

### Markdown Support
Add markdown rendering for formatted responses:

```bash
npm install marked @types/marked
```

### Conversation History
Persist conversations in localStorage or a database:

```typescript
export class ConversationService {
  saveConversation(id: string, messages: ChatMessage[]): void {
    localStorage.setItem(`chat-${id}`, JSON.stringify(messages));
  }

  loadConversation(id: string): ChatMessage[] {
    const stored = localStorage.getItem(`chat-${id}`);
    return stored ? JSON.parse(stored) : [];
  }
}
```

### Authentication
Add user authentication and personalized conversations:

```typescript
export class AuthService {
  // Implement user authentication logic
}
```

### Dark Mode
Add theme switching capability:

```css
[data-theme="dark"] .chat-container {
  background: #1f2937;
  color: #f9fafb;
}
```

---

## 7. Testing Your Application

### Backend Testing
Test your server endpoints:

```bash
# Health check
curl http://localhost:3001/api/health

# Chat endpoint
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello!"}]}'
```

### Frontend Testing
1. Open your browser to `http://localhost:8080`
2. Type a message and press Enter
3. Verify the AI responds appropriately
4. Test error handling by stopping the backend server
5. Test responsive design by resizing your browser window

## 8. Troubleshooting

### Common Issues

**"Invalid API key" error:**
- Verify your OpenAI API key is correct in the `.env` file
- Ensure you have credits in your OpenAI account

**"Rate limit exceeded" error:**
- You're sending too many requests. Wait a moment and try again
- Consider implementing request throttling

**CORS errors:**
- Ensure the server's CORS configuration allows your frontend domain
- Check that both server and client are running on expected ports

**Connection issues:**
- Verify both backend (port 3001) and frontend (port 8080) are running
- Check browser console for network errors
- Ensure firewall isn't blocking the ports

## Conclusion

You've built a modern, feature-rich ChatGPT-inspired application using Aurelia 2. This project demonstrates:

### Modern Architecture
- **Aurelia 2**: Latest framework features with proper dependency injection using `resolve()`
- **TypeScript**: Strong typing throughout the application
- **Service Pattern**: Separation of concerns with dedicated services
- **Component-Based**: Reusable and maintainable component structure

### Best Practices
- **Error Handling**: Comprehensive error management and user feedback
- **Responsive Design**: Mobile-first approach with modern CSS
- **Performance**: Optimized rendering and smooth animations
- **Accessibility**: Keyboard navigation and semantic HTML

### Production-Ready Features
- **Environment Configuration**: Secure API key management
- **Health Checks**: Server monitoring endpoints
- **Loading States**: Clear user feedback during operations
- **Connection Status**: Real-time connectivity monitoring

This application serves as an excellent foundation for building more complex AI-powered chat interfaces. You can extend it with additional features like conversation persistence, user authentication, file uploads, or integration with other AI services.

**Next Steps:**
- Deploy your application to production using services like Vercel, Netlify, or AWS
- Add user authentication and conversation history
- Implement streaming responses for real-time text generation
- Add support for image uploads and multimodal conversations
- Create custom AI personalities or specialized assistants
