import React, { useState } from "react";
import Setup from "./components/Setup";
import Chat from "./components/Chat";

export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);

  const handleSetup = (id, info) => {
    setSessionId(id);
    setPatientInfo(info);
  };

  return sessionId
    ? <Chat sessionId={sessionId} patientInfo={patientInfo} />
    : <Setup onSetup={handleSetup} />;
}
