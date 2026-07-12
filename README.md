# FarmSmart 🌾

FarmSmart is a full-stack smart agriculture platform designed to empower farmers with data-driven insights. It provides real-time weather alerts, localized market commodity (mandi) prices, crop health diaries, secure user management, and premium payment subscription flows. The platform is designed with scalability in mind, using a microservices-inspired architecture that is fully dockerized.

---

## 🚀 Key Features

*   **🔒 Secure Authentication & User Profiles:** Register/login with password hashing (Bcrypt), JSON Web Tokens (JWT), and a secure OTP-based password recovery flow via Nodemailer.
*   **💳 Premium Subscription Integration:** Monetization flow enabled by integrated **Razorpay** payment gateway for premium platform features (₹299 sign-up fee).
*   **🌱 Crop Lifecycle Tracking (CRUD):** Log farm plots, specify soil types, monitor land area, and record sowing dates.
*   **📸 Crop Health Logger (Diary):** Capture crop milestones and track health status with custom notes, health scores, and image uploads managed by **Cloudinary**.
*   **📈 Real-Time Mandi Prices:** Live lookup of crop prices fetched directly from the **Gov of India API** (`api.data.gov.in`), optimized with low-latency caching (`node-cache`).
*   **🌤️ Localized Weather Alerts:** Instant weather updates based on Indian pincodes, fetched from **OpenWeatherMap API**.
*   **🧠 Intelligence Center (Upcoming ML Features):** 
    *   *Yield Predictor:* Estimate yield based on crop type, soil type, and fertilizer metrics.
    *   *Disease Detector:* Fungal/bacterial disease identification from leaf image uploads. *(Front-end simulated, Python ML-service integration under development).*

---

## 🛠️ Tech Stack

### Frontend
*   **Framework:** React (Vite-powered, SPA routing with `react-router-dom`)
*   **Styling:** Modern Tailwind CSS
*   **State Management:** React Context API

### Backend
*   **Runtime:** Node.js (ES Modules syntax)
*   **Framework:** Express.js
*   **Database:** PostgreSQL (with `pg` pooling)
*   **Caching:** `node-cache` (saves Gov API and OpenWeather API rates)
*   **Media Uploads:** Cloudinary API

### Infrastructure & DevOps
*   **Containers:** Docker & Docker Compose (Frontend & Backend containers)
*   **Reverse Proxy / Web Server:** Nginx (built into frontend container)

---

## 📁 Repository Structure

```text
FarmSmart/
├── backend/            # Express.js REST API
│   ├── src/
│   │   ├── config/     # Database configurations (PostgreSQL Pool)
│   │   ├── controllers/# Business logic (auth, crop, log, mandi, weather, payment)
│   │   ├── middleware/ # Auth validation, Multer image upload
│   │   └── routes/     # Express route definitions
│   └── Dockerfile
├── frontend/           # React SPA
│   ├── src/
│   │   ├── components/ # Shared UI & Dashboard layout
│   │   ├── pages/      # Views (Dashboard, Health Log, Predictions, Prices)
│   │   └── App.jsx     # App entry & routes
│   ├── Nginx.conf      # Container reverse proxy setup
│   └── Dockerfile
├── ml-service/         # Empty structure (reserved for Flask/FastAPI ML API)
├── docker-compose.yml  # Orchestrates full-stack deployment
└── sqlScript.sql       # Database schema initialization script
```

---

## ⚙️ Local Setup Instructions

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL
*   Docker & Docker Compose (optional, for containerized run)

### 1. Database Setup
Create a PostgreSQL database and run the schema setup in `sqlScript.sql` or use your DBMS to set up the tables:
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    pincode VARCHAR(10),
    state VARCHAR(100),
    is_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    soil_type VARCHAR(100),
    area_acres NUMERIC,
    sowing_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE crop_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
    date TIMESTAMP DEFAULT NOW(),
    health_score INT,
    notes TEXT,
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Environment Variables configuration
Create a `.env` file in the `backend/` directory referencing `.env.example`:
```env
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/<dbname>
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
PORT=5000

# Nodemailer SMTP settings (for OTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Third-Party APIs
OPENWEATHER_API_KEY=your_openweather_key
DATA_GOV_API_KEY=your_government_data_portal_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Razorpay Sandbox Credentials
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Create a `.env` in `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000
```

### 3. Run Locally

#### Running with Docker (Recommended)
From the root directory, simply run:
```bash
docker-compose up --build
```
*   Frontend will be available at: `http://localhost:3000`
*   Backend will be available at: `http://localhost:5000`

#### Running Manually
**Backend:**
```bash
cd backend
npm install
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🔮 Future Roadmap
*   **ML Backend Integration (`ml-service`):** Hook up a Flask/FastAPI backend containing a custom-trained TensorFlow/PyTorch model for crop disease classification.
*   **Yield Regression Model:** Deploy a Scikit-Learn regression model inside `ml-service` to output accurate yield figures by factoring in historic regional rainfall and nitrogen-phosphorus-potassium (NPK) ratios.
*   **Multilingual Support:** Add regional languages translation options for non-English speaking farmers.
