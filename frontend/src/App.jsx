import { useState } from "react";

function App() {
  const [status, setStatus] = useState("Not connected");
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/health");

      if (!response.ok) {
        throw new Error("Backend request failed");
      }

      const data = await response.json();

      setStatus(`🟢 ${data.status} — ${data.environment}`);
    } catch (error) {
      console.error(error);
      setStatus("🔴 Backend connection failed");
    }

    setLoading(false);
  };

  return (
    <div>
      <h1>SOVEREIGN AI WORKBENCH</h1>

      <p>
        Confidential AI • On-Premise • Secure
      </p>

      <hr />

      <h2>Backend Status</h2>

      <p>{status}</p>

      <button onClick={testConnection} disabled={loading}>
        {loading ? "Connecting..." : "Test Connection"}
      </button>
    </div>
  );
}

export default App;