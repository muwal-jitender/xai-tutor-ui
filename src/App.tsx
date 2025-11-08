/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { ingest, nextStep, resetSession, type ApiResult } from "./api";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function App() {
  const [sessionId] = useState(() => `ui-${uid()}`);
  const [log, setLog] = useState<string[]>([]);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [answer, setAnswer] = useState<string>("");

  // helper to append log
  const pushLog = (line: string) =>
    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${line}`]);

  // start session once
  useEffect(() => {
    (async () => {
      pushLog(`Session: ${sessionId}`);
      const res = await ingest({ session_id: sessionId, action: "start" });
      setResult(res);
      pushLog(`Action: ${res.action}`);
    })().catch((e) => pushLog(`ERR start: ${e}`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rationale = result?.ui?.rationale || "";
  const question = result?.ui?.question;
  // const options = result?.ui?.options || [];

  async function handleContinue() {
    try {
      const res = await nextStep(sessionId);
      setResult(res);
      setAnswer("");
      pushLog(`Action: ${res.action}`);
    } catch (e: any) {
      pushLog(`ERR next: ${e.message || e}`);
    }
  }

  async function handleDiagnosticChoice(yes: boolean) {
    try {
      const res = await ingest({
        session_id: sessionId,
        action: "continue",
        message: yes ? "diagnostic_yes" : "diagnostic_no",
      });
      setResult(res);
      pushLog(`Diagnostic choice: ${yes ? "Yes" : "No"} → ${res.action}`);
    } catch (e: any) {
      pushLog(`ERR diag: ${e.message || e}`);
    }
  }

  async function submitAnswer() {
    if (!question) return;
    try {
      const graded = await ingest({
        session_id: sessionId,
        action: "answer",
        question_id: question.id,
        answer: answer,
      });
      setResult(graded);
      pushLog(`Answer submitted (${answer}). Next action: ${graded.action}`);
    } catch (e: any) {
      pushLog(`ERR answer: ${e.message || e}`);
    }
  }

  async function handleReset() {
    try {
      await resetSession(sessionId);
      setLog([]);
      setResult(null);
      setAnswer("");
      // soft-reload app state
      const res = await ingest({ session_id: sessionId, action: "start" });
      setResult(res);
      pushLog("Session reset");
      pushLog(`Action: ${res.action}`);
    } catch (e: any) {
      pushLog(`ERR reset: ${e.message || e}`);
    }
  }

  return (
    <div className="h-screen grid grid-cols-12 gap-3 p-3 bg-gray-50">
      {/* Left: Chat / Controls */}
      <div className="col-span-4 bg-white border rounded p-3 flex flex-col">
        <div className="font-semibold mb-2">Controls</div>
        <div className="flex gap-2">
          <button onClick={handleContinue} className="px-3 py-1 bg-blue-600 text-white rounded">
            Continue
          </button>
          <button onClick={() => handleDiagnosticChoice(true)} className="px-3 py-1 bg-green-600 text-white rounded">
            Diagnostic: Yes
          </button>
          <button onClick={() => handleDiagnosticChoice(false)} className="px-3 py-1 bg-yellow-600 text-white rounded">
            Diagnostic: No
          </button>
          <button onClick={handleReset} className="px-3 py-1 bg-gray-600 text-white rounded">
            Reset
          </button>
        </div>

        <div className="mt-4">
          <div className="text-sm text-gray-600 mb-1">Log</div>
          <div className="h-64 overflow-auto border rounded p-2 text-sm bg-gray-50">
            {log.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle: Rationale */}
      <div className="col-span-5 bg-white border rounded p-3">
        <div className="font-semibold mb-2">Rationale</div>
        <div className="whitespace-pre-wrap text-sm">{rationale || "—"}</div>

        {/* Question (if any) */}
        {question && (
          <div className="mt-4">
            <div className="font-semibold mb-1">Question</div>
            <div className="mb-2">{question.prompt}</div>
            {Array.isArray(question.choices) && (
              <select
                className="border rounded p-2"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              >
                <option value="">Select your answer</option>
                {question.choices.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}
            <button
              onClick={submitAnswer}
              disabled={!answer}
              className="ml-2 px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-50"
            >
              Submit
            </button>
          </div>
        )}
      </div>

      {/* Right: Skill nodes (very simple list for now) */}
      <div className="col-span-3 bg-white border rounded p-3">
        <div className="font-semibold mb-2">Skill Nodes</div>
        <SkillList focus={result?.next_node || ""} />
      </div>
    </div>
  );
}

function SkillList({ focus }: { focus: string }) {
  const nodes = useMemo(
    () => [
      { id: "prereq.math.basics", title: "Math Basics" },
      { id: "prereq.algorithms.vocab", title: "Algorithmic Vocabulary" },
      { id: "core.bigO.time", title: "Time Complexity (Big O)" },
      { id: "core.bigO.space", title: "Space Complexity (Big O)" },
    ],
    []
  );
  return (
    <ul className="space-y-1">
      {nodes.map((n) => (
        <li
          key={n.id}
          className={`px-2 py-1 rounded ${
            focus === n.id ? "bg-blue-50 border border-blue-300" : "bg-gray-50 border"
          }`}
        >
          {/* <div className="text-xs text-gray-500">{n.id}</div> */}
          <div className="text-sm">{n.title}</div>
        </li>
      ))}
    </ul>
  );
}
