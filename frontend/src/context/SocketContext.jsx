import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setNotifications((prev) => [{ ...notification, id, read: false }, ...prev]);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => setNotifications([]);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    const newSocket = io({ path: '/socket.io', withCredentials: true });

    const events = {
      connect: () => newSocket.emit('register', user._id || user.id),
      newPropertyNotification: (data) => addNotification({ type: 'property', title: 'New property added', ...data }),
      propertyStatusChanged: (data) => addNotification({ type: 'property', title: 'Property status updated', ...data }),
      newReviewNotification: (data) => addNotification({ type: 'review', title: 'New review received', ...data }),
      reviewReportedNotification: (data) => addNotification({ type: 'review', title: 'Review reported', ...data }),
      reviewActionNotification: (data) => addNotification({ type: 'review', title: 'Review action taken', ...data }),
      newBookingNotification: (data) => addNotification({ type: 'booking', title: 'New booking request', ...data }),
      bookingUpdatedNotification: (data) => addNotification({ type: 'booking', title: 'Booking updated', ...data }),
      bookingCancelledNotification: (data) => addNotification({ type: 'booking', title: 'Booking cancelled', ...data }),
      bookingConfirmedNotification: (data) => addNotification({ type: 'booking', title: 'Booking confirmed', ...data }),
      bookingPaidNotification: (data) => addNotification({ type: 'booking', title: 'Payment received', ...data }),
      bookingCompletedNotification: (data) => addNotification({ type: 'booking', title: 'Stay completed', ...data }),
      bookingRejectedNotification: (data) => addNotification({ type: 'booking', title: 'Booking rejected', ...data }),
      newDisputeNotification: (data) => addNotification({ type: 'dispute', title: 'New dispute opened', ...data }),
      disputeResolvedNotification: (data) => addNotification({ type: 'dispute', title: 'Dispute resolved', ...data }),
    };

    for (const [event, handler] of Object.entries(events)) {
      newSocket.on(event, handler);
    }

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      for (const [event, handler] of Object.entries(events)) {
        newSocket.off(event, handler);
      }
      newSocket.disconnect();
    };
  }, [user, addNotification]);

  return (
    <SocketContext.Provider value={{ socket, notifications, addNotification, markAllRead, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
