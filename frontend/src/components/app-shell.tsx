"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, FileSearch, History, Home, Info, Menu, Plus, Settings, ShieldCheck } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/analyze", label: "Analyze listing", icon: FileSearch },
  { href: "/history", label: "Analysis history", icon: History },
  { href: "/how-it-works", label: "How it works", icon: BookOpen },
  { href: "/safety-guide", label: "Safety guide", icon: Info },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pageName = pathname === "/dashboard" ? "Dashboard" : pathname === "/analyze" ? "Analyze listing" : pathname === "/history" ? "Analysis history" : pathname === "/how-it-works" ? "How it works" : pathname === "/safety-guide" ? "Safety guide" : pathname === "/about" ? "About" : "Report";
  return <div className="site-shell">
    <aside className={`site-sidebar ${mobileOpen ? "translate-x-0" : ""}`}>
      <Link href="/" className="brand" aria-label="Go to InternGuard home" onClick={() => setMobileOpen(false)}><span className="brand-mark"><ShieldCheck size={19} /></span><span><span className="brand-name">InternGuard</span><span className="brand-caption">Evidence before you apply</span></span></Link>
      <div className="sidebar-label">Workspace</div>
      <nav className="sidebar-nav">{navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={pathname === href || (href === "/analyze" && pathname.startsWith("/analysis")) ? "active" : ""}><Icon size={16} />{label}</Link>)}</nav>
      <div className="sidebar-note"><strong>Privacy first</strong><br />Never upload passwords, OTPs, banking credentials, or identity documents.</div>
    </aside>
    {mobileOpen && <button className="fixed inset-0 z-10 bg-slate-950/30 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}
    <main className="site-main">
      <header className="site-header"><button className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={18} /></button><div className="breadcrumb hidden sm:block">InternGuard <span className="mx-2 text-slate-300">/</span> <strong>{pageName}</strong></div><div className="header-actions"><Link href="/about" className="header-link hidden sm:inline-flex"><Info size={15} /> About</Link><Link href="/settings" className="header-link hidden md:inline-flex"><Settings size={15} /> Settings</Link><Link href="/analyze" className="btn btn-primary min-h-9 px-3 text-xs"><Plus size={14} /> New analysis</Link></div></header>
      <div className="page fade-in">{children}</div>
    </main>
  </div>;
}
