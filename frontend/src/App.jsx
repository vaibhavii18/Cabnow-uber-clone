import { useState } from "react";
import "./index.css";
import BookingForm from "./components/BookingForm";
import DriversPanel from "./components/DriversPanel";
import TripTracker from "./components/TripTracker";

export default function App() {
  const [activeRide, setActiveRide] = useState(null);
  const [view, setView] = useState("book"); // "book" | "track"

  function handleRideRequested(ride) {
    setActiveRide(ride);
    setView("track");
  }

  function handleRideComplete() {
    setActiveRide(null);
    setView("book");
  }

  return (
    <div className="app-wrapper">
      {/* ---- Navbar ---- */}
      <nav className="navbar">
        <a className="navbar-logo" href="#" onClick={() => { setView("book"); setActiveRide(null); }}>
          🚖 Cab<span>Now</span>
          <span className="navbar-badge">NYC</span>
        </a>
        <div className="navbar-status">
          <span className="status-dot" />
          API Online
        </div>
      </nav>

      {/* ---- Hero ---- */}
      {view === "book" && (
        <section className="hero">
          <h1>
            Your ride,<br />
            <em>your way.</em>
          </h1>
          <p>Book a cab in seconds. Real-time driver matching, instant fare estimates.</p>
        </section>
      )}

      {/* ---- Main Content ---- */}
      <main className="main-content">
        {/* LEFT COLUMN */}
        <div>
          {view === "book" ? (
            <div className="card">
              <div className="card-header">
                <span className="card-icon">🗺️</span>
                <div>
                  <div className="card-title">Book a Ride</div>
                  <div className="card-subtitle">Pick your location and ride type</div>
                </div>
              </div>
              <BookingForm onRideRequested={handleRideRequested} />
            </div>
          ) : (
            <div className="card">
              <div className="card-header">
                <span className="card-icon">📡</span>
                <div>
                  <div className="card-title">Trip Tracker</div>
                  <div className="card-subtitle">Live status of your ride</div>
                </div>
              </div>
              {activeRide && (
                <TripTracker
                  ride={activeRide}
                  onRideComplete={handleRideComplete}
                  onCancelComplete={handleRideComplete}
                />
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN — always show drivers panel */}
        <div>
          <div className="card">
            <div className="card-header">
              <span className="card-icon">🧑‍✈️</span>
              <div>
                <div className="card-title">Active Drivers</div>
                <div className="card-subtitle">Nearby drivers in New York City</div>
              </div>
            </div>
            <DriversPanel />
          </div>

          {/* Fare guide */}
          <div className="card" style={{ marginTop: "1.2rem" }}>
            <div className="card-header">
              <span className="card-icon">💰</span>
              <div>
                <div className="card-title">Fare Guide</div>
                <div className="card-subtitle">Transparent pricing per ride type</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {[
                { type: "🚗 Standard", base: "$3.50", rate: "$1.80/km", multiplier: "1x" },
                { type: "🚘 Premium", base: "$6.00", rate: "$3.00/km", multiplier: "1.5x" },
                { type: "🏍️ Moto", base: "$2.00", rate: "$1.00/km", multiplier: "0.8x" },
              ].map((row) => (
                <div
                  key={row.type}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "var(--color-surface-2)",
                    borderRadius: "var(--radius-sm)",
                    padding: "0.65rem 0.9rem",
                    fontSize: "0.82rem",
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{row.type}</span>
                  <span className="text-muted">{row.base} + {row.rate}</span>
                  <span className="text-yellow" style={{ fontWeight: 700 }}>{row.multiplier}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ---- Footer ---- */}
      <footer className="footer">
        Built with ❤️ · <span>CabNow</span> Uber Clone · FastAPI + React
      </footer>
    </div>
  );
}
