Vehicle Rental System
A full-stack vehicle rental application for managing rentals of various vehicle types (bus, elf, hi-ace, private car) with real-time GPS tracking, admin dashboard, and user authentication.
Features
Vehicle Management

Add, edit, delete vehicles with details:
Vehicle name
Vehicle type (bus, elf, hi-ace, private car)
License plate
Seat capacity
Vehicle photo
Availability status



Driver Management

Add, edit drivers with details:
Full name
Phone number
Driver photo
Availability status



Vehicle Rental

Input renter data
Select available vehicle and driver
Specify rental date, time, destination, and estimated return time
Track payment status

GPS Tracking (Dummy/Simulation)

Real-time vehicle location display using dummy data
Map integration with Leaflet or Google Maps

Authentication

User login and registration via Supabase Auth

Admin Dashboard

Statistics on rented vehicles
Active vehicle schedules
Rental history

Notifications & Status

Vehicle status: available, rented, in service
Driver status: active, on duty, off

Tech Stack

Frontend: React, Tailwind CSS, React Router, Axios
Backend: FastAPI (Python)
Database & Auth: Supabase
Map: Leaflet or Google Maps API (optional)

Database Schema
Vehicles
CREATE TABLE vehicles (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  license_plate VARCHAR(20) UNIQUE NOT NULL,
  seat_capacity INTEGER NOT NULL,
  photo_url VARCHAR(255),
  status VARCHAR(20) NOT NULL, -- available, rented, in_service
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Drivers
CREATE TABLE drivers (
  id UUID PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  photo_url VARCHAR(255),
  status VARCHAR(20) NOT NULL, -- active, on_duty, off
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Rentals
CREATE TABLE rentals (
  id UUID PRIMARY KEY,
  renter_name VARCHAR(100) NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id),
  driver_id UUID REFERENCES drivers(id),
  rental_date TIMESTAMP NOT NULL,
  destination TEXT NOT NULL,
  estimated_return TIMESTAMP NOT NULL,
  payment_status VARCHAR(20) NOT NULL, -- pending, paid
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Users (Supabase Auth)
-- Managed by Supabase Auth
CREATE TABLE auth.users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL -- admin, user
);

Project Structure
vehicle-rental-system/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── pages/            # Page components (Dashboard, Vehicle, Rental)
│   │   ├── services/         # API calls with Axios
│   │   ├── App.jsx           # Main app with React Router
│   │   └── index.css         # Tailwind CSS
├── backend/
│   ├── app/
│   │   ├── api/              # FastAPI route handlers
│   │   ├── models/           # Pydantic models
│   │   ├── schemas/          # Database schemas
│   │   ├── services/         # Business logic
│   │   └── main.py           # FastAPI entry point
├── README.md
└── .env                      # Environment variables (Supabase, API keys)

Setup Instructions
Prerequisites

Node.js (v18+)
Python (v3.9+)
Supabase account
(Optional) Google Maps API key

Installation

Clone the repository:
git clone https://github.com/username/vehicle-rental-system.git
cd vehicle-rental-system


Frontend Setup:
cd frontend
npm install
npm start


Backend Setup:
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload


Supabase Setup:

Create a Supabase project
Set up tables as per the schema above
Add Supabase URL and Key to .env:SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key




Run the Application:

Frontend runs on http://localhost:3000
Backend runs on http://localhost:8000



Usage

Access the admin dashboard to manage vehicles, drivers, and rentals
Use the rental form to book vehicles
View real-time vehicle locations on the map
Monitor statuses and statistics via the dashboard

Contributing

Fork the repository
Create a feature branch (git checkout -b feature/YourFeature)
Commit changes (git commit -m 'Add YourFeature')
Push to the branch (git push origin feature/YourFeature)
Open a Pull Request

License
MIT License
