import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./layout.css";

/* ── Route → display name map ── add future routes here ── */
const ROUTE_META = {
  "/dashboard":   { label: "Dashboard",   parent: null },
  "/leads/add":   { label: "Add Lead",    parent: "Dashboard" },
  "/clients":     { label: "Client List", parent: "Dashboard" },
  "/invoices":    { label: "Invoice",     parent: "Dashboard" },
  "/reports":     { label: "Reports",     parent: "Dashboard" },
  "/settings":    { label: "Settings",    parent: "Dashboard" },
};

const NotificationPanel = ({ onClose }) => {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const NOTIFS = [
    { id: 1, title: "Follow-up due today",  body: "Arjun Mehta — TechWave Solutions", time: "Just now",  unread: true  },
    { id: 2, title: "New lead assigned",    body: "Karthik Iyer — AutoServ Logistics", time: "2 min ago", unread: true  },
    { id: 3, title: "Invoice #INV-0042",    body: "Marked as paid by FinEdge Capital", time: "1 hr ago",  unread: false },
    { id: 4, title: "Report ready",         body: "Q2 pipeline report generated",      time: "Yesterday", unread: false },
  ];

  return (
    <div className="notif-panel" ref={ref}>
      <div className="notif-head">
        <span className="notif-title">Notifications</span>
        <button className="notif-clear">Mark all read</button>
      </div>
      <ul className="notif-list">
        {NOTIFS.map((n) => (
          <li key={n.id} className={`notif-item ${n.unread ? "notif-unread" : ""}`}>
            <div className="notif-dot-wrap">
              {n.unread && <span className="notif-dot" />}
            </div>
            <div className="notif-content">
              <p className="notif-item-title">{n.title}</p>
              <p className="notif-item-body">{n.body}</p>
              <p className="notif-item-time">{n.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ProfilePanel = ({ onClose }) => {
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div className="profile-panel" ref={ref}>
      <div className="profile-info">
        <div className="profile-avatar-lg">A</div>
        <div>
          <p className="profile-name">Admin User</p>
          <p className="profile-email">admin@leadflow.io</p>
        </div>
      </div>
      <div className="profile-divider" />
      <ul className="profile-menu">
        {[
          { icon: "👤", label: "My Profile"   },
          { icon: "⚙️", label: "Settings",  action: () => navigate("/settings") },
          { icon: "🔒", label: "Security"      },
        ].map((item) => (
          <li key={item.label}>
            <button className="profile-menu-item" onClick={item.action || onClose}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="profile-divider" />
      <button className="profile-logout">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Sign Out
      </button>
    </div>
  );
};

const NavBar = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const [search,       setSearch]      = useState("");
  const [showNotif,    setShowNotif]   = useState(false);
  const [showProfile,  setShowProfile] = useState(false);

  const meta     = ROUTE_META[location.pathname] || { label: "Page", parent: null };
  const unreadCount = 2;

  const handleSearch = (e) => {
    if (e.key === "Enter" && search.trim()) {
      // wire up global search here when ready
      setSearch("");
    }
  };

  return (
    <header className="navbar">

      {/* ── Left: Breadcrumb ── */}
      <div className="navbar-left">
        {meta.parent && (
          <>
            <button
              className="navbar-bc-parent"
              onClick={() => navigate("/dashboard")}
            >
              {meta.parent}
            </button>
            <span className="navbar-bc-sep">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </span>
          </>
        )}
        <span className="navbar-bc-current">{meta.label}</span>
      </div>

      {/* ── Center: Search ── */}
      <div className="navbar-search-wrap">
        <span className="navbar-search-icon" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        <input
          className="navbar-search"
          type="text"
          placeholder="Search leads, clients, invoices…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearch}
        />
        <span className="navbar-search-kbd">⌘K</span>
      </div>

      {/* ── Right: Actions ── */}
      <div className="navbar-right">

        {/* Notification bell */}
        <div className="navbar-action-wrap">
          <button
            className={`navbar-action-btn ${showNotif ? "navbar-action-active" : ""}`}
            onClick={() => { setShowNotif((p) => !p); setShowProfile(false); }}
            aria-label="Notifications"
            title="Notifications"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unreadCount > 0 && (
              <span className="navbar-badge">{unreadCount}</span>
            )}
          </button>
          {showNotif && <NotificationPanel onClose={() => setShowNotif(false)} />}
        </div>

        {/* Divider */}
        <div className="navbar-vdiv" />

        {/* Profile */}
        <div className="navbar-action-wrap">
          <button
            className={`navbar-profile-btn ${showProfile ? "navbar-action-active" : ""}`}
            onClick={() => { setShowProfile((p) => !p); setShowNotif(false); }}
            aria-label="Profile menu"
          >
            <div className="navbar-avatar">A</div>
            <div className="navbar-profile-info">
              <span className="navbar-profile-name">Admin</span>
              <span className="navbar-profile-role">Administrator</span>
            </div>
            <span className="navbar-chevron" style={{ transform: showProfile ? "rotate(180deg)" : "rotate(0deg)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </span>
          </button>
          {showProfile && <ProfilePanel onClose={() => setShowProfile(false)} />}
        </div>

      </div>
    </header>
  );
};

export default NavBar;