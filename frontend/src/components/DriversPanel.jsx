import { useState, useEffect } from "react";
import { getDrivers } from "../api";

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function DriversPanel() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  async function fetchDrivers() {
    setLoading(true);
    setError(null);
    try {
      const data = await getDrivers();
      setDrivers(data.drivers || []);
      setLastRefresh(new Date().toLocaleTimeString());
    } catch (err) {
      setError("Could not reach backend. Make sure the API is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDrivers();
    // Refresh every 10 seconds
    const interval = setInterval(fetchDrivers, 10000);
    return () => clearInterval(interval);
  }, []);

  const available = drivers.filter((d) => d.status === "available").length;

  return (
    <div>
      {/* Header summary */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div>
          <p className="text-muted" style={{ fontSize: "0.8rem" }}>
            {loading ? "Refreshing…" : `${available} of ${drivers.length} available`}
            {lastRefresh && !loading && (
              <span style={{ marginLeft: "0.5rem", opacity: 0.6 }}>· Updated {lastRefresh}</span>
            )}
          </p>
        </div>
        <button
          id="refresh-drivers-btn"
          className="btn btn-secondary btn-sm"
          onClick={fetchDrivers}
          disabled={loading}
        >
          {loading ? <span className="spinner spinner-light" style={{ width: 14, height: 14, borderWidth: 2 }} /> : "↻"} Refresh
        </button>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {!error && (
        <div className="drivers-list">
          {loading && drivers.length === 0 ? (
            // Skeleton placeholders
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="driver-card" style={{ opacity: 0.4 }}>
                <div className="driver-avatar" style={{ background: "var(--color-surface-2)" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 14, width: "60%", background: "var(--color-surface-2)", borderRadius: 4 }} />
                  <div style={{ height: 11, width: "80%", background: "var(--color-surface-2)", borderRadius: 4, marginTop: 6 }} />
                </div>
              </div>
            ))
          ) : (
            drivers.map((driver) => (
              <div key={driver.id} className="driver-card" id={`driver-${driver.id}`}>
                <div className="driver-avatar">
                  {getInitials(driver.name)}
                </div>
                <div className="driver-info">
                  <div className="driver-name">{driver.name}</div>
                  <div className="driver-vehicle">{driver.vehicle}</div>
                </div>
                <div className="driver-meta">
                  <div className="driver-rating">
                    ⭐ {driver.rating}
                  </div>
                  <span
                    className={`driver-status-badge ${
                      driver.status === "available" ? "badge-available" : "badge-busy"
                    }`}
                  >
                    {driver.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
