import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../Login-Form/LoginForm.css";
import { Eye, EyeOff, Smartphone, Lock, ArrowRight, ShieldCheck, Zap, TrendingUp } from "lucide-react";

// TODO: dummy credentials for now — replace with a real auth API call
const DUMMY_MOBILE = "8317289305";
const DUMMY_PASSWORD = "123456";

const LoginForm = () => {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errs, setErrs] = useState({});
  const [loading, setLoading] = useState(false);

  const handleMobileChange = (e) => {
    setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
    if (errs.mobile) setErrs((p) => ({ ...p, mobile: "" }));
  };

  const validate = () => {
    const e = {};
    if (!/^[6-9]\d{9}$/.test(mobile)) e.mobile = "Enter a valid 10-digit mobile number";
    if (!password.trim()) e.password = "Password is required";
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrs(e); return; }

    setLoading(true);
    // TODO: replace this dummy check with a real auth API call
    setTimeout(() => {
      if (mobile === DUMMY_MOBILE && password === DUMMY_PASSWORD) {
        sessionStorage.setItem("kunash_auth", "true");
        toast.success("Login Successfully!");
        navigate("/dashboard", { replace: true });
      } else {
        toast.error("Invalid mobile number or password");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="login-root">
      {/* ── LEFT: Brand / Visual Panel ── */}
      <div className="login-visual">
        <div className="lv-glow lv-glow-1" />
        <div className="lv-glow lv-glow-2" />

        <div className="lv-content">
          <div className="lv-brand">
            <img src="/Images/kunash-logo.png" alt="Kunash" className="lv-logo" />
             <sub className="login-logo-tag ">CRM</sub>
          </div>

          <h1 className="lv-heading">
            Every lead.<br />Every follow-up.<br /><span>One clear pipeline.</span>
          </h1>
          <p className="lv-sub">
            The command center your sales team actually enjoys using — built for speed, clarity, and closing deals faster.
          </p>

          <div className="lv-feature-list">
            <div className="lv-feature">
              <span className="lv-feature-ico"><Zap size={16} /></span>
              <span>Real-time follow-up tracking</span>
            </div>
            <div className="lv-feature">
              <span className="lv-feature-ico"><TrendingUp size={16} /></span>
              <span>Pipeline insights that actually help</span>
            </div>
            <div className="lv-feature">
              <span className="lv-feature-ico"><ShieldCheck size={16} /></span>
              <span>Your data, secured end-to-end</span>
            </div>
          </div>

          <div className="lv-quote">
            <p>"Cut our follow-up misses to almost zero within a month."</p>
            <span>— Kunash Media Solutions</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Form Panel ── */}
      <div className="login-form-panel">
        <div className="lf-card">
          <div className="lf-mobile-brand">
            <img src="/Images/kunash-symbol.png" alt="Kunash" className="lf-mobile-logo" />
          </div>

          <div className="lf-head">
            <h2>Welcome back</h2>
            <p>Sign in to continue to your dashboard</p>
          </div>

          <form className="lf-form" onSubmit={handleSubmit} noValidate>
            <div className="lf-fg">
              <label>Mobile Number</label>
              <div className={`lf-input-wrap ${errs.mobile ? "lf-err" : ""}`}>
                <span className="lf-input-ico"><Smartphone size={17} /></span>
                <span className="lf-prefix">+91</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="9876543210"
                  value={mobile}
                  onChange={handleMobileChange}
                  disabled={loading}
                  autoComplete="tel"
                />
              </div>
              {errs.mobile && <span className="lf-err-msg">{errs.mobile}</span>}
            </div>

            <div className="lf-fg">
              <div className="lf-label-row">
                <label>Password</label>
                <a href="#forgot-password" className="lf-forgot">Forgot password?</a>
              </div>
              <div className={`lf-input-wrap ${errs.password ? "lf-err" : ""}`}>
                <span className="lf-input-ico"><Lock size={17} /></span>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errs.password) setErrs((p)=>({...p, password:""})); }}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="lf-eye-btn"
                  onClick={() => setShowPass((p) => !p)}
                  tabIndex={-1}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errs.password && <span className="lf-err-msg">{errs.password}</span>}
            </div>

           

            <button type="submit" className="lf-submit" disabled={loading}>
              {loading ? <span className="lf-spinner" /> : (
                <>Sign In <ArrowRight size={17} /></>
              )}
            </button>
          </form>

          <p className="lf-footer-note">
            Having trouble signing in? <a href="#support">Contact support</a>
          </p>
        </div>

        <p className="lf-copyright">© {new Date().getFullYear()} Kunash CRM. All rights reserved.</p>
      </div>
    </div>
  );
};

export default LoginForm;