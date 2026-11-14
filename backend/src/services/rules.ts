import type { AnalysisInput } from "../validators/analysis.js";

export type Indicator = {
  code: string;
  title: string;
  explanation: string;
  evidence: string;
  recommendation: string;
  severity: "low" | "medium" | "high";
  source: "rule" | "ai";
};

const rules = [
  { code: "UPFRONT_FEE", title: "Upfront payment language", pattern: /registration fee|training fee|processing fee|pay\s+(an|the)?\s*fee|security deposit|joining fee/i, severity: "high" as const, explanation: "Legitimate employers generally do not require candidates to pay to access a job or internship.", recommendation: "Do not pay. Confirm the hiring process through an independently found company channel." },
  { code: "UNREALISTIC_PAY", title: "Unusually high compensation", pattern: /(?:earn|salary|stipend|income)[^.!\n]{0,80}(?:\$|₹|rs\.?|inr)?\s*(?:[1-9]\d{2,}(?:,\d{3})?|[1-9]\d)\s*(?:per day|daily|weekly|per week)/i, severity: "medium" as const, explanation: "Compensation that is unusually high for the stated experience or effort deserves independent verification.", recommendation: "Compare the compensation with the employer's official careers page and reputable salary sources." },
  { code: "SENSITIVE_DOCUMENTS", title: "Early request for sensitive documents", pattern: /aadhaar|aadhar|pan card|bank account|credit card|otp|upi pin|password|financial credentials/i, severity: "high" as const, explanation: "Requests for identity or financial credentials before a verified hiring stage can expose applicants to identity theft.", recommendation: "Do not share OTPs, banking credentials, or identity documents until the employer and process are verified." },
  { code: "URGENCY_GUARANTEE", title: "Urgency or guaranteed placement", pattern: /guaranteed (job|placement|selection)|100% placement|act now|limited slots|immediately|no interview/i, severity: "medium" as const, explanation: "Pressure tactics and guaranteed outcomes can discourage normal due diligence.", recommendation: "Pause and verify the role through official channels before responding to an urgent request." },
  { code: "VAGUE_EMPLOYER", title: "Limited employer detail", pattern: /work from home|easy money|simple task|no experience required/i, severity: "low" as const, explanation: "Generic descriptions without clear responsibilities or verifiable employer context make a listing harder to validate.", recommendation: "Find the employer independently and confirm the role on its official careers page." },
  { code: "CONTACT_MISMATCH", title: "Unprofessional contact channel", pattern: /gmail\.com|yahoo\.com|telegram|whatsapp only|send (your )?resume to/i, severity: "low" as const, explanation: "A personal mailbox or messaging-only contact is not proof of fraud, but it is a useful signal to verify the employer independently.", recommendation: "Confirm the recruiter and email domain using contact details published on the employer's official website." }
];

export function detectRuleIndicators(input: AnalysisInput): Indicator[] {
  const text = [input.title, input.company, input.description, input.salary, input.contact].join("\n");
  const findings = rules.filter((rule) => rule.pattern.test(text)).map((rule) => {
    const match = text.match(rule.pattern);
    return { code: rule.code, title: rule.title, evidence: match?.[0] ?? "Matching language found in submitted details", recommendation: rule.recommendation, explanation: rule.explanation, severity: rule.severity, source: "rule" as const };
  });
  if (!input.company.trim()) findings.push({ code: "MISSING_COMPANY", title: "Company name not provided", evidence: "Company field is empty", recommendation: "Identify the employer independently before sharing personal information.", explanation: "Without a company name, there is less context available for independent verification.", severity: "low", source: "rule" });
  if (!input.applicationUrl.trim()) findings.push({ code: "MISSING_URL", title: "Application URL not provided", evidence: "Application URL field is empty", recommendation: "Locate the role on the employer's official careers page.", explanation: "A missing application URL makes it harder to inspect the recruiting channel and domain.", severity: "low", source: "rule" });
  return findings;
}

export function calculateRiskScore(indicators: Indicator[], aiConfidence = 0): number {
  const rulePoints = indicators.reduce((total, item) => total + (item.severity === "high" ? 22 : item.severity === "medium" ? 12 : 5), 0);
  return Math.min(100, Math.round(rulePoints + Math.min(15, aiConfidence * 15)));
}

export function riskCategory(score: number): "Low" | "Moderate" | "High" {
  return score >= 60 ? "High" : score >= 30 ? "Moderate" : "Low";
}
