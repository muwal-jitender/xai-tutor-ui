export type ChoiceQuestion = {
  id: string;
  prompt: string;
  choices?: string[];
};

export type UiPayload = {
  rationale?: string;
  question?: ChoiceQuestion;
  options?: string[];
};

export type TutorTurn = {
  role: "tutor";
  text: string;            // naturalized message (we’ll derive from action)
  rationale?: string;
  confidence?: "low" | "medium" | "high";
  options?: string[];      // quick replies
  question?: ChoiceQuestion;
  graded?: { correct: boolean; expected: string } | null;
};

export type StudentTurn = {
  role: "student";
  text: string;
};
