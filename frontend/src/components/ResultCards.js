import React, { useState } from "react";

export default function ResultCards({ publications, trials }) {
  const [tab, setTab] = useState("publications");
  if (!publications.length && !trials.length) return null;

  return (
    <div style={s.container}>
      <div style={s.tabRow}>
        <button style={{ ...s.tab, ...(tab === "publications" ? s.activeTab : {}) }} onClick={() => setTab("publications")}>
          Publications <span style={{ ...s.badge, ...(tab === "publications" ? s.activeBadge : {}) }}>{publications.length}</span>
        </button>
        <button style={{ ...s.tab, ...(tab === "trials" ? s.activeTab : {}) }} onClick={() => setTab("trials")}>
          Trials <span style={{ ...s.badge, ...(tab === "trials" ? s.activeBadge : {}) }}>{trials.length}</span>
        </button>
      </div>

      {tab === "publications" && (
        <div>
          {publications.map((p, i) => (
            <div key={i} style={s.card}>
              <div style={s.cardHeader}>
                <span style={{ ...s.sourcePill, background: p.source === "PubMed" ? "#1a2a1a" : "#1a1a2e", color: p.source === "PubMed" ? "#68d391" : "#9f7aea", border: `1px solid ${p.source === "PubMed" ? "#2d5a2d" : "#4a2d6a"}` }}>{p.source}</span>
                <span style={s.year}>{p.year}</span>
              </div>
              <a href={p.url} target="_blank" rel="noreferrer" style={s.title}>{p.title}</a>
              {p.authors?.length > 0 && <div style={s.authors}>{p.authors.slice(0, 2).join(", ")}{p.authors.length > 2 ? " et al." : ""}</div>}
              {p.abstract && p.abstract !== "No abstract available" && (
                <p style={s.abstract}>{p.abstract.slice(0, 120)}...</p>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "trials" && (
        <div>
          {trials.map((t, i) => (
            <div key={i} style={s.card}>
              <div style={s.cardHeader}>
                <span style={{ ...s.sourcePill, background: t.status === "RECRUITING" ? "#0d2a1a" : "#1a1a0d", color: t.status === "RECRUITING" ? "#68d391" : "#f6ad55", border: `1px solid ${t.status === "RECRUITING" ? "#1a4a2a" : "#3a2a0d"}` }}>{t.status}</span>
                <span style={s.year}>{t.phase}</span>
              </div>
              <a href={t.url} target="_blank" rel="noreferrer" style={s.title}>{t.title}</a>
              <div style={s.authors}>{t.locations?.slice(0, 2).join(" · ")}</div>
              <p style={s.abstract}>{t.briefSummary?.slice(0, 120)}...</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  container: { marginTop: "4px" },
  tabRow: { display: "flex", gap: "6px", marginBottom: "12px" },
  tab: { flex: 1, padding: "8px 10px", background: "#111827", border: "1px solid #1e2a3a", borderRadius: "8px", color: "#718096", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontWeight: "500" },
  activeTab: { background: "#1a3a5c", border: "1px solid #3182ce", color: "#63b3ed" },
  badge: { background: "#1e2a3a", color: "#718096", padding: "1px 6px", borderRadius: "10px", fontSize: "10px" },
  activeBadge: { background: "#2a4a7c", color: "#90cdf4" },
  card: { background: "#111827", borderRadius: "10px", padding: "12px", marginBottom: "8px", border: "1px solid #1e2a3a", transition: "border-color 0.2s" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  sourcePill: { padding: "2px 8px", borderRadius: "8px", fontSize: "10px", fontWeight: "600" },
  year: { fontSize: "11px", color: "#4a5568" },
  title: { display: "block", fontSize: "12px", color: "#90cdf4", fontWeight: "500", marginBottom: "4px", textDecoration: "none", lineHeight: "1.4", cursor: "pointer" },
  authors: { fontSize: "11px", color: "#4a5568", marginBottom: "6px" },
  abstract: { fontSize: "11px", color: "#718096", lineHeight: "1.5" }
};
