# RAILPORTER — Railway Luggage Porter Booking Platform

RailPorter is a modern, production-ready MERN stack web application designed to solve a real-world railway problem: connecting passengers with verified railway luggage porters (Kulis).

## 🚀 Features

**For Passengers:**
- Discover and book verified porters based on Station, Platform, and Pickup Point.
- Real-time booking tracking (Status & Hybrid Location).
- Secure simulated payment integration (Cash, UPI, Online).
- Trust systems: Ratings, Reviews, and Complaints.
- Unified notification dashboard.

**For Porters:**
- Mobile-first dashboard tailored for on-the-go usage.
- Accept/Reject incoming booking requests.
- Progression tracking (Accepted → Picked Luggage → Delivered).
- Location sharing and availability toggles.

**For Admins:**
- Desktop-optimized control panel.
- Verification and management of porters.
- Dispute/Complaint resolution pipeline.
- High-level platform analytics.

## 🛠️ Technology Stack

- **Frontend**: React.js (Vite), Tailwind CSS, React Router DOM, Lucide React, Axios, Leaflet (Map).
- **Backend**: Node.js, Express.js, Socket.IO.
- **Database**: MongoDB & Mongoose.
- **Security**: JWT Authentication, bcrypt, Helmet, Express-Rate-Limit.

## 📂 Folder Structure

```
RailwayPorter/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # Reusable UI & Layouts
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Role-based pages (Admin, Passenger, Porter, Public)
│   │   ├── routes/         # Protected routing logic
│   │   └── utils/          # Axios & Socket singletons
├── server/                 # Backend Node.js Application
│   ├── config/             # DB connection
│   ├── controllers/        # Route logic
│   ├── middleware/         # Auth & Global Error handlers
│   ├── models/             # Mongoose schemas (User, Booking, Payment, etc.)
│   ├── routes/             # Express API routes
│   └── server.js           # Entry point (Express + Socket.IO initialization)
```

## ⚙️ Installation & Setup

1. **Clone the repository**
2. **Backend Setup**:
   ```bash
   cd server
   npm install
   npm run dev
   ```
   *Create a `.env` in `server/` with:*
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   CLIENT_URL=http://localhost:5173
   ```
3. **Frontend Setup**:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   *Create a `.env` in `client/` with:*
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

## 📡 Architecture Highlights

### Real-Time Socket.IO Architecture
Real-time tracking is scoped securely using Socket.IO "Rooms". 
When a passenger and porter are matched, they both join a unique room `booking:<booking_id>`. This ensures location updates and status changes are entirely private and strictly routed only to the participants of that specific booking. Listeners are cleaned up on unmount to prevent memory leaks.

### Hybrid Location Strategy
**Disclaimer:** GPS accuracy inside large, covered railway stations is fundamentally unreliable. 
RailPorter employs a hybrid approach:
- Primary dependency is placed on deterministic user input: **Station → Platform Number → Pickup Point**.
- Browser Geolocation API is used exclusively as a *fallback indicator* rather than a strict source of truth for the porter's exact location.
- Location tracking is strictly limited to the duration of an active booking for privacy.

### Secure Payments
- The application implements a simulated payment gateway.
- **Security Principle**: The backend implements a Zero-Trust architecture regarding pricing. The frontend checkout screen cannot dictate the payment amount. The backend independently queries the MongoDB `Booking` document to calculate the authoritative total before processing the transaction.

## ⚠️ Limitations & Disclaimers

1. **Pricing**: The pricing displayed in this application is for demonstration purposes. It does not represent official Indian Railways tariffs unless explicitly configured by an authoritative admin.
2. **Verification**: Porters cannot automatically verify themselves. An Admin must manually verify a porter's credentials in the dashboard before they appear in passenger search results.
3. **Passwords**: The system hashes passwords using `bcrypt` and utilizes Mongoose `select: false` to ensure passwords are never inadvertently exposed via the API.
