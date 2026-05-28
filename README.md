# CabNow 🚖 (Uber Clone)

Welcome to **CabNow**, a premium, modern ride-booking web application inspired by Uber. CabNow handles dynamic ride requests, fare estimations, geolocation-based driver dispatch, and interactive trip tracking.

---

## 🏗️ Project Architecture

```
Cabnow-uber-clone/
│
├── backend/                 # Python FastAPI REST API
│   ├── main.py              # Core API engine (drivers, rides, tracking)
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment variable template
│
├── frontend/                # React (Vite) SPA
│   ├── src/
│   │   ├── App.jsx          # Root component & app state
│   │   ├── main.jsx         # React entry point
│   │   ├── index.css        # Global design system (dark mode, variables)
│   │   ├── api.js           # Backend API client
│   │   └── components/
│   │       ├── BookingForm.jsx   # Ride booking form
│   │       ├── DriversPanel.jsx  # Live driver list with auto-refresh
│   │       └── TripTracker.jsx   # Live trip status & accept/cancel
│   └── index.html           # HTML entry point
│
└── .gitignore
```

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| **Backend** | Python, FastAPI, Uvicorn, Pydantic |
| **Frontend** | React 19, Vite 6, Vanilla CSS |
| **Algorithms** | Haversine distance formula, dynamic fare pricing |

---

## 🚀 Getting Started

### 1. Launch the Backend API

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be live at `http://127.0.0.1:8000`.  
Explore the docs at `http://127.0.0.1:8000/docs`.

### 2. Launch the Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be live at `http://localhost:5173`.

> **Important:** Run the backend first. The frontend connects to `http://127.0.0.1:8000` automatically.

---

## ✨ Features

- 🗺️ **Ride Booking** — Select pickup/destination from NYC landmarks, choose Standard / Premium / Moto
- 💰 **Instant Fare Estimate** — Haversine-based distance + dynamic pricing by ride type
- 🧑‍✈️ **Driver Matching** — Nearest available driver is matched automatically
- 📡 **Live Trip Tracking** — Status progresses: Searching → Accepted → In Progress → Completed
- ↻ **Auto-refresh Drivers Panel** — Refreshes every 10 seconds
- ❌ **Cancel Anytime** — Cancel before or during the ride

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/drivers` | List all drivers + availability |
| `POST` | `/api/rides/request` | Create a new ride request |
| `POST` | `/api/rides/{id}/accept` | Accept driver offer |
| `GET` | `/api/rides/{id}/status` | Poll current ride status |
| `POST` | `/api/rides/{id}/cancel` | Cancel the ride |
