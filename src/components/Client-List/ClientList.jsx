import { useState } from "react";
import "../Client-List/ClientList.css";

const CLIENTS = [
  { id: 1, firstName: "Arjun", lastName: "Mehta", contact: "+91 98765 43210", email: "arjun@techwave.io", service: "Web Development", project: "TechWave Solutions", totalAmount: 85000, advanceAmount: 60000, remainAmount: 25000, pendingAmount: 5000, source: "Referral", type: "dynamic" },
  { id: 2, firstName: "Karthik", lastName: "Iyer", contact: "+91 91234 56780", email: "karthik@autoserv.com", service: "Static Website", project: "AutoServ Logistics", totalAmount: 25000, advanceAmount: 25000, remainAmount: 0, pendingAmount: 5000, source: "Instagram", type: "static" },
  { id: 3, firstName: "Neha", lastName: "Shah", contact: "+91 99887 76655", email: "neha@finedge.in", service: "E-commerce", project: "FinEdge Capital", totalAmount: 140000, advanceAmount: 90000, remainAmount: 50000, pendingAmount: 25000,source: "Website", type: "dynamic" },
  { id: 4, firstName: "Rohan", lastName: "Verma", contact: "+91 90909 12121", email: "rohan@brightleaf.co", service: "Static Website", project: "Brightleaf Interiors", totalAmount: 18000, advanceAmount: 18000, remainAmount: 0, pendingAmount: 5000, source: "Google Ads", type: "static" },
];

const currency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const StatCard = ({ label, value, icon }) => (
  <div className="cl-stat-card">
    <div className="cl-stat-icon">{icon}</div>
    <div>
      <p className="cl-stat-value">{value}</p>
      <p className="cl-stat-label">{label}</p>
    </div>
  </div>
);

const SectionRow = ({ title, children, last }) => (
  <div className={`cl-section-row ${last ? "cl-section-row-last" : ""}`}>
    <div className="cl-section-row-label">
      <p className="cl-section-row-title">{title}</p>
    </div>
    <div className="cl-section-row-content">{children}</div>
  </div>
);

const ViewClientForm = ({ client, onClose }) => (
  <div className="cl-modal-overlay" onClick={onClose}>
    <div className="cl-modal-panel" onClick={(e) => e.stopPropagation()}>
      <div className="cl-modal-header">
        <h2 className="cl-modal-title">Client details</h2>
        <button className="cl-modal-close-btn" onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="cl-modal-body">
        <SectionRow title="Personal information">
          <div className="cl-form-grid">
            <div className="cl-form-field"><label>First name</label><div className="cl-form-value">{client.firstName}</div></div>
            <div className="cl-form-field"><label>Last name</label><div className="cl-form-value">{client.lastName}</div></div>
            <div className="cl-form-field"><label>Contact number</label><div className="cl-form-value">{client.contact}</div></div>
            <div className="cl-form-field"><label>Email address</label><div className="cl-form-value">{client.email}</div></div>
          </div>
        </SectionRow>

        <SectionRow title="Project information">
          <div className="cl-form-grid">
            <div className="cl-form-field"><label>Service</label><div className="cl-form-value">{client.service}</div></div>
            <div className="cl-form-field"><label>Project / company</label><div className="cl-form-value">{client.project}</div></div>
            <div className="cl-form-field"><label>Source</label><div className="cl-form-value">{client.source}</div></div>
            <div className="cl-form-field"><label>Website type</label><div className="cl-form-value" style={{ textTransform: "capitalize" }}>{client.type}</div></div>
          </div>
        </SectionRow>

        <SectionRow title="Payment information" last>
          <div className="cl-form-grid">
            <div className="cl-form-field"><label>Totol Amount</label><div className="cl-form-value">{currency(client.totalAmount)}</div></div>
            <div className="cl-form-field"><label>Advance (60%)</label><div className="cl-form-value cl-form-value-success">{currency(client.advanceAmount)}</div></div>
            <div className="cl-form-field"><label>Remains (40%)</label><div className="cl-form-value cl-form-value-pending">{currency(client.remainAmount)}</div></div>
            <div className="cl-form-field"><label>Pending Payment</label><div className="cl-form-value cl-form-value-pending">{currency(client.pendingAmount)}</div></div>

          </div>
        </SectionRow>
      </div>

      <div className="cl-modal-footer">
        <button className="cl-btn-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  </div>
);

const EditClientForm = ({ client, onClose, onSave }) => {
  const [form, setForm] = useState(client);
  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="cl-modal-overlay" onClick={onClose}>
      <div className="cl-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="cl-modal-header">
          <h2 className="cl-modal-title">Edit client</h2>
          <button className="cl-modal-close-btn" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="cl-modal-body">
          <SectionRow title="Personal information">
            <div className="cl-form-grid">
              <div className="cl-form-field"><label>First name</label><input value={form.firstName} onChange={update("firstName")} /></div>
              <div className="cl-form-field"><label>Last name</label><input value={form.lastName} onChange={update("lastName")} /></div>
              <div className="cl-form-field"><label>Contact number</label><input value={form.contact} onChange={update("contact")} /></div>
              <div className="cl-form-field"><label>Email address</label><input value={form.email} onChange={update("email")} /></div>
            </div>
          </SectionRow>

          <SectionRow title="Project information">
            <div className="cl-form-grid">
              <div className="cl-form-field"><label>Service</label><input value={form.service} onChange={update("service")} /></div>
              <div className="cl-form-field"><label>Project / company</label><input value={form.project} onChange={update("project")} /></div>
              <div className="cl-form-field"><label>Source</label><input value={form.source} onChange={update("source")} /></div>
              <div className="cl-form-field">
                <label>Website type</label>
                <select value={form.type} onChange={update("type")}>
                  <option value="static">Static</option>
                  <option value="dynamic">Dynamic</option>
                </select>
              </div>
            </div>
          </SectionRow>

          <SectionRow title="Payment information" last>
            <div className="cl-form-grid">
              <div className="cl-form-field"><label>totalAmount</label><input type="number" value={form.totalAmount} onChange={update("totalAmount")} /></div>
              <div className="cl-form-field"><label>Advance (60%)</label><input type="number" value={form.advanceAmount} onChange={update("advanceAmount")} /></div>
              <div className="cl-form-field"><label>Remains (40%)</label><input type="number" value={form.remainAmount} onChange={update("remainAmount")} /></div>
              <div className="cl-form-field"><label>Pending Amount</label><input type="number" value={form.pendingAmount} onChange={update("pendingAmount")} /></div>
            </div>
          </SectionRow>
        </div>

        <div className="cl-modal-footer">
          <button className="cl-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="cl-btn-save" onClick={() => onSave(form)}>Save changes</button>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirm = ({ client, onCancel, onConfirm }) => (
  <div className="cl-modal-overlay" onClick={onCancel}>
    <div className="cl-confirm-panel" onClick={(e) => e.stopPropagation()}>
      <div className="cl-confirm-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" /><path d="M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </div>
      <h3 className="cl-confirm-title">Delete client?</h3>
      <p className="cl-confirm-body">
        This will permanently remove <strong>{client.firstName} {client.lastName}</strong> and all associated records. This can't be undone.
      </p>
      <div className="cl-confirm-actions">
        <button className="cl-btn-cancel" onClick={onCancel}>No, keep it</button>
        <button className="cl-btn-delete" onClick={() => onConfirm(client)}>Yes, delete</button>
      </div>
    </div>
  </div>
);

const ClientList = () => {
  const [clients, setClients] = useState(CLIENTS);
  const [viewClient, setViewClient] = useState(null);
  const [editClient, setEditClient] = useState(null);
  const [deleteClient, setDeleteClient] = useState(null);

  const totalClients = clients.length;
  const totalWebsites = clients.length;
  const staticCount = clients.filter((c) => c.type === "static").length;
  const dynamicCount = clients.filter((c) => c.type === "dynamic").length;

  const handleSaveEdit = (updated) => {
    setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setEditClient(null);
  };

  const handleConfirmDelete = (client) => {
    setClients((prev) => prev.filter((c) => c.id !== client.id));
    setDeleteClient(null);
  };

  return (
    <div className="client-root">
      <div className="cl-stat-grid">
        <StatCard label="Total clients" value={totalClients} icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        } />
        <StatCard label="Total websites" value={totalWebsites} icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20z" />
          </svg>
        } />
        <StatCard label="Static websites" value={staticCount} icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" />
          </svg>
        } />
        <StatCard label="Dynamic websites" value={dynamicCount} icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        } />
      </div>

      <div className="cl-table-card">
        <div className="cl-table-scroll">
          <table className="cl-table">
            <thead>
              <tr>
                <th>First name</th><th>Last name</th><th>Contact</th><th>Email</th>
                <th>Service</th><th>Project</th><th>totalAmount</th><th>Advance (60%)</th>
                <th>Pending pay</th><th>Source</th><th className="cl-col-sticky">Action</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td>{c.firstName}</td>
                  <td>{c.lastName}</td>
                  <td>{c.contact}</td>
                  <td className="cl-cell-muted">{c.email}</td>
                  <td>{c.service}</td>
                  <td>{c.project}</td>
                  <td>{currency(c.totalAmount)}</td>
                  <td className="cl-cell-success">{currency(c.advanceAmount)}</td>
                  <td className={c.remainAmount > 0 ? "cl-cell-pending" : "cl-cell-muted"}>{currency(c.remainAmount)}</td>
                  <td>{c.source}</td>
                  <td className="cl-col-sticky">
                    <div className="cl-action-btns">
                      <button className="cl-icon-btn" title="View" onClick={() => setViewClient(c)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button className="cl-icon-btn" title="Edit" onClick={() => setEditClient(c)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button className="cl-icon-btn cl-icon-btn-danger" title="Delete" onClick={() => setDeleteClient(c)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6" /><path d="M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewClient && <ViewClientForm client={viewClient} onClose={() => setViewClient(null)} />}
      {editClient && <EditClientForm client={editClient} onClose={() => setEditClient(null)} onSave={handleSaveEdit} />}
      {deleteClient && <DeleteConfirm client={deleteClient} onCancel={() => setDeleteClient(null)} onConfirm={handleConfirmDelete} />}
    </div>
  );
};

export default ClientList;