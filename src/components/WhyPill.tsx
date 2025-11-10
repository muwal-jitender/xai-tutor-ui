import { useState } from "react";

type Props = {
  confidence?: "low" | "medium" | "high";
  rationale?: string;
};

export default function WhyPill({ confidence, rationale }: Props) {
  // Hooks must be called unconditionally (before any return).
  const [open, setOpen] = useState(false);

  const hasAnything = Boolean(confidence || rationale);
  if (!hasAnything) return null;

  const color =
    confidence === "high"
      ? "bg-green-50 border-green-300 text-green-700"
      : confidence === "medium"
      ? "bg-yellow-50 border-yellow-300 text-yellow-700"
      : "bg-red-50 border-red-300 text-red-700";

  return (
    <div className="mt-1 flex items-center gap-2">
      {confidence && (
        <span className={`text-xs px-2 py-0.5 rounded border ${color}`}>
          {confidence}
        </span>
      )}

      {rationale && (
        <>
          <button
            className="text-xs px-2 py-0.5 rounded border bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="why-details"
          >
            Why?
          </button>

          {open && (
            <div
              id="why-details"
              className="ml-2 text-xs text-gray-700 max-w-prose"
            >
              {rationale}
            </div>
          )}
        </>
      )}
    </div>
  );
}
