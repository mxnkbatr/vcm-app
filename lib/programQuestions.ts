export type ProgramQuestionType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "email"
  | "phone";

export type ProgramQuestion = {
  id: string;
  label: { mn: string; en?: string };
  type: ProgramQuestionType;
  required: boolean;
  options?: string[];
  placeholder?: { mn?: string; en?: string };
  order: number;
};

export type ApplicationAnswer = {
  questionId: string;
  label: string;
  value: string;
};

export function newQuestionId() {
  return `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function sortQuestions(questions: ProgramQuestion[] = []) {
  return [...questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export const DEFAULT_APPLICATION_QUESTIONS: Record<string, ProgramQuestion[]> = {
  EDU: [
    {
      id: "age",
      label: { mn: "Нас", en: "Age" },
      type: "number",
      required: true,
      order: 1,
    },
    {
      id: "english_level",
      label: { mn: "Англи хэлний түвшин", en: "English level" },
      type: "select",
      required: true,
      options: ["A1", "A2", "B1", "B2", "C1"],
      order: 2,
    },
    {
      id: "motivation",
      label: { mn: "Урам зориг / зорилго", en: "Motivation" },
      type: "textarea",
      required: true,
      placeholder: { mn: "Яагаад энэ хөтөлбөрт нэгдэхийг хүсэж байна вэ?" },
      order: 3,
    },
  ],
  AND: [
    {
      id: "age",
      label: { mn: "Нас", en: "Age" },
      type: "number",
      required: true,
      order: 1,
    },
    {
      id: "experience",
      label: { mn: "Тусгай хэрэгцээт хүүхдүүдтэй ажилласан туршлага", en: "Experience with special needs" },
      type: "textarea",
      required: true,
      order: 2,
    },
    {
      id: "motivation",
      label: { mn: "Урам зориг / зорилго", en: "Motivation" },
      type: "textarea",
      required: true,
      order: 3,
    },
  ],
  VCLUB: [
    {
      id: "age",
      label: { mn: "Нас", en: "Age" },
      type: "number",
      required: true,
      order: 1,
    },
    {
      id: "leadership",
      label: { mn: "Манлайлал, арга хэмжээний туршлага", en: "Leadership / events experience" },
      type: "textarea",
      required: false,
      order: 2,
    },
    {
      id: "motivation",
      label: { mn: "Урам зориг / зорилго", en: "Motivation" },
      type: "textarea",
      required: true,
      order: 3,
    },
  ],
};

export function defaultQuestionsForCode(code: string): ProgramQuestion[] {
  return DEFAULT_APPLICATION_QUESTIONS[code.toUpperCase()] || [
    {
      id: "motivation",
      label: { mn: "Урам зориг / зорилго", en: "Motivation" },
      type: "textarea",
      required: true,
      order: 1,
    },
  ];
}

export function validateApplicationAnswers(
  questions: ProgramQuestion[],
  answers: ApplicationAnswer[]
): string | null {
  const byId = new Map(answers.map((a) => [a.questionId, a.value?.trim() ?? ""]));
  for (const q of sortQuestions(questions)) {
    if (!q.required) continue;
    const value = byId.get(q.id);
    if (!value) return `${q.label.mn} талбарыг бөглөнө үү.`;
  }
  return null;
}

export function answersFromForm(
  questions: ProgramQuestion[],
  form: Record<string, string>
): ApplicationAnswer[] {
  return sortQuestions(questions).map((q) => ({
    questionId: q.id,
    label: q.label.mn,
    value: String(form[q.id] ?? "").trim(),
  }));
}
