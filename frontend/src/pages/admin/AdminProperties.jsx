import { useEffect, useState, useCallback } from 'react';
import { propertyApi } from '../../api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useSocket } from '../../context/SocketContext';

export default function AdminProperties() {
  const [pendingProperties, setPendingProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const { socket } = useSocket();

  const loadPendingProperties = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await propertyApi.getPending();
      setPendingProperties(response.data || []);
    } catch (err) {
      setError(err.message || 'Unable to load pending properties');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPendingProperties();
  }, [loadPendingProperties]);

  useEffect(() => {
    if (!socket) return;
    const handler = () => loadPendingProperties();
    socket.on('newPropertyNotification', handler);
    return () => socket.off('newPropertyNotification', handler);
  }, [socket, loadPendingProperties]);

  const handleVerify = async (propertyId, status) => {
    const rejectionReason = status === 'rejected' ? window.prompt('Please enter a rejection reason') : undefined;
    if (status === 'rejected' && !rejectionReason) return;

    setActionLoading(propertyId);
    setError('');

    try {
      await propertyApi.verify({ propertyId, status, rejectionReason });
      await loadPendingProperties();
    } catch (err) {
      setError(err.message || 'Unable to update property status');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Property approvals</h1>
        <p className="mt-2 text-gray-600">Review all newly submitted host listings and approve or reject them with a single click.</p>
      </div>

      {error && <Card className="mb-6 bg-red-50 border-red-200 text-red-700">{error}</Card>}

      {loading ? (
        <Card className="text-center">Loading pending properties…</Card>
      ) : pendingProperties.length === 0 ? (
        <Card className="text-center">There are no pending properties to review right now.</Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {pendingProperties.map((property) => (
            <Card key={property._id} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{property.title}</h2>
                  <p className="text-sm text-gray-600 mt-2">{property.description || 'No description provided yet.'}</p>
                  <div className="mt-3 text-sm text-gray-500 space-y-2">
                    <p><span className="font-medium text-gray-700">Host:</span> {property.hostId?.name || 'Unknown host'}</p>
                    <p><span className="font-medium text-gray-700">Email:</span> {property.hostId?.email || 'No email'}</p>
                    <p><span className="font-medium text-gray-700">Address:</span> {property.location?.address || 'No address'}</p>
                    <p><span className="font-medium text-gray-700">Guests:</span> {property.maxGuests}</p>
                    <p><span className="font-medium text-gray-700">Price per night:</span> ${property.pricePerNight}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {property.images?.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {property.images.slice(0, 4).map((img, index) => (
                        <img key={index} src={img} alt={`Property preview ${index + 1}`} className="w-full h-28 object-cover rounded-lg border" />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-lg h-28 flex items-center justify-center text-gray-500">No images uploaded</div>
                  )}

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="text-sm text-gray-600">Verification documents</p>
                    {property.verificationDocuments ? (
                      <a href={property.verificationDocuments} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline text-sm block mt-2 truncate">
                        View document
                      </a>
                    ) : (
                      <p className="text-sm text-gray-500 mt-2">No verification URL provided.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  onClick={() => handleVerify(property._id, 'approved')}
                  loading={actionLoading === property._id}
                >
                  Approve
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleVerify(property._id, 'rejected')}
                  disabled={actionLoading === property._id}
                >
                  Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
