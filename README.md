# MCP SQL Server with GPT Chat Interface

This project consists of two main components: a MCP server for handling SQLite database operations via Ollama, the easiest way to get up and running with large language models, and a web application for interacting with the database through a chat interface.

## Screenshots

<img width="2262" height="1244" alt="image" src="https://github.com/user-attachments/assets/43514de0-ddbe-419a-a347-c4704fc9d4c8" />

## Project Structure

```
.
├── server/         # Backend SQLite server
└── gpt-db-chat/   # Frontend React application
```

## Server

The server component is a TypeScript-based backend application that:

- Handles SQLite database operations
- Provides a REST API for database interactions
- Includes database initialization scripts

### Setup

First, install [Ollama](https://ollama.com/) and download the model `qwen2.5:latest`

```bash
ollama run qwen2.5:latest
```
_Feel free to install and use other models_


Setup server
```bash
cd server
npm install

npm run init:db # Initalize the database
```

Key files:
- `server.ts` - Main server implementation
- `init-db.ts` - Database initialization script

## GPT DB Chat

The application provides a chat interface for interacting with the SQLite database.

### Setup

```bash
cd gpt-db-chat
npm install
```

Key directories:
- `app/` - Core application code
- `app/chat/` - Chat interface implementation
- `app/components/` - Reusable UI components
- `app/infra/` - Infrastructure code including API clients

## Run apps

1. Start the server:
```bash
cd server
npm run start
```

**Extra:** You can run the CLI
```bash
cd server
npm run cli "Your question"
```

2. Start the web application:
```bash
cd gpt-db-chat
npm run dev
```

## Tech Stack

- TypeScript
- Node.js
- SQLite
- React
- Vite
- React Router
