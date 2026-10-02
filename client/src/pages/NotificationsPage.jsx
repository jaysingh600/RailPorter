import React, { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import { Clock, Check, Bell, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const navigate = useNavigate();

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-[#0B192C]">All Notifications</h1>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center text-sm font-medium text-[#38A169] bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Check size={16} className="mr-1.5" /> Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-16 text-center">
          <Bell size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No notifications yet</h3>
          <p className="text-gray-500">We'll let you know when there's an update.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
          {notifications.map((notification) => (
            <div 
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-5 sm:p-6 transition-colors hover:bg-gray-50 flex gap-4 ${!notification.isRead ? 'bg-blue-50/40' : ''}`}
            >
              <div className="mt-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!notification.isRead ? 'bg-[#0B192C] text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <Bell size={20} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`text-base ${!notification.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                    {notification.title}
                  </h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-4 flex items-center">
                    <Clock size={12} className="mr-1" />
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-2">
                  {notification.message}
                </p>
                {notification.booking && (
                  <span className="inline-block mt-2 text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    Order #{notification.booking.slice(-6).toUpperCase()}
                  </span>
                )}
              </div>
              {!notification.isRead && (
                <div className="flex items-center">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
