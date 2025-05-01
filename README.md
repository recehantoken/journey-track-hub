# 🚗 Vehicle Rental System

A full-stack vehicle rental application for managing rentals of various vehicle types (bus, elf, hi-ace, private car) with real-time GPS tracking, admin dashboard, and user authentication.

---

## ✨ Features

### 🚙 Vehicle Management
- Add, edit, delete vehicles with:
  - Vehicle name
  - Vehicle type (bus, elf, hi-ace, private car)
  - License plate
  - Seat capacity
  - Vehicle photo
  - Availability status

### 👨‍✈️ Driver Management
- Add, edit drivers with:
  - Full name
  - Phone number
  - Driver photo
  - Availability status

### 📄 Vehicle Rental
- Input renter data
- Select vehicle and driver
- Specify:
  - Rental date & time
  - Destination
  - Estimated return time
- Track payment status

### 🛰️ GPS Tracking (Dummy/Simulated)
- Real-time vehicle location using dummy data
- Map integration with **Leaflet** or **Google Maps API**

### 🔐 Authentication
- User login and registration via **Supabase Auth**

### 📊 Admin Dashboard
- View statistics of rented vehicles
- Monitor active vehicle schedules
- Browse rental history

### 🔔 Notifications & Status
- Vehicle status: `available`, `rented`, `in_service`
- Driver status: `active`, `on_duty`, `off`

---

## 🛠 Tech Stack

- **Frontend**: React, Tailwind CSS, React Router, Axios  
- **Backend**: FastAPI (Python)  
- **Database & Auth**: Supabase  
- **Map**: Leaflet or Google Maps API (optional)

---

## 🗃️ Database Schema

### `vehicles`
```sql
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
```

### `drivers`
```sql
CREATE TABLE drivers (
  id UUID PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  photo_url VARCHAR(255),
  status VARCHAR(20) NOT NULL, -- active, on_duty, off
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `rentals`
```sql
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
```

### `users` (via Supabase Auth)
Managed by Supabase Auth:
```sql
CREATE TABLE auth.users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL -- admin, user
);
```

---

## 📁 Project Structure

```
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
```

---

## ⚙️ Setup Instructions

### ✅ Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- Supabase account
- (Optional) Google Maps API key

### 📦 Installation

**Clone the repository:**
```bash
git clone https://github.com/username/vehicle-rental-system.git
cd vehicle-rental-system
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm start
```

**Backend Setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 🧩 Supabase Setup
1. Create a new Supabase project.
2. Set up tables using the schema above.
3. Add Supabase credentials to `.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

---

## 🚀 Run the Application

- Frontend: [http://localhost:3000](http://localhost:3000)  
- Backend: [http://localhost:8000](http://localhost:8000)

---

## 💼 Usage

- Manage vehicles, drivers, and rentals via the admin dashboard  
- Book vehicles using rental form  
- Monitor vehicle locations via integrated map  
- Track rental history and statistics

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch:  
   `git checkout -b feature/YourFeature`
3. Commit your changes:  
   `git commit -m 'Add YourFeature'`
4. Push to GitHub:  
   `git push origin feature/YourFeature`
5. Open a Pull Request

---

## 📄 License

MIT License
