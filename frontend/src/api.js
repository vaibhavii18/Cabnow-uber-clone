const BASE_URL = "http://127.0.0.1:8000";

export async function getDrivers() {
  const res = await fetch(`${BASE_URL}/api/drivers`);
  if (!res.ok) throw new Error("Failed to fetch drivers");
  return res.json();
}

export async function requestRide(pickup, destination, rideType) {
  const res = await fetch(`${BASE_URL}/api/rides/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pickup,
      destination,
      ride_type: rideType,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to request ride");
  }
  return res.json();
}

export async function acceptRide(rideId) {
  const res = await fetch(`${BASE_URL}/api/rides/${rideId}/accept`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to accept ride");
  }
  return res.json();
}

export async function getRideStatus(rideId) {
  const res = await fetch(`${BASE_URL}/api/rides/${rideId}/status`);
  if (!res.ok) throw new Error("Failed to get ride status");
  return res.json();
}

export async function cancelRide(rideId) {
  const res = await fetch(`${BASE_URL}/api/rides/${rideId}/cancel`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to cancel ride");
  }
  return res.json();
}
