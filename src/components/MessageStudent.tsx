import type { StudentTurn } from "../types";

export default function MessageStudent({ turn }: { turn: StudentTurn }) {
  return (
    <div className="mb-4">
      <div className="flex items-start gap-2 justify-end">
        <div className="max-w-3xl text-right">
          <div className="font-semibold">You</div>
          <div className="mt-1 whitespace-pre-wrap">{turn.text}</div>
        </div>
        <div className="shrink-0 w-7 h-7 rounded-full bg-indigo-500" aria-hidden />
      </div>
    </div>
  );
}
