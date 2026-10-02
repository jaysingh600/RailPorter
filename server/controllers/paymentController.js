const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { sendNotification } = require('../services/notificationService');
const crypto = require('crypto');
const pricingConfig = require('../config/pricing');
const mongoose = require('mongoose');

// @desc    Process a simulated secure payment
// @route   POST /api/payments/process
// @access  Private (Passenger)
exports.processPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bookingId, method } = req.body;
    
    // 1. Validate Booking atomically
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // 2. Authorize Passenger Ownership
    if (booking.passenger.toString() !== req.user.id) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: 'Not authorized for this payment' });
    }

    // Ensure it's COMPLETED
    if (booking.status !== 'COMPLETED') {
      await session.abortTransaction();
      return res.status(422).json({ success: false, message: 'Service must be completed before payment.' });
    }

    // Ensure it's not already paid (Idempotency)
    if (booking.paymentStatus === 'PAID') {
      const existingPayment = await Payment.findOne({ booking: bookingId }).session(session);
      await session.abortTransaction();
      return res.status(200).json({ success: true, message: 'Already paid', data: existingPayment });
    }

    // 3. SECURE AMOUNT FETCH & COMMISSION MATH
    // Must use finalTotal set by backend when completed
    const amountToPay = booking.fare.finalTotal || booking.fare.estimatedTotal;
    
    const commissionPercent = pricingConfig.platformCommissionPercent;
    const platformCommission = Math.round((amountToPay * commissionPercent) / 100);
    const porterEarning = amountToPay - platformCommission;

    const fareBreakdown = {
      baseFare: booking.fare.baseFare,
      luggageCharge: booking.fare.additionalLuggage,
      serviceCharge: booking.fare.serviceCharge,
      total: amountToPay
    };

    // 4. Simulate Processing (Razorpay Mock)
    const txnId = `TXN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Create the payment record securely
    const payment = new Payment({
      booking: bookingId,
      passenger: req.user.id,
      porter: booking.porter,
      amount: amountToPay,
      platformCommission,
      porterEarning,
      fareBreakdown,
      method,
      status: 'SUCCESS', // Mock success
      transactionId: txnId
    });
    
    await payment.save({ session });

    // Update Booking status
    booking.paymentStatus = 'PAID';
    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    // 5. Notify Passenger & Porter outside transaction
    await sendNotification({
      recipient: booking.passenger,
      type: 'PAYMENT_SUCCESS',
      title: 'Payment Successful',
      message: `Your payment of ₹${amountToPay} for Booking #${bookingId.toString().slice(-6).toUpperCase()} was successful.`,
      booking: booking._id
    });

    await sendNotification({
      recipient: booking.porter,
      type: 'PAYMENT_SUCCESS',
      title: 'Earnings Credited',
      message: `You earned ₹${porterEarning} from Booking #${bookingId.toString().slice(-6).toUpperCase()}.`,
      booking: booking._id
    });

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payment receipt
// @route   GET /api/payments/:transactionId
// @access  Private
exports.getPaymentDetails = async (req, res) => {
  try {
    const payment = await Payment.findOne({ transactionId: req.params.transactionId })
      .populate({ path: 'booking', populate: { path: 'porter', select: 'name profileImage' } })
      .populate('passenger', 'name email');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (payment.passenger._id.toString() !== req.user.id && payment.porter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this receipt' });
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged-in passenger's payments
// @route   GET /api/payments/passenger/history
// @access  Private (Passenger)
exports.getPassengerPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ passenger: req.user.id })
      .populate('porter', 'name profileImage')
      .populate({ path: 'booking', populate: { path: 'station platform pickupPoint' }})
      .sort('-createdAt');
      
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged-in porter's earnings
// @route   GET /api/payments/porter/earnings
// @access  Private (Porter)
exports.getPorterEarnings = async (req, res) => {
  try {
    const porterId = new mongoose.Types.ObjectId(req.user.id);
    
    // Aggregation for Stats (Today, Week, Month, Total)
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0,0,0,0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const statsAgg = await Payment.aggregate([
      { $match: { porter: porterId, status: 'SUCCESS' } },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$porterEarning" },
          todayEarnings: {
            $sum: {
              $cond: [{ $gte: ["$createdAt", startOfToday] }, "$porterEarning", 0]
            }
          },
          weekEarnings: {
            $sum: {
              $cond: [{ $gte: ["$createdAt", startOfWeek] }, "$porterEarning", 0]
            }
          },
          monthEarnings: {
            $sum: {
              $cond: [{ $gte: ["$createdAt", startOfMonth] }, "$porterEarning", 0]
            }
          }
        }
      }
    ]);

    const stats = statsAgg.length > 0 ? statsAgg[0] : { totalEarnings: 0, todayEarnings: 0, weekEarnings: 0, monthEarnings: 0 };
    delete stats._id;

    // Recent Transactions
    const transactions = await Payment.find({ porter: porterId })
      .populate('passenger', 'name')
      .populate({ path: 'booking', select: 'station platform', populate: { path: 'station', select: 'name' } })
      .sort('-createdAt')
      .limit(20);

    res.status(200).json({
      success: true,
      data: {
        stats,
        transactions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all payments (Admin)
// @route   GET /api/payments/admin/all
// @access  Private (Admin)
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('passenger', 'name')
      .populate('porter', 'name')
      .populate({ path: 'booking', select: 'station', populate: { path: 'station', select: 'name' } })
      .sort('-createdAt');

    // Simple revenue sum
    const revenueAgg = await Payment.aggregate([
      { $match: { status: 'SUCCESS' } },
      {
        $group: {
          _id: null,
          totalCollected: { $sum: "$amount" },
          totalCommission: { $sum: "$platformCommission" },
          totalPorterEarnings: { $sum: "$porterEarning" }
        }
      }
    ]);
    
    const summary = revenueAgg.length > 0 ? revenueAgg[0] : { totalCollected: 0, totalCommission: 0, totalPorterEarnings: 0 };

    res.status(200).json({
      success: true,
      data: {
        summary,
        payments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
