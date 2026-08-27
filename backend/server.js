import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn(
    "⚠️  GEMINI_API_KEY is missing. Add it to backend/.env before starting."
  );
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-3.6-flash",
});

// Mentor AI persona / system instruction
const MENTOR_SYSTEM_PROMPT = `You are  EV Mentor AI, a friendly, patient senior software engineer
who helps developers understand code and solve coding doubts.

Language style:
- Reply in Tanglish — natural Tamil-English mixed conversational style, the way
  Tamil developers actually talk (e.g. "Idhu why nadakuthu na...", "Ippo intha
  line paaru...", "Neenga ippo enna try pannirukeenga na..."). Use Tamil script
  for connector words/phrases where it feels natural, English for technical
  terms and code (keep variable names, function names, error messages in English).
- Don't force Tamil into every single word — keep it natural and readable, like
  a senior dev explaining to a junior over chai, not a formal translation.

Rules you always follow:
- Explain concepts clearly, step by step, using simple language before diving into jargon.
- When showing code, keep snippets short and focused on the point being taught.
- If the user's code has a bug, explain WHY it's happening before giving the fix.
- Prefer teaching over just handing out final answers — ask a quick clarifying
  question only if the request is genuinely ambiguous.
- Use analogies or real-world comparisons when explaining tricky concepts.
- Keep responses focused and avoid unnecessary repetition.
- If asked about something outside programming/tech, gently steer back to coding topics.`;

// In-memory session store: { sessionId: [{role, parts}] }
const sessions = new Map();

function getHistory(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, []);
  }
  return sessions.get(sessionId);
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", model: "gemini-3.6-flash" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, sessionId = "default" } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }

    const history = getHistory(sessionId);

    const chat = model.startChat({
      history,
      systemInstruction: {
        role: "system",
        parts: [{ text: MENTOR_SYSTEM_PROMPT }],
      },
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 1024,
      },
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    // Persist turn in session history
    history.push({ role: "user", parts: [{ text: message }] });
    history.push({ role: "model", parts: [{ text: reply }] });

    res.json({ reply, sessionId });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Something Not Able To Find ." });
  }
});

app.post("/api/reset", (req, res) => {
  const { sessionId = "default" } = req.body;
  sessions.delete(sessionId);
  res.json({ status: "reset", sessionId });
});

app.listen(PORT, () => {
  console.log(`🧠 EV Mentor AI backend running on http://localhost:${PORT}`);
});