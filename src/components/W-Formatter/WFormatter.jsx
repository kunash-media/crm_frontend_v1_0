import { useState, useRef, useEffect } from "react";
import "./WFormatter.css";
import { formatSentences } from "../utils/textFormatter";

const DEFAULTS = {
  report: {
    thankYou:
      "Thank you for your patience. We are actively working on resolving this issue and will keep you updated.",
    heading: "Issue Report",
  },
  resolved: {
    thankYou:
      "Thank you for your patience and cooperation. Please let us know if you face any further issues.\n\nBest regards,\nTeam Kunash :)",
    heading: "Issue Resolution Update",
  },
};

const WFormatter = () => {
  const [type, setType] = useState("report");
  const [clientName, setClientName] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [exactReason, setExactReason] = useState("");
  const [resolutionText, setResolutionText] = useState("");
  const [remark, setRemark] = useState("");
  const [thankYouMsg, setThankYouMsg] = useState(DEFAULTS.report.thankYou);
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  

  const userEditedThankYou = useRef(false);
  const previewTimeRef = useRef("");

  useEffect(() => {
    previewTimeRef.current = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [clientName, problemStatement, exactReason, resolutionText, remark, thankYouMsg]);

  const handleTypeChange = (nextType) => {
    setType(nextType);
    if (!userEditedThankYou.current) {
      setThankYouMsg(DEFAULTS[nextType].thankYou);
    }
  };

  const handleThankYouChange = (val) => {
    userEditedThankYou.current = true;
    setThankYouMsg(val);
  };

  const buildMessage = () => {
    const lines = [];
    const heading = DEFAULTS[type].heading;
    const client = clientName.trim();

    lines.push(client ? `${heading} - ${client}` : heading);
    lines.push("");

    if (problemStatement.trim()) {
      lines.push("Statement");
      lines.push(formatSentences(problemStatement));
      lines.push("");
    }

    if (exactReason.trim()) {
      lines.push("Reason");
      lines.push(formatSentences(exactReason));
      lines.push("");
    }

    if (type === "resolved" && resolutionText.trim()) {
      lines.push("Resolution");
      lines.push(formatSentences(resolutionText));
      lines.push("");
    }

    if (remark.trim()) {
      lines.push("Remark");
      lines.push(formatSentences(remark));
      lines.push("");
    }

    if (thankYouMsg.trim()) {
      lines.push(thankYouMsg.trim());
    }

   return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  };

  const buildRawMessage = () => {
    const lines = [];
    const heading = DEFAULTS[type].heading;
    const client = clientName.trim();
    lines.push(client ? `${heading} - ${client}` : heading);
    lines.push("");
    if (problemStatement.trim()) { lines.push("Statement"); lines.push(problemStatement.trim()); lines.push(""); }
    if (exactReason.trim()) { lines.push("Reason"); lines.push(exactReason.trim()); lines.push(""); }
    if (type === "resolved" && resolutionText.trim()) { lines.push("Resolution"); lines.push(resolutionText.trim()); lines.push(""); }
    if (remark.trim()) { lines.push("Remark"); lines.push(remark.trim()); lines.push(""); }
    if (thankYouMsg.trim()) lines.push(thankYouMsg.trim());
    return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  };

  const message = buildMessage();
  const rawMessage = buildRawMessage();
  const displayMessage = showRaw ? rawMessage : message;

  const handleCopy = async () => {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = message;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleReset = () => {
    setClientName("");
    setProblemStatement("");
    setExactReason("");
    setResolutionText("");
    setRemark("");
    userEditedThankYou.current = false;
    setThankYouMsg(DEFAULTS[type].thankYou);
  };

  const waHref = "https://wa.me/?text=" + encodeURIComponent(message);

  return (
    <div className="formatter-root min-h-screen  font-[Inter]">
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur border-slate-200">
        <div className="flex items-center justify-between max-w-6xl px-4 py-4 mx-auto sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center shadow-sm w-9 h-9 rounded-xl bg-emerald-500">
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.45 1.26 4.9L2 22l5.25-1.28A9.96 9.96 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10Zm0 18.2c-1.6 0-3.13-.43-4.46-1.24l-.32-.19-3.13.76.77-3.05-.21-.32A8.16 8.16 0 0 1 3.84 12c0-4.53 3.68-8.2 8.2-8.2 4.53 0 8.2 3.67 8.2 8.2 0 4.53-3.67 8.2-8.2 8.2Zm4.5-6.13c-.24-.12-1.44-.71-1.66-.79-.22-.08-.38-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.53.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.44-1.34-1.68-.14-.24-.02-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.42-.55-.42-.14 0-.3-.02-.46-.02-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.13 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-slate-800">
                WhatsApp Message Drafter
              </h1>
              <p className="text-xs text-slate-500 -mt-0.5">
                Issue Report &amp; Resolution templates
              </p>
            </div>
          </div>
          <div className="items-center hidden gap-2 text-xs font-medium sm:flex text-slate-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Ready
            </span>
          </div>
        </div>
      </header>

      <main className="grid max-w-6xl gap-6 px-4 py-8 mx-auto sm:px-6 lg:grid-cols-2">
        <section className="p-5 bg-white border shadow-sm rounded-2xl border-slate-200 sm:p-6 h-fit">
          <div className="mb-6">
            <label className="block mb-2 text-xs font-semibold tracking-wide uppercase text-slate-500">
              Template Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => handleTypeChange("report")}
                className={`tpl-btn ${type === "report" ? "active-tpl" : ""} flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                </svg>
                Issue Report
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("resolved")}
                className={`tpl-btn ${type === "resolved" ? "active-tpl" : ""} flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="m22 4-10 10.01-3-3" />
                </svg>
                Issue Resolved
              </button>
            </div>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Client / Project Name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Artezo VPS - HRMS Module"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Statement
              </label>
              <textarea
                rows={3}
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="Describe the issue that occurred..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Reason
              </label>
              <textarea
                rows={3}
                value={exactReason}
                onChange={(e) => setExactReason(e.target.value)}
                placeholder="Root cause / reason behind the issue..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition resize-none"
              />
            </div>

            {type === "resolved" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Resolution / Fix Applied
                </label>
                <textarea
                  rows={3}
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="What was done to fix it..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition resize-none"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Remark
              </label>
              <textarea
                rows={2}
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Any additional remark or note..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Closing / Thank You Message
              </label>
              <textarea
                rows={2}
                value={thankYouMsg}
                onChange={(e) => handleThankYouChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition"
            >
              Clear Form
            </button>
          </form>
        </section>

        <section className="lg:sticky lg:top-24 h-fit">
          <div className="bg-[#e5ddd5] rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-600">
              <div className="flex items-center justify-center text-sm font-bold text-white rounded-full w-9 h-9 bg-emerald-300/40">
                KM
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight text-white">Kunash Media</p>
                <p className="text-emerald-100 text-[11px]">preview</p>
              </div>
            </div>

            <div
              className="p-4 min-h-[320px] flex flex-col justify-end"
              style={{
                backgroundImage: "radial-gradient(#00000008 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            >
              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  onClick={() => setShowRaw((p) => !p)}
                  className="text-[11px] font-semibold text-emerald-600 hover:underline"
                >
                  {showRaw ? "Show formatted (winkNLP)" : "Show raw input"}
                </button>
              </div>
              <div className="relative bg-white rounded-lg rounded-tl-none shadow-sm px-3.5 py-3 max-w-full ml-0 mr-auto">
                <pre className="whitespace-pre-wrap break-words text-[13.5px] leading-relaxed text-slate-800 font-[Inter]">
                  {displayMessage || "Fill the form to see your message preview here..."}
                </pre>
                <div className="flex justify-end mt-1">
                  <span className="text-[10px] text-slate-400">{previewTimeRef.current}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCopy}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-sm hover:bg-emerald-700 active:scale-[0.98] transition"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy to Clipboard
                </>
              )}
            </button>
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition border rounded-xl border-emerald-600 text-emerald-700 hover:bg-emerald-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.45 1.26 4.9L2 22l5.25-1.28A9.96 9.96 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10Z" />
              </svg>
              Send
            </a>
          </div>
          {copied && (
            <p className="mt-3 text-sm font-medium text-center text-emerald-600">
              ✓ Copied to clipboard
            </p>
          )}
        </section>
      </main>

      <footer className="pb-8 text-xs text-center text-slate-400">
        Built for quick, consistent client update messages.
      </footer>
    </div>
  );
};

export default WFormatter;