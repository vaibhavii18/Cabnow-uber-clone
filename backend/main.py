import uuid
import math
import random
import logging
from typing import List, Dict, Optional
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

# Initialize logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger("cabnow-backend")

app = FastAPI(
    title="CabNow API (Uber Clone)",
    description="A Python FastAPI backend for ride booking, tracking, and driver dispatch.",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================================
# 1. DATA MODELS & SIMULATED DATABASES
# =====================================================================

class Location(BaseModel):
    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")
    address: str = Field(..., description="Human-readable address name")

class RideRequest(BaseModel):
    pickup: Location
    destination: Location
    ride_type: str = Field("Standard", description="Type of ride (e.g. Standard, Premium, Moto)")

class RideUpdate(BaseModel):
    status: str

# Simulated Drivers Database (Real-time tracking of available drivers in New York City area)
DRIVERS_DB = [
    {
        "id": "driver_01",
        "name": "Alex Mercer",
        "vehicle": "Toyota Prius (Black) - NY982X",
        "phone": "+1 (555) 123-4567",
        "rating": 4.9,
        "latitude": 40.7128,
        "longitude": -74.0060,
        "status": "available"
    },
    {
        "id": "driver_02",
        "name": "Sophia Rodriguez",
        "vehicle": "Tesla Model 3 (White) - NY104A",
        "phone": "+1 (555) 987-6543",
        "rating": 4.8,
        "latitude": 40.7250,
        "longitude": -73.9980,
        "status": "available"
    },
    {
        "id": "driver_03",
        "name": "Marcus Vance",
        "vehicle": "Hyundai Sonata (Silver) - NY745Z",
        "phone": "+1 (555) 456-7890",
        "rating": 4.7,
        "latitude": 40.7090,
        "longitude": -74.0130,
        "status": "available"
    }
]

# Simulated Rides Database
RIDES_DB: Dict[str, dict] = {}

# =====================================================================
# 2. UTILITY FUNCTIONS
# =====================================================================

def calculate_distance(loc1: Location, loc2: Location) -> float:
    """
    Calculates the Haversine distance in kilometers between two GPS coordinates.
    """
    R = 6371.0 # Earth's radius in kilometers
    
    lat1 = math.radians(loc1.latitude)
    lon1 = math.radians(loc1.longitude)
    lat2 = math.radians(loc2.latitude)
    lon2 = math.radians(loc2.longitude)
    
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    
    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c
    return round(distance, 2)

def calculate_fare(distance_km: float, ride_type: str) -> float:
    """
    Calculates the ride fare based on distance and type of service.
    """
    base_fare = 3.50
    rate_per_km = 1.80
    multiplier = 1.0
    
    if ride_type.lower() == "premium":
        base_fare = 6.00
        rate_per_km = 3.00
        multiplier = 1.5
    elif ride_type.lower() == "moto":
        base_fare = 2.00
        rate_per_km = 1.00
        multiplier = 0.8
        
    total_fare = (base_fare + (distance_km * rate_per_km)) * multiplier
    return round(total_fare, 2)

def find_nearest_driver(pickup_loc: Location) -> Optional[dict]:
    """
    Finds the closest available driver to the pickup location.
    """
    nearest_driver = None
    min_distance = float('inf')
    
    for driver in DRIVERS_DB:
        if driver["status"] == "available":
            driver_loc = Location(
                latitude=driver["latitude"],
                longitude=driver["longitude"],
                address="Driver Current Location"
            )
            dist = calculate_distance(pickup_loc, driver_loc)
            if dist < min_distance:
                min_distance = dist
                nearest_driver = driver
                
    return nearest_driver

# =====================================================================
# 3. ROUTE IMPLEMENTATION
# =====================================================================

@app.get("/")
def home():
    """
    Welcome endpoint.
    """
    return {
        "app": "CabNow Backend",
        "description": "Premium Ride-Booking API Engine (Uber Clone)",
        "status": "active",
        "endpoints": {
            "get_drivers": "/api/drivers",
            "request_ride": "/api/rides/request",
            "ride_status": "/api/rides/{ride_id}/status"
        }
    }

@app.get("/api/drivers")
def get_drivers():
    """
    Retrieve all simulated drivers and their current locations.
    """
    logger.info("Fetching all simulated drivers")
    return {"drivers": DRIVERS_DB}

@app.post("/api/rides/request", status_code=status.HTTP_201_CREATED)
def request_ride(request: RideRequest):
    """
    Initiate a ride booking request. Calculates distance, price, and matches with the nearest driver.
    """
    logger.info(f"Received ride request from '{request.pickup.address}' to '{request.destination.address}'")
    
    # Calculate distance and price
    distance = calculate_distance(request.pickup, request.destination)
    if distance < 0.1:
        raise HTTPException(
            status_code=400,
            detail="Pickup and destination must be different locations."
        )
        
    fare = calculate_fare(distance, request.ride_type)
    
    # Try matching with nearest driver
    matched_driver = find_nearest_driver(request.pickup)
    
    ride_id = str(uuid.uuid4())[:8] # short easy-to-read ID
    
    ride_details = {
        "ride_id": ride_id,
        "pickup": request.pickup.model_dump(),
        "destination": request.destination.model_dump(),
        "ride_type": request.ride_type,
        "distance_km": distance,
        "fare_amount": fare,
        "status": "SEARCHING" if matched_driver else "NO_DRIVERS_AVAILABLE",
        "driver": None,
        "estimated_arrival_minutes": None
    }
    
    if matched_driver:
        # Match driver but keep status as "SEARCHING" (to simulate driver accepting the offer)
        ride_details["driver_offer"] = matched_driver
        logger.info(f"Ride {ride_id}: Found potential match - Driver {matched_driver['name']}")
    else:
        logger.warning(f"Ride {ride_id}: No available drivers found nearby.")
        
    # Store ride in-memory
    RIDES_DB[ride_id] = ride_details
    return ride_details

@app.post("/api/rides/{ride_id}/accept")
def accept_ride(ride_id: str):
    """
    Simulate the driver accepting the ride offer.
    """
    if ride_id not in RIDES_DB:
        raise HTTPException(status_code=404, detail="Ride not found.")
        
    ride = RIDES_DB[ride_id]
    
    if ride["status"] != "SEARCHING":
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot accept a ride with status: {ride['status']}"
        )
        
    driver = ride.pop("driver_offer", None)
    if not driver:
        raise HTTPException(status_code=400, detail="No driver is assigned to this offer.")
        
    # Mark driver as busy
    for d in DRIVERS_DB:
        if d["id"] == driver["id"]:
            d["status"] = "busy"
            
    # Update ride details
    ride["status"] = "ACCEPTED"
    ride["driver"] = driver
    ride["estimated_arrival_minutes"] = random.randint(3, 8)
    
    logger.info(f"Ride {ride_id}: Accepted by driver {driver['name']}. ETA: {ride['estimated_arrival_minutes']} mins")
    return ride

@app.get("/api/rides/{ride_id}/status")
def get_ride_status(ride_id: str):
    """
    Get the current tracking status of a ride.
    """
    if ride_id not in RIDES_DB:
        raise HTTPException(status_code=404, detail="Ride not found.")
        
    # Simulate a step-by-step progress update on status fetches (Mock Real-time Trip Flow)
    ride = RIDES_DB[ride_id]
    
    # Auto-advance ride status for beautiful demo simulation:
    # SEARCHING -> ACCEPTED (if auto-driver-accept is requested) -> IN_PROGRESS -> ARRIVED -> COMPLETED
    if ride["status"] == "ACCEPTED":
        # Simulate driver picking up user
        ride["status"] = "IN_PROGRESS"
        ride["estimated_arrival_minutes"] = max(1, ride["estimated_arrival_minutes"] - 1)
        logger.info(f"Ride {ride_id}: Status updated to IN_PROGRESS")
    elif ride["status"] == "IN_PROGRESS":
        # Randomly complete ride or decrement ETA
        if random.random() > 0.6:
            ride["status"] = "COMPLETED"
            # Free up the driver
            if ride["driver"]:
                for d in DRIVERS_DB:
                    if d["id"] == ride["driver"]["id"]:
                        d["status"] = "available"
            logger.info(f"Ride {ride_id}: Completed successfully!")
            
    return ride

@app.post("/api/rides/{ride_id}/cancel")
def cancel_ride(ride_id: str):
    """
    Cancel an active ride request.
    """
    if ride_id not in RIDES_DB:
        raise HTTPException(status_code=404, detail="Ride not found.")
        
    ride = RIDES_DB[ride_id]
    
    if ride["status"] in ["COMPLETED", "CANCELLED"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot cancel a ride that is already {ride['status']}."
        )
        
    # Free up the driver if they were matched
    if ride["driver"]:
        for d in DRIVERS_DB:
            if d["id"] == ride["driver"]["id"]:
                d["status"] = "available"
                
    ride["status"] = "CANCELLED"
    logger.info(f"Ride {ride_id}: Cancelled by user.")
    return {"message": "Ride cancelled successfully.", "ride": ride}
