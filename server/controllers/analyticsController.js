const analyticsService = require('../services/analyticsService');
const mongoose = require('mongoose');

// Helper to build match stage from query params
const buildMatchStage = (req) => {
  const { fromDate, toDate, stationId, platformId, porterId } = req.query;
  let matchStage = {};

  if (fromDate && toDate) {
    matchStage.createdAt = {
      $gte: new Date(fromDate),
      $lte: new Date(toDate)
    };
  }

  if (stationId && mongoose.isValidObjectId(stationId)) {
    matchStage.station = new mongoose.Types.ObjectId(stationId);
  }

  if (platformId && mongoose.isValidObjectId(platformId)) {
    matchStage.platform = new mongoose.Types.ObjectId(platformId);
  }

  if (porterId && mongoose.isValidObjectId(porterId)) {
    matchStage.porter = new mongoose.Types.ObjectId(porterId);
  }

  return matchStage;
};

exports.getOverview = async (req, res, next) => {
  try {
    const matchStage = buildMatchStage(req);
    const data = await analyticsService.getOverviewStats(matchStage);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getBookings = async (req, res, next) => {
  try {
    const matchStage = buildMatchStage(req);
    const groupBy = req.query.groupBy || 'day';
    
    const [trend, statusDistribution] = await Promise.all([
      analyticsService.getBookingTrend(matchStage, groupBy),
      analyticsService.getBookingStatusDistribution(matchStage)
    ]);
    
    res.json({ success: true, data: { trend, statusDistribution } });
  } catch (error) {
    next(error);
  }
};

exports.getRevenue = async (req, res, next) => {
  try {
    const matchStage = buildMatchStage(req);
    const groupBy = req.query.groupBy || 'day';
    const data = await analyticsService.getRevenueAnalytics(matchStage, groupBy);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getPayments = async (req, res, next) => {
  try {
    const matchStage = buildMatchStage(req);
    const data = await analyticsService.getPaymentAnalytics(matchStage);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getStations = async (req, res, next) => {
  try {
    const matchStage = buildMatchStage(req);
    const data = await analyticsService.getStationAnalytics(matchStage);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getPorters = async (req, res, next) => {
  try {
    const matchStage = buildMatchStage(req);
    const data = await analyticsService.getPorterAnalytics(matchStage);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getPorterDetails = async (req, res, next) => {
  try {
    const { porterId } = req.params;
    if (!mongoose.isValidObjectId(porterId)) {
      return res.status(400).json({ success: false, message: 'Invalid Porter ID' });
    }
    
    const matchStage = buildMatchStage(req);
    matchStage.porter = new mongoose.Types.ObjectId(porterId);
    
    // For single porter, reuse the getPorterAnalytics method with restricted matchStage
    const [porterData, trend] = await Promise.all([
      analyticsService.getPorterAnalytics(matchStage),
      analyticsService.getBookingTrend(matchStage, 'day')
    ]);
    
    if (!porterData || porterData.length === 0) {
      return res.status(404).json({ success: false, message: 'Porter data not found' });
    }

    res.json({ success: true, data: { ...porterData[0], trend } });
  } catch (error) {
    next(error);
  }
};

exports.getReviews = async (req, res, next) => {
  try {
    const matchStage = buildMatchStage(req);
    const data = await analyticsService.getReviewAnalytics(matchStage);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getComplaints = async (req, res, next) => {
  try {
    const matchStage = buildMatchStage(req);
    const data = await analyticsService.getComplaintAnalytics(matchStage);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getSafety = async (req, res, next) => {
  try {
    const matchStage = buildMatchStage(req);
    const data = await analyticsService.getSafetyAnalytics(matchStage);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getPeakTimes = async (req, res, next) => {
  try {
    const matchStage = buildMatchStage(req);
    const data = await analyticsService.getPeakTimeAnalytics(matchStage);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// Porter's Personal Analytics
exports.getPorterPersonalAnalytics = async (req, res, next) => {
  try {
    const porterId = req.user.id;
    let matchStage = buildMatchStage(req);
    matchStage.porter = new mongoose.Types.ObjectId(porterId);
    
    const [overview, trend] = await Promise.all([
      analyticsService.getPorterAnalytics(matchStage),
      analyticsService.getBookingTrend(matchStage, 'day')
    ]);
    
    res.json({ success: true, data: { overview: overview[0] || {}, trend } });
  } catch (error) {
    next(error);
  }
};

// Passenger's Personal Analytics
exports.getPassengerPersonalAnalytics = async (req, res, next) => {
  try {
    const passengerId = req.user.id;
    let matchStage = buildMatchStage(req);
    matchStage.passenger = new mongoose.Types.ObjectId(passengerId);
    
    const [bookingStats, paymentStats] = await Promise.all([
      analyticsService.getOverviewStats(matchStage),
      analyticsService.getPaymentAnalytics(matchStage)
    ]);
    
    res.json({ 
      success: true, 
      data: { 
        bookings: bookingStats.bookings, 
        payments: paymentStats 
      } 
    });
  } catch (error) {
    next(error);
  }
};

// Export Reports
exports.exportReport = async (req, res, next) => {
  try {
    const { reportType } = req.params;
    const matchStage = buildMatchStage(req);
    let data = [];
    let filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
    let headers = [];

    switch (reportType) {
      case 'bookings':
        data = await analyticsService.getBookingTrend(matchStage, 'day');
        headers = ['Date', 'Total', 'Completed', 'Cancelled'];
        break;
      case 'revenue':
        data = await analyticsService.getRevenueAnalytics(matchStage, 'day');
        headers = ['Date', 'Gross Revenue', 'Platform Commission', 'Porter Earnings'];
        break;
      case 'stations':
        data = await analyticsService.getStationAnalytics(matchStage);
        headers = ['Station Name', 'City', 'Bookings', 'Completed', 'Cancelled', 'Revenue'];
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid report type' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'No data to export' });
    }

    // Very basic CSV generation
    let csv = headers.join(',') + '\n';
    
    data.forEach(row => {
      if (reportType === 'bookings') {
        csv += `${row._id},${row.total},${row.completed},${row.cancelled}\n`;
      } else if (reportType === 'revenue') {
        csv += `${row._id},${row.grossRevenue},${row.platformCommission},${row.porterEarnings}\n`;
      } else if (reportType === 'stations') {
        csv += `"${row.stationName}","${row.city}",${row.bookings},${row.completed},${row.cancelled},${row.revenue}\n`;
      }
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(csv);

  } catch (error) {
    next(error);
  }
};
