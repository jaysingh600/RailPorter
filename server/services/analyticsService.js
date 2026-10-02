const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const Complaint = require('../models/Complaint');
const EmergencyEvent = require('../models/EmergencyEvent');
const User = require('../models/User');

class AnalyticsService {
  
  // Overview Stats (Admin)
  async getOverviewStats(matchStage) {
    const [bookingStats, paymentStats, porterStats, passengerStats] = await Promise.all([
      Booking.aggregate([
        { $match: matchStage },
        { 
          $group: { 
            _id: null, 
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
            cancelled: { $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] } },
            active: { $sum: { $cond: [{ $in: ['$status', ['REQUESTED', 'ACCEPTED', 'REACHED_PLATFORM', 'LUGGAGE_PICKED', 'IN_TRANSIT']] }, 1, 0] } }
          }
        }
      ]),
      Payment.aggregate([
        { $match: { ...matchStage, status: 'SUCCESS' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            platformCommission: { $sum: '$platformCommission' },
            porterEarnings: { $sum: '$porterEarning' }
          }
        }
      ]),
      User.countDocuments({ role: 'porter', isVerified: true }),
      User.countDocuments({ role: 'passenger' })
    ]);

    return {
      bookings: bookingStats[0] || { total: 0, completed: 0, cancelled: 0, active: 0 },
      revenue: paymentStats[0] || { totalRevenue: 0, platformCommission: 0, porterEarnings: 0 },
      porters: { verified: porterStats },
      passengers: { total: passengerStats }
    };
  }

  // Booking Trend
  async getBookingTrend(matchStage, groupBy = 'day') {
    let dateGroup = {
      $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
    };

    if (groupBy === 'month') {
      dateGroup = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
    }

    return await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: dateGroup,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }

  // Booking Status Distribution
  async getBookingStatusDistribution(matchStage) {
    return await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
  }

  // Revenue Analytics
  async getRevenueAnalytics(matchStage, groupBy = 'day') {
    let dateGroup = {
      $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
    };

    return await Payment.aggregate([
      { $match: { ...matchStage, status: 'SUCCESS' } },
      {
        $group: {
          _id: dateGroup,
          grossRevenue: { $sum: '$amount' },
          platformCommission: { $sum: '$platformCommission' },
          porterEarnings: { $sum: '$porterEarning' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }

  // Payment Analytics
  async getPaymentAnalytics(matchStage) {
    return await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]);
  }

  // Station Analytics
  async getStationAnalytics(matchStage) {
    return await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$station',
          bookings: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] } },
          revenue: { $sum: '$fare.finalTotal' }
        }
      },
      {
        $lookup: {
          from: 'stations',
          localField: '_id',
          foreignField: '_id',
          as: 'stationDetails'
        }
      },
      { $unwind: { path: '$stationDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          stationName: '$stationDetails.name',
          city: '$stationDetails.city',
          bookings: 1,
          completed: 1,
          cancelled: 1,
          revenue: 1
        }
      },
      { $sort: { bookings: -1 } }
    ]);
  }

  // Porter Analytics
  async getPorterAnalytics(matchStage) {
    return await Booking.aggregate([
      { $match: { ...matchStage, porter: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$porter',
          completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] } },
          totalBookings: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'porterDetails'
        }
      },
      { $unwind: '$porterDetails' },
      {
        $lookup: {
          from: 'porterprofiles',
          localField: '_id',
          foreignField: 'user',
          as: 'profile'
        }
      },
      { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'payments',
          let: { porterId: '$_id' },
          pipeline: [
            { $match: { $expr: { $and: [ { $eq: ['$porter', '$$porterId'] }, { $eq: ['$status', 'SUCCESS'] } ] } } },
            { $group: { _id: null, earnings: { $sum: '$porterEarning' } } }
          ],
          as: 'earningsData'
        }
      },
      {
        $project: {
          name: '$porterDetails.name',
          email: '$porterDetails.email',
          completed: 1,
          cancelled: 1,
          totalBookings: 1,
          rating: '$profile.rating',
          isVerified: '$porterDetails.isVerified',
          earnings: { $ifNull: [{ $arrayElemAt: ['$earningsData.earnings', 0] }, 0] }
        }
      },
      { $sort: { completed: -1 } },
      { $limit: 100 }
    ]);
  }

  // Review Analytics
  async getReviewAnalytics(matchStage) {
    return await Review.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);
  }

  // Complaint Analytics
  async getComplaintAnalytics(matchStage) {
    return await Complaint.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'RESOLVED'] }, 1, 0] } },
          open: { $sum: { $cond: [{ $in: ['$status', ['OPEN', 'UNDER_REVIEW']] }, 1, 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]);
  }

  // Safety Analytics
  async getSafetyAnalytics(matchStage) {
    return await EmergencyEvent.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'RESOLVED'] }, 1, 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]);
  }

  // Peak Time Analytics
  async getPeakTimeAnalytics(matchStage) {
    return await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }
}

module.exports = new AnalyticsService();
