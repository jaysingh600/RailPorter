const socketIo = require('socket.io');

let io;

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: '*', // For boilerplate/dev. Secure in prod.
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // User joins personal room (passenger:id or porter:id)
    socket.on('join_user_room', ({ userId, role }) => {
      const room = `${role}:${userId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined personal room ${room}`);
      
      // If admin, also join safety broadcast room
      if (role === 'admin') {
        socket.join('admin:safety');
        console.log(`Socket ${socket.id} joined admin:safety`);
      }
    });

    // User joins a specific booking room
    socket.on('join_booking', (bookingId) => {
      socket.join(`booking:${bookingId}`);
      console.log(`Socket ${socket.id} joined room booking:${bookingId}`);
    });

    // Porter sends live location
    socket.on('porter_location_update', async (data) => {
      try {
        const { bookingId, lat, lng, accuracy } = data;
        if (!bookingId || lat == null || lng == null) return;
        
        // Basic bounds validation
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return;

        // DB validation (optional but requested for security)
        // In a highly scaled app, we might use Redis for this, but for now DB is fine.
        const mongoose = require('mongoose');
        const Booking = mongoose.model('Booking');
        const booking = await Booking.findById(bookingId).select('status');
        
        const activeStatuses = ['ACCEPTED', 'REACHED_PLATFORM', 'LUGGAGE_PICKED', 'IN_TRANSIT'];
        if (booking && activeStatuses.includes(booking.status)) {
          io.to(`booking:${bookingId}`).emit('porter_location_changed', {
            lat,
            lng,
            accuracy,
            timestamp: new Date()
          });
        }
      } catch (err) {
        console.error('Socket location error:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initSocket, getIo };
