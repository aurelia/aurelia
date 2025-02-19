---
description: Learn how to build a ChatGPT-inspired application with Aurelia 2, Node.js, and the OpenAI GPT-4o API.
---

# Building a ChatGPT-Inspired App with Aurelia 2, Node.js, and OpenAI GPT-4o API

This tutorial will guide you through creating a ChatGPT-like application using Aurelia 2 for the frontend, Node.js + Express for the backend, and OpenAI's GPT-4o API to generate responses. We'll use the official OpenAI Node.js client for integration and apply modern styling.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (latest LTS version recommended)
- [OpenAI API Key](https://platform.openai.com/signup)

---

## 1. Setting Up the Aurelia 2 Frontend

### Create a New Aurelia Project

Run the following command to scaffold a new Aurelia 2 project with Vite:

```bash
npx makes aurelia
```

Select "Default TypeScript App" and "Vite" when prompted.

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
```

### Create the Express Server

Create an `index.js` file inside the `server` directory:

```javascript
const express = require('express');
const { OpenAI } = require('openai');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: message }],
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error communicating with OpenAI API');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
```

### Secure Your API Key

Create a `.env` file in the `server` directory:

```
OPENAI_API_KEY=your_openai_api_key_here
```

Replace `your_openai_api_key_here` with your actual OpenAI API key.

---

## 3. Connecting Frontend and Backend

### Create the Chat Component in Aurelia

Inside your Aurelia 2 project, create a new file `src/components/chat.ts`:

```typescript
import { IHttpClient, json } from 'aurelia';
import { inject } from 'aurelia';

@inject(IHttpClient)
export class Chat {
  public userMessage = '';
  public chatHistory: { sender: string; message: string }[] = [];

  constructor(private http: IHttpClient) {}

  async sendMessage() {
    if (this.userMessage.trim() === '') return;

    this.chatHistory.push({ sender: 'User', message: this.userMessage });

    try {
      const response = await this.http.post(
        'http://localhost:3001/api/chat',
        json({ message: this.userMessage })
      );
      const data = await response.json();
      this.chatHistory.push({ sender: 'Bot', message: data.reply });
    } catch (error) {
      console.error('Error:', error);
      this.chatHistory.push({
        sender: 'Bot',
        message: 'Sorry, something went wrong.',
      });
    }

    this.userMessage = '';
  }
}
```

### Create the Chat Component View

Create `src/components/chat.html`:

```html
<template>
  <div class="chat-container">
    <div class="chat-history">
      <div
        repeat.for="entry of chatHistory"
        class="message ${entry.sender === 'User' ? 'user' : 'bot'}"
      >
        <strong>${entry.sender}:</strong> ${entry.message}
      </div>
    </div>
    <form submit.trigger="sendMessage()">
      <input
        type="text"
        value.bind="userMessage"
        placeholder="Type your message..."
      />
      <button type="submit">Send</button>
    </form>
  </div>
</template>
```

### Apply CSS Styling

Add the following styles to your `src/my-app.css`:

```css
.chat-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.chat-history {
  border: 1px solid #ccc;
  padding: 10px;
  height: 400px;
  overflow-y: scroll;
  margin-bottom: 10px;
  background: #f9f9f9;
}

.message {
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 4px;
}

.message.user {
  background-color: #007bff;
  color: white;
  text-align: right;
}

.message.bot {
  background-color: #e0e0e0;
  color: black;
}

form {
  display: flex;
}

input[type='text'] {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 10px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  margin-left: 10px;
  border-radius: 4px;
}

button:hover {
  background-color: #0056b3;
}
```

### Add the Chat Component to the App

In your `my-app.html` file, add the following:

```html
<import from="./components/chat"></import>
<div class="container">
  <chat></chat>
</div>
```

---

## 4. Running the Application

### Start the Backend Server

Navigate to the `server` directory and run:

```bash
node index.js
```

### Start the Aurelia Frontend

Navigate to your Aurelia project directory and run:

```bash
npm start
```

A browser will open your app automatically.

---

## 5. Additional Enhancements

- Typing Indicator: Show a "Bot is typing..." animation while waiting for a response.
- Markdown Support: Render bot responses with Markdown formatting.
- Streaming Responses: Implement OpenAI's streaming API for real-time responses.
- Authentication: Allow users to log in and save chat history.
- Dark Mode: Add a toggle to switch between light and dark themes.

---

## Conclusion

In this tutorial, we built a ChatGPT-inspired app using Aurelia 2, Node.js, and OpenAI's GPT-4o API. This project covered:

- Frontend: Aurelia 2 with HTTP client integration.
- Backend: Node.js + Express with OpenAI API integration.
- Styling: Modern CSS for a clean UI.
