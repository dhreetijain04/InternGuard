export type Category = "Low" | "Moderate" | "High";
export type Indicator = { code: string; title: string; explanation: string; evidence?: string; recommendation?: string; severity: "low" | "medium" | "high"; source: "rule" | "ai" };
export type ChecklistItem = { id: string; label: string; completed: boolean };
export type Analysis = { id: string; title: string; company: string; description: string; salary: string; location: string; workMode: string; applicationUrl: string; contact: string; score: number; category: Category; indicators: Indicator[]; extracted: Record<string, string>; recommendations: string[]; checklist?: ChecklistItem[]; aiReasoning: string; aiAvailable: boolean; createdAt: string };
export type FormData = { title: string; company: string; description: string; salary: string; location: string; workMode: string; applicationUrl: string; contact: string };
export const emptyForm: FormData = { title: "", company: "", description: "", salary: "", location: "", workMode: "Not specified", applicationUrl: "", contact: "" };
export const colors: Record<Category, string> = { Low: "#58d8ae", Moderate: "#ffc857", High: "#ff6b7a" };
