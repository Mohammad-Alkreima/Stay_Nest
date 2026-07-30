import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi } from '../../api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useSocket } from '../../context/SocketContext';

export default function HostDashboard() {
  const [summary, setSummary] = useState({ bookings: 0, earnings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { socket } = useSocket();

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const bookingsResponse = await bookingApi.getAll({ type: 'upcoming' });
      const earningsResponse = await bookingApi.getHostEarnings();
      setSummary({
        bookings: bookingsResponse.count || 0,
        earnings: earningsResponse.data?.summary?.totalHostEarnings || 0,
      });
    } catch (err) {
      setError(err.message || 'Unable to load host dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    if (!socket) return;
    const events = ['newBookingNotification', 'propertyStatusChanged', 'bookingConfirmedNotification', 'bookingPaidNotification', 'bookingCancelledNotification'];
    const handler = () => loadSummary();
    events.forEach((e) => socket.on(e, handler));
    return () => events.forEach((e) => socket.off(e, handler));
  }, [socket, loadSummary]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Host dashboard</h1>
        <p className="mt-2 text-gray-600">Manage your listings, bookings, and earnings from one place.</p>
      </div>

      {error && <Card className="mb-6 bg-red-50 border-red-200 text-red-700">{error}</Card>}
      {loading ? (
        <Card className="text-center">Loading your host insights…</Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <p className="text-sm text-gray-500">Upcoming bookings</p>
            <p className="mt-4 text-3xl font-semibold text-gray-900">{summary.bookings}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Total earnings</p>
            <p className="mt-4 text-3xl font-semibold text-gray-900">${summary.earnings.toFixed(2)}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Quick actions</p>
            <div className="mt-4 flex flex-col gap-3">
              <Link to="/host/add-property">
                <Button variant="secondary" className="w-full">Add new property</Button>
              </Link>
              <Link to="/host/bookings">
                <Button variant="outline" className="w-full">View bookings</Button>
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
