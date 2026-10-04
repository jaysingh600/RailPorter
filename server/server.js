const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load env vars
dotenv.config();

// Validate Environment Variables
const validateEnv = require('./config/envValidator');
validateEnv();

// Connect to DB
connectDB();

const app = express();

// Security Middleware
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // limit each IP to 10000 requests per windowMs (increased for dev)
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// Body parser with strict limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// CORS configuration - allowing local development
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Mount routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/passenger', require('./routes/passengerRoutes'));
app.use('/api/porter', require('./routes/porterRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/porters', require('./routes/porterSearchRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/stations', require('./routes/stationRoutes'));
app.use('/api/platforms', require('./routes/platformRoutes'));
app.use('/api/emergency', require('./routes/emergencyRoutes'));
app.use('/api/emergency-contacts', require('./routes/emergencyContactRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Custom Error Handler
app.use(errorHandler);
// Health Check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});
// Basic route
app.get('/', (req, res) => {
  res.send('RAILPORTER API is running...');
});

const http = require('http');
const { initSocket } = require('./socket');

const server = http.createServer(app);
// Initialize Socket.io
initSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
