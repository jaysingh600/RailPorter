const Notification = require('../models/Notification');
const { getIo } = require('../socket');

/**
 * Creates and sends a real-time notification
 * @param {Object} params
 * @param {String} params.recipient - User ID of the recipient
 * @param {String} [params.sender] - Optional User ID of the sender
 * @param {String} params.type - Enum type of notification
 * @param {String} params.title - Title of the notification
 * @param {String} params.message - Body of the notification
 * @param {String} [params.booking] - Optional Booking ID related to this
 * @param {Object} [params.metadata] - Any extra data to send
 */
exports.sendNotification = async ({ recipient, sender, type, title, message, booking, metadata }) => {
  try {
    if (!recipient || !type || !title || !message) {
      throw new Error('Missing required notification fields');
    }

    // 1. Save to MongoDB
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      booking,
      metadata
    });

    // 2. Broadcast to recipient's personal socket room
    try {
      const io = getIo();
      // We don't know the exact role (passenger/porter/admin) here easily without looking it up.
      // But we can just broadcast to the general user room if we standardise it, 
      // or we can broadcast to both possible roles just in case, or look up user role.
      // Wait, in socket/index.js we used `${role}:${userId}`. 
      // Emitting to both `passenger:${recipient}` and `porter:${recipient}` is safe 
      // since a user ID is unique and they will only be in their true role room.
      io.to(`passenger:${recipient.toString()}`).emit('notification:new', notification);
      io.to(`porter:${recipient.toString()}`).emit('notification:new', notification);
      io.to(`admin:${recipient.toString()}`).emit('notification:new', notification);
    } catch (socketErr) {
      console.error('Socket emission failed, but notification was saved:', socketErr.message);
    }

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    // Don't throw to prevent breaking the main transaction flow (like booking/payment)
  }
};
