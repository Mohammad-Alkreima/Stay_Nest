import { useEffect, useState, useCallback } from 'react';
import { propertyApi } from '../api';
import PropertyCard from '../components/PropertyCard';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useSocket } from '../context/SocketContext';

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { socket } = useSocket();

  const loadProperties = useCallback(async (query = {}) => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (query.location) params.location = query.location;
      const response = await propertyApi.getAll(params);
      setProperties(response.data || []);
    } catch (err) {
      setError(err.message || 'Unable to load properties');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProperties({});
  }, [loadProperties]);

  useEffect(() => {
    if (!socket) return;
    const events = ['propertyStatusChanged'];
    const handler = () => loadProperties({});
    events.forEach((e) => socket.on(e, handler));
    return () => events.forEach((e) => socket.off(e, handler));
  }, [socket, loadProperties]);

  const handleSearch = async (event) => {
    event.preventDefault();
    loadProperties({ location: search });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Explore properties</h1>
          <p className="mt-2 text-gray-600">Find your next stay or manage your hosted properties from the dashboard.</p>
        </div>
        <form className="flex flex-col gap-3 sm:flex-row sm:items-center" onSubmit={handleSearch}>
          <Input
            label="Search by location"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="City, neighborhood, or address"
            className="w-full sm:w-80"
          />
          <Button type="submit" loading={loading} className="w-full sm:w-auto">Search</Button>
        </form>
      </div>

      <div className="mt-8">
        {error && <Card className="mb-6 bg-red-50 border-red-200 text-red-700">{error}</Card>}
        {loading ? (
          <Card className="text-center">Loading properties…</Card>
        ) : properties.length === 0 ? (
          <Card className="text-center">No properties found. Try a different search term.</Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property._id} property={property} showStatus />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
