import { API_BASE } from "./config";

export type ApiUI = {
  rationale?: string;
  question?: { id: string; prompt: string; choices?: string[] };
  options?: string[];
};

export type ApiResult = {
  action?: string;
  next_node?: string | null;
  from_node?: string | null;
  confidence?: string | null;
  ui: ApiUI;
  graded?: { correct: boolean; skill: string; expected: string } | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function ingest(payload: any): Promise<ApiResult> {
  const r = await fetch(`${API_BASE}/session/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`API error ${r.status}`);
  const data = await r.json();
  return {
    action: data.action,
    next_node: data.next_node,
    from_node: data.from_node,
    confidence: data.confidence,
    ui: data.ui || {},
    graded: data.graded || null,
  };
}

export async function nextStep(sessionId: string): Promise<ApiResult> {
  const r = await fetch(`${API_BASE}/session/next?session_id=${encodeURIComponent(sessionId)}`, {
    method: "POST",
  });
  if (!r.ok) throw new Error(`API error ${r.status}`);
  const data = await r.json();
  return {
    action: data.action,
    next_node: data.next_node,
    from_node: data.from_node,
    confidence: data.confidence,
    ui: data.ui || {},
    graded: data.graded || null,
  };
}

export async function resetSession(sessionId: string) {
  const r = await fetch(`${API_BASE}/session/reset?session_id=${encodeURIComponent(sessionId)}`, {
    method: "POST",
  });
  if (!r.ok) throw new Error(`API error ${r.status}`);
  return r.json();
}
