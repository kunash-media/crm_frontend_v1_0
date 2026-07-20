import "./components/Asidebar-Navbar/layout.css";
import { Routes, Route, Navigate } from "react-router-dom";
import AsideBar from "./components/Asidebar-Navbar/AsideBar.jsx";
import NavBar   from "./components/Asidebar-Navbar/NavBar.jsx";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import AddLead from "./components/Lead-Form/AddLead.jsx";
import Invoice from "./components/Invoice/Invoice.jsx";


/* ─────────────────────────────────────────────────────────────
   PLACEHOLDER — swap each one for the real component once built
───────────────────────────────────────────────────────────── */
const ComingSoon = ({ title }) => (
  <div style={{
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    height: "60vh", gap: "12px",
  }}>
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
      stroke="var(--or-400, #fb923c)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
    <h2 style={{ fontFamily: "var(--ff-display,'Space Grotesk',sans-serif)", fontSize: "20px", fontWeight: 700, color: "var(--tx-hi,#1c0d03)" }}>
      {title}
    </h2>
    <p style={{ fontSize: "14px", color: "var(--tx-mute,#b07850)" }}>
      This section is coming soon.
    </p>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   LAYOUT WRAPPER — AsideBar + NavBar + page content
   All new routes just need a <Route> added below.
───────────────────────────────────────────────────────────── */
const AppLayout = ({ children }) => (
  <div className="app-shell">
    <AsideBar />
    <div className="app-main">
      <NavBar />
      <main className="app-content">
        {children}
      </main>
    </div>
  </div>
);

function App() {
  return (
    <Routes>
      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* ── All pages share the same AppLayout shell ── */}
      <Route path="/dashboard" element={
        <AppLayout><Dashboard /></AppLayout>
      } />

      <Route path="/leads/add" element={
        <AppLayout><AddLead /></AppLayout>
      } />

      <Route path="/clients" element={
        <AppLayout><ComingSoon title="Client List" /></AppLayout>
      } />

      <Route path="/invoices" element={
        <AppLayout><Invoice/></AppLayout>
      } />

      <Route path="/reports" element={
        <AppLayout><ComingSoon title="Reports" /></AppLayout>
      } />

      <Route path="/settings" element={
        <AppLayout><ComingSoon title="Settings" /></AppLayout>
      } />

      {/* 404 fallback */}
      <Route path="*" element={
        <AppLayout><ComingSoon title="Page Not Found" /></AppLayout>
      } />
    </Routes>
  );
}

export default App;