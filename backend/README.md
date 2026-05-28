# CabNow Backend 🚖 (Uber Clone API Engine)

A robust, premium Python FastAPI web server application designed to handle real-time cab bookings, fare estimations, driver matching, and simulated trip updates.

---

## 🛠️ Features

* **Real-time Fare Estimation:** Calculates fares dynamically based on geodesic GPS distance using the Haversine formula, adjusted by service types (Standard, Premium, Moto).
* **Smart Driver Dispatch:** Matches riders to the nearest available driver using active geolocation sorting.
* **State-Machine Ride Flow:** Seamlessly transitions ride state through:
  `SEARCHING` ➔ `ACCEPTED` ➔ `IN_PROGRESS` ➔ `COMPLETED` / `CANCELLED`
* **Real-time Live Logging:** Prints instant console logs for all major user events.

---

## 🚀 How to Get Started

### 1. Set Up your Python Environment
Make sure you are in the `backend` directory:
```bash
cd "C:\Users\VAIBHAVI\Cabnow uber clone\backend"
```

Create a virtual environment to isolate your packages:
```bash
python -m venv venv
```

Activate the virtual environment:
* **Windows (PowerShell):**
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
* **Windows (CMD):**
  ```cmd
  .\venv\Scripts\activate.bat
  ```

### 2. Install Dependencies
Run pip to install the required libraries:
```bash
pip install -r requirements.txt
```

### 3. Launch the Server
Start the Uvicorn development server:
```bash
uvicorn main:app --reload --port 8000
```

---

## 📡 Core API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| **GET** | `/` | API Information & Health Check |
| **GET** | `/api/drivers` | Retrieve all mock drivers and their locations |
| **POST** | `/api/rides/request` | Initiate a ride request (matching and fare calculation) |
| **POST** | `/api/rides/{ride_id}/accept` | Simulate the assigned driver accepting the ride |
| **GET** | `/api/rides/{ride_id}/status` | Get tracking details & status of an active ride |
| **POST** | `/api/rides/{ride_id}/cancel` | Cancel an active ride request |
