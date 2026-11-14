import { strict as assert } from "node:assert";
import test from "node:test";
import { calculateRiskScore, detectRuleIndicators, riskCategory } from "./rules.js";

test("detects payment and sensitive document signals", () => {
  const input = { title: "Remote internship", company: "", description: "Pay a registration fee today and send your Aadhaar and bank account for guaranteed placement.", salary: "", location: "", workMode: "Remote" as const, applicationUrl: "", contact: "" };
  const findings = detectRuleIndicators(input);
  assert.ok(findings.some((item) => item.code === "UPFRONT_FEE"));
  assert.ok(findings.some((item) => item.code === "SENSITIVE_DOCUMENTS"));
  assert.equal(riskCategory(calculateRiskScore(findings)), "High");
});

test("does not treat a normal listing as high risk", () => {
  const findings = detectRuleIndicators({ title: "Frontend Intern", company: "Northstar Labs", description: "Work with the engineering team on accessible React features and tests. Apply through our official careers page.", salary: "₹20,000/month", location: "Bengaluru", workMode: "Hybrid", applicationUrl: "https://northstar.example/careers", contact: "careers@northstar.example" });
  assert.notEqual(riskCategory(calculateRiskScore(findings)), "High");
});
