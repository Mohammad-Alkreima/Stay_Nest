import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyApi, reviewApi, bookingApi } from '../api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Star } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const { socket } = useSocket();
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const defaultStartDate = useMemo(() => today.toISOString().split('T')[0], [today]);
  const defaultEndDate = useMemo(() => {
    const nextDay = new Date(today);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  }, [today]);

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  const loadProperty = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await propertyApi.getById(id);
      setProperty(response.data);
      const reviewResult = await reviewApi.getByProperty(id);
      setReviews(reviewResult.reviews || []);
    } catch (err) {
      setError(err.message || 'Unable to load property details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProperty();
  }, [loadProperty]);

  useEffect(() => {
    if (!socket) return;
    socket.on('propertyStatusChanged', (data) => {
      if (data.propertyId === id) loadProperty();
    });
    return () => socket.off('propertyStatusChanged');
  }, [socket, id, loadProperty]);

  const nights = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [startDate, endDate]);

  const totalPrice = useMemo(() => {
    if (!property || nights < 1) return 0;
    const subtotal = nights * property.pricePerNight;
    return subtotal + (property.cleaningFee || 0) + (property.serviceFee || 0);
  }, [nights, property]);

  const minEndDate = useMemo(() => {
    const nextDay = new Date(startDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  }, [startDate]);

  const handleBooking = async () => {
    setBookingError('');
    setBookingSuccess('');
    setBookingLoading(true);

    if (nights < 1) {
      setBookingError('Please select valid check-in and check-out dates.');
      setBookingLoading(false);
      return;
    }

    if (property.status !== 'available') {
      setBookingError('This property is not available for booking.');
      setBookingLoading(false);
      return;
    }

    try {
      await bookingApi.create({
        propertyId: id,
        startDate,
        endDate,
      });
      setBookingSuccess('Booking submitted successfully. You can review it in your bookings.');
      navigate('/bookings');
    } catch (err) {
      setBookingError(err.message || 'Unable to create booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <Card className="text-center">Loading property details…</Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <Card className="text-center bg-red-50 border-red-200 text-red-700">{error}</Card>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <Card className="text-center">Property not found.</Card>
      </div>
    );
  }

  const image = property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop';
  const averageRating = reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
        <div>
          <div className="overflow-hidden rounded-3xl shadow-sm border border-gray-200">
            <img src={image} alt={property.title} className="w-full h-[420px] object-cover" />
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-semibold text-gray-900">{property.title}</h1>
              <p className="text-gray-500">{property.location?.address || 'Address not available'}</p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  {averageRating ? averageRating.toFixed(1) : 'No reviews yet'}
                </span>
                <span>{property.maxGuests} guests</span>
                <span>${property.pricePerNight} per night</span>
              </div>
            </div>

            <Card>
              <h2 className="text-xl font-semibold text-gray-900">About this property</h2>
              <p className="mt-3 text-gray-600 whitespace-pre-line">{property.description || 'No description provided.'}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-600">
                <div>
                  <p className="font-medium text-gray-900">Cleaning fee</p>
                  <p>${property.cleaningFee ?? 0}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Service fee</p>
                  <p>${property.serviceFee ?? 0}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Status</p>
                  <p>{property.status}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Verification</p>
                  <p>{property.isVerified ? 'Verified' : 'Pending review'}</p>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
              {reviews.length === 0 ? (
                <p className="mt-4 text-gray-600">No reviews are available for this property yet.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="rounded-2xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-gray-900">{review.reviewerId?.name || 'Guest'}</p>
                          <p className="mt-1 text-sm text-gray-500">{review.reviewerRole}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
                          <Star className="h-4 w-4" /> {review.rating}
                        </span>
                      </div>
                      {review.comment && <p className="mt-3 text-gray-600">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        <aside className="space-y-6">
          <Card>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Host</p>
                <p className="text-lg font-semibold text-gray-900">{property.hostId?.name || 'Host'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                <p className="text-gray-900">{property.hostId?.email || 'Not available'}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Price summary</p>
                <p className="font-semibold text-gray-900">${property.pricePerNight}/night</p>
              </div>
              <div className="space-y-4">
                <Input
                  label="Check-in"
                  type="date"
                  value={startDate}
                  onChange={(event) => {
                    setStartDate(event.target.value);
                    if (new Date(event.target.value) >= new Date(endDate)) {
                      const nextDay = new Date(event.target.value);
                      nextDay.setDate(nextDay.getDate() + 1);
                      setEndDate(nextDay.toISOString().split('T')[0]);
                    }
                  }}
                  min={defaultStartDate}
                />
                <Input
                  label="Check-out"
                  type="date"
                  value={endDate}
                  min={minEndDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                  <div>
                    <p className="font-medium text-gray-900">Nights</p>
                    <p>{nights}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Total price</p>
                    <p>${totalPrice.toFixed(2)}</p>
                  </div>
                </div>
                {bookingError && <p className="text-sm text-red-600">{bookingError}</p>}
                {bookingSuccess && <p className="text-sm text-green-600">{bookingSuccess}</p>}
                <Button
                  className="w-full"
                  onClick={handleBooking}
                  loading={bookingLoading}
                  disabled={property.status !== 'available'}
                >
                  {property.status === 'available' ? 'Book this place' : 'Unavailable'}
                </Button>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
