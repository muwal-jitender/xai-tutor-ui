import type { TutorTurn } from "../types";
import WhyPill from "./WhyPill";

export default function MessageTutor({
  turn,
  onOption,
  onAnswer,
}: {
  turn: TutorTurn;
  onOption: (label: string) => void;
  onAnswer: (choice: string, qid: string) => void;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-start gap-2">
        <div className="shrink-0 w-7 h-7 rounded-full bg-blue-600" aria-hidden />
        <div className="max-w-3xl">
          <div className="font-semibold">Tutor</div>
          <div className="mt-1 whitespace-pre-wrap">{turn.text}</div>

          <WhyPill confidence={turn.confidence} rationale={turn.rationale} />

          {/* Quick replies */}
          {Array.isArray(turn.options) && turn.options.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {turn.options.map((opt) => (
                <button
                  key={opt}
                  className="px-3 py-1 rounded-2xl border bg-blue-50 border-blue-200 text-sky-800 hover:bg-blue-100"
                  onClick={() => onOption(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* MCQ */}
          {turn.question && Array.isArray(turn.question.choices) && (
            <div className="mt-3">
              <div className="mb-1">{turn.question.prompt}</div>
              <div className="flex flex-wrap gap-2">
                {turn.question.choices!.map((c) => (
                  <button
                    key={c}
                    onClick={() => onAnswer(c, turn.question!.id)}
                    className="px-3 py-1 rounded-2xl border bg-gray-50 border-gray-200 hover:bg-gray-100"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Graded chip */}
          {turn.graded && (
            <div className="mt-2">
              <span
                className={
                  "inline-block text-xs px-2 py-0.5 rounded border " +
                  (turn.graded.correct
                    ? "bg-green-50 border-green-300 text-green-700"
                    : "bg-red-50 border-red-300 text-red-700")
                }
              >
                {turn.graded.correct
                  ? "Correct"
                  : `Incorrect • Expected: ${turn.graded.expected}`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
