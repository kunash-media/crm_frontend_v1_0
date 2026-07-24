import "../Lead-Form/AddLead.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const STATUS_CFG = {
  hot:  { label: "Hot",  color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  warm: { label: "Warm", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  cold: { label: "Cold", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
};

const PRIORITY_CFG = {
  P1: { color: "#ef4444", label: "High" },
  P2: { color: "#f59e0b", label: "Medium" },
  P3: { color: "#3b82f6", label: "Low" },
};

const LEAD_SOURCES = ["Website", "Referral", "Cold Call", "LinkedIn", "Event", "WhatsApp", "Inbound Email", "Other"];

const EMPTY_LEAD = {
  name: "",
  email: "",
  phone: "",
  company: "",
  status: "warm",
  priority: "P2",
  followUpDate: "",
  notes: "",
  source: "Website",
  dealValue: "",
  tags: "",
};

const AddLead = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_LEAD);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Auto-set follow-up date to tomorrow by default
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDate = tomorrow.toISOString().split('T')[0];
    setForm(prev => ({ ...prev, followUpDate: defaultDate }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = "Full name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) err.email = "Valid email is required";
    if (!form.phone.trim()) err.phone = "Phone number is required";
    if (!form.followUpDate) err.followUpDate = "Follow-up date is required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      // Get existing leads and add new one
      const existing = JSON.parse(localStorage.getItem("crm_leads_v2") || "[]");
      
      const newLead = {
        ...form,
        id: `lead_${Date.now()}`,
        createdAt: new Date().toISOString(),
        badgeGrad: `linear-gradient(135deg,#f97316,#ea580c)`, // default gradient
      };

      localStorage.setItem("crm_leads_v2", JSON.stringify([newLead, ...existing]));
      
      alert("✅ Lead created successfully!");
      navigate("/dashboard");
    }, 800);
  };

  return (
    <div className="add-lead-page">
      <div className="add-lead-header">
        <div>
          <h1 className="add-lead-title">Add New Lead</h1>
          <p className="add-lead-subtitle">Capture a new business opportunity</p>
        </div>
        
        <div className="header-actions">
          <button className="btn-cancel" onClick={() => navigate("/dashboard")}>
            Cancel
          </button>
          <button 
            className="btn-save" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving Lead..." : "Save Lead"}
          </button>
        </div>
      </div>

      <div className="add-lead-content">
        {/* Main Form */}
        <div className="add-lead-form">
          <div className="form-grid">

            {/* Basic Info */}
            <div className="form-section">
              <h3 className="section-title">Basic Information</h3>
              
              <div className="fg">
                <label>Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Arjun Mehta"
                  className={errors.name ? "error" : ""}
                />
                {errors.name && <span className="error-msg">{errors.name}</span>}
              </div>

              <div className="fg">
                <label>Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="arjun@techwave.io"
                  className={errors.email ? "error" : ""}
                />
                {errors.email && <span className="error-msg">{errors.email}</span>}
              </div>

              <div className="fg">
                <label>Phone Number <span className="required">*</span></label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 98201 33410"
                  className={errors.phone ? "error" : ""}
                />
                {errors.phone && <span className="error-msg">{errors.phone}</span>}
              </div>

              <div className="fg">
                <label>Company</label>
                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="TechWave Solutions"
                />
              </div>
            </div>

            {/* Lead Details */}
            <div className="form-section">
              <h3 className="section-title">Lead Details</h3>

              <div className="fg">
                <label>Status</label>
                <div className="status-options">
                  {Object.keys(STATUS_CFG).map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`status-chip ${form.status === s ? "active" : ""}`}
                      style={{
                        background: form.status === s ? STATUS_CFG[s].bg : "",
                        color: form.status === s ? STATUS_CFG[s].color : "",
                        border: form.status === s ? `1px solid ${STATUS_CFG[s].color}` : "",
                      }}
                      onClick={() => setForm(prev => ({ ...prev, status: s }))}
                    >
                      {STATUS_CFG[s].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="fg">
                <label>Priority</label>
                <div className="prio-row">
                  {["P1", "P2", "P3"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`prio-btn prio-${p.toLowerCase()} ${form.priority === p ? "active" : ""}`}
                      onClick={() => setForm(prev => ({ ...prev, priority: p }))}
                    >
                      {p} — {PRIORITY_CFG[p].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="fg">
                <label>Source</label>
                <select name="source" value={form.source} onChange={handleChange}>
                  {LEAD_SOURCES.map(src => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              </div>

              <div className="fg">
                <label>Deal Value (₹)</label>
                <input
                  type="number"
                  name="dealValue"
                  value={form.dealValue}
                  onChange={handleChange}
                  placeholder="250000"
                />
              </div>

              <div className="fg">
                <label>Follow-up Date <span className="required">*</span></label>
                <input
                  type="date"
                  name="followUpDate"
                  value={form.followUpDate}
                  onChange={handleChange}
                  className={errors.followUpDate ? "error" : ""}
                />
                {errors.followUpDate && <span className="error-msg">{errors.followUpDate}</span>}
              </div>
            </div>

            {/* Additional Info */}
            <div className="form-section full-width">
              <h3 className="section-title">Additional Information</h3>
              
              <div className="fg full">
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="enterprise, q3, demo"
                />
              </div>

              <div className="fg full">
                <label>Notes / Context</label>
                <textarea
                  name="notes"
                  rows={6}
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Requested enterprise demo. Very interested in Q3 rollout..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Sidebar */}
        <div className="add-lead-preview">
          <div className="preview-card">
            <h4 className="preview-title ">Live Preview</h4>
            
            <div className="preview-content">
              {/* <div className="preview-name">{form.name || "New Lead"}</div> */}
              <div className="preview-company">{form.company || "Company Name"}</div>

              <div className="preview-meta">
                <span className="preview-pill" style={{
                  color: STATUS_CFG[form.status].color,
                  background: STATUS_CFG[form.status].bg
                }}>
                  {STATUS_CFG[form.status].label}
                </span>
                <span className="preview-pill" style={{
                  color: PRIORITY_CFG[form.priority].color,
                  background: PRIORITY_CFG[form.priority].color + "15"
                }}>
                  {form.priority}
                </span>
              </div>

              <div className="preview-info">
                <p><strong>Email:</strong> {form.email || "—"}</p>
                <p><strong>Phone:</strong> {form.phone || "—"}</p>
                <p><strong>Follow-up:</strong> {form.followUpDate ? new Date(form.followUpDate).toLocaleDateString('en-IN') : "—"}</p>
              </div>

              {form.notes && (
                <div className="preview-notes">
                  <strong>Notes:</strong>
                  <p>{form.notes.slice(0, 120)}{form.notes.length > 120 ? "..." : ""}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLead;