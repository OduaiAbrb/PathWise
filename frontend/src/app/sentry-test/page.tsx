"use client";

import * as Sentry from "@sentry/nextjs";

export default function SentryTestPage() {
  const throwError = () => {
    throw new Error("Sentry frontend test error - PathWise");
  };

  const captureMessage = () => {
    Sentry.captureMessage("Test message from PathWise frontend");
    alert("Message sent to Sentry!");
  };

  return (
    <div style={{ padding: 48, fontFamily: "system-ui" }}>
      <h1>Sentry Test Page</h1>
      <p>Click the buttons below to test Sentry integration:</p>
      
      <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
        <button
          onClick={throwError}
          style={{
            padding: "12px 24px",
            background: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Throw Error
        </button>
        
        <button
          onClick={captureMessage}
          style={{
            padding: "12px 24px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Send Test Message
        </button>
      </div>
    </div>
  );
}
