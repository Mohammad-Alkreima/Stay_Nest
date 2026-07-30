import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi, propertyApi, reviewApi, disputeApi } from '../../api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useSocket } from '../../context/SocketContext';

export default function AdminDashboard() {
  const [summary, setSummary] = useState({ bookings: 0, reviews: 0, disputes: 0, pendingProperties: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { socket } = useSocket();

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const bookingsResponse = await bookingApi.getAll();
      const reviewsResponse = await reviewApi.getAll();
      const disputesResponse = await disputeApi.getAll();
      const pendingResponse = await propertyApi.getPending();

      setSummary({
        bookings: bookingsResponse.count || 0,
        reviews: reviewsResponse.totalReviews || (reviewsResponse.reviews?.length ?? 0),
        disputes: disputesResponse.totalDisputes || disputesResponse.disputes?.length || 0,
        pendingProperties: pendingResponse.count || 0,
      });
    } catch (err) {
      setError(err.message || 'Unable to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    if (!socket) return;
    const events = ['newPropertyNotification', 'newBookingNotification', 'newReviewNotification', 'bookingCancelledNotification'];
    const handler = () => loadSummary();
    events.forEach((e) => socket.on(e, handler));
    return () => events.forEach((e) => socket.off(e, handler));
  }, [socket, loadSummary]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Admin dashboard</h1>
        <p className="mt-2 text-gray-600">Review platform activity, pending issues, and content moderation in one place.</p>
      </div>

      {error && <Card className="mb-6 bg-red-50 border-red-200 text-red-700">{error}</Card>}
      {loading ? (
        <Card className="text-center">Loading admin overview…</Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-4">
          <Card>
            <p className="text-sm text-gray-500">Total bookings</p>
            <p className="mt-4 text-3xl font-semibold text-gray-900">{summary.bookings}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Total reviews</p>
            <p className="mt-4 text-3xl font-semibold text-gray-900">{summary.reviews}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Open disputes</p>
            <p className="mt-4 text-3xl font-semibold text-gray-900">{summary.disputes}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Pending properties</p>
            <p className="mt-4 text-3xl font-semibold text-gray-900">{summary.pendingProperties}</p>
          </Card>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/admin/properties"><Button className="w-full">Review properties</Button></Link>
        <Link to="/admin/bookings"><Button variant="secondary" className="w-full">Manage bookings</Button></Link>
        <Link to="/admin/reviews"><Button variant="secondary" className="w-full">Manage reviews</Button></Link>
        <Link to="/admin/disputes"><Button variant="secondary" className="w-full">Review disputes</Button></Link>
      </div>
    </div>
  );
}
