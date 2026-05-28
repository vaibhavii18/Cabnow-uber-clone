import { useState } from "react";
import { requestRide } from "../api";

// Predefined locations for easy demo
const LOCATIONS = [
  { label: "Times Square", address: "Times Square, NYC", latitude: 40.758, longitude: -73.9855 },
  { label: "JFK Airport", address: "JFK Airport, NYC", latitude: 40.6413, longitude: -73.7781 },
  { label: "Central Park", address: "Central Park, NYC", latitude: 40.7851, longitude: -73.9683 },
  { label: "Brooklyn Bridge", address: "Brooklyn Bridge, NYC", latitude: 40.7061, longitude: -73.9969 },
  { label: "Statue of Liberty", address: "Statue of Liberty, NYC", latitude: 40.6892, longitude: -74.0445 },
  { label: "Empire State", address: "Empire State Building, NYC", latitude: 40.7484, longitude: -73.9967 },
];

const RIDE_TYPES = [
  { id: "Standard", emoji: "🚗", label: "Standard", desc: "Everyday comfort" },
  { id: "Premium", emoji: "🚘", label: "Premium", desc: "Luxury ride" },
  { id: "Moto", emoji: "🏍️", label: "Moto", desc: "Fast & cheap" },
];

export default function BookingForm({ onRideRequested }) {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [rideType, setRideType] = useState("Standard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function getLocation(value) {
    return LOCATIONS.find((l) => l.label === value) || null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const pickupLoc = getLocation(pickup);
    const destLoc = getLocation(destination);

    if (!pickupLoc || !destLoc) {
      setError("Please select both a pickup and a destination from the list.");
      return;
    }

    if (pickup === destination) {
      setError("Pickup and destination must be different locations.");
      return;
    }

    setLoading(true);
    try {
      const ride = await requestRide(
        { latitude: pickupLoc.latitude, longitude: pickupLoc.longitude, address: pickupLoc.address },
        { latitude: destLoc.latitude, longitude: destLoc.longitude, address: destLoc.address },
        rideType
      );
      onRideRequested(ride);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} id="booking-form">
      {/* Pickup */}
      <div className="form-group">
        <label className="form-label" htmlFor="pickup-select">📍 Pickup Location</label>
        <select
          id="pickup-select"
          className="form-input"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
          required
        >
          <option value="">Select pickup…</option>
          {LOCATIONS.map((l) => (
            <option key={l.label} value={l.label}>{l.label}</option>
          ))}
        </select>
      </div>

      {/* Destination */}
      <div className="form-group">
        <label className="form-label" htmlFor="dest-select">🏁 Destination</label>
        <select
          id="dest-select"
          className="form-input"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          required
        >
          <option value="">Select destination…</option>
          {LOCATIONS.map((l) => (
            <option key={l.label} value={l.label}>{l.label}</option>
          ))}
        </select>
      </div>

      {/* Ride Type */}
      <div className="form-group">
        <label className="form-label">🚕 Ride Type</label>
        <div className="ride-type-grid">
          {RIDE_TYPES.map((rt) => (
            <button
              key={rt.id}
              type="button"
              id={`ride-type-${rt.id.toLowerCase()}`}
              className={`ride-type-btn ${rideType === rt.id ? "active" : ""}`}
              onClick={() => setRideType(rt.id)}
            >
              <span className="ride-type-emoji">{rt.emoji}</span>
              {rt.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <button
        type="submit"
        id="book-ride-btn"
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner" />
            Finding your ride…
          </>
        ) : (
          "🚖 Book Ride Now"
        )}
      </button>
    </form>
  );
}
