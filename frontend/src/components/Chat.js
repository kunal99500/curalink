import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import MessageBubble from "./MessageBubble";
import ResultCards from "./ResultCards";

const API = "https://curalink-backend-dabe.onrender.com/api/chat";

const suggestions = [
  "Latest treatment options",
  "Ongoing clinical trials",
  "Recent research studies",
  "Side effects and risks",
  "Alternative therapies",
  "Early diagnosis methods"
];

export default function Chat({ sessionId, patientInfo }) {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: `Hello${patientInfo.patientName ? " **" + patientInfo.patientName + "**" : ""}! I am **Curalink**, your AI medical research assistant.\n\nI will help you find the latest research on **${patientInfo.disease}** using real publications from PubMed, OpenAlex, and clinical trials from ClinicalTrials.gov.\n\nWhat would you like to know?`
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [publications, setPublications] = useState([]);
  const [trials, setTrials] = useState([]);
  const [stats, setStats] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/message`, { sessionId, message: msg }, { timeout: 120000 });
      setMessages(prev => [...prev, { role: "assistant", content: res.data.response }]);
      setPublications(res.data.publications || []);
      setTrials(res.data.trials || []);
      setStats(res.data.stats);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  return (
    <div style={s.page}>
      <div style={s.sidebar}>
        <div style={s.sidebarHeader}>
          <div style={s.brandRow}>
            <div style={s.brandIcon}>C</div>
            <span style={s.brandName}>Curalink</span>
          </div>
        </div>

        <div style={s.patientCard}>
          <div style={s.patientLabel}>Active Session</div>
          {patientInfo.patientName && (
            <div style={s.patientRow}>
              <span style={s.patientKey}>Patient</span>
              <span style={s.patientVal}>{patientInfo.patientName}</span>
            </div>
          )}
          <div style={s.patientRow}>
            <span style={s.patientKey}>Condition</span>
            <span style={s.conditionBadge}>{patientInfo.disease}</span>
          </div>
          {patientInfo.location && (
            <div style={s.patientRow}>
              <span style={s.patientKey}>Location</span>
              <span style={s.patientVal}>{patientInfo.location}</span>
            </div>
          )}
        </div>

        {stats && (
          <div style={s.statsCard}>
            <div style={s.statsTitle}>Research Pipeline</div>
            <div style={s.statsGrid}>
              <div style={s.statBox}>
                <div style={s.statNum}>{stats.pubmedFetched}</div>
                <div style={s.statLabel}>PubMed</div>
              </div>
              <div style={s.statBox}>
                <div style={s.statNum}>{stats.openalexFetched}</div>
                <div style={s.statLabel}>OpenAlex</div>
              </div>
              <div style={s.statBox}>
                <div style={s.statNum}>{stats.trialsFetched}</div>
                <div style={s.statLabel}>Trials</div>
              </div>
              <div style={{ ...s.statBox, background: "#0d2a1a" }}>
                <div style={{ ...s.statNum, color: "#68d391" }}>{stats.afterRanking}</div>
                <div style={s.statLabel}>Top Ranked</div>
              </div>
            </div>
          </div>
        )}

        <div style={s.resultsArea}>
          <ResultCards publications={publications} trials={trials} />
        </div>
      </div>

      <div style={s.main}>
        <div style={s.topBar}>
          <div style={s.topBarLeft}>
            <div style={s.statusDot} />
            <span style={s.statusText}>Researching: <strong style={{ color: "#90cdf4" }}>{patientInfo.disease}</strong></span>
          </div>
          <div style={s.topBarRight}>
            <span style={s.sourceTag}>PubMed</span>
            <span style={s.sourceTag}>OpenAlex</span>
            <span style={s.sourceTag}>ClinicalTrials</span>
          </div>
        </div>

        <div style={s.messages}>
          {messages.map((m, i) => <MessageBubble key={i} message={m} />)}
          {loading && (
            <div style={s.loadingRow}>
              <div style={s.loadingAvatar}>C</div>
              <div style={s.loadingBubble}>
                <div style={s.loadingDots}>
                  {[0,1,2].map(i => <div key={i} style={{ ...s.dot, animationDelay: `${i*0.2}s` }} />)}
                </div>
                <span style={s.loadingText}>Searching research databases...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={s.suggestionsRow}>
          {suggestions.map(sg => (
            <button key={sg} style={s.suggBtn} onClick={() => send(sg + " for " + patientInfo.disease)}>{sg}</button>
          ))}
        </div>

        <div style={s.inputArea}>
          <div style={s.inputWrapper}>
            <input
              ref={inputRef}
              style={s.input}
              placeholder={`Ask about ${patientInfo.disease}...`}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            />
            <button style={{ ...s.sendBtn, ...(loading || !input.trim() ? s.sendBtnDisabled : {}) }}
              onClick={() => send()} disabled={loading || !input.trim()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <p style={s.disclaimer}>Curalink provides research information only. Always consult a qualified healthcare professional.</p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { display: "flex", height: "100vh", background: "#080c14", overflow: "hidden" },
  sidebar: { width: "300px", background: "#0d1117", borderRight: "1px solid #1e2a3a", display: "flex", flexDirection: "column", flexShrink: 0 },
  sidebarHeader: { padding: "20px", borderBottom: "1px solid #1e2a3a" },
  brandRow: { display: "flex", alignItems: "center", gap: "10px" },
  brandIcon: { width: "32px", height: "32px", background: "linear-gradient(135deg,#2b6cb0,#63b3ed)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "16px", color: "white" },
  brandName: { fontSize: "18px", fontWeight: "700", color: "#e2e8f0" },
  patientCard: { margin: "16px", background: "#111827", borderRadius: "12px", padding: "16px", border: "1px solid #1e2a3a" },
  patientLabel: { fontSize: "10px", color: "#4a6fa5", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", fontWeight: "600" },
  patientRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  patientKey: { fontSize: "12px", color: "#718096" },
  patientVal: { fontSize: "12px", color: "#e2e8f0", fontWeight: "500" },
  conditionBadge: { background: "#1a3a5c", color: "#63b3ed", padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "600", border: "1px solid #2a4a7c" },
  statsCard: { margin: "0 16px 16px", background: "#111827", borderRadius: "12px", padding: "16px", border: "1px solid #1e2a3a" },
  statsTitle: { fontSize: "10px", color: "#4a6fa5", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", fontWeight: "600" },
  statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" },
  statBox: { background: "#0d1f35", borderRadius: "8px", padding: "10px", textAlign: "center" },
  statNum: { fontSize: "20px", fontWeight: "700", color: "#63b3ed" },
  statLabel: { fontSize: "10px", color: "#718096", marginTop: "2px" },
  resultsArea: { flex: 1, overflowY: "auto", padding: "0 16px 16px" },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  topBar: { padding: "14px 24px", borderBottom: "1px solid #1e2a3a", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0d1117" },
  topBarLeft: { display: "flex", alignItems: "center", gap: "8px" },
  statusDot: { width: "8px", height: "8px", background: "#38a169", borderRadius: "50%", boxShadow: "0 0 6px #38a169" },
  statusText: { fontSize: "13px", color: "#718096" },
  topBarRight: { display: "flex", gap: "8px" },
  sourceTag: { background: "#111827", border: "1px solid #1e2a3a", borderRadius: "6px", padding: "3px 10px", fontSize: "11px", color: "#4a6fa5" },
  messages: { flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "4px" },
  loadingRow: { display: "flex", alignItems: "flex-start", gap: "12px", animation: "fadeIn 0.3s ease" },
  loadingAvatar: { width: "34px", height: "34px", background: "linear-gradient(135deg,#2b6cb0,#63b3ed)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "white", flexShrink: 0 },
  loadingBubble: { background: "#111827", border: "1px solid #1e2a3a", borderRadius: "16px", borderBottomLeftRadius: "4px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px" },
  loadingDots: { display: "flex", gap: "4px" },
  dot: { width: "7px", height: "7px", background: "#3182ce", borderRadius: "50%", animation: "pulse 1.4s infinite" },
  loadingText: { fontSize: "13px", color: "#718096" },
  suggestionsRow: { padding: "12px 24px", display: "flex", gap: "8px", flexWrap: "wrap", borderTop: "1px solid #1e2a3a" },
  suggBtn: { background: "#111827", color: "#718096", border: "1px solid #1e2a3a", borderRadius: "20px", padding: "6px 14px", fontSize: "12px", cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" },
  inputArea: { padding: "16px 24px 20px", background: "#0d1117", borderTop: "1px solid #1e2a3a" },
  inputWrapper: { display: "flex", gap: "10px", alignItems: "center" },
  input: { flex: 1, padding: "14px 18px", background: "#111827", border: "1px solid #1e2a3a", borderRadius: "12px", color: "#e2e8f0", fontSize: "14px", outline: "none", transition: "border-color 0.2s" },
  sendBtn: { width: "46px", height: "46px", background: "linear-gradient(135deg,#2b6cb0,#3182ce)", border: "none", borderRadius: "12px", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  sendBtnDisabled: { opacity: 0.4, cursor: "not-allowed" },
  disclaimer: { fontSize: "11px", color: "#2d3748", marginTop: "10px", textAlign: "center" }
};
