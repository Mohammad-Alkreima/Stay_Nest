import { useEffect, useState, useCallback } from 'react';
import { reviewApi } from '../../api';
import ReviewCard from '../../components/ReviewCard';
import Card from '../../components/ui/Card';
import { useSocket } from '../../context/SocketContext';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { socket } = useSocket();

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await reviewApi.getAll();
      setReviews(response.reviews || []);
    } catch (err) {
      setError(err.message || 'Unable to load reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    if (!socket) return;
    const events = ['newReviewNotification', 'reviewReportedNotification', 'reviewActionNotification'];
    const handler = () => loadReviews();
    events.forEach((e) => socket.on(e, handler));
    return () => events.forEach((e) => socket.off(e, handler));
  }, [socket, loadReviews]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Review moderation</h1>
        <p className="mt-2 text-gray-600">Manage review visibility and reported feedback on the platform.</p>
      </div>

      {error && <Card className="mb-6 bg-red-50 border-red-200 text-red-700">{error}</Card>}
      {loading ? (
        <Card className="text-center">Loading reviews…</Card>
      ) : reviews.length === 0 ? (
        <Card className="text-center">No reviews available.</Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review._id} review={review} isAdmin />
          ))}
        </div>
      )}
    </div>
  );
}
