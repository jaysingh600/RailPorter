# RailPorter - Project Viva & Documentation Guide

This guide is designed to help you prepare for your project presentation or viva by breaking down the core technical aspects of the **RailPorter** application.

---

## 1. How Many Models Are in the Project?

The backend uses **Mongoose** (MongoDB) and consists of exactly **14 Models** to handle different aspects of the platform:

1. **User:** Base schema for authentication (stores Name, Phone, Email, Password Hash, Role).
2. **PorterProfile:** Extended profile specifically for Porters (stores availability, station, languages, verification status).
3. **Booking:** The core transactional model handling the lifecycle of a porter request.
4. **Station:** Master data for railway stations.
5. **Platform:** Master data mapping platforms to stations.
6. **PickupPoint:** Specific locations within a station/platform (e.g., "Waiting Room A").
7. **Payment:** Tracks transaction details (Amount, Gateway IDs, Status).
8. **Notification:** Persists notifications for the user's dashboard.
9. **Review:** Ratings and feedback submitted by passengers after a booking.
10. **Complaint:** Support tickets raised by users.
11. **EmergencyEvent:** Tracks SOS/Safety triggers.
12. **EmergencyContact:** Saved contacts for users during emergencies.
13. **SystemSetting:** Global app configuration (e.g., base fare rates) managed by admins.
14. **AdminAuditLog:** Tracks critical actions taken by administrators.

---

## 2. How Does the Project Work Overall?

**Architecture:** The project is a standard **MERN Stack** (MongoDB, Express, React, Node.js) application. 
- **Roles:** It operates on Role-Based Access Control (RBAC) with three primary actors: **Passenger**, **Porter**, and **Admin**.
- **The Flow:**
  1. A **Passenger** selects a Station, Platform, and Pickup Point, then submits a booking request.
  2. The Backend uses a matching algorithm to find **Eligible Porters** (verified, available, and at that specific station/platform).
  3. A real-time **Socket.IO** broadcast alerts these eligible porters.
  4. The first **Porter** to accept the request is assigned to the booking. The system locks the booking and updates the porter's status to "BUSY".
  5. The Passenger tracks the Porter in real-time (hybrid GPS tracking via Leaflet map).
  6. The Porter physically meets the Passenger, enters a secure **OTP** to confirm pickup, and begins transit.
  7. Upon completion, the backend finalizes the fare, the passenger "pays" (simulated), and leaves a review. The porter becomes "AVAILABLE" again.

---

## 3. How Are Real-Time Notifications Handled?

Real-time communication is entirely powered by **Socket.IO**. It works through a "Rooms" concept to ensure data privacy:

- **Personal Rooms:** When a user logs in, their socket connection automatically joins a private room named after their role and ID (e.g., `passenger:64abc123...`). 
  - *How it works:* When the `notificationService.js` creates a new notification in MongoDB, it immediately grabs the Socket instance (`getIo()`) and emits a `notification:new` event directly to that specific user's private room.
- **Booking Rooms:** Once a booking is created and accepted, both the Passenger and the Porter join a shared room (e.g., `booking:88xyz...`).
  - *How it works:* Any GPS location updates (`porter_location_changed`) or status changes (`booking:status-updated`) are emitted exclusively to this booking room. This is highly efficient and ensures that other users do not receive this private tracking data.

---

## 4. How is the OTP Generated and Verified?

The OTP (One Time Password) mechanism is used as a physical handshake to guarantee that the correct Porter has met the correct Passenger.

- **Generation:** 
  When a booking is first created (in `bookingController.js`), the backend generates a random 4-digit string using standard JavaScript math:
  ```javascript
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  ```
  This is saved directly into the `Booking` document in the database and is displayed **only on the Passenger's screen**.

- **Verification:**
  When the Porter clicks "Luggage Picked" on their device, the system prompts them to ask the passenger for the PIN. The Porter enters it, and it is sent to the backend (`PUT /api/bookings/:id/status`). 
  The backend checks:
  ```javascript
  if (status === 'LUGGAGE_PICKED') {
    if (!otp || booking.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
  }
  ```
  If it matches, the status officially changes to `LUGGAGE_PICKED` and the journey begins.

---

## 5. Potential Teacher/Viva Questions & Answers

**Q: Why use Socket.IO instead of standard HTTP polling for location tracking?**
*A:* HTTP polling (sending a request every 2 seconds) creates massive overhead and overloads the server with HTTP headers and connection handshakes. Socket.IO keeps a persistent, bidirectional WebSocket connection open, allowing the server to push location coordinates instantly and with minimal bandwidth.

**Q: How do you secure the API endpoints?**
*A:* We use JWT (JSON Web Tokens). When a user logs in, they receive a signed token. Every subsequent request must include this token in the `Authorization` header. A middleware (`protect`) verifies the signature, and another middleware (`authorize`) checks if the user's role (e.g., `admin` or `porter`) is permitted to access that specific route.

**Q: What happens if a Porter's GPS is inaccurate inside the railway station?**
*A:* We use a "Hybrid Location Strategy." We know GPS fails under heavy station roofs, so the core matching is deterministic (based on the manual selection of Station/Platform). The GPS tracking is provided as a fallback/estimation feature on the map, rather than a strict enforcer of logic.

**Q: How is password security handled?**
*A:* Passwords are never stored in plain text. They are hashed using `bcrypt` before being saved to MongoDB. Additionally, the password field in the Mongoose schema has `select: false`, meaning accidental database queries will never accidentally leak the password hash to the frontend.

**Q: How is the Porter matching logic handled? Which functions/modules are responsible?**
*A:* The matching logic is handled by the `findEligiblePorters` function located in `server/services/porterMatchingService.js`. When a passenger requests a booking, this function queries the `PorterProfile` model to find porters who are currently `AVAILABLE`, have a `VERIFIED` status, and whose assigned `station` and `workingPlatforms` match the passenger's exact location.

**Q: How do you prevent a race condition if two porters try to accept the same booking at exactly the same time?**
*A:* This is handled in the `acceptBooking` function within `server/controllers/bookingController.js`. We use MongoDB's atomic `findOneAndUpdate` method. The database query specifically looks for the booking by its ID **AND** ensures its status is still `REQUESTED` (`{ _id: bookingId, status: 'REQUESTED' }`). If Porter A accepts it first, the status changes to `ACCEPTED`. When Porter B's request arrives milliseconds later, the query finds 0 matches because the status is no longer `REQUESTED`, and Porter B safely receives a "Booking already accepted" error.

**Q: How is the Fare calculated dynamically?**
*A:* The fare calculation is managed by the `calculateFare` function in `server/services/fareService.js`. It takes the assigned porter's base rate and adds an additional fee based on the amount of luggage (`luggageDetails.count`). It also computes any applicable system-wide service charges to generate an `estimatedTotal`.

**Q: How do you secure endpoints against brute-force attacks or spam (e.g., spamming the booking API)?**
*A:* We use the `express-rate-limit` NPM package. In `server/routes/bookingRoutes.js`, we have defined a `bookingLimiter` middleware. It restricts the number of booking actions a single IP address can make within a 10-minute window. We also use the `helmet` package in `server.js` to automatically set secure HTTP headers and protect against common web vulnerabilities.

**Q: How does the system handle emergencies (SOS)?**
*A:* The emergency system is handled by the `triggerSOS` function in `server/controllers/emergencyController.js`. If a passenger or porter feels unsafe, pressing the SOS button creates a high-priority `EmergencyEvent` document in the database. Instantly, `socket.io` emits an `emergency:sos` event directly to a dedicated `admin:safety` socket room, meaning administrators receive a loud, real-time alert on their dashboard without needing to refresh the page.
