import React from "react";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  const renderContent = (text) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("## ")) return <h3 key={i} style={s.h3}>{line.replace("## ", "")}</h3>;
      if (line.startsWith("# ")) return <h2 key={i} style={s.h2}>{line.replace("# ", "")}</h2>;
      if (line.match(/^\d+\./)) return <p key={i} style={s.numbered}>{formatInline(line)}</p>;
      if (line.startsWith("- ")) return <p key={i} style={s.bullet}>• {formatInline(line.slice(2))}</p>;
      if (line.trim() === "") return <div key={i} style={{ height: "8px" }} />;
      return <p key={i} style={s.para}>{formatInline(line)}</p>;
    });
  };

  const formatInline = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith("**") && part.endsWith("**")
        ? <strong key={i} style={s.bold}>{part.slice(2, -2)}</strong>
        : part
    );
  };

  return (
    <div style={{ ...s.row, justifyContent: isUser ? "flex-end" : "flex-start", animation: "fadeIn 0.3s ease" }}>
      {!isUser && <div style={s.avatar}>C</div>}
      <div style={{ ...s.bubble, ...(isUser ? s.userBubble : s.aiBubble) }}>
        {renderContent(message.content)}
      </div>
      {isUser && <div style={s.userAvatar}>U</div>}
    </div>
  );
}

const s = {
  row: { display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "16px" },
  avatar: { width: "34px", height: "34px", background: "linear-gradient(135deg,#2b6cb0,#63b3ed)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "white", flexShrink: 0, marginTop: "2px" },
  userAvatar: { width: "34px", height: "34px", background: "#2d3748", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "#a0aec0", flexShrink: 0, marginTop: "2px" },
  bubble: { maxWidth: "72%", padding: "14px 18px", borderRadius: "18px", fontSize: "14px", lineHeight: "1.6" },
  userBubble: { background: "linear-gradient(135deg,#2b6cb0,#3182ce)", color: "white", borderBottomRightRadius: "4px" },
  aiBubble: { background: "#111827", border: "1px solid #1e2a3a", color: "#e2e8f0", borderBottomLeftRadius: "4px" },
  h2: { fontSize: "16px", fontWeight: "700", color: "#90cdf4", marginBottom: "8px", marginTop: "4px" },
  h3: { fontSize: "14px", fontWeight: "600", color: "#63b3ed", marginBottom: "6px", marginTop: "4px" },
  para: { marginBottom: "6px", color: "#cbd5e0", lineHeight: "1.7" },
  numbered: { marginBottom: "6px", color: "#cbd5e0", paddingLeft: "4px" },
  bullet: { marginBottom: "4px", color: "#cbd5e0", paddingLeft: "8px" },
  bold: { color: "#90cdf4", fontWeight: "600" }
};
