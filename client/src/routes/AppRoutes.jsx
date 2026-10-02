import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Public Pages
import Home from '../pages/Public/Home';
import Login from '../pages/Public/Login';
import PassengerRegister from '../pages/Public/PassengerRegister';
import PorterRegister from '../pages/Public/PorterRegister';

// Lazy load Shared Pages
const NotificationsPage = lazy(() => import('../pages/NotificationsPage'));
const SafetyCenter = lazy(() => import('../pages/Shared/SafetyCenter'));

// Lazy load Passenger Pages
const PassengerDashboard = lazy(() => import('../pages/Passenger/Dashboard'));
const FindPorter = lazy(() => import('../pages/Passenger/FindPorter'));
const PorterProfile = lazy(() => import('../pages/Passenger/PorterProfile'));
const SearchingPorter = lazy(() => import('../pages/Passenger/SearchingPorter'));
const BookingConfirmation = lazy(() => import('../pages/Passenger/BookingConfirmation'));
const Tracking = lazy(() => import('../pages/Passenger/Tracking'));
const ReportIssue = lazy(() => import('../pages/Passenger/ReportIssue'));
const Payment = lazy(() => import('../pages/Passenger/Payment'));
const PaymentSuccess = lazy(() => import('../pages/Passenger/PaymentSuccess'));
const PaymentHistory = lazy(() => import('../pages/Passenger/PaymentHistory'));
const PassengerComplaints = lazy(() => import('../pages/Passenger/Complaints'));

// Lazy load Porter Pages
const PorterDashboard = lazy(() => import('../pages/Porter/Dashboard'));

// Lazy load Admin Pages
const AdminLayout = lazy(() => import('../components/layout/AdminLayout'));
const AdminDashboard = lazy(() => import('../pages/Admin/Dashboard'));
const PorterManagement = lazy(() => import('../pages/Admin/PorterManagement'));
const UserManagement = lazy(() => import('../pages/Admin/UserManagement'));
const ComplaintManagement = lazy(() => import('../pages/Admin/ComplaintManagement'));
const StationManagement = lazy(() => import('../pages/Admin/StationManagement'));
const StationDetails = lazy(() => import('../pages/Admin/StationDetails'));
const PaymentsPage = lazy(() => import('../pages/Admin/PaymentsPage'));
const LiveOperations = lazy(() => import('../pages/Admin/LiveOperations'));
const BookingManagement = lazy(() => import('../pages/Admin/BookingManagement'));
const SystemSettings = lazy(() => import('../pages/Admin/SystemSettings'));
const AuditLogs = lazy(() => import('../pages/Admin/AuditLogs'));
const SafetyDashboard = lazy(() => import('../pages/Admin/SafetyDashboard'));
const EmergencyDetails = lazy(() => import('../pages/Admin/EmergencyDetails'));
const Analytics = lazy(() => import('../pages/Admin/Analytics'));
const PorterAnalyticsDetail = lazy(() => import('../pages/Admin/PorterAnalyticsDetail'));

// Fallback Loader
const FallbackLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-900"></div>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<FallbackLoader />}>
      <Routes>
        {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<PassengerRegister />} />
      <Route path="/porter/register" element={<PorterRegister />} />

      {/* Passenger Routes */}
      <Route 
        path="/passenger/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['passenger']}>
            <PassengerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/passenger/find-porter" 
        element={
          <ProtectedRoute allowedRoles={['passenger']}>
            <FindPorter />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/passenger/porter/:id" 
        element={
          <ProtectedRoute allowedRoles={['passenger']}>
            <PorterProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/passenger/booking/:id/searching" 
        element={
          <ProtectedRoute allowedRoles={['passenger']}>
            <SearchingPorter />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/passenger/booking/:id" 
        element={
          <ProtectedRoute allowedRoles={['passenger']}>
            <BookingConfirmation />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/passenger/tracking/:id" 
        element={
          <ProtectedRoute allowedRoles={['passenger']}>
            <Tracking />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/passenger/report-issue" 
        element={
          <ProtectedRoute allowedRoles={['passenger']}>
            <ReportIssue />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/passenger/payment/:id" 
        element={
          <ProtectedRoute allowedRoles={['passenger']}>
            <Payment />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/passenger/payment-success/:txnId" 
        element={
          <ProtectedRoute allowedRoles={['passenger']}>
            <PaymentSuccess />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/passenger/payments" 
        element={
          <ProtectedRoute allowedRoles={['passenger']}>
            <PaymentHistory />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/passenger/complaints" 
        element={
          <ProtectedRoute allowedRoles={['passenger']}>
            <PassengerComplaints />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute allowedRoles={['passenger', 'porter', 'admin']}>
            <NotificationsPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/passenger/safety" 
        element={
          <ProtectedRoute allowedRoles={['passenger']}>
            <SafetyCenter />
          </ProtectedRoute>
        } 
      />

      {/* Porter Routes */}
      <Route 
        path="/porter/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['porter']}>
            <PorterDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/porter/safety" 
        element={
          <ProtectedRoute allowedRoles={['porter']}>
            <SafetyCenter />
          </ProtectedRoute>
        } 
      />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="analytics/porters/:porterId" element={<PorterAnalyticsDetail />} />
        <Route path="porters" element={<PorterManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="complaints" element={<ComplaintManagement />} />
        <Route path="stations" element={<StationManagement />} />
        <Route path="stations/:id" element={<StationDetails />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="operations" element={<LiveOperations />} />
        <Route path="bookings" element={<BookingManagement />} />
        <Route path="safety" element={<SafetyDashboard />} />
        <Route path="safety/:id" element={<EmergencyDetails />} />
        <Route path="settings" element={<SystemSettings />} />
        <Route path="audit" element={<AuditLogs />} />
        <Route path="*" element={<div className="p-8 text-center text-gray-500">This module is coming in Phase 2.</div>} />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
};

export default AppRoutes;
