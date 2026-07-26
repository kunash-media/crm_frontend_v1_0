import "../Dashboard/Dashboard.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState, useRef, useMemo } from "react";
import confetti from "canvas-confetti";
import * as XLSX from "xlsx";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
} from "recharts";
import {
  Users, CalendarClock, Mail, Repeat, CheckCircle2, XCircle,
  Eye, Pencil, History, CalendarPlus, Handshake, FileSpreadsheet,
  X, Clock3, MessageSquareText, BellRing, CalendarCheck2, Inbox,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   CONSTANTS & HELPERS
───────────────────────────────────────────────────────────── */
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const PRIORITY_CFG = {
  P1: { color: "#ef4444", bg: "rgba(239,68,68,0.13)" },
  P2: { color: "#f59e0b", bg: "rgba(245,158,11,0.13)" },
  P3: { color: "#3b82f6", bg: "rgba(59,130,246,0.13)" },
};
const STATUS_CFG = {
  hot:  { label:"Hot",  color:"#ef4444", bg:"rgba(239,68,68,0.12)"  },
  warm: { label:"Warm", color:"#f59e0b", bg:"rgba(245,158,11,0.12)" },
  cold: { label:"Cold", color:"#3b82f6", bg:"rgba(59,130,246,0.12)" },
};

const WORK_TYPE_CFG = {
  static:   { label:"Static Website"   },
  dynamic:  { label:"Dynamic Website"  },
  meta_ads: { label:"Meta Ads"         },
  campaign: { label:"Campaign Running" },
};

const REQUIREMENT_CATEGORIES = [
  "Website Design","Ecommerce Website","Dynamic Website","Landing Page",
  "Google Ads","Meta Ads","LinkedIn Marketing","SEO","Social Media Marketing",
  "Graphic Design","Software Development","Mobile App","HRMS","CRM",
  "Custom Development","Other",
];

/* Deterministic hash → dark HSL color. Same key ALWAYS produces the same
   color — no DB, no localStorage, no cache to manage. */
const colorForKey = (key) => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue   = Math.abs(hash) % 360;
  const sat   = 55 + (Math.abs(hash >> 8) % 20);
  const light = 24 + (Math.abs(hash >> 4) % 14);
  return `hsl(${hue}, ${sat}%, ${light}%)`;
};

const BADGE_GRADIENTS = [
  "linear-gradient(135deg,#f97316,#ea580c)",
  "linear-gradient(135deg,#a855f7,#7c3aed)",
  "linear-gradient(135deg,#14b8a6,#0d9488)",
  "linear-gradient(135deg,#f43f5e,#e11d48)",
  "linear-gradient(135deg,#84cc16,#65a30d)",
  "linear-gradient(135deg,#06b6d4,#0891b2)",
];
const randomGrad = () => BADGE_GRADIENTS[Math.floor(Math.random() * BADGE_GRADIENTS.length)];

const pad   = (n) => String(n).padStart(2,"0");
const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const keyToDate = (k) => { const [y,m,d]=k.split("-"); return new Date(+y,+m-1,+d); };

const fmtDate = (v) => {
  if (!v) return "—";
  const d = typeof v==="string" ? keyToDate(v) : v;
  return d.toLocaleDateString("en-IN",{ day:"2-digit", month:"short", year:"numeric" });
};

const splitName = (l) => ({
  firstName: l.firstName || (l.name || "").split(" ")[0] || "",
  lastName:  l.lastName  || (l.name || "").split(" ").slice(1).join(" ") || "",
});

/* build 42-cell calendar grid */
const buildGrid = (year, month) => {
  const firstDow    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const daysInPrev  = new Date(year, month,   0).getDate();
  const cells = [];
  for (let i = firstDow-1; i >= 0; i--)
    cells.push({ d: new Date(year, month-1, daysInPrev-i), out: true });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ d: new Date(year, month, d), out: false });
  let t = 1;
  while (cells.length < 42)
    cells.push({ d: new Date(year, month+1, t++), out: true });
  return cells;
};

/* ─────────────────────────────────────────────────────────────
   DUMMY SEED DATA  (relative to today so calendar always shows)
───────────────────────────────────────────────────────────── */
const today = new Date();
const rel = (offset) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return toKey(d);
};

const DUMMY_LEADS = [
  {
    id:"d1", firstName:"Arjun", lastName:"Mehta", email:"arjun@techwave.io",
    phone:"+91 98201 33410", company:"TechWave Solutions",
    status:"hot", priority:"P1", notes:"Requested enterprise demo. Very interested in Q3 rollout.",
    requirementCategory:"Software Development",
    followUpDate: rel(0), followupStatus:"pending",
    history: [
      { date: rel(-6), note:"Initial discovery call done. Sending proposal next.", action:"done", at: new Date(today.getFullYear(),today.getMonth(),today.getDate()-6).toISOString() },
    ],
    createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate()-5).toISOString(),
    badgeGrad: BADGE_GRADIENTS[0],
    workType:"meta_ads", emailSent:true, outcome:null,
  },
  {
    id:"d6", firstName:"Ananya", lastName:"Joshi", email:"ananya@healthplus.in",
    phone:"+91 91234 56789", company:"HealthPlus Clinics",
    status:"cold", priority:"P3", notes:"Interested in 6-month pilot. Budget approval pending.",
    requirementCategory:"Dynamic Website",
    followUpDate: rel(-3), followupStatus:"pending", history:[],
    createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate()-15).toISOString(),
    badgeGrad: BADGE_GRADIENTS[5],
    workType:"static", emailSent:false, outcome:"lost",
  },
  {
    id:"d2", firstName:"Priya", lastName:"Sharma", email:"priya@finedge.com",
    phone:"+91 99112 87654", company:"FinEdge Capital",
    status:"warm", priority:"P2", notes:"Comparing us with Salesforce. Send ROI doc.",
    requirementCategory:"CRM",
    followUpDate: rel(2), followupStatus:"pending", history:[],
    createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate()-3).toISOString(),
    badgeGrad: BADGE_GRADIENTS[1],
    workType:"static", emailSent:true, outcome:null,
  },
  {
    id:"d3", firstName:"Rahul", lastName:"Nair", email:"rahul.nair@cloudops.in",
    phone:"+91 90000 12345", company:"CloudOps India",
    status:"cold", priority:"P3", notes:"Low budget this quarter. Revisit in Q4.",
    requirementCategory:"Google Ads",
    followUpDate: rel(5), followupStatus:"pending", history:[],
    createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate()-10).toISOString(),
    badgeGrad: BADGE_GRADIENTS[2],
    workType:"campaign", emailSent:false, outcome:"lost",
  },
  {
    id:"d4", firstName:"Sneha", lastName:"Kulkarni", email:"sneha@growthlab.co",
    phone:"+91 87654 32100", company:"GrowthLab Agency",
    status:"hot", priority:"P1", notes:"Ready to sign. Needs legal review first.",
    requirementCategory:"Landing Page",
    followUpDate: rel(1), followupStatus:"pending", history:[],
    createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate()-2).toISOString(),
    badgeGrad: BADGE_GRADIENTS[3],
    workType:"dynamic", emailSent:true, outcome:"won",
  },
  {
    id:"d5", firstName:"Vikram", lastName:"Desai", email:"vikram@nexaretail.com",
    phone:"+91 80000 99887", company:"Nexa Retail",
    status:"warm", priority:"P2", notes:"Attended webinar. Sent proposal, awaiting response.",
    requirementCategory:"Meta Ads",
    followUpDate: rel(7), followupStatus:"pending", history:[],
    createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate()-7).toISOString(),
    badgeGrad: BADGE_GRADIENTS[4],
    workType:"meta_ads", emailSent:true, outcome:null,
  },
  {
    id:"d7", firstName:"Karthik", lastName:"Iyer", email:"karthik@autoserv.io",
    phone:"+91 77889 11223", company:"AutoServ Logistics",
    status:"hot", priority:"P2", notes:"Pilot running. Escalate to decision-maker next call.",
    requirementCategory:"Software Development",
    followUpDate: rel(0), followupStatus:"pending", history:[],
    createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate()-1).toISOString(),
    badgeGrad: BADGE_GRADIENTS[0],
    workType:"campaign", emailSent:true, outcome:"won",
  },
  {
    id:"d8", firstName:"Meera", lastName:"Pillai", email:"meera@urbanstyle.in",
    phone:"+91 90123 44556", company:"UrbanStyle Fashion",
    status:"warm", priority:"P2", notes:"Landed via SEO blog post, requested pricing sheet.",
    requirementCategory:"SEO",
    followUpDate: rel(4), followupStatus:"pending", history:[],
    createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate()-4).toISOString(),
    badgeGrad: BADGE_GRADIENTS[1],
    workType:"static", emailSent:true, outcome:null,
  },
];

/* ─────────────────────────────────────────────────────────────
   STORAGE  (dummy for now — swap loadLeads() with your API call)
───────────────────────────────────────────────────────────── */
const loadLeads = () => DUMMY_LEADS;
const EMPTY_FORM = {
  firstName:"", lastName:"", email:"", phone:"", company:"",
  status:"warm", priority:"P2", notes:"", followUpDate:"",
  requirementCategory: REQUIREMENT_CATEGORIES[0],
};

/* ─────────────────────────────────────────────────────────────
   SMALL SHARED PIECES
───────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, Icon, accent }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: accent.bg, color: accent.color }}>
      <Icon size={19} strokeWidth={2.1} />
    </div>
    <div className="stat-info">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  </div>
);

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tip">
      {label && <p className="chart-tip-lbl">{label}</p>}
      {payload.map((p) => (
        <p key={p.dataKey || p.name} className="chart-tip-row">
          <span className="chart-tip-dot" style={{ background: p.color || p.fill }} />
          {p.name}: <b>{p.value}</b>
        </p>
      ))}
    </div>
  );
};

const StatusPill = ({ status }) => (
  <span className="status-pill" style={{ color: STATUS_CFG[status]?.color, background: STATUS_CFG[status]?.bg }}>
    {STATUS_CFG[status]?.label}
  </span>
);
const PriorityPill = ({ priority }) => (
  <span className="status-pill" style={{ color: PRIORITY_CFG[priority]?.color, background: PRIORITY_CFG[priority]?.bg }}>
    {priority}
  </span>
);
const FollowupStatusPill = ({ status }) => (
  <span className={`fus-pill fus-${status || "pending"}`}>
    {status === "done" ? "Done" : "Pending"}
  </span>
);

/* Generic overlay shell — click outside to close */
const OverlayShell = ({ onClose, className = "", children }) => {
  const ref = useRef(null);
  return (
    <div className="mo-overlay" ref={ref} onClick={(e) => e.target === ref.current && onClose()}>
      <div className={`mo-card ${className}`}>{children}</div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   CALENDAR GRID
───────────────────────────────────────────────────────────── */
const CalendarGrid = ({ year, month, leadsByDate, onDayClick }) => {
  const cells = useMemo(() => buildGrid(year, month), [year, month]);
  const todayKey = toKey(today);

  return (
    <div className="cg-wrap">
      <div className="cg-header">
        {DAY_LABELS.map((d) => <span key={d} className="cg-dow">{d}</span>)}
      </div>
      <div className="cg-body">
        {cells.map(({ d, out }, idx) => {
          const key      = toKey(d);
          const dayLeads = leadsByDate[key] || [];
          const isToday  = key === todayKey;
          const hasBlink = isToday && dayLeads.length > 0;

          return (
            <div
              key={idx}
              className={[
                "cg-cell",
                out      ? "cg-out"    : "",
                isToday  ? "cg-today"  : "",
                dayLeads.length ? "cg-has" : "",
              ].filter(Boolean).join(" ")}
              onClick={() => dayLeads.length && onDayClick(d, dayLeads)}
            >
              <span className={`cg-num ${isToday ? "cg-num-today" : ""}`}>{d.getDate()}</span>

              {dayLeads.length > 0 && (
                <div className="cg-chips">
                  <span
                    className={`cg-badge ${hasBlink ? "cg-blink" : ""}`}
                    style={{
                      background: dayLeads[0].badgeGrad || BADGE_GRADIENTS[0],
                      outline: `2px solid ${PRIORITY_CFG[dayLeads[0].priority]?.color}`,
                      outlineOffset: "1px",
                    }}
                  >
                    {dayLeads.length}
                  </span>
                  {dayLeads.slice(0,2).map((l) => (
                    <div key={l.id} className="cg-chip" style={{
                      background:  STATUS_CFG[l.status]?.bg,
                      borderLeft: `2px solid ${STATUS_CFG[l.status]?.color}`,
                      color: STATUS_CFG[l.status]?.color,
                    }}>
                      {l.firstName || (l.name||"").split(" ")[0]}
                    </div>
                  ))}
                  {dayLeads.length > 2 && <div className="cg-chip cg-more">+{dayLeads.length-2}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── Charts ── */
const TrendBarChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={220}>
    <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      <CartesianGrid vertical={false} stroke="rgba(234,88,12,0.12)" />
      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#b07850", fontWeight: 600 }} axisLine={false} tickLine={false} />
      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#b07850" }} axisLine={false} tickLine={false} width={26} />
      <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(249,115,22,0.06)" }} />
      <Bar dataKey="count" name="Leads" fill="url(#barGrad)" radius={[5, 5, 0, 0]} maxBarSize={34} />
    </BarChart>
  </ResponsiveContainer>
);

const DoughnutChart = ({ counts }) => {
  const data = useMemo(() =>
    Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({ key, name: WORK_TYPE_CFG[key].label, value, color: colorForKey(key) })),
  [counts]);
  if (data.length === 0) return <p className="up-empty">No source data yet</p>;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={3} cornerRadius={4} stroke="none">
          {data.map((d) => <Cell key={d.key} fill={d.color} />)}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" iconSize={8}
          wrapperStyle={{ fontSize: 12, color: "#7c4520", fontWeight: 500 }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

/* ─────────────────────────────────────────────────────────────
   OVERLAY: Day leads table (calendar cell click)
───────────────────────────────────────────────────────────── */
const DayLeadsOverlay = ({ date, leads, onClose, onView, onEdit, onDone, onNextFollowup, onHistory }) => (
  <OverlayShell onClose={onClose} className="mo-wide">
    <div className="mo-head">
      <div>
        <p className="mo-sub">{fmtDate(date).toUpperCase()}</p>
        <h2 className="mo-title">Follow-ups for this day</h2>
      </div>
      <button className="mo-x" onClick={onClose}><X size={16} /></button>
    </div>
    <div className="mo-body">
      <div className="tbl-scroll">
        <table className="lead-tbl day-ov-tbl">
          <thead>
            <tr className="sticky top-0">
              <th>First Name</th><th>Last Name</th><th>Mobile</th><th>Company</th>
              <th>Requirement</th><th>Priority</th><th>Follow-up Date</th><th>Note</th>
              <th>Status</th><th className="action-th" >Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className={`tbl-row tbl-${l.status}`}>
                <td className="td-name">{l.firstName}</td>
                <td className="td-name">{l.lastName}</td>
                <td className="td-phone">{l.phone}</td>
                <td className="td-co">{l.company || "—"}</td>
                <td>{l.requirementCategory || "—"}</td>
                <td><PriorityPill priority={l.priority} /></td>
                <td>{fmtDate(l.followUpDate)}</td>
                <td className="td-note">{(l.notes || "—").slice(0, 40)}</td>
                <td><FollowupStatusPill status={l.followupStatus} /></td>
                <td className="action-th ">
                  <div className="act-row">
                    <button className="act-btn act-v" title="View" onClick={() => onView(l)}><Eye size={15} /></button>
                    <button className="act-btn act-e" title="Edit" onClick={() => onEdit(l)}><Pencil size={15} /></button>
                    <button className="act-btn act-done" title="Mark done" onClick={() => onDone(l)}><CheckCircle2 size={15} /></button>
                    <button className="act-btn act-next" title="Next follow-up" onClick={() => onNextFollowup(l)}><CalendarPlus size={15} /></button>
                    <button className="act-btn act-hist" title="History" onClick={() => onHistory(l)}><History size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    <div className="mo-foot"><button className="btn-cancel" onClick={onClose}>Close</button></div>
  </OverlayShell>
);

/* ── OVERLAY: Mark as done (note + submit/cancel) ── */
const DoneOverlay = ({ lead, onClose, onSubmit }) => {
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const submit = () => {
    if (!note.trim()) { setErr("Please add a note before submitting"); return; }
    onSubmit(lead, note.trim());
  };
  return (
    <OverlayShell onClose={onClose}>
      <div className="mo-head">
        <div><p className="mo-sub">MARK AS DONE</p><h2 className="mo-title">{lead.firstName} {lead.lastName}</h2></div>
        <button className="mo-x" onClick={onClose}><X size={16} /></button>
      </div>
      <div className="mo-body">
        <div className="fg">
          <label>Follow-up Note *</label>
          <textarea rows={4} placeholder="What happened on this call/meeting?"
            value={note} onChange={(e) => { setNote(e.target.value); setErr(""); }} className={err ? "fe" : ""} />
          {err && <span className="fe-msg">{err}</span>}
        </div>
      </div>
      <div className="mo-foot">
        <button className="btn-cancel" onClick={onClose}>Cancel</button>
        <button className="btn-save btn-done" onClick={submit}>Submit</button>
      </div>
    </OverlayShell>
  );
};

/* ── OVERLAY: Next follow-up (date picker + submit/cancel) ── */
const NextFollowupOverlay = ({ lead, onClose, onSubmit }) => {
  const [date, setDate] = useState("");
  const [err, setErr] = useState("");
  const submit = () => {
    if (!date) { setErr("Pick a follow-up date"); return; }
    onSubmit(lead, date);
  };
  return (
    <OverlayShell onClose={onClose}>
      <div className="mo-head">
        <div><p className="mo-sub">NEXT FOLLOW-UP</p><h2 className="mo-title">{lead.firstName} {lead.lastName}</h2></div>
        <button className="mo-x" onClick={onClose}><X size={16} /></button>
      </div>
      <div className="mo-body">
        <div className="fg">
          <label>Next Follow-up Date *</label>
          <input type="date" value={date} className={err ? "fe" : ""}
            onChange={(e) => { setDate(e.target.value); setErr(""); }} />
          {err && <span className="fe-msg">{err}</span>}
        </div>
      </div>
      <div className="mo-foot">
        <button className="btn-cancel" onClick={onClose}>Cancel</button>
        <button className="btn-save" onClick={submit}>Submit</button>
      </div>
    </OverlayShell>
  );
};

/* ── OVERLAY: History ── */
const HistoryOverlay = ({ lead, onClose }) => (
  <OverlayShell onClose={onClose}>
    <div className="mo-head">
      <div><p className="mo-sub">FOLLOW-UP HISTORY</p><h2 className="mo-title">{lead.firstName} {lead.lastName}</h2></div>
      <button className="mo-x" onClick={onClose}><X size={16} /></button>
    </div>
    <div className="mo-body">
      {(!lead.history || lead.history.length === 0) ? (
        <div className="hist-empty">
          <Inbox size={30} strokeWidth={1.5} />
          <p>No past follow-ups for this lead</p>
        </div>
      ) : (
        <div className="hist-list">
          {[...lead.history].reverse().map((h, i) => (
            <div key={i} className={`hist-item hist-${h.action}`}>
              <div className="hist-icon">{h.action === "done" ? <CheckCircle2 size={14} /> : <CalendarPlus size={14} />}</div>
              <div className="hist-content">
                <div className="hist-row">
                  <span className="hist-date">{fmtDate(h.date)}</span>
                  <span className="hist-tag">{h.action === "done" ? "Completed" : "Carried Forward"}</span>
                </div>
                <p className="hist-note">{h.note}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    <div className="mo-foot"><button className="btn-save" onClick={onClose}>Close</button></div>
  </OverlayShell>
);

/* ── OVERLAY: split read-only lead detail (view) ── */
const LeadDetailOverlay = ({ lead, onClose }) => (
  <OverlayShell onClose={onClose} className="mo-view">
    <div className="mo-head">
      <div><p className="mo-sub">LEAD DETAILS</p><h2 className="mo-title">{lead.firstName} {lead.lastName}</h2></div>
      <button className="mo-x" onClick={onClose}><X size={16} /></button>
    </div>
    <div className="mo-body">
      <div className="vg-section">
        <p className="vg-section-title">Basic Information</p>
        <div className="vg-grid">
          <div className="vg-item"><span className="vg-lbl">First Name</span><span className="vg-val">{lead.firstName}</span></div>
          <div className="vg-item"><span className="vg-lbl">Last Name</span><span className="vg-val">{lead.lastName}</span></div>
          <div className="vg-item"><span className="vg-lbl">Email</span><span className="vg-val">{lead.email}</span></div>
          <div className="vg-item"><span className="vg-lbl">Phone</span><span className="vg-val">{lead.phone}</span></div>
          <div className="vg-item"><span className="vg-lbl">Company</span><span className="vg-val">{lead.company || "—"}</span></div>
        </div>
      </div>
      <div className="vg-section">
        <p className="vg-section-title">Lead Details</p>
        <div className="vg-grid">
          <div className="vg-item"><span className="vg-lbl">Requirement</span><span className="vg-val">{lead.requirementCategory || "—"}</span></div>
          <div className="vg-item"><span className="vg-lbl">Status</span><StatusPill status={lead.status} /></div>
          <div className="vg-item"><span className="vg-lbl">Priority</span><PriorityPill priority={lead.priority} /></div>
          <div className="vg-item"><span className="vg-lbl">Follow-up</span><span className="vg-val">{fmtDate(lead.followUpDate)}</span></div>
          <div className="vg-item"><span className="vg-lbl">Follow-up Status</span><FollowupStatusPill status={lead.followupStatus} /></div>
          <div className="vg-item"><span className="vg-lbl">Created</span><span className="vg-val">{fmtDate(lead.createdAt)}</span></div>
        </div>
      </div>
      <div className="vg-section">
        <p className="vg-section-title">Notes</p>
        <p className="vg-val vg-notes">{lead.notes || "—"}</p>
      </div>
    </div>
    <div className="mo-foot"><button className="btn-save" onClick={onClose}>Close</button></div>
  </OverlayShell>
);

/* ── Edit form (all fields editable) ── */
const LeadFormModal = ({ date, lead, onClose, onSave }) => {
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    ...(lead ? { ...lead, ...splitName(lead) } : { followUpDate: toKey(date) }),
  }));
  const [errs, setErrs] = useState({});
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim())  e.lastName  = "Last name is required";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrs(e); return; }
    onSave(form, !!lead);
  };

  return (
    <OverlayShell onClose={onClose}>
      <div className="mo-head">
        <div>
          <p className="mo-sub">{lead ? "EDIT LEAD" : fmtDate(date).toUpperCase()}</p>
          <h2 className="mo-title">{lead ? "Update Lead" : "Add New Lead"}</h2>
        </div>
        <button className="mo-x" onClick={onClose}><X size={16} /></button>
      </div>
      <div className="mo-body">
        <div className="fg-grid">
          <div className="fg">
            <label>First Name *</label>
            <input value={form.firstName} placeholder="Arjun" className={errs.firstName ? "fe" : ""} onChange={(e) => set("firstName", e.target.value)} />
            {errs.firstName && <span className="fe-msg">{errs.firstName}</span>}
          </div>
          <div className="fg">
            <label>Last Name *</label>
            <input value={form.lastName} placeholder="Mehta" className={errs.lastName ? "fe" : ""} onChange={(e) => set("lastName", e.target.value)} />
            {errs.lastName && <span className="fe-msg">{errs.lastName}</span>}
          </div>
          <div className="fg">
            <label>Email *</label>
            <input type="email" value={form.email} placeholder="arjun@company.com" className={errs.email ? "fe" : ""} onChange={(e) => set("email", e.target.value)} />
            {errs.email && <span className="fe-msg">{errs.email}</span>}
          </div>
          <div className="fg">
            <label>Phone *</label>
            <input type="tel" value={form.phone} placeholder="+91 98765 43210" className={errs.phone ? "fe" : ""} onChange={(e) => set("phone", e.target.value)} />
            {errs.phone && <span className="fe-msg">{errs.phone}</span>}
          </div>
          <div className="fg">
            <label>Company</label>
            <input value={form.company} placeholder="Acme Corp" onChange={(e) => set("company", e.target.value)} />
          </div>
          <div className="fg">
            <label>Requirement Category</label>
            <select value={form.requirementCategory} onChange={(e) => set("requirementCategory", e.target.value)}>
              {REQUIREMENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="fg">
            <label>Status</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="hot">🔥 Hot</option>
              <option value="warm">🌤 Warm</option>
              <option value="cold">❄️ Cold</option>
            </select>
          </div>
          <div className="fg">
            <label>Priority</label>
            <div className="prio-row">
              {["P1","P2","P3"].map((p) => (
                <button key={p} type="button" className={`prio-btn prio-${p.toLowerCase()} ${form.priority===p?"active":""}`} onClick={() => set("priority", p)}>{p}</button>
              ))}
            </div>
          </div>
          <div className="fg fg-full">
            <label>Follow-up Date</label>
            <input type="date" value={form.followUpDate} onChange={(e) => set("followUpDate", e.target.value)} />
          </div>
          <div className="fg fg-full">
            <label>Notes</label>
            <textarea rows={3} placeholder="Add context about this lead…" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>
        </div>
      </div>
      <div className="mo-foot">
        <button className="btn-cancel" onClick={onClose}>Cancel</button>
        <button className="btn-save" onClick={submit}>{lead ? "Update Lead" : "Save Lead"}</button>
      </div>
    </OverlayShell>
  );
};

/* ── OVERLAY: Convert (deal done!/cancel) ── */
const ConvertOverlay = ({ lead, onClose, onConfirm }) => (
  <OverlayShell onClose={onClose}>
    <div className="mo-head">
      <div><p className="mo-sub">CONVERT LEAD</p><h2 className="mo-title">{lead.firstName} {lead.lastName}</h2></div>
      <button className="mo-x" onClick={onClose}><X size={16} /></button>
    </div>
    <div className="mo-body convert-body">
      <Handshake size={40} strokeWidth={1.5} className="convert-icon" />
      <p className="convert-msg">Mark this lead as a closed, won deal?</p>
    </div>
    <div className="mo-foot">
      <button className="btn-cancel" onClick={onClose}>Cancel</button>
      <button className="btn-save btn-convert" onClick={() => onConfirm(lead)}>Deal Done! 🎉</button>
    </div>
  </OverlayShell>
);


/* ── OVERLAY: Confirm delete (yes/no) ── */
const DeleteConfirmOverlay = ({ label, onCancel, onConfirm }) => (
  <OverlayShell onClose={onCancel}>
    <div className="mo-head">
      <div><p className="mo-sub">CONFIRM DELETE</p><h2 className="mo-title">{label}</h2></div>
      <button className="mo-x" onClick={onCancel}><X size={16} /></button>
    </div>
    <div className="mo-body convert-body">
      <XCircle size={40} strokeWidth={1.5} className="delete-icon" />
      <p className="convert-msg">This action can't be undone. Are you sure?</p>
    </div>
    <div className="mo-foot">
      <button className="btn-cancel" onClick={onCancel}>No, Keep It</button>
      <button className="btn-save btn-delete" onClick={onConfirm}>Yes, Delete</button>
    </div>
  </OverlayShell>
);

/* ── Celebration burst (confetti + sound + message) ── */
// TODO: drop your own clap sound file at public/sounds/clap.mp3 — this path is a placeholder.
const CLAP_SOUND_URL = "/sounds/clap.mp3";
const CelebrationOverlay = ({ name }) => (
  <div className="celebrate-overlay">
    <div className="celebrate-card">
      <Handshake size={46} className="celebrate-icon" />
      <h2>Deal Closed! 🎉</h2>
      <p>{name} is officially a customer. Great work!</p>
    </div>
  </div>
);

/* ── OVERLAY: Bulk email template picker ── */
const BulkEmailOverlay = ({ count, onClose, onSend }) => (
  <OverlayShell onClose={onClose}>
    <div className="mo-head">
      <div><p className="mo-sub">SEND EMAIL</p><h2 className="mo-title">{count} lead{count!==1?"s":""} selected</h2></div>
      <button className="mo-x" onClick={onClose}><X size={16} /></button>
    </div>
    <div className="mo-body">
      <p className="email-hint">Choose a message template to send to all selected leads:</p>
      <div className="email-tpl-row">
        <button className="email-tpl-btn" onClick={() => onSend("followup")}>
          <MessageSquareText size={20} /><span>Follow-up</span>
        </button>
        <button className="email-tpl-btn" onClick={() => onSend("meet_reminder")}>
          <CalendarCheck2 size={20} /><span>Meet Reminder</span>
        </button>
        <button className="email-tpl-btn" onClick={() => onSend("normal_reminder")}>
          <BellRing size={20} /><span>Normal Reminder</span>
        </button>
      </div>
    </div>
    <div className="mo-foot"><button className="btn-cancel" onClick={onClose}>Cancel</button></div>
  </OverlayShell>
);

/* ── OVERLAY: Export to Excel ── */
const ExportOverlay = ({ statusFilter, onClose, onExport }) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [month, setMonth] = useState("");
  const noFilter = !from && !to && !month && statusFilter === "all";

  return (
    <OverlayShell onClose={onClose}>
      <div className="mo-head">
        <div><p className="mo-sub">EXPORT LEADS</p><h2 className="mo-title">Download Excel Sheet</h2></div>
        <button className="mo-x" onClick={onClose}><X size={16} /></button>
      </div>
      <div className="mo-body">
        <div className="fg-grid">
          <div className="fg"><label>From Date</label><input type="date" value={from} onChange={(e)=>{setFrom(e.target.value); setMonth("");}} /></div>
          <div className="fg"><label>To Date</label><input type="date" value={to} onChange={(e)=>{setTo(e.target.value); setMonth("");}} /></div>
          <div className="fg fg-full"><label>Or Pick a Month</label><input type="month" value={month} onChange={(e)=>{setMonth(e.target.value); setFrom(""); setTo("");}} /></div>
        </div>
        <p className="export-note">
          {noFilter
            ? "No filters selected — this will export all leads."
            : `Exporting leads${statusFilter!=="all" ? ` marked "${STATUS_CFG[statusFilter]?.label}"` : ""}${month ? ` for ${month}` : (from||to) ? ` from ${from||"…"} to ${to||"…"}` : ""}.`}
        </p>
      </div>
      <div className="mo-foot">
        <button className="btn-cancel" onClick={onClose}>Cancel</button>
        <button className="btn-save" onClick={() => onExport({ from, to, month })}>
          <FileSpreadsheet size={15} style={{ marginRight: 6 }} /> Export
        </button>
      </div>
    </OverlayShell>
  );
};

/* ─────────────────────────────────────────────────────────────
   DASHBOARD (root)
───────────────────────────────────────────────────────────── */
const Dashboard = () => {
  const [leads,     setLeads]     = useState(loadLeads);
  const [activeYM,  setActiveYM]  = useState({ year: today.getFullYear(), month: today.getMonth() });

  const [dayOverlay, setDayOverlay]   = useState(null); // { date, leads }
  const [editLead,   setEditLead]     = useState(null);
  const [viewLead,   setViewLead]     = useState(null);
  const [doneLead,   setDoneLead]     = useState(null);
  const [nextLead,   setNextLead]     = useState(null);
  const [histLead,   setHistLead]     = useState(null);
  const [convertLead,setConvertLead]  = useState(null);
  const [celebrate,  setCelebrate]    = useState(null); // name string while showing

  const [bulkEmailOpen, setBulkEmailOpen] = useState(false);
  const [exportOpen,    setExportOpen]    = useState(false);

  const [search,   setSearch]   = useState("");
  const [stFilter, setStFilter] = useState("all");
  const [selected, setSelected] = useState([]);

  const [deleteTarget, setDeleteTarget] = useState(null); // { type: "one", id } | { type: "bulk" }

  /* date → pending leads map (done leads never show again — dedupes automatically) */
  const leadsByDate = useMemo(() => {
    const map = {};
    leads.forEach((l) => {
      if (!l.followUpDate || l.followupStatus === "done") return;
      (map[l.followUpDate] = map[l.followUpDate] || []).push(l);
    });
    return map;
  }, [leads]);

  const stats = useMemo(() => {
    const todayKey = toKey(today);
    return {
      total: leads.length,
      todayFollowups: leads.filter((l) => l.followUpDate === todayKey && l.followupStatus !== "done").length,
      emailSent: leads.filter((l) => l.emailSent).length,
      totalFollowups: leads.filter((l) => l.followUpDate).length,
      won: leads.filter((l) => l.outcome === "won").length,
      lost: leads.filter((l) => l.outcome === "lost").length,
    };
  }, [leads]);

  const monthlyTrend = useMemo(() => {
    const buckets = {}; const labels = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      buckets[key] = 0;
      labels.push({ key, label: MONTH_NAMES[d.getMonth()].slice(0, 3) });
    }
    leads.forEach((l) => {
      const d = new Date(l.createdAt);
      const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      if (key in buckets) buckets[key]++;
    });
    return labels.map((l) => ({ ...l, count: buckets[l.key] }));
  }, [leads]);

  const workTypeDist = useMemo(() => {
    const counts = { static: 0, dynamic: 0, meta_ads: 0, campaign: 0 };
    leads.forEach((l) => { if (l.workType && counts[l.workType] !== undefined) counts[l.workType]++; });
    return counts;
  }, [leads]);

  const upcoming = useMemo(() => {
    const todayKey = toKey(today);
    return [...leads]
      .filter((l) => l.followUpDate && l.followupStatus !== "done")
      .sort((a, b) => {
        const isTodayA = a.followUpDate === todayKey, isTodayB = b.followUpDate === todayKey;
        if (isTodayA && !isTodayB) return -1;
        if (isTodayB && !isTodayA) return 1;
        return a.followUpDate.localeCompare(b.followUpDate);
      })
      .slice(0, 6);
  }, [leads]);

  const filtered = useMemo(() =>
    leads.filter((l) =>
      (stFilter === "all" || l.status === stFilter) &&
      [l.firstName, l.lastName, l.email, l.company || ""].some((f) => (f||"").toLowerCase().includes(search.toLowerCase()))
    ),
  [leads, stFilter, search]);

  const visIds    = filtered.map((l) => l.id);
  const allCheck  = visIds.length > 0 && visIds.every((id) => selected.includes(id));
  const toggleAll = () => allCheck
    ? setSelected((p) => p.filter((id) => !visIds.includes(id)))
    : setSelected((p) => [...new Set([...p, ...visIds])]);
  const toggleOne = (id) => setSelected((p) => p.includes(id) ? p.filter((s) => s !== id) : [...p, id]);

  /* ── CRUD ── */
  const handleSave = (form, isEdit) => {
    if (isEdit) {
      setLeads((p) => p.map((l) => (l.id === form.id ? { ...form } : l)));
    } else {
      setLeads((p) => [{ ...form, id: Date.now().toString(), createdAt: new Date().toISOString(), badgeGrad: randomGrad(), followupStatus: "pending", history: [] }, ...p]);
    }
    toast.success(isEdit ? "Lead updated" : "Lead created");
    setEditLead(null);
  };

const delOne = (id) => setDeleteTarget({ type: "one", id });

  const delBulk = () => {
    if (!selected.length) return;
    setDeleteTarget({ type: "bulk" });
  };

  const confirmDelete = () => {
    if (deleteTarget.type === "one") {
      setLeads((p) => p.filter((l) => l.id !== deleteTarget.id));
      setSelected((p) => p.filter((s) => s !== deleteTarget.id));
      toast.success("Lead deleted");
    } else {
      setLeads((p) => p.filter((l) => !selected.includes(l.id)));
      toast.success(`${selected.length} leads deleted`);
      setSelected([]);
    }
    setDeleteTarget(null);
  };
  /* ── Follow-up flow handlers ── */
  const handleDoneSubmit = (lead, note) => {
    setLeads((p) => p.map((l) => l.id === lead.id ? {
      ...l,
      followupStatus: "done",
      history: [...(l.history || []), { date: l.followUpDate, note, action: "done", at: new Date().toISOString() }],
    } : l));
    setDoneLead(null);

    toast.success("Follow-up marked as done");

    // keep the day overlay's snapshot in sync if it's open
    setDayOverlay((ov) => ov ? { ...ov, leads: ov.leads.filter((x) => x.id !== lead.id) } : ov);
  };

  const handleNextFollowupSubmit = (lead, newDate) => {
    setLeads((p) => p.map((l) => l.id === lead.id ? {
      ...l,
      history: [...(l.history || []), { date: l.followUpDate, note: `Carried forward to ${fmtDate(newDate)}`, action: "next-followup", at: new Date().toISOString() }],
      followUpDate: newDate,
    } : l));
    setNextLead(null);
    toast.success("Next follow-up scheduled");
    setDayOverlay((ov) => ov ? { ...ov, leads: ov.leads.filter((x) => x.id !== lead.id) } : ov);
  };

  /* ── Convert + celebration ── */
  const handleConvertConfirm = (lead) => {
    setConvertLead(null);
    setLeads((p) => p.map((l) => l.id === lead.id ? { ...l, outcome: "won" } : l));

    // confetti burst
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 70, origin: { x: 0 } }), 200);
    setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 70, origin: { x: 1 } }), 200);

    try { const audio = new Audio(CLAP_SOUND_URL); audio.volume = 0.6; audio.play().catch(() => {}); } catch (e) {}

    setCelebrate(`${lead.firstName} ${lead.lastName}`);
    setTimeout(() => setCelebrate(null), 2600);
  };

  /* ── Bulk email (dummy — wire to your API) ── */
  const handleBulkSend = (template) => {
    const recipients = leads.filter((l) => selected.includes(l.id)).map((l) => l.email);
    // TODO: replace with your real bulk-email API call, e.g.
    // await api.post('/leads/bulk-email', { template, leadIds: selected })
    console.log("Sending", template, "to", recipients);
    toast.success(`"${template.replace("_"," ")}" email queued for ${recipients.length} lead(s).`);
    setBulkEmailOpen(false);
  };

  /* ── Export to Excel ── */
  const handleExport = ({ from, to, month }) => {
    let rows = leads.filter((l) => stFilter === "all" || l.status === stFilter);
    if (month) {
      rows = rows.filter((l) => l.followUpDate && l.followUpDate.startsWith(month));
    } else if (from || to) {
      rows = rows.filter((l) => {
        if (!l.followUpDate) return false;
        if (from && l.followUpDate < from) return false;
        if (to && l.followUpDate > to) return false;
        return true;
      });
    }
    const data = rows.map((l) => ({
      "First Name": l.firstName, "Last Name": l.lastName, "Email": l.email, "Phone": l.phone,
      "Company": l.company || "", "Requirement": l.requirementCategory || "",
      "Status": STATUS_CFG[l.status]?.label || l.status, "Priority": l.priority,
      "Follow-up Date": fmtDate(l.followUpDate), "Follow-up Status": l.followupStatus === "done" ? "Done" : "Pending",
      "Outcome": l.outcome || "-",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, `leads-export-${toKey(today)}.xlsx`);

    toast.success("Excel sheet downloaded");
    setExportOpen(false);
  };

  const prevMonth = () => setActiveYM(({year,month}) => month===0 ? {year:year-1,month:11} : {year,month:month-1});
  const nextMonth = () => setActiveYM(({year,month}) => month===11 ? {year:year+1,month:0} : {year,month:month+1});

  const todayKey = toKey(today);

  return (
    <div className="root-dashboard">
      <ToastContainer position="top-right" autoClose={2500} theme="light" />
      <nav className="dash-nav">
        <div className="nav-brand">
          <span className="font-mono text-sm font-thin text-gray-600">Hey! Let's make it happen :)</span>
        </div>
      </nav>

      <div className="dash-body">

        <section className="stats-row">
          <StatCard label="Total Leads"      value={stats.total}          Icon={Users}         accent={{ bg:"rgba(249,115,22,.13)", color:"#ea580c" }} />
          <StatCard label="Today Follow-ups" value={stats.todayFollowups} Icon={CalendarClock} accent={{ bg:"rgba(239,68,68,.13)",  color:"#ef4444" }} />
          <StatCard label="WhatsApp"         value={stats.emailSent}      Icon={Mail}          accent={{ bg:"rgba(59,130,246,.13)", color:"#3b82f6" }} />
          <StatCard label="Total Follow-ups" value={stats.totalFollowups} Icon={Repeat}        accent={{ bg:"rgba(245,158,11,.13)", color:"#f59e0b" }} />
          <StatCard label="Won"              value={stats.won}            Icon={CheckCircle2}  accent={{ bg:"rgba(34,197,94,.13)",  color:"#16a34a" }} />
          <StatCard label="Lost Leads"       value={stats.lost}           Icon={XCircle}       accent={{ bg:"rgba(107,114,128,.13)",color:"#6b7280" }} />
        </section>

        <section className="cal-section">
          <div className="cal-left">
            <div className="cal-month-block">
              <p className="cal-month-name">{MONTH_NAMES[activeYM.month].toUpperCase()}</p>
              <h1 className="cal-year">{activeYM.year}</h1>
            </div>

            <div className="cal-upcoming">
              <p className="up-heading">UPCOMING EVENTS</p>
              <div className="up-list">
                {upcoming.length===0 && <p className="up-empty">No upcoming follow-ups</p>}
                {upcoming.map((lead) => {
                  const isToday = lead.followUpDate === todayKey;
                  return (
                    <div key={lead.id} className={`up-card ${isToday?"up-card-today":""}`} onClick={() => setViewLead(lead)}>
                      {isToday && <span className="up-today-tag">TODAY</span>}
                      <div className="up-row">
                        <span className="up-name">{lead.firstName} {lead.lastName}</span>
                        <span className="up-date">{fmtDate(lead.followUpDate)}</span>
                      </div>
                      <div className="up-row">
                        <span className="up-co">{lead.company || lead.email}</span>
                        <span className="up-prio" style={{color:PRIORITY_CFG[lead.priority]?.color}}>{lead.priority}</span>
                      </div>
                      <p className="up-note">{(lead.notes||"").slice(0,52)||"—"}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="cal-right">
            <div className="cal-nav">
              <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
              <span className="cal-nav-label">{MONTH_NAMES[activeYM.month]} {activeYM.year}</span>
              <button className="cal-nav-btn" onClick={nextMonth}>›</button>
            </div>
            <CalendarGrid
              year={activeYM.year}
              month={activeYM.month}
              leadsByDate={leadsByDate}
              onDayClick={(date, dayLeads) => setDayOverlay({ date, leads: dayLeads })}
            />
          </div>
        </section>

        <section className="charts-row">
          <div className="chart-card">
            <p className="chart-title">Monthly Lead Trend</p>
            <TrendBarChart data={monthlyTrend} />
          </div>
          <div className="chart-card">
            <p className="chart-title">Working Category Distribution</p>
            <DoughnutChart counts={workTypeDist} />
          </div>
        </section>

        <section className="tbl-section">
          <div className="tbl-top">
            <div>
              <h2 className="tbl-title">Lead Pipeline</h2>
              <p className="tbl-sub">{filtered.length} lead{filtered.length!==1?"s":""}</p>
            </div>
            <div className="tbl-bulk">
              <button className="btn-export" onClick={() => setExportOpen(true)}>
                <FileSpreadsheet size={15} /> Export
              </button>
              {selected.length>0 && (
                <>
                  <button className="btn-bulk-del" onClick={delBulk}>🗑 Delete ({selected.length})</button>
                  <button className="btn-bulk-email" onClick={() => setBulkEmailOpen(true)}>
                    <Mail size={14} /> Email ({selected.length})
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="tbl-filters">
            <div className="srch-wrap">
              <span className="srch-ico">⌕</span>
              <input className="srch-input" placeholder="Search name, email, company…" value={search} onChange={(e)=>setSearch(e.target.value)} />
            </div>
            <div className="st-filters">
              {["all","hot","warm","cold"].map((s)=>(
                <button key={s} className={`st-btn st-${s} ${stFilter===s?"active":""}`} onClick={()=>setStFilter(s)}>
                  {s==="all"?"All":STATUS_CFG[s].label}
                </button>
              ))}
            </div>
          </div>

          <div className="tbl-scroll">
            <table className="lead-tbl">
              <thead>
                <tr>
                  <th><input type="checkbox" className="chk" checked={allCheck} onChange={toggleAll}/></th>
                  <th>Name</th><th>Company</th><th>Email</th><th>Phone</th>
                  <th>Status</th><th>Priority</th><th>Follow-up</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length===0 && (
                  <tr><td colSpan={9} className="tbl-empty">No leads found — click any calendar date to view follow-ups.</td></tr>
                )}
                {filtered.map((lead) => {
                  const isFollowToday = lead.followUpDate === todayKey;
                  return (
                    <tr key={lead.id} className={`tbl-row tbl-${lead.status} ${selected.includes(lead.id)?"tbl-sel":""}`}>
                      <td><input type="checkbox" className="chk" checked={selected.includes(lead.id)} onChange={()=>toggleOne(lead.id)}/></td>
                      <td className="td-name">{lead.firstName} {lead.lastName}</td>
                      <td className="td-co">{lead.company||"—"}</td>
                      <td className="td-email">{lead.email}</td>
                      <td className="td-phone">{lead.phone}</td>
                      <td><StatusPill status={lead.status} /></td>
                      <td><PriorityPill priority={lead.priority} /></td>
                      <td>
                        <span className={`fu-date ${isFollowToday?"fu-today":""}`}>
                          {fmtDate(lead.followUpDate)}{isFollowToday && <span className="fu-dot"/>}
                        </span>
                      </td>
                      <td>
                        <div className="act-row">
                          <button className="act-btn act-v" onClick={()=>setViewLead(lead)} title="View"><Eye size={15}/></button>
                          <button className="act-btn act-e" onClick={()=>setEditLead(lead)}  title="Edit"><Pencil size={15}/></button>
                          <button className="act-btn act-convert" onClick={()=>setConvertLead(lead)} title="Convert"><Handshake size={15}/></button>
                          <button className="act-btn act-d" onClick={()=>delOne(lead.id)}    title="Delete">🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ── MODALS / OVERLAYS ── */}
      {dayOverlay && (
        <DayLeadsOverlay
          date={dayOverlay.date}
          leads={dayOverlay.leads}
          onClose={() => setDayOverlay(null)}
          onView={setViewLead}
          onEdit={setEditLead}
          onDone={setDoneLead}
          onNextFollowup={setNextLead}
          onHistory={setHistLead}
        />
      )}
      {editLead   && <LeadFormModal lead={editLead} onClose={() => setEditLead(null)} onSave={handleSave} />}
      {viewLead   && <LeadDetailOverlay lead={viewLead} onClose={() => setViewLead(null)} />}
      {doneLead   && <DoneOverlay lead={doneLead} onClose={() => setDoneLead(null)} onSubmit={handleDoneSubmit} />}
      {nextLead   && <NextFollowupOverlay lead={nextLead} onClose={() => setNextLead(null)} onSubmit={handleNextFollowupSubmit} />}
      {histLead   && <HistoryOverlay lead={histLead} onClose={() => setHistLead(null)} />}
      {convertLead&& <ConvertOverlay lead={convertLead} onClose={() => setConvertLead(null)} onConfirm={handleConvertConfirm} />}
      {deleteTarget && (
        <DeleteConfirmOverlay
          label={deleteTarget.type === "one" ? "Delete this lead?" : `Delete ${selected.length} leads?`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
      {celebrate  && <CelebrationOverlay name={celebrate} />}
      {bulkEmailOpen && <BulkEmailOverlay count={selected.length} onClose={() => setBulkEmailOpen(false)} onSend={handleBulkSend} />}
      {exportOpen && <ExportOverlay statusFilter={stFilter} onClose={() => setExportOpen(false)} onExport={handleExport} />}
    </div>
  );
};

export default Dashboard;