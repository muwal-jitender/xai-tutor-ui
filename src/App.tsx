/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { ingest, nextStep, resetSession, type ApiResult } from "./api";
import ChatTimeline, { type Turn } from "./components/ChatTimeline";
import type { TutorTurn, StudentTurn } from "./types";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function tutorTextFromResult(res: ApiResult): string {
  switch (res.action) {
    case "OFFER_DIAGNOSTIC":
      return "Before we jump into DSA, I recommend a quick diagnostic (5–8 items) to confirm prerequisites. You can skip if you prefer.";
    case "ASK_QUESTION":
      return "Let’s check your understanding with a quick question.";
    case "REVIEW_PREREQ":
      return "I’m seeing a gap in a prerequisite. Let’s review it briefly, then we’ll come back.";
    case "ADVANCE":
      return "Looks good. Advancing to the next concept.";
    case "ANSWER_CONTENT":
      return "Here’s a concise explanation:";
    default:
      return "Let’s continue.";
  }
}

export default function App() {
  const [sessionId] = useState(() => `ui-${uid()}`);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
    const startedRef = useRef(false);

  // Start session with a tutor turn
  useEffect(() => {
    if (startedRef.current) return;   // prevent StrictMode double-invoke
    startedRef.current = true;

    (async () => {
      const res = await ingest({ session_id: sessionId, action: "start" });
      pushTutor(res);
    })().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pushTutor(res: ApiResult) {
    const t: TutorTurn = {
      role: "tutor",
      text: tutorTextFromResult(res),
      rationale: res.ui?.rationale,
      confidence: (res.confidence as any) || undefined,
      options: res.ui?.options || [],
      question: res.ui?.question,
      graded: res.graded || null,
    };
    setTurns((prev) => [...prev, t]);
  }

  function pushStudent(text: string) {
    const s: StudentTurn = { role: "student", text };
    setTurns((prev) => [...prev, s]);
  }

  async function handleOption(label: string) {
    try {
      setBusy(true);
      pushStudent(label);
      const res = await ingest({
        session_id: sessionId,
        action: "continue",
        message: label,
      });
      pushTutor(res);
    } finally {
      setBusy(false);
    }
  }

  async function handleAnswer(choice: string, qid: string) {
    try {
      setBusy(true);
      pushStudent(choice);
      const graded = await ingest({
        session_id: sessionId,
        action: "answer",
        question_id: qid,
        answer: choice,
      });
      pushTutor(graded);

      // and drive the next step
      const nextRes = await nextStep(sessionId);
      pushTutor(nextRes);
    } finally {
      setBusy(false);
    }
  }

  async function handleFreeTextSend() {
    if (!input.trim()) return;
    const msg = input.trim();
    setInput("");
    pushStudent(msg);

    // Treat free text as content request
    const res = await ingest({
      session_id: sessionId,
      action: "content_only",
      message: msg,
    });
    pushTutor(res);
  }

  async function handleReset() {
    setBusy(true);
    try {
      await resetSession(sessionId);
      setTurns([]);
      const res = await ingest({ session_id: sessionId, action: "start" });
      pushTutor(res);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="h-screen grid grid-cols-[260px_1fr_320px] gap-3 p-3 bg-gray-50 text-gray-900">
      {/* Left Nav */}
      <aside className="bg-white border rounded p-3">
        <div className="font-semibold mb-3">New Chat</div>
        <button
          onClick={handleReset}
          disabled={busy}
          className="w-full px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          Start new session
        </button>

        <div className="mt-6 font-semibold mb-2">Courses</div>
        <div className="space-y-2 text-sm">
          <div className="px-3 py-2 rounded bg-blue-50 border border-blue-200">
            Data Structures & Algorithms
          </div>
          <div className="px-3 py-2 rounded bg-gray-50 border">Statistics</div>
          <div className="px-3 py-2 rounded bg-gray-50 border">Python Foundations</div>
        </div>
      </aside>

      {/* Chat */}
      <main className="bg-white border rounded flex flex-col">
        <div className="flex-1 overflow-auto">
          <ChatTimeline turns={turns} onOption={handleOption} onAnswer={handleAnswer} />
        </div>
        <div className="border-t p-3 flex gap-2">
          <input
            className="flex-1 border rounded px-3 py-2"
            placeholder="Ask your AI Tutor a question…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFreeTextSend()}
            aria-label="Message input"
          />
          <button
            onClick={handleFreeTextSend}
            disabled={busy || !input.trim()}
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </main>

      {/* Skill Drawer */}
      <aside className="bg-white border rounded p-3">
        <div className="font-semibold mb-2">Skill Focus</div>
        <ul className="space-y-2 text-sm">
          <li className="px-2 py-2 rounded bg-blue-50 border border-blue-200">Math Basics</li>
          <li className="px-2 py-2 rounded bg-gray-50 border">Algorithmic Vocabulary</li>
          <li className="px-2 py-2 rounded bg-gray-50 border">Time Complexity (Big O)</li>
          <li className="px-2 py-2 rounded bg-gray-50 border">Space Complexity (Big O)</li>
        </ul>
      </aside>
    </div>
  );
}
