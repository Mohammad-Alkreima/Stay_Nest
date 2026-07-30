import { useEffect, useState, useCallback } from 'react';
import { bookingApi } from '../../api';
import BookingCard from '../../components/BookingCard';
import Card from '../../components/ui/Card';
import { useSocket } from '../../context/SocketContext';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const { socket } = useSocket();

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await bookingApi.getAll();
      setBookings(response.data || []);
    } catch (err) {
      setError(err.message || 'Unable to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    if (!socket) return;
    const events = ['newBookingNotification', 'bookingUpdatedNotification', 'bookingCancelledNotification', 'bookingConfirmedNotification', 'bookingRejectedNotification'];
    const handler = () => loadBookings();
    events.forEach((e) => socket.on(e, handler));
    return () => events.forEach((e) => socket.off(e, handler));
  }, [socket, loadBookings]);

  const handleConfirm = async (booking) => {
    setActionLoading(booking._id);
    try {
      await bookingApi.confirm(booking._id);
      await loadBookings();
    } catch (err) {
      setError(err.message || 'Unable to confirm booking');
    } finally {
      setActionLoading('');
    }
  };

  const handleReject = async (booking) => {
    const reason = window.prompt('Please enter a rejection reason');
    if (!reason) return;
    setActionLoading(booking._id);
    try {
      await bookingApi.reject(booking._id, { rejectionReason: reason });
      await loadBookings();
    } catch (err) {
      setError(err.message || 'Unable to reject booking');
    } finally {
      setActionLoading('');
    }
  };

  const handleComplete = async (booking) => {
    if (!window.confirm('Mark this booking as completed?')) return;
    setActionLoading(booking._id);
    try {
      await bookingApi.complete(booking._id);
      await loadBookings();
    } catch (err) {
      setError(err.message || 'Unable to complete booking');
    } finally {
      setActionLoading('');
    }
  };

  const handleCancel = async (booking) => {
    if (!window.confirm('Cancel this booking?')) return;
    setActionLoading(booking._id);
    try {
      await bookingApi.cancel(booking._id, { cancellationReason: 'Admin cancelled the booking.' });
      await loadBookings();
    } catch (err) {
      setError(err.message || 'Unable to cancel booking');
    } finally {
      setActionLoading('');
    }
  };

  const buildActions = (booking) => {
    const actions = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingEnd = new Date(booking.endDate);
    bookingEnd.setHours(0, 0, 0, 0);

    if (booking.status === 'pending') {
      actions.push({
        label: 'Confirm',
        variant: 'primary',
        onClick: () => handleConfirm(booking),
        loading: actionLoading === booking._id,
      });
      actions.push({
        label: 'Reject',
        variant: 'secondary',
        onClick: () => handleReject(booking),
        loading: actionLoading === booking._id,
      });
      actions.push({
        label: 'Cancel',
        variant: 'outline',
        onClick: () => handleCancel(booking),
        loading: actionLoading === booking._id,
      });
    }

    if (booking.status === 'confirmed' && bookingEnd <= today) {
      actions.push({
        label: 'Complete',
        variant: 'primary',
        onClick: () => handleComplete(booking),
        loading: actionLoading === booking._id,
      });
    }

    return actions;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">All bookings</h1>
        <p className="mt-2 text-gray-600">Review every reservation across the platform.</p>
      </div>

      {error && <Card className="mb-6 bg-red-50 border-red-200 text-red-700">{error}</Card>}
      {loading ? (
        <Card className="text-center">Loading booking records…</Card>
      ) : bookings.length === 0 ? (
        <Card className="text-center">No bookings available.</Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard key={booking._id} booking={booking} actions={buildActions(booking)} />
          ))}
        </div>
      )}
    </div>
  );
}
