import { useEffect, useState, useCallback } from 'react';
import { bookingApi, reviewApi, disputeApi } from '../../api';
import BookingCard from '../../components/BookingCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Modal } from '../../components/ui/Card';
import { useSocket } from '../../context/SocketContext';

export default function HostBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [disputeTarget, setDisputeTarget] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');
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
    const events = ['newBookingNotification', 'bookingUpdatedNotification', 'bookingCancelledNotification', 'bookingConfirmedNotification', 'bookingPaidNotification', 'bookingCompletedNotification', 'bookingRejectedNotification'];
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

  const handleRejectClick = (booking) => {
    setRejectTarget(booking);
    setRejectReason('');
  };

  const handleRejectSubmit = async () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    setActionLoading(rejectTarget._id);
    try {
      await bookingApi.reject(rejectTarget._id, { rejectionReason: rejectReason.trim() });
      setRejectTarget(null);
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

  const handleReviewSubmit = async () => {
    if (!reviewTarget) return;
    setActionLoading(reviewTarget._id);
    try {
      await reviewApi.create({ bookingId: reviewTarget._id, rating: reviewForm.rating, comment: reviewForm.comment, reviewerRole: 'hostToGuest' });
      setReviewTarget(null);
      setReviewForm({ rating: 5, comment: '' });
      await loadBookings();
    } catch (err) {
      setError(err.message || 'Unable to submit review');
    } finally {
      setActionLoading('');
    }
  };

  const handleDisputeSubmit = async () => {
    if (!disputeTarget || !disputeReason.trim()) return;
    setActionLoading(disputeTarget._id);
    try {
      await disputeApi.create({ bookingId: disputeTarget._id, reason: disputeReason.trim() });
      setDisputeTarget(null);
      setDisputeReason('');
      await loadBookings();
    } catch (err) {
      setError(err.message || 'Unable to create dispute');
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
        onClick: () => handleRejectClick(booking),
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

    if (booking.status === 'completed') {
      actions.push({
        label: 'Write review',
        variant: 'secondary',
        onClick: () => { setReviewTarget(booking); setReviewForm({ rating: 5, comment: '' }); },
      });
      if (booking.payment?.status === 'held') {
        actions.push({
          label: 'Open dispute',
          variant: 'outline',
          onClick: () => { setDisputeTarget(booking); setDisputeReason(''); },
        });
      }
    }

    return actions;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Booking requests</h1>
        <p className="mt-2 text-gray-600">Monitor reservations for your hosted properties.</p>
      </div>

      {error && <Card className="mb-6 bg-red-50 border-red-200 text-red-700">{error}</Card>}
      {loading ? (
        <Card className="text-center">Loading booking requests…</Card>
      ) : bookings.length === 0 ? (
        <Card className="text-center">No booking requests found.</Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard key={booking._id} booking={booking} actions={buildActions(booking)} />
          ))}
        </div>
      )}

      <Modal open={!!reviewTarget} onClose={() => setReviewTarget(null)} title="Write a review">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <select
              value={reviewForm.rating}
              onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comment (optional)</label>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              rows={3}
              placeholder="Share your experience..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setReviewTarget(null)}>Cancel</Button>
            <Button onClick={handleReviewSubmit} loading={actionLoading === reviewTarget?._id}>Submit review</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!disputeTarget} onClose={() => setDisputeTarget(null)} title="Open a dispute">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              rows={3}
              placeholder="Describe the issue..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDisputeTarget(null)}>Cancel</Button>
            <Button onClick={handleDisputeSubmit} loading={actionLoading === disputeTarget?._id} disabled={!disputeReason.trim()}>Submit dispute</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title="Reject Booking">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rejection reason</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              rows={3}
              placeholder="Explain why this booking is being rejected..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={handleRejectSubmit}
              loading={actionLoading === rejectTarget?._id}
              disabled={!rejectReason.trim()}
            >
              Reject
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
