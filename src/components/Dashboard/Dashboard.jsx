import { useState, useEffect, useRef, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
} from "recharts";
import {
  Users, CalendarClock, Mail, Repeat, CheckCircle2, XCircle,
} from "lucide-react";
import "../Dashboard/Dashboard.css"

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
  static:   { label:"Static Website",  color:"#ea580c" },
  dynamic:  { label:"Dynamic Website", color:"#fb923c" },
  meta_ads: { label:"Meta Ads",        color:"#f59e0b" },
  campaign: { label:"Campaign Running",color:"#fdba74" },
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

const sameDay = (a,b) =>
  a instanceof Date && b instanceof Date &&
  a.getFullYear()===b.getFullYear() &&
  a.getMonth()===b.getMonth() &&
  a.getDate()===b.getDate();

const fmtDate = (v) => {
  if (!v) return "—";
  const d = typeof v==="string" ? keyToDate(v) : v;
  return d.toLocaleDateString("en-IN",{ day:"2-digit", month:"short", year:"numeric" });
};

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
    id:"d1", name:"Arjun Mehta", email:"arjun@techwave.io",
    phone:"+91 98201 33410", company:"TechWave Solutions",
    status:"hot", priority:"P1", notes:"Requested enterprise demo. Very interested in Q3 rollout.",
    followUpDate: rel(0),   /* TODAY  */
    createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate()-5).toISOString(),
    badgeGrad: BADGE_GRADIENTS[0],
    workType:"meta", emailSent:true, outcome:null,
  },
  {
    id:"d6", name:"Ananya Joshi", email:"ananya@healthplus.in",
    phone:"+91 91234 56789", company:"HealthPlus Clinics",
    status:"cold", priority:"P3", notes:"Interested in 6-month pilot. Budget approval pending.",
    followUpDate: rel(-3),
    createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate()-15).toISOString(),
    badgeGrad: BADGE_GRADIENTS[5],
    workType:"static", emailSent:false, outcome:"lost",
  },
  {
    id:"d7", name:"Karthik Iyer", email:"karthik@autoserv.io",
    phone:"+91 77889 11223", company:"AutoServ Logistics",
    status:"hot", priority:"P2", notes:"Pilot running. Escalate to decision-maker next call.",
    followUpDate: rel(0),   /* TODAY also — shows multi-lead on same day */
    createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate()-1).toISOString(),
    badgeGrad: BADGE_GRADIENTS[0],
    workType:"campaign", emailSent:true, outcome:"won",
  },

   {
    id:"d2", name:"Priya Sharma", email:"priya@finedge.com",
    phone:"+91 99112 87654", company:"FinEdge Capital",
    status:"warm", priority:"P2", notes:"Comparing us with Salesforce. Send ROI doc.",
    followUpDate: rel(2),
    createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate()-3).toISOString(),
    badgeGrad: BADGE_GRADIENTS[1],
    workType:"static", emailSent:true, outcome:null,
  },
  {
    id:"d3", name:"Rahul Nair", email:"rahul.nair@cloudops.in",
    phone:"+91 90000 12345", company:"CloudOps India",
    status:"cold", priority:"P3", notes:"Low budget this quarter. Revisit in Q4.",
    followUpDate: rel(5),
    createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate()-10).toISOString(),
    badgeGrad: BADGE_GRADIENTS[2],
    workType:"campaign", emailSent:false, outcome:"lost",
  },
  {
    id:"d4", name:"Sneha Kulkarni", email:"sneha@growthlab.co",
    phone:"+91 87654 32100", company:"GrowthLab Agency",
    status:"hot", priority:"P1", notes:"Ready to sign. Needs legal review first.",
    followUpDate: rel(1),
    createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate()-2).toISOString(),
    badgeGrad: BADGE_GRADIENTS[3],
    workType:"dynamic", emailSent:true, outcome:"won",
  },
  {
    id:"d5", name:"Vikram Desai", email:"vikram@nexaretail.com",
    phone:"+91 80000 99887", company:"Nexa Retail",
    status:"warm", priority:"P2", notes:"Attended webinar. Sent proposal, awaiting response.",
    followUpDate: rel(7),
    createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate()-7).toISOString(),
    badgeGrad: BADGE_GRADIENTS[4],
    workType:"meta_ads", emailSent:true, outcome:null,
  },
  {
    id:"d6", name:"Ananya Joshi", email:"ananya@healthplus.in",
    phone:"+91 91234 56789", company:"HealthPlus Clinics",
    status:"cold", priority:"P3", notes:"Interested in 6-month pilot. Budget approval pending.",
    followUpDate: rel(-3),
    createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate()-15).toISOString(),
    badgeGrad: BADGE_GRADIENTS[5],
    workType:"static", emailSent:false, outcome:"lost",
  },
  {
    id:"d7", name:"Karthik Iyer", email:"karthik@autoserv.io",
    phone:"+91 77889 11223", company:"AutoServ Logistics",
    status:"hot", priority:"P2", notes:"Pilot running. Escalate to decision-maker next call.",
    followUpDate: rel(0),   /* TODAY also — shows multi-lead on same day */
    createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate()-1).toISOString(),
    badgeGrad: BADGE_GRADIENTS[0],
    workType:"campaign", emailSent:true, outcome:"won",
  },
  {
    id:"d8", name:"Meera Pillai", email:"meera@urbanstyle.in",
    phone:"+91 90123 44556", company:"UrbanStyle Fashion",
    status:"warm", priority:"P2", notes:"Landed via SEO blog post, requested pricing sheet.",
    followUpDate: rel(4),
    createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate()-4).toISOString(),
    badgeGrad: BADGE_GRADIENTS[1],
    workType:"static", emailSent:true, outcome:null,
  },
  {
    id:"d9", name:"Rohan Batra", email:"rohan@finlyapp.com",
    phone:"+91 98765 11209", company:"Finly App",
    status:"hot", priority:"P1", notes:"Signed up via product-led onboarding flow.",
    followUpDate: rel(3),
    createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate()-6).toISOString(),
    badgeGrad: BADGE_GRADIENTS[2],
    workType:"dynamic", emailSent:true, outcome:null,
  },
  {
    id:"d10", name:"Ishita Rao", email:"ishita@bloomcosmetics.in",
    phone:"+91 89012 33445", company:"Bloom Cosmetics",
    status:"cold", priority:"P3", notes:"Clicked Instagram story ad, hasn't responded since.",
    followUpDate: rel(9),
    createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate()-8).toISOString(),
    badgeGrad: BADGE_GRADIENTS[3],
    workType:"meta_ads", emailSent:false, outcome:null,
  },
  {
    id:"d11", name:"Aditya Kapoor", email:"aditya@stackforge.dev",
    phone:"+91 91234 77889", company:"StackForge Dev",
    status:"warm", priority:"P2", notes:"Downloaded whitepaper from landing page.",
    followUpDate: rel(6),
    createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate()-12).toISOString(),
    badgeGrad: BADGE_GRADIENTS[4],
    workType:"static", emailSent:true, outcome:"won",
  },
  {
    id:"d12", name:"Divya Menon", email:"divya@zentrafit.com",
    phone:"+91 90876 65432", company:"Zentra Fitness",
    status:"hot", priority:"P1", notes:"Booked demo via Facebook lead-gen form.",
    followUpDate: rel(1),
    createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate()-9).toISOString(),
    badgeGrad: BADGE_GRADIENTS[5],
    workType:"meta_ads", emailSent:true, outcome:null,
  },
  {
    id:"d13", name:"Farhan Sheikh", email:"farhan@quicklogix.in",
    phone:"+91 89999 22110", company:"QuickLogix",
    status:"cold", priority:"P3", notes:"Referral from Q2 email drip campaign.",
    followUpDate: rel(11),
    createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate()-14).toISOString(),
    badgeGrad: BADGE_GRADIENTS[0],
    workType:"campaign", emailSent:false, outcome:"lost",
  },
  {
    id:"d14", name:"Neha Choudhary", email:"neha@paperlybooks.com",
    phone:"+91 88123 45670", company:"Paperly Books",
    status:"warm", priority:"P2", notes:"Chatbot on dynamic site captured this lead.",
    followUpDate: rel(8),
    createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate()-11).toISOString(),
    badgeGrad: BADGE_GRADIENTS[1],
    workType:"dynamic", emailSent:true, outcome:null,
  },

];

/* ─────────────────────────────────────────────────────────────
   STORAGE
───────────────────────────────────────────────────────────── */
const STORAGE_KEY = "crm_leads_v3";
const loadLeads = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  // first-run: seed dummy data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DUMMY_LEADS));
  return DUMMY_LEADS;
};
const persist = (leads) => localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));

const EMPTY_FORM = {
  name:"", email:"", phone:"", company:"",
  status:"warm", priority:"P2", notes:"", followUpDate:"",
};

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────── */

/* ── Stat Card (standard clean icon style) ── */
const StatCard = ({ label, value, Icon, accent }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: accent.bg, color: accent.color }}>
      <Icon size={19} strokeWidth={2.1} />
    </div>
    <div className="stat-info">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  </div>
);

/* ── Chart tooltip (shared, theme-matched) ── */
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

/* ── Monthly Trend Bar Chart (Recharts) ── */
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

/* ── Lead Source Doughnut Chart (Recharts) ── */
const DoughnutChart = ({ counts }) => {
  const data = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ key, name: WORK_TYPE_CFG[key].label, value, color: WORK_TYPE_CFG[key].color }));

  if (data.length === 0) return <p className="up-empty">No source data yet</p>;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={52}
          outerRadius={78}
          paddingAngle={3}
          cornerRadius={4}
          stroke="none"
        >
          {data.map((d) => <Cell key={d.key} fill={d.color} />)}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, color: "#7c4520", fontWeight: 500 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

/* ── Mini Calendar Grid ── */
const CalendarGrid = ({ year, month, leadsByDate, onDayClick }) => {
  const cells = useMemo(() => buildGrid(year, month), [year, month]);
  const todayKey = toKey(today);

  return (
    <div className="cg-wrap">
      {/* Day-of-week headers */}
      <div className="cg-header">
        {DAY_LABELS.map((d) => <span key={d} className="cg-dow">{d}</span>)}
      </div>

      {/* 42 cells */}
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
              onClick={() => onDayClick(d)}
            >
              {/* Date number */}
              <span className={`cg-num ${isToday ? "cg-num-today" : ""}`}>
                {d.getDate()}
              </span>

              {/* Lead chip(s) */}
              {dayLeads.length > 0 && (
                <div className="cg-chips">
                  {/* Count badge */}
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

                  {/* Name chips — max 2 */}
                  {dayLeads.slice(0,2).map((l) => (
                    <div
                      key={l.id}
                      className="cg-chip"
                      style={{
                        background:  STATUS_CFG[l.status]?.bg,
                        borderLeft: `2px solid ${STATUS_CFG[l.status]?.color}`,
                        color: STATUS_CFG[l.status]?.color,
                      }}
                    >
                      {l.name.split(" ")[0]}
                    </div>
                  ))}

                  {/* overflow indicator */}
                  {dayLeads.length > 2 && (
                    <div className="cg-chip cg-more">+{dayLeads.length-2}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── Lead Form Modal ── */
const LeadFormModal = ({ date, lead, onClose, onSave }) => {
  const isEdit = !!lead;
  const [form, setForm] = useState(
    lead ? { ...lead } : { ...EMPTY_FORM, followUpDate: toKey(date) }
  );
  const [errs, setErrs] = useState({});
  const ref = useRef(null);

  const set  = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = "Name is required";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrs(e); return; }
    onSave(form, isEdit);
  };

  return (
    <div className="mo-overlay" ref={ref} onClick={(e) => e.target===ref.current && onClose()}>
      <div className="mo-card">

        <div className="mo-head">
          <div>
            <p className="mo-sub">{isEdit ? "EDIT LEAD" : fmtDate(date).toUpperCase()}</p>
            <h2 className="mo-title">{isEdit ? "Update Lead" : "Add New Lead"}</h2>
          </div>
          <button className="mo-x" onClick={onClose}>✕</button>
        </div>

        <div className="mo-body">
          <div className="fg-grid">

            <div className="fg">
              <label>Full Name *</label>
              <input value={form.name} placeholder="Arjun Mehta"
                className={errs.name?"fe":""} onChange={(e)=>set("name",e.target.value)} />
              {errs.name && <span className="fe-msg">{errs.name}</span>}
            </div>

            <div className="fg">
              <label>Email *</label>
              <input type="email" value={form.email} placeholder="arjun@company.com"
                className={errs.email?"fe":""} onChange={(e)=>set("email",e.target.value)} />
              {errs.email && <span className="fe-msg">{errs.email}</span>}
            </div>

            <div className="fg">
              <label>Phone *</label>
              <input type="tel" value={form.phone} placeholder="+91 98765 43210"
                className={errs.phone?"fe":""} onChange={(e)=>set("phone",e.target.value)} />
              {errs.phone && <span className="fe-msg">{errs.phone}</span>}
            </div>

            <div className="fg">
              <label>Company</label>
              <input value={form.company} placeholder="Acme Corp"
                onChange={(e)=>set("company",e.target.value)} />
            </div>

            <div className="fg">
              <label>Status</label>
              <select value={form.status} onChange={(e)=>set("status",e.target.value)}>
                <option value="hot">🔥 Hot</option>
                <option value="warm">🌤 Warm</option>
                <option value="cold">❄️ Cold</option>
              </select>
            </div>

            <div className="fg">
              <label>Priority</label>
              <div className="prio-row">
                {["P1","P2","P3"].map((p)=>(
                  <button key={p} type="button"
                    className={`prio-btn prio-${p.toLowerCase()} ${form.priority===p?"active":""}`}
                    onClick={()=>set("priority",p)}>{p}</button>
                ))}
              </div>
            </div>

            <div className="fg fg-full">
              <label>Follow-up Date</label>
              <input type="date" value={form.followUpDate}
                onChange={(e)=>set("followUpDate",e.target.value)} />
            </div>

            <div className="fg fg-full">
              <label>Notes</label>
              <textarea rows={3} placeholder="Add context about this lead…"
                value={form.notes} onChange={(e)=>set("notes",e.target.value)} />
            </div>

          </div>
        </div>

        <div className="mo-foot">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save"   onClick={submit}>
            {isEdit ? "Update Lead" : "Save Lead"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── View Modal ── */
const ViewModal = ({ lead, onClose }) => {
  const ref = useRef(null);
  return (
    <div className="mo-overlay" ref={ref} onClick={(e)=>e.target===ref.current&&onClose()}>
      <div className="mo-card mo-view">
        <div className="mo-head">
          <div>
            <p className="mo-sub">LEAD DETAILS</p>
            <h2 className="mo-title">{lead.name}</h2>
          </div>
          <button className="mo-x" onClick={onClose}>✕</button>
        </div>
        <div className="mo-body">
          <div className="vg-grid">
            {[["Email",lead.email],["Phone",lead.phone],
              ["Company",lead.company||"—"],["Created",fmtDate(lead.createdAt)]].map(([l,v])=>(
              <div className="vg-item" key={l}>
                <span className="vg-lbl">{l}</span>
                <span className="vg-val">{v}</span>
              </div>
            ))}
            <div className="vg-item">
              <span className="vg-lbl">Status</span>
              <span className="status-pill"
                style={{color:STATUS_CFG[lead.status]?.color,background:STATUS_CFG[lead.status]?.bg}}>
                {STATUS_CFG[lead.status]?.label}
              </span>
            </div>
            <div className="vg-item">
              <span className="vg-lbl">Priority</span>
              <span className="status-pill"
                style={{color:PRIORITY_CFG[lead.priority]?.color,background:PRIORITY_CFG[lead.priority]?.bg}}>
                {lead.priority}
              </span>
            </div>
            <div className="vg-item">
              <span className="vg-lbl">Follow-up</span>
              <span className="vg-val">{fmtDate(lead.followUpDate)}</span>
            </div>
            <div className="vg-item vg-full">
              <span className="vg-lbl">Notes</span>
              <span className="vg-val">{lead.notes||"—"}</span>
            </div>
          </div>
        </div>
        <div className="mo-foot">
          <button className="btn-save" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   DASHBOARD (root)
───────────────────────────────────────────────────────────── */
const Dashboard = () => {
  const [leads,     setLeads]     = useState(loadLeads);
  const [activeYM,  setActiveYM]  = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [modalDate, setModalDate] = useState(null);   // clicking a cell
  const [editLead,  setEditLead]  = useState(null);
  const [viewLead,  setViewLead]  = useState(null);
  const [search,    setSearch]    = useState("");
  const [stFilter,  setStFilter]  = useState("all");
  const [selected,  setSelected]  = useState([]);

  useEffect(() => persist(leads), [leads]);

  /* date → leads map */
  const leadsByDate = useMemo(() => {
    const map = {};
    leads.forEach((l) => {
      if (!l.followUpDate) return;
      (map[l.followUpDate] = map[l.followUpDate] || []).push(l);
    });
    return map;
  }, [leads]);

  /* stat cards */
  const stats = useMemo(() => {
    const todayKey = toKey(today);
    return {
      total: leads.length,
      todayFollowups: leads.filter((l) => l.followUpDate === todayKey).length,
      emailSent: leads.filter((l) => l.emailSent).length,
      totalFollowups: leads.filter((l) => l.followUpDate).length,
      won: leads.filter((l) => l.outcome === "won").length,
      lost: leads.filter((l) => l.outcome === "lost").length,
    };
  }, [leads]);

  /* monthly trend — last 6 months, by createdAt */
  const monthlyTrend = useMemo(() => {
    const buckets = {};
    const labels = [];
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

  /* lead source distribution */
 /* company working-category distribution */
  const workTypeDist = useMemo(() => {
    const counts = { static: 0, dynamic: 0, meta_ads: 0, campaign: 0 };
    leads.forEach((l) => {
      if (l.workType && counts[l.workType] !== undefined) counts[l.workType]++;
    });
    return counts;
  }, [leads]);

  /* upcoming sidebar — next 6 (Today first, then soonest future) */
  const upcoming = useMemo(() => {
    const todayKey = toKey(today);

    return [...leads]
      .filter((l) => l.followUpDate)
      .sort((a, b) => {
        const isTodayA = a.followUpDate === todayKey;
        const isTodayB = b.followUpDate === todayKey;

        // Today always comes first
        if (isTodayA && !isTodayB) return -1;
        if (isTodayB && !isTodayA) return 1;

        // Then sort by date (ascending = soonest first)
        return a.followUpDate.localeCompare(b.followUpDate);
      })
      .slice(0, 6);
  }, [leads]);

  /* table rows */
  const filtered = useMemo(() =>
    leads.filter((l) =>
      (stFilter==="all" || l.status===stFilter) &&
      [l.name,l.email,l.company||""].some((f)=>
        f.toLowerCase().includes(search.toLowerCase()))
    ),
  [leads, stFilter, search]);

  /* selection */
  const visIds    = filtered.map((l)=>l.id);
  const allCheck  = visIds.length>0 && visIds.every((id)=>selected.includes(id));
  const toggleAll = () =>
    allCheck
      ? setSelected((p)=>p.filter((id)=>!visIds.includes(id)))
      : setSelected((p)=>[...new Set([...p,...visIds])]);
  const toggleOne = (id) =>
    setSelected((p)=>p.includes(id)?p.filter((s)=>s!==id):[...p,id]);

  /* CRUD */
  const handleSave = (form, isEdit) => {
    if (isEdit) {
      setLeads((p)=>p.map((l)=>l.id===form.id?{...form}:l));
    } else {
      setLeads((p)=>[
        { ...form, id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          badgeGrad: randomGrad() },
        ...p,
      ]);
    }
    setModalDate(null); setEditLead(null);
  };

  const delOne = (id) => {
    if (!window.confirm("Delete this lead?")) return;
    setLeads((p)=>p.filter((l)=>l.id!==id));
    setSelected((p)=>p.filter((s)=>s!==id));
  };

  const delBulk = () => {
    if (!selected.length || !window.confirm(`Delete ${selected.length} leads?`)) return;
    setLeads((p)=>p.filter((l)=>!selected.includes(l.id)));
    setSelected([]);
  };

  /* month nav */
  const prevMonth = () => setActiveYM(({year,month}) =>
    month===0 ? {year:year-1,month:11} : {year,month:month-1});
  const nextMonth = () => setActiveYM(({year,month}) =>
    month===11 ? {year:year+1,month:0} : {year,month:month+1});

  const todayKey = toKey(today);

  return (
    <div className="root-dashboard">

      {/* ── NAV ── */}
      <nav className="dash-nav">
        <div className="nav-brand">
          <span className="font-mono text-sm font-thin text-gray-600">Hey! Let's make it happen :)</span>
        </div>
      </nav>

      <div className="dash-body">

        {/* ════════════════════════════════════════
            STAT CARDS
        ════════════════════════════════════════ */}
        <section className="stats-row">
          <StatCard label="Total Leads"       value={stats.total}          Icon={Users}         accent={{ bg:"rgba(249,115,22,.13)", color:"#ea580c" }} />
          <StatCard label="Today Follow-ups"  value={stats.todayFollowups} Icon={CalendarClock} accent={{ bg:"rgba(239,68,68,.13)",  color:"#ef4444" }} />
          <StatCard label="Emails Sent"       value={stats.emailSent}      Icon={Mail}          accent={{ bg:"rgba(59,130,246,.13)", color:"#3b82f6" }} />
          <StatCard label="Total Follow-ups"  value={stats.totalFollowups} Icon={Repeat}        accent={{ bg:"rgba(245,158,11,.13)", color:"#f59e0b" }} />
          <StatCard label="Won"      value={stats.won}            Icon={CheckCircle2}  accent={{ bg:"rgba(34,197,94,.13)",  color:"#16a34a" }} />
          <StatCard label="Lost Leads"        value={stats.lost}           Icon={XCircle}       accent={{ bg:"rgba(107,114,128,.13)",color:"#6b7280" }} />
        </section>

        {/* ════════════════════════════════════════
            CHARTS
        ════════════════════════════════════════ */}
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

        {/* ════════════════════════════════════════
            CALENDAR SECTION
        ════════════════════════════════════════ */}
        <section className="cal-section">

          {/* LEFT — month/year + upcoming */}
          <div className="cal-left">
            <div className="cal-month-block">
              <p className="cal-month-name">
                {MONTH_NAMES[activeYM.month].toUpperCase()}
              </p>
              <h1 className="cal-year">{activeYM.year}</h1>
            </div>

            <div className="cal-upcoming">
              <p className="up-heading">UPCOMING EVENTS</p>
              <div className="up-list">
                {upcoming.length===0 && <p className="up-empty">No upcoming follow-ups</p>}
                {upcoming.map((lead) => {
                  const isToday = lead.followUpDate === todayKey;
                  return (
                    <div
                      key={lead.id}
                      className={`up-card ${isToday?"up-card-today":""}`}
                      onClick={() => setViewLead(lead)}
                    >
                      {isToday && <span className="up-today-tag">TODAY</span>}
                      <div className="up-row">
                        <span className="up-name">{lead.name}</span>
                        <span className="up-date">{fmtDate(lead.followUpDate)}</span>
                      </div>
                      <div className="up-row">
                        <span className="up-co">{lead.company || lead.email}</span>
                        <span className="up-prio"
                          style={{color:PRIORITY_CFG[lead.priority]?.color}}>
                          {lead.priority}
                        </span>
                      </div>
                      <p className="up-note">{(lead.notes||"").slice(0,52)||"—"}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT — calendar grid */}
          <div className="cal-right">
            {/* Month nav */}
            <div className="cal-nav">
              <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
              <span className="cal-nav-label">
                {MONTH_NAMES[activeYM.month]} {activeYM.year}
              </span>
              <button className="cal-nav-btn" onClick={nextMonth}>›</button>
            </div>

            <CalendarGrid
              year={activeYM.year}
              month={activeYM.month}
              leadsByDate={leadsByDate}
              onDayClick={(date) => setModalDate(date)}
            />
          </div>
        </section>

        {/* ════════════════════════════════════════
            LEAD TABLE SECTION
        ════════════════════════════════════════ */}
        <section className="tbl-section">

          <div className="tbl-top">
            <div>
              <h2 className="tbl-title">Lead Pipeline</h2>
              <p className="tbl-sub">{filtered.length} lead{filtered.length!==1?"s":""}</p>
            </div>
            <div className="tbl-bulk">
              {selected.length>0 && (
                <>
                  <button className="btn-bulk-del" onClick={delBulk}>
                    🗑 Delete ({selected.length})
                  </button>
                  <button className="btn-bulk-email">
                    ✉ Email ({selected.length})
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="tbl-filters">
            <div className="srch-wrap">
              <span className="srch-ico">⌕</span>
              <input className="srch-input" placeholder="Search name, email, company…"
                value={search} onChange={(e)=>setSearch(e.target.value)} />
            </div>
            <div className="st-filters">
              {["all","hot","warm","cold"].map((s)=>(
                <button key={s}
                  className={`st-btn st-${s} ${stFilter===s?"active":""}`}
                  onClick={()=>setStFilter(s)}>
                  {s==="all"?"All":STATUS_CFG[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="tbl-scroll">
            <table className="lead-tbl">
              <thead>
                <tr>
                  <th><input type="checkbox" className="chk" checked={allCheck} onChange={toggleAll}/></th>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Follow-up</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length===0 && (
                  <tr><td colSpan={9} className="tbl-empty">
                    No leads found — click any calendar date to add one.
                  </td></tr>
                )}
                {filtered.map((lead) => {
                  const isFollowToday = lead.followUpDate === todayKey;
                  return (
                    <tr key={lead.id}
                      className={`tbl-row tbl-${lead.status} ${selected.includes(lead.id)?"tbl-sel":""}`}>
                      <td><input type="checkbox" className="chk"
                        checked={selected.includes(lead.id)} onChange={()=>toggleOne(lead.id)}/></td>
                      <td className="td-name">{lead.name}</td>
                      <td className="td-co">{lead.company||"—"}</td>
                      <td className="td-email">{lead.email}</td>
                      <td className="td-phone">{lead.phone}</td>
                      <td>
                        <span className="status-pill"
                          style={{color:STATUS_CFG[lead.status]?.color,background:STATUS_CFG[lead.status]?.bg}}>
                          {STATUS_CFG[lead.status]?.label}
                        </span>
                      </td>
                      <td>
                        <span className="status-pill"
                          style={{color:PRIORITY_CFG[lead.priority]?.color,background:PRIORITY_CFG[lead.priority]?.bg}}>
                          {lead.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`fu-date ${isFollowToday?"fu-today":""}`}>
                          {fmtDate(lead.followUpDate)}
                          {isFollowToday && <span className="fu-dot"/>}
                        </span>
                      </td>
                      <td>
                        <div className="act-row">
                          <button className="act-btn act-v" onClick={()=>setViewLead(lead)} title="View">👁</button>
                          <button className="act-btn act-e" onClick={()=>setEditLead(lead)}  title="Edit">✏</button>
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

      {/* ── MODALS ── */}
      {(modalDate || editLead) && (
        <LeadFormModal
          date={modalDate || keyToDate(editLead?.followUpDate || toKey(today))}
          lead={editLead}
          onClose={() => { setModalDate(null); setEditLead(null); }}
          onSave={handleSave}
        />
      )}
      {viewLead && <ViewModal lead={viewLead} onClose={()=>setViewLead(null)} />}
    </div>
  );
};

export default Dashboard;