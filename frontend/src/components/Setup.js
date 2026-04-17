import React, { useState } from "react";
import axios from "axios";

const API = "https://curalink-backend-dabe.onrender.com/api/chat";

const conditions = ["Parkinson's disease","Lung cancer","Type 2 Diabetes","Alzheimer's disease","Heart disease","Breast cancer"];

export default function Setup({ onSetup }) {
  const [form, setForm] = useState({ patientName: "", disease: "", location: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState("");

  const handle = async (e) => {
    e.preventDefault();
    if (!form.disease.trim()) { setError("Please enter a condition to research."); return; }
    setLoading(true); setError("");
    try {
      const res = await axios.post(`${API}/session`, form);
      onSetup(res.data.sessionId, form);
    } catch {
      setError("Cannot connect to server. Make sure backend is running on port 5000.");
    }
    setLoading(false);
  };

  return (
    <div style={s.page}>
      <div style={s.bg} />
      <div style={s.card}>
        <div style={s.logoRow}>
          <div style={s.logoIcon}>C</div>
          <div>
            <div style={s.logoText}>Curalink</div>
            <div style={s.logoSub}>AI Medical Research Assistant</div>
          </div>
        </div>

        <div style={s.divider} />

        <p style={s.desc}>Enter your details to get personalized, research-backed medical insights powered by real publications and clinical trials.</p>

        <form onSubmit={handle}>
          {[
            { key: "patientName", label: "Patient Name", placeholder: "e.g. John Smith", required: false },
            { key: "disease", label: "Condition / Disease", placeholder: "e.g. Parkinson's disease", required: true },
            { key: "location", label: "Location", placeholder: "e.g. Mumbai, India", required: false },
          ].map(({ key, label, placeholder, required }) => (
            <div key={key} style={s.field}>
              <label style={s.label}>{label}{required && <span style={s.req}> *</span>}</label>
              <input
                style={{ ...s.input, ...(focused === key ? s.inputFocused : {}) }}
                placeholder={placeholder}
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                onFocus={() => setFocused(key)}
                onBlur={() => setFocused("")}
              />
            </div>
          ))}

          {error && <div style={s.error}>{error}</div>}

          <button style={{ ...s.btn, ...(loading ? s.btnLoading : {}) }} type="submit" disabled={loading}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <span style={s.spinner} />  Starting session...
              </span>
            ) : "Start Research Session ?"}
          </button>
        </form>

        <div style={s.tagsSection}>
          <p style={s.tagsLabel}>Quick select:</p>
          <div style={s.tags}>
            {conditions.map(d => (
              <span key={d} style={{ ...s.tag, ...(form.disease === d ? s.tagActive : {}) }}
                onClick={() => setForm({ ...form, disease: d })}>{d}</span>
            ))}
          </div>
        </div>

        <div style={s.footer}>
          <div style={s.footerItem}><span style={s.dot} />PubMed</div>
          <div style={s.footerItem}><span style={s.dot} />OpenAlex</div>
          <div style={s.footerItem}><span style={s.dot} />ClinicalTrials.gov</div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#080c14", padding: "20px", position: "relative", overflow: "hidden" },
  bg: { position: "absolute", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(49,130,206,0.08) 0%, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" },
  card: { background: "#0d1117", border: "1px solid #1e2a3a", borderRadius: "20px", padding: "40px", width: "100%", maxWidth: "500px", position: "relative", zIndex: 1, boxShadow: "0 25px 50px rgba(0,0,0,0.5)" },
  logoRow: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" },
  logoIcon: { width: "48px", height: "48px", background: "linear-gradient(135deg, #3182ce, #63b3ed)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "800", color: "white" },
  logoText: { fontSize: "24px", fontWeight: "700", color: "#e2e8f0" },
  logoSub: { fontSize: "12px", color: "#4a6fa5", marginTop: "2px" },
  divider: { height: "1px", background: "#1e2a3a", margin: "0 0 20px" },
  desc: { fontSize: "13px", color: "#718096", lineHeight: "1.7", marginBottom: "28px" },
  field: { marginBottom: "18px" },
  label: { display: "block", fontSize: "12px", fontWeight: "600", color: "#a0aec0", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" },
  req: { color: "#fc8181" },
  input: { width: "100%", padding: "13px 16px", background: "#111827", border: "1px solid #1e2a3a", borderRadius: "10px", color: "#e2e8f0", fontSize: "14px", outline: "none", transition: "border-color 0.2s" },
  inputFocused: { borderColor: "#3182ce" },
  btn: { width: "100%", padding: "15px", background: "linear-gradient(135deg, #2b6cb0, #3182ce)", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "600", cursor: "pointer", marginTop: "8px", transition: "opacity 0.2s" },
  btnLoading: { opacity: 0.7, cursor: "not-allowed" },
  spinner: { width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" },
  error: { background: "#2d1515", border: "1px solid #c53030", borderRadius: "8px", padding: "12px 16px", fontSize: "13px", color: "#fc8181", marginBottom: "16px" },
  tagsSection: { marginTop: "28px" },
  tagsLabel: { fontSize: "11px", color: "#4a5568", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" },
  tags: { display: "flex", flexWrap: "wrap", gap: "8px" },
  tag: { padding: "6px 14px", background: "#111827", border: "1px solid #1e2a3a", borderRadius: "20px", fontSize: "12px", color: "#718096", cursor: "pointer", transition: "all 0.2s" },
  tagActive: { background: "#1a3a5c", border: "1px solid #3182ce", color: "#63b3ed" },
  footer: { display: "flex", gap: "20px", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #1e2a3a" },
  footerItem: { display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#4a5568" },
  dot: { width: "6px", height: "6px", background: "#38a169", borderRadius: "50%", display: "inline-block" }
};
