import type { StudentTurn, TutorTurn } from "../types";

import MessageStudent from "./MessageStudent";
import MessageTutor from "./MessageTutor";

export type Turn = TutorTurn | StudentTurn;

export default function ChatTimeline({
  turns,
  onOption,
  onAnswer,
}: {
  turns: Turn[];
  onOption: (label: string) => void;
  onAnswer: (choice: string, qid: string) => void;
}) {
  return (
    <div className="p-4">
      {turns.map((t, i) =>
        t.role === "tutor" ? (
          <MessageTutor key={i} turn={t} onOption={onOption} onAnswer={onAnswer} />
        ) : (
          <MessageStudent key={i} turn={t} />
        )
      )}
    </div>
  );
}
