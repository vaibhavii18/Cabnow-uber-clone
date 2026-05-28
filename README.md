# CabNow 🚖 (Uber Clone)

Welcome to **CabNow**, a premium, modern ride-booking web application inspired by Uber. CabNow is built to handle dynamic ride requests, fare estimations, geolocation-based driver dispatch, and interactive trip tracking.

---

## 🏗️ Project Architecture

The application is structured into two main components:

* **`/backend`:** A high-performance REST API built using **Python FastAPI** and **Uvicorn**. It handles coordinates logic, fare calculations, active driver lists, and trip state management.
* **`/frontend`:** A modern single-page dashboard built using **React (Vite)** and CSS (designed for high-fidelity animations, map integration, and responsive layout). *(Ready for implementation!)*

---

## 🛠️ Tech Stack

* **Backend Engine:** Python, FastAPI, Uvicorn, Pydantic
* **Frontend Platform:** React.js, Vite, Vanilla CSS
* **Tracking & Maps:** Custom geocoordinate tracking and simulated path distance (Haversine formula)

---

## 📂 Repository Structure

```text
Cabnow uber clone/
│
├── backend/                 # Python ASGI REST API Infrastructure
│   ├── main.py              # FastAPI Application Core Engine
│   ├── requirements.txt     # Python Packages Dependencies
│   └── README.md            # Backend Setup & Execution Guide
│
├── frontend/                # React.js Client Canvas Dashboard
│
└── .gitignore               # Multi-layer Version Control Exclusions
```

---

## 🚀 Getting Started

### 1. Launching the Backend API
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Activate your virtual environment and install dependencies:
   ```bash
   venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Run the development server:
   ```bash
   uvicorn main:app --reload
   ```

The backend API will be live at `http://127.0.0.1:8000`. You can explore the interactive OpenAPI documentation at `http://127.0.0.1:8000/docs`.

### 2. Setting Up the Frontend
To set up the frontend, navigate to the `frontend` folder, install standard web dependencies, and launch your bundler (Vite).
