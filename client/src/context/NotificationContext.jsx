import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/axios';
import { socketService } from '../utils/socket';
import { AuthContext } from './AuthContext';
import toast from 'react-hot-toast';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      // 1. Fetch initial state
      const fetchNotifications = async () => {
        try {
          const res = await api.get('/notifications');
          setNotifications(res.data.data);
          setUnreadCount(res.data.unreadCount);
        } catch (error) {
          console.error('Failed to load notifications', error);
        }
      };

      fetchNotifications();

      // 2. Setup Socket Connection & Join Room
      const socket = socketService.connect();
      socket.emit('join_user_room', { userId: user._id, role: user.role });

      // 3. Listen for incoming notifications
      const handleNewNotification = (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Show toast for important real-time events
        if (notification.type === 'PORTER_REQUEST') {
          toast.success(notification.title + ': ' + notification.message, { duration: 10000, icon: '🛎️' });
        } else if (notification.type === 'PORTER_ACCEPTED') {
          toast.success('Porter Found! ' + notification.message, { duration: 6000, icon: '🎉' });
        } else {
          toast(notification.title, { icon: '🔔' });
        }
      };

      socketService.on('notification:new', handleNewNotification);

      return () => {
        socketService.off('notification:new');
      };
    }
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
