import { ArrowRight, BrainCircuit, CheckCircle2, FileText, ListChecks, ScanSearch, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

const stages = [
  { title: "Bring the evidence", text: "Paste the listing, recruiter message, or offer details exactly as you received them. You can include compensation, location, contact information, and the application link.", icon: FileText },
  { title: "Build the context", text: "The API validates the submission and organizes the available role, employer, contact, and application details without inventing anything that is missing.", icon: ScanSearch },
  { title: "Spot observable signals", text: "Deterministic checks look for upfront fees, pressure tactics, sensitive document requests, unrealistic claims, vague employers, and unusual contact channels.", icon: ListChecks },
  { title: "Add AI context when available", text: "Gemini provides a separate contextual perspective through the backend. Its output is validated, labeled, and never presented as proof of fraud.", icon: BrainCircuit },
  { title: "Leave with a verification plan", text: "Your report combines the findings, explains the evidence, and saves practical checks for confirming the employer independently.", icon: CheckCircle2 },
];

export default function HowItWorksPage() {
  return <AppShell>
    <div className="how-hero">
      <div className="eyebrow">A transparent analysis process</div>
      <h1>Turn a questionable opportunity into clear next steps.</h1>
      <p>InternGuard does not make the decision for you. It helps you slow down, understand what stands out, and verify the details that matter before you apply.</p>
      <div className="button-row"><Link href="/analyze" className="btn btn-primary">Analyze a listing <ArrowRight size={15} /></Link><Link href="/safety-guide" className="btn btn-secondary">Read the safety guide</Link></div>
    </div>
    <div className="how-layout">
      <section className="how-stages">
        <div className="section-intro"><div className="eyebrow">From submission to report</div><h2>What happens to your listing</h2><p>Each stage has a specific job, so observed evidence and AI-assisted context remain easy to distinguish.</p></div>
        <div className="stage-list">{stages.map(({ title, text, icon: Icon }) => <article key={title} className="stage-card"><span className="workflow-icon"><Icon size={20} /></span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
      </section>
      <aside className="how-aside">
        <div className="how-callout"><ShieldCheck size={22} /><h2>Designed for careful decisions</h2><p>A Low, Moderate, or High category summarizes signals found in the submission. It is not a calibrated probability and cannot certify that an employer is genuine or fraudulent.</p></div>
        <div className="how-note"><h3>What InternGuard will not do</h3><ul><li>Claim certainty from a missing detail.</li><li>Verify an employer on your behalf.</li><li>Send your Gemini API key to the browser.</li><li>Replace independent research and judgment.</li></ul></div>
      </aside>
    </div>
  </AppShell>;
}
