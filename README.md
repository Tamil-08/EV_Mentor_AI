# Mentor AI — AI Coding Assistant

A chat-based coding mentor powered by the Gemini API. Explains concepts,
reviews doubts, and walks through bugs step by step instead of just
dumping fixed code.

```
mentor-ai/
├── backend/          # Express server that talks to Gemini
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    └── index.html    # Single-file chat UI (no build step)
```

## 1. Get a Gemini API key

Go to https://aistudio.google.com/apikey and create a free API key.

## 2. Set up the backend (Windows CMD)

```cmd
cd mentor-ai\backend
npm install
copy .env.example .env
```

Open `.env` and paste your key:

```
GEMINI_API_KEY=your_actual_key_here
PORT=5000
```

Start the server:

```cmd
npm start
```

You should see:

```
🧠 Mentor AI backend running on http://localhost:5000
```

## 3. Open the frontend

Just double-click `frontend/index.html` (or open it in your browser).
It connects to `http://localhost:5000` automatically. The status dot
in the header turns green once it's connected.

## How it's built

- **Backend** (`server.js`): Express + `@google/generative-ai`. Each
  browser tab gets a `sessionId` and the server keeps that
  conversation's history in memory, so Gemini remembers earlier turns
  in the chat.
- **System prompt**: Mentor AI is instructed to explain *why* before
  handing out fixes, use short focused snippets, and teach rather than
  just answer — you can edit `MENTOR_SYSTEM_PROMPT` in `server.js` to
  change its personality or focus (e.g. make it interview-prep focused).
- **Frontend**: plain HTML/CSS/JS, no React/build tooling needed —
  easy to drop into any static host later (Vercel, GitHub Pages, etc.)
  once you point `API_BASE` at your deployed backend.

## Next steps you could add

- Swap in-memory session storage for Redis/SQLite so history survives restarts
- Stream responses token-by-token instead of waiting for the full reply
- Deploy backend to Render/Railway and frontend to Vercel
- Add a "paste code file" upload option
- Add syntax highlighting (e.g. highlight.js) for code blocks
