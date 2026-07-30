import { useEffect, useState, useCallback } from 'react';
import { bookingApi } from '../../api';
import Card from '../../components/ui/Card';
import { useSocket } from '../../context/SocketContext';

export default function HostEarnings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { socket } = useSocket();

  const loadEarnings = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await bookingApi.getHostEarnings();
      setData(response.data);
    } catch (err) {
      setError(err.message || 'Unable to load earnings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEarnings();
  }, [loadEarnings]);

  useEffect(() => {
    if (!socket) return;
    const events = ['bookingCompletedNotification', 'bookingPaidNotification'];
    const handler = () => loadEarnings();
    events.forEach((e) => socket.on(e, handler));
    return () => events.forEach((e) => socket.off(e, handler));
  }, [socket, loadEarnings]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Earnings</h1>
        <p className="mt-2 text-gray-600">See your completed bookings and monthly revenue breakdown.</p>
      </div>

      {error && <Card className="mb-6 bg-red-50 border-red-200 text-red-700">{error}</Card>}
      {loading ? (
        <Card className="text-center">Loading earnings summary…</Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <p className="text-sm text-gray-500">Completed bookings</p>
            <p className="mt-4 text-3xl font-semibold text-gray-900">{data?.summary?.totalBookings ?? 0}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Total revenue</p>
            <p className="mt-4 text-3xl font-semibold text-gray-900">${data?.summary?.totalRevenue?.toFixed(2) ?? '0.00'}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Host earnings</p>
            <p className="mt-4 text-3xl font-semibold text-gray-900">${data?.summary?.totalHostEarnings?.toFixed(2) ?? '0.00'}</p>
          </Card>
        </div>
      )}

      {data?.monthlyBreakdown?.length > 0 && (
        <Card className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900">Monthly breakdown</h2>
          <div className="mt-4 space-y-4">
            {data.monthlyBreakdown.map((month) => (
              <div key={`${month.year}-${month.month}`} className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-2xl border border-gray-200 p-4">
                <div>
                  <p className="text-sm text-gray-500">Period</p>
                  <p className="font-medium text-gray-900">{month.year} / {month.month}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Revenue</p>
                  <p className="font-medium text-gray-900">${month.monthlyRevenue?.toFixed(2) ?? '0.00'}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
