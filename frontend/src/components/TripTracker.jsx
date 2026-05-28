import { useState, useEffect, useRef } from "react";
import { acceptRide, getRideStatus, cancelRide } from "../api";

const STATUS_STEPS = [
  { key: "SEARCHING", emoji: "🔍", label: "Searching" },
  { key: "ACCEPTED", emoji: "✅", label: "Accepted" },
  { key: "IN_PROGRESS", emoji: "🚗", label: "On the Way" },
  { key: "COMPLETED", emoji: "🏁", label: "Arrived" },
];

function stepIndex(status) {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function TripTracker({ ride, onRideComplete, onCancelComplete }) {
  const [rideData, setRideData] = useState(ride);
  const [accepting, setAccepting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(false);
  const pollRef = useRef(null);

  // Poll ride status when in active states
  useEffect(() => {
    const activeStates = ["ACCEPTED", "IN_PROGRESS"];
    if (activeStates.includes(rideData.status)) {
      setPolling(true);
      pollRef.current = setInterval(async () => {
        try {
          const updated = await getRideStatus(rideData.ride_id);
          setRideData(updated);
          if (updated.status === "COMPLETED") {
            clearInterval(pollRef.current);
            setPolling(false);
          }
        } catch {
          // silently ignore poll errors
        }
      }, 3000);
    }
    return () => clearInterval(pollRef.current);
  }, [rideData.status, rideData.ride_id]);

  async function handleAccept() {
    setAccepting(true);
    setError(null);
    try {
      const updated = await acceptRide(rideData.ride_id);
      setRideData(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setAccepting(false);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    setError(null);
    try {
      const result = await cancelRide(rideData.ride_id);
      setRideData(result.ride);
      onCancelComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  }

  const currentStep = stepIndex(rideData.status);
  const driver = rideData.driver || rideData.driver_offer;

  // ---- Completed UI ----
  if (rideData.status === "COMPLETED") {
    return (
      <div className="ride-complete-banner">
        <div className="icon">🎉</div>
        <h2>Ride Complete!</h2>
        <p>
          You've arrived at <strong>{rideData.destination?.address}</strong>.<br />
          Total fare: <strong className="text-yellow">
            ${rideData.fare_amount}
          </strong>
        </p>
        <button
          id="book-another-btn"
          className="btn btn-primary"
          style={{ width: "auto", padding: "0.7rem 2rem" }}
          onClick={onRideComplete}
        >
          Book Another Ride
        </button>
      </div>
    );
  }

  // ---- Cancelled UI ----
  if (rideData.status === "CANCELLED") {
    return (
      <div className="alert alert-error" style={{ padding: "1.5rem", borderRadius: "var(--radius-md)", textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>❌</div>
        <strong>Ride Cancelled</strong>
        <p style={{ marginTop: "0.3rem", fontSize: "0.85rem" }}>Your ride has been cancelled.</p>
      </div>
    );
  }

  return (
    <div className="trip-tracker">
      {/* Ride ID header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <div>
          <span className="text-muted" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Ride ID
          </span>
          <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.5px" }}>
            #{rideData.ride_id}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <span className="text-muted" style={{ fontSize: "0.78rem" }}>Fare</span>
          <div className="fare-price" style={{ fontSize: "1.3rem" }}>${rideData.fare_amount}</div>
        </div>
      </div>

      {/* Route summary */}
      <div style={{ background: "var(--color-surface-2)", borderRadius: "var(--radius-sm)", padding: "0.8rem 1rem", marginBottom: "1rem", fontSize: "0.82rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
          <span>📍</span>
          <span className="text-muted">From:</span>
          <span style={{ fontWeight: 600 }}>{rideData.pickup?.address}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>🏁</span>
          <span className="text-muted">To:</span>
          <span style={{ fontWeight: 600 }}>{rideData.destination?.address}</span>
        </div>
        <div style={{ display: "flex", gap: "1rem", marginTop: "0.6rem" }}>
          <span><span className="text-muted">Distance:</span> <strong>{rideData.distance_km} km</strong></span>
          <span><span className="text-muted">Type:</span> <strong>{rideData.ride_type}</strong></span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="status-steps">
        {STATUS_STEPS.map((step, i) => (
          <div key={step.key} className="status-step">
            <div
              className={`step-circle ${i < currentStep ? "done" : i === currentStep ? "active" : ""}`}
            >
              {i < currentStep ? "✓" : step.emoji}
            </div>
            <span className={`step-label ${i === currentStep ? "active-label" : ""}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* No drivers */}
      {rideData.status === "NO_DRIVERS_AVAILABLE" && (
        <div className="alert alert-error">
          🚫 No drivers available nearby. Please try again in a moment.
        </div>
      )}

      {/* Driver offer card (SEARCHING state) */}
      {rideData.status === "SEARCHING" && driver && (
        <div className="driver-confirmed">
          <div className="driver-avatar" style={{ width: 52, height: 52, fontSize: "1.3rem" }}>
            {getInitials(driver.name)}
          </div>
          <div className="driver-confirmed-info" style={{ flex: 1 }}>
            <h3>{driver.name}</h3>
            <p>{driver.vehicle}</p>
            <p style={{ marginTop: "0.2rem" }}>⭐ {driver.rating} · {driver.phone}</p>
            <div className="eta" style={{ color: "var(--color-yellow)" }}>Driver ready to accept</div>
          </div>
        </div>
      )}

      {/* Accepted/In progress driver card */}
      {["ACCEPTED", "IN_PROGRESS"].includes(rideData.status) && driver && (
        <div className="driver-confirmed">
          <div className="driver-avatar" style={{ width: 52, height: 52, fontSize: "1.3rem" }}>
            {getInitials(driver.name)}
          </div>
          <div className="driver-confirmed-info" style={{ flex: 1 }}>
            <h3>{driver.name}</h3>
            <p>{driver.vehicle}</p>
            <p style={{ marginTop: "0.2rem" }}>⭐ {driver.rating} · {driver.phone}</p>
            {rideData.estimated_arrival_minutes && (
              <div className="eta">
                {rideData.status === "ACCEPTED"
                  ? `🕐 Arriving in ~${rideData.estimated_arrival_minutes} min`
                  : "🚗 Your ride is on its way!"}
              </div>
            )}
          </div>
          {polling && (
            <span className="spinner spinner-light" style={{ width: 16, height: 16 }} />
          )}
        </div>
      )}

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Action buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "1rem" }}>
        {rideData.status === "SEARCHING" && driver && (
          <button
            id="accept-ride-btn"
            className="btn btn-primary"
            onClick={handleAccept}
            disabled={accepting}
          >
            {accepting ? <><span className="spinner" /> Confirming…</> : "✅ Confirm Driver"}
          </button>
        )}

        {!["COMPLETED", "CANCELLED", "NO_DRIVERS_AVAILABLE"].includes(rideData.status) && (
          <button
            id="cancel-ride-btn"
            className="btn btn-danger"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? <><span className="spinner spinner-light" style={{ borderTopColor: "var(--color-red)" }} /> Cancelling…</> : "✕ Cancel Ride"}
          </button>
        )}
      </div>
    </div>
  );
}
