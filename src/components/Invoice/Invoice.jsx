import { useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Invoice.css";

/* ─── helpers ─────────────────────────────────────────────── */
const inr  = (n) => `Rs. ${Number(n).toLocaleString("en-IN")}`;
const fmtD = (s) => s ? new Date(s).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "";

/* ─── PDF GENERATOR ───────────────────────────────────────── */
const generatePDF = async (invoice, subtotal, gstAmount, grandTotal, isPaid) => {
  const doc = new jsPDF("p", "mm", "a4");
  const PW  = doc.internal.pageSize.getWidth();   // 210
  const PH  = doc.internal.pageSize.getHeight();  // 297
  const L   = 18;
  const R   = PW - 18;

  /* ── palette — clean white/grey, one accent ── */
  const accent  = [249, 115, 22];   // orange — used sparingly
  const black   = [20,  20,  20];
  const darkGry = [50,  50,  50];
  const midGry  = [100, 100, 100];
  const litGry  = [160, 160, 160];
  const bdrGry  = [210, 210, 210];  // border grey
  const rowAlt  = [249, 249, 249];  // alternate row
  const headBg  = [242, 242, 242];  // table header bg
  const white   = [255, 255, 255];

  /* ── pure white page ── */
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, PW, PH, "F");

  /* ── thin top accent line (2px only) ── */
  doc.setFillColor(...accent);
  doc.rect(0, 0, PW, 2, "F");

  /* ── LOGO ── */
  try {
    const img = new Image();
    img.src = "/Images/kunash-logo.png";
    await new Promise((res) => {
      img.onload  = () => { doc.addImage(img, "PNG", L, 10, 46, 22); res(); };
      img.onerror = () => res();
    });
  } catch { /* ignore */ }

  /* ── INVOICE title (right) ── */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(...darkGry);
  doc.text("INVOICE", R, 24, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...litGry);
  doc.text("Professional Tax Invoice", R, 31, { align: "right" });

  /* ── thin divider ── */
  let y = 40;
  doc.setDrawColor(...bdrGry);
  doc.setLineWidth(0.5);
  doc.line(L, y, R, y);
  y += 11;

  /* ── BILL TO (left) ── */
  const col2 = 118;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text("BILL TO", L, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...black);
  doc.text(invoice.billTo.name || "—", L, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...midGry);
  let bY = y + 15;
  if (invoice.billTo.company) { doc.text(invoice.billTo.company, L, bY); bY += 5.5; }
  if (invoice.billTo.email)   { doc.text(invoice.billTo.email,   L, bY); bY += 5.5; }
  if (invoice.billTo.address) {
    const lines = doc.splitTextToSize(invoice.billTo.address, 85);
    doc.text(lines, L, bY);
  }

  /* ── Invoice details box (right) — grey border, no fill ── */
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...bdrGry);
  doc.setLineWidth(0.5);
  doc.roundedRect(col2, y - 5, R - col2, 40, 2, 2, "FD");

  const detRow = (label, value, ry) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(90, 90, 90);
    doc.text(label, col2 + 6, ry);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(25, 25, 25);
    doc.text(value, R - 6, ry, { align: "right" });
  };

  detRow("Invoice No", invoice.invoiceNo,          y + 5);
  detRow("Date",       fmtD(invoice.invoiceDate),   y + 13);
  detRow("GST Rate",   `${invoice.gstRate}%`,        y + 21);
  detRow("Status",     "",                           y + 29);

  /* status coloured separately */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...(isPaid ? [5, 150, 105] : [200, 30, 30]));
  doc.text(isPaid ? "PAID" : "UNPAID", R - 6, y + 29, { align: "right" });

  y += 52;

  /* ═══════════════════════════════════════════
     SERVICES TABLE
  ═══════════════════════════════════════════ */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...midGry);
  doc.text("SERVICES", L, y);
  y += 6;

  /* Fixed total usable width: R - L = 174mm
     Columns: # 9 | Description 75 | Qty 16 | Rate 37 | Amount 37 = 174 */
  autoTable(doc, {
    startY: y,
    margin: { left: L, right: 18 },
    tableWidth: R - L,
    head: [["#", "Description", "Qty", "Rate (Rs.)", "Amount (Rs.)"]],
    body: invoice.items
      .filter((i) => i.description)
      .map((item, idx) => [
        idx + 1,
        item.description,
        item.qty,
        Number(item.rate).toLocaleString("en-IN"),
        (item.qty * item.rate).toLocaleString("en-IN"),
      ]),
    headStyles: {
      fillColor: headBg,
      textColor: darkGry,
      fontStyle: "bold",
      fontSize: 9,
      cellPadding: { top: 5, bottom: 5, left: 5, right: 5 },
      lineColor: bdrGry,
      lineWidth: 0.4,
    },
    bodyStyles: {
      fontSize: 9.5,
      textColor: darkGry,
      cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
      lineColor: bdrGry,
      lineWidth: 0.3,
    },
    alternateRowStyles: { fillColor: rowAlt },
    columnStyles: {
      0: { cellWidth: 9,   halign: "center" },
      1: { cellWidth: 75  },
      2: { cellWidth: 16,  halign: "center" },
      3: { cellWidth: 37,  halign: "right" },
      4: { cellWidth: 37,  halign: "right", fontStyle: "bold" },
    },
    tableLineColor: bdrGry,
    tableLineWidth: 0.4,
    theme: "grid",
  });

  y = (doc.lastAutoTable?.finalY ?? y + 40) + 10;

  /* ═══════════════════════════════════════════
     TOTALS — right-aligned box
  ═══════════════════════════════════════════ */
  const tX = col2;
  const tW = R - col2;

  /* outer box */
  doc.setDrawColor(...bdrGry);
  doc.setLineWidth(0.5);
  doc.roundedRect(tX, y, tW, 35, 2, 2, "D");

  /* divider above grand total */
  doc.setDrawColor(...bdrGry);
  doc.setLineWidth(0.4);
  doc.line(tX, y + 24, tX + tW, y + 24);

  /* Subtotal row */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...midGry);
  doc.text("Subtotal", tX + 7, y + 9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkGry);
  doc.text(`Rs. ${subtotal.toLocaleString("en-IN")}`, R - 6, y + 9, { align: "right" });

  /* GST row */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...midGry);
  doc.text(`GST (${invoice.gstRate}%)`, tX + 7, y + 18);
  doc.setTextColor(...darkGry);
  doc.text(`Rs. ${gstAmount.toLocaleString("en-IN")}`, R - 6, y + 18, { align: "right" });

  /* Grand Total row — accent bg strip */
  doc.setFillColor(...accent);
  doc.roundedRect(tX, y + 24, tW, 11, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...white);
  doc.text("GRAND TOTAL", tX + 7, y + 32);
  doc.text(`Rs. ${grandTotal.toLocaleString("en-IN")}`, R - 6, y + 32, { align: "right" });

  y += 50;

  /* ═══════════════════════════════════════════
     PAYMENT SCHEDULE TABLE
  ═══════════════════════════════════════════ */
  const paidRows = invoice.payments.filter((p) => p.amount > 0);
  if (paidRows.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...midGry);
    doc.text("PAYMENT SCHEDULE", L, y);
    y += 6;

    /* Fixed widths: Payment 62 | Date 36 | Mode 38 | Amount 38 = 174 */
    autoTable(doc, {
      startY: y,
      margin: { left: L, right: 18 },
      tableWidth: R - L,
      head: [["Payment", "Date", "Mode", "Amount (Rs.)"]],
      body: paidRows.map((p) => [
        p.label,
        fmtD(p.date) || "—",
        p.mode,
        p.amount.toLocaleString("en-IN"),
      ]),
      headStyles: {
        fillColor: headBg,
        textColor: darkGry,
        fontStyle: "bold",
        fontSize: 9,
        cellPadding: { top: 5, bottom: 5, left: 5, right: 5 },
        lineColor: bdrGry,
        lineWidth: 0.4,
      },
      bodyStyles: {
        fontSize: 9.5,
        textColor: darkGry,
        cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
        lineColor: bdrGry,
        lineWidth: 0.3,
      },
      alternateRowStyles: { fillColor: rowAlt },
      columnStyles: {
        0: { cellWidth: 62 },
        1: { cellWidth: 36 },
        2: { cellWidth: 38 },
        3: { cellWidth: 38, halign: "right", fontStyle: "bold" },
      },
      tableLineColor: bdrGry,
      tableLineWidth: 0.4,
      theme: "grid",
    });

    y = (doc.lastAutoTable?.finalY ?? y + 40) + 10;
  }

  /* ═══════════════════════════════════════════
     NOTES
  ═══════════════════════════════════════════ */
  if (invoice.notes) {
    doc.setDrawColor(...bdrGry);
    doc.setFillColor(250, 250, 250);
    doc.setLineWidth(0.4);
    doc.roundedRect(L, y, R - L, 22, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...midGry);
    doc.text("NOTE", L + 6, y + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...darkGry);
    const noteLines = doc.splitTextToSize(invoice.notes, R - L - 14);
    doc.text(noteLines, L + 6, y + 15);
    y += 28;
  }

  /* ═══════════════════════════════════════════
     FOOTER — minimal grey text, no heavy bar
  ═══════════════════════════════════════════ */
  doc.setDrawColor(...bdrGry);
  doc.setLineWidth(0.4);
  doc.line(L, PH - 18, R, PH - 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...litGry);
  doc.text("Thank you for your business with Kunash!", PW / 2, PH - 11, { align: "center" });
  doc.text(`Invoice ${invoice.invoiceNo}  ·  Generated ${fmtD(new Date())}`, PW / 2, PH - 6, { align: "center" });

  doc.save(`Invoice_${invoice.invoiceNo}.pdf`);
};

/* ─── COMPONENT ───────────────────────────────────────────── */
const Invoice = () => {
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState({
    invoiceNo:   `KUN-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    invoiceDate: new Date().toISOString().split("T")[0],
    billTo:   { name: "", company: "", email: "", address: "" },
    items:    [{ description: "", qty: 1, rate: 0 }],
    payments: [{ label: "First Payment", date: "", mode: "Bank Transfer", amount: 0 }],
    gstRate:  18,
    notes:    "",
  });

  const subtotal   = invoice.items.reduce((s, i) => s + i.qty * i.rate, 0);
  const gstAmount  = Math.round((subtotal * invoice.gstRate) / 100);
  const grandTotal = subtotal + gstAmount;

  const isValid = invoice.billTo.name &&
    invoice.billTo.email &&
    invoice.items.some((i) => i.description && i.rate > 0);

  const set = (k, v) => setInvoice((p) => ({ ...p, [k]: v }));
  const setBillTo = (f, v) =>
    setInvoice((p) => ({ ...p, billTo: { ...p.billTo, [f]: v } }));

  const addItem = () =>
    set("items", [...invoice.items, { description: "", qty: 1, rate: 0 }]);

  const updItem = (idx, f, v) => {
    const arr = [...invoice.items];
    arr[idx][f] = f === "qty" || f === "rate" ? Number(v) || 0 : v;
    set("items", arr);
  };

  const rmItem = (idx) => {
    if (invoice.items.length === 1) return;
    set("items", invoice.items.filter((_, i) => i !== idx));
  };

  const addPay = () => {
    const n = invoice.payments.length + 1;
    set("payments", [...invoice.payments, { label: `Payment ${n}`, date: "", mode: "Bank Transfer", amount: 0 }]);
  };

  const updPay = (idx, f, v) => {
    const arr = [...invoice.payments];
    arr[idx][f] = f === "amount" ? Number(v) || 0 : v;
    set("payments", arr);
  };

  const rmPay = (idx) => {
    if (invoice.payments.length === 1) return;
    set("payments", invoice.payments.filter((_, i) => i !== idx));
  };

  const totalPaid = invoice.payments.reduce((s, p) => s + p.amount, 0);
  const balance   = grandTotal - totalPaid;

  return (
    <div className="invoice-page">

      {/* ── Page Header ── */}
      <div className="invoice-page-header">
        <div>
          <h1 className="invoice-page-title">Create Invoice</h1>
          <p className="invoice-page-sub">Professional billing for your clients</p>
        </div>
        <div className="invoice-header-actions">
          <button onClick={() => navigate("/dashboard")} className="inv-btn-ghost">
            Cancel
          </button>
          {isValid && (
            <button
              onClick={() => generatePDF(invoice, subtotal, gstAmount, grandTotal, balance === 0 && totalPaid > 0)}
              className="inv-btn-green"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download PDF
            </button>
          )}
          <button className="inv-btn-orange">Save &amp; Send</button>
        </div>
      </div>

      {/* ── Body: Form + Preview ── */}
      <div className="invoice-body">

        {/* ════ FORM ════ */}
        <div className="inv-form-col">

          {/* Invoice Info */}
          <div className="inv-card">
            <h3 className="inv-card-title">
              <span className="inv-card-icon">📋</span> Invoice Information
            </h3>
            <div className="inv-grid-2">
              <div className="inv-fg">
                <label>Invoice No</label>
                <input className="inv-input inv-readonly" value={invoice.invoiceNo} readOnly />
              </div>
              <div className="inv-fg">
                <label>Invoice Date</label>
                <input type="date" className="inv-input" name="invoiceDate"
                  value={invoice.invoiceDate}
                  onChange={(e) => set("invoiceDate", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="inv-card">
            <h3 className="inv-card-title">
              <span className="inv-card-icon">👤</span> Bill To
            </h3>
            <div className="inv-grid-2">
              <div className="inv-fg">
                <label>Client Name *</label>
                <input className="inv-input" placeholder="Enter Name"
                  value={invoice.billTo.name}
                  onChange={(e) => setBillTo("name", e.target.value)} />
              </div>
              <div className="inv-fg">
                <label>Company Name</label>
                <input className="inv-input" placeholder="Enter Company"
                  value={invoice.billTo.company}
                  onChange={(e) => setBillTo("company", e.target.value)} />
              </div>
              <div className="inv-fg">
                <label>Email *</label>
                <input type="email" className="inv-input" placeholder="Enter Email"
                  value={invoice.billTo.email}
                  onChange={(e) => setBillTo("email", e.target.value)} />
              </div>
              <div className="inv-fg">
                <label>Address</label>
                <input className="inv-input" placeholder="City, State"
                  value={invoice.billTo.address}
                  onChange={(e) => setBillTo("address", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="inv-card">
            <div className="inv-card-row">
              <h3 className="inv-card-title">
                <span className="inv-card-icon">🛠</span> Services / Items
              </h3>
              <button onClick={addItem} className="inv-btn-sm">+ Add Item</button>
            </div>
            <div className="inv-table-wrap">
              <table className="inv-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th className="th-sm">Qty</th>
                    <th className="th-md">Rate (₹)</th>
                    <th className="text-right th-md">Amount</th>
                    <th className="th-xs"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <input className="inv-input" placeholder="Service description"
                          value={item.description}
                          onChange={(e) => updItem(idx, "description", e.target.value)} />
                      </td>
                      <td>
                        <input type="number" className="text-center inv-input" min="1"
                          value={item.qty}
                          onChange={(e) => updItem(idx, "qty", e.target.value)} />
                      </td>
                      <td>
                        <input type="number" className="inv-input" min="0"
                          value={item.rate}
                          onChange={(e) => updItem(idx, "rate", e.target.value)} />
                      </td>
                      <td className="td-amount">
                        ₹{(item.qty * item.rate).toLocaleString("en-IN")}
                      </td>
                      <td>
                        {invoice.items.length > 1 && (
                          <button onClick={() => rmItem(idx)} className="inv-rm-btn">×</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Schedule */}
          <div className="inv-card">
            <div className="inv-card-row">
              <h3 className="inv-card-title">
                <span className="inv-card-icon">💳</span> Payment Schedule
              </h3>
              <button onClick={addPay} className="inv-btn-sm">+ Add Payment</button>
            </div>
            <div className="inv-table-wrap">
              <table className="inv-table">
                <thead>
                  <tr>
                    <th>Payment</th>
                    <th>Date</th>
                    <th>Mode</th>
                    <th className="text-right">Amount (₹)</th>
                    <th className="th-xs"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.payments.map((pay, idx) => (
                    <tr key={idx}>
                      <td className="td-label">{pay.label}</td>
                      <td>
                        <input type="date" className="inv-input"
                          value={pay.date}
                          onChange={(e) => updPay(idx, "date", e.target.value)} />
                      </td>
                      <td>
                        <select className="inv-input" value={pay.mode}
                          onChange={(e) => updPay(idx, "mode", e.target.value)}>
                          <option>Bank Transfer</option>
                          <option>UPI</option>
                          <option>Cash</option>
                          <option>Cheque</option>
                        </select>
                      </td>
                      <td>
                        <input type="number" className="text-right inv-input" min="0"
                          value={pay.amount}
                          onChange={(e) => updPay(idx, "amount", e.target.value)} />
                      </td>
                      <td>
                        {invoice.payments.length > 1 && (
                          <button onClick={() => rmPay(idx)} className="inv-rm-btn">×</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Payment summary */}
            <div className="inv-pay-summary">
              <div className="inv-pay-row">
                <span>Total Scheduled</span>
                <span>₹{totalPaid.toLocaleString("en-IN")}</span>
              </div>
              <div className={`inv-pay-row inv-pay-balance ${balance < 0 ? "over" : balance === 0 ? "settled" : ""}`}>
                <span>{balance < 0 ? "Over-scheduled" : balance === 0 ? "✓ Fully Scheduled" : "Balance Due"}</span>
                <span>₹{Math.abs(balance).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Tax & Notes */}
          <div className="inv-card">
            <h3 className="inv-card-title">
              <span className="inv-card-icon">📝</span> Tax &amp; Notes
            </h3>
            <div className="inv-grid-2">
              <div className="inv-fg">
                <label>GST (%)</label>
                <input type="number" className="inv-input" min="0" max="100"
                  value={invoice.gstRate}
                  onChange={(e) => set("gstRate", Number(e.target.value))} />
              </div>
            </div>
            <div className="inv-fg" style={{ marginTop: "14px" }}>
              <label>Notes</label>
              <textarea className="inv-input inv-textarea"
                placeholder="e.g. For any third-party integration feature, contact: kunashmedia@gmail.com"
                value={invoice.notes}
                onChange={(e) => set("notes", e.target.value)} />
            </div>
          </div>
        </div>

        {/* ════ PREVIEW ════ */}
        <div className="inv-preview-col">
          <div className="inv-preview-sticky">
            <div className="inv-preview-card">

              {/* Preview header */}
              <div className="prev-head">
                <img src="/Images/kunash-logo.png" alt="Logo" className="prev-logo"
                  onError={(e) => { e.target.style.display="none"; }} />
                <div className={`prev-badge ${balance === 0 && totalPaid > 0 ? "paid" : ""}`}>
                  {balance === 0 && totalPaid > 0 ? "PAID" : "UNPAID"}
                </div>
              </div>

              {/* Invoice meta */}
              <div className="prev-meta">
                <div>
                  <p className="prev-inv-no">Invoice #{invoice.invoiceNo}</p>
                  <p className="prev-inv-date">{fmtD(invoice.invoiceDate)}</p>
                </div>
              </div>

              {/* Bill to */}
              <div className="prev-section">
                <p className="prev-section-label">BILL TO</p>
                <p className="prev-client-name">{invoice.billTo.name || "Client Name"}</p>
                {invoice.billTo.company && <p className="prev-detail">{invoice.billTo.company}</p>}
                {invoice.billTo.email   && <p className="prev-detail">{invoice.billTo.email}</p>}
                {invoice.billTo.address && <p className="prev-detail">{invoice.billTo.address}</p>}
              </div>

              {/* Services */}
              <div className="prev-section">
                <p className="prev-section-label">SERVICES</p>
                {invoice.items.filter((i) => i.description).map((item, i) => (
                  <div key={i} className="prev-item-row">
                    <span className="prev-item-desc">
                      {item.description}
                      <span className="prev-item-qty"> ×{item.qty}</span>
                    </span>
                    <span className="prev-item-amt">
                      ₹{(item.qty * item.rate).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="prev-totals">
                <div className="prev-total-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="prev-total-row">
                  <span>GST ({invoice.gstRate}%)</span>
                  <span>₹{gstAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="prev-grand-row">
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Payment schedule */}
              {invoice.payments.some((p) => p.amount > 0) && (
                <div className="prev-section">
                  <p className="prev-section-label">PAYMENT SCHEDULE</p>
                  <table className="prev-pay-table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Mode</th>
                        <th className="text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.payments.filter((p) => p.amount > 0).map((p, i) => (
                        <tr key={i}>
                          <td>{p.label}{p.date ? ` (${fmtD(p.date)})` : ""}</td>
                          <td>{p.mode}</td>
                          <td className="font-semibold text-right">
                            ₹{p.amount.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Notes */}
              {invoice.notes && (
                <div className="prev-notes">
                  <span className="prev-notes-label">Note: </span>
                  {invoice.notes}
                </div>
              )}

              {/* Footer */}
              <div className="prev-footer">
                Thank you for your business with Kunash!
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Invoice;