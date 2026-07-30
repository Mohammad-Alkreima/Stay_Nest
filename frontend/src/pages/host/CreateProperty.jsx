import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyApi, uploadFiles } from '../../api';
import Card from '../../components/ui/Card';
import Input, { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { MapPin, Loader2, CheckCircle2 } from 'lucide-react';

const GEOCODE_URL = 'https://nominatim.openstreetmap.org/search';

export default function CreateProperty() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    address: '',
    lat: '',
    lng: '',
    pricePerNight: '',
    cleaningFee: '',
    serviceFee: '',
    maxGuests: '',
    imageUrl: '',
    amenities: '',
    verificationDocuments: '',
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [verificationDocumentFile, setVerificationDocumentFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoLocated, setGeoLocated] = useState(false);
  const previewUrls = useRef([]);
  const geoTimeout = useRef(null);

  const geocodeAddress = useCallback(async (address) => {
    if (!address?.trim()) return;
    setGeoLoading(true);
    setError('');

    try {
      const url = `${GEOCODE_URL}?q=${encodeURIComponent(address.trim())}&format=json&limit=1`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'en' },
      });
      const data = await res.json();

      if (data?.length > 0) {
        const { lat, lon, display_name } = data[0];
        setForm((prev) => ({
          ...prev,
          address: display_name,
          lat,
          lng: lon,
        }));
        setGeoLocated(true);
        setError('');
      } else {
        setError('Could not find this location. Try a more specific address.');
        setGeoLocated(false);
      }
    } catch {
      setError('Unable to search for location. Please check your connection.');
    } finally {
      setGeoLoading(false);
    }
  }, []);

  const handleAddressChange = (value) => {
    setForm((prev) => ({ ...prev, address: value }));
    setGeoLocated(false);
    if (geoTimeout.current) clearTimeout(geoTimeout.current);
    geoTimeout.current = setTimeout(() => {
      if (value.trim()) geocodeAddress(value);
    }, 800);
  };

  useEffect(() => {
    const urls = previewUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      if (geoTimeout.current) clearTimeout(geoTimeout.current);
    };
  }, []);

  const handleImageFiles = (event) => {
    const files = Array.from(event.target.files || []);
    setImageFiles(files);
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    const newUrls = files.map((file) => URL.createObjectURL(file));
    previewUrls.current = newUrls;
    setImagePreviews(newUrls);
  };

  const handleVerificationFile = (event) => {
    const file = event.target.files?.[0] || null;
    setVerificationDocumentFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.lat || !form.lng) {
      setError('Please enter a valid address and wait for the location to be detected.');
      return;
    }

    setLoading(true);

    try {
      let uploadedImageUrls = [];
      if (imageFiles.length) {
        const uploadResult = await uploadFiles(imageFiles);
        uploadedImageUrls = uploadResult.path || [];
      }

      let verificationDocuments = form.verificationDocuments;
      if (verificationDocumentFile) {
        const uploadResult = await uploadFiles([verificationDocumentFile]);
        verificationDocuments = uploadResult.path?.[0] || verificationDocuments;
      }

      await propertyApi.create({
        title: form.title,
        description: form.description,
        location: {
          type: 'Point',
          coordinates: [Number(form.lng), Number(form.lat)],
          address: form.address,
        },
        pricePerNight: Number(form.pricePerNight),
        cleaningFee: Number(form.cleaningFee || 0),
        serviceFee: Number(form.serviceFee || 0),
        maxGuests: Number(form.maxGuests),
        images: uploadedImageUrls,
        amenities: form.amenities.split(',').map((item) => item.trim()).filter(Boolean),
        verificationDocuments,
      });

      navigate('/host');
    } catch (err) {
      setError(err.message || 'Unable to create property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Create a new property</h1>
        <p className="mt-2 text-gray-600">Add a new listing and submit it for verification.</p>
      </div>

      <Card>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <Input
            label="Title"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            required
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            required
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Property address</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  placeholder="Search for an address or place name..."
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => geocodeAddress(form.address)}
                disabled={geoLoading || !form.address.trim()}
              >
                {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                Locate
              </Button>
            </div>
            {geoLocated && form.lat && form.lng && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>
                  Location found: <strong>{form.lat}, {form.lng}</strong>
                </span>
              </div>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Price per night"
              type="number"
              value={form.pricePerNight}
              onChange={(event) => setForm({ ...form, pricePerNight: event.target.value })}
              required
            />
            <Input
              label="Cleaning fee"
              type="number"
              value={form.cleaningFee}
              onChange={(event) => setForm({ ...form, cleaningFee: event.target.value })}
            />
            <Input
              label="Service fee"
              type="number"
              value={form.serviceFee}
              onChange={(event) => setForm({ ...form, serviceFee: event.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Max guests"
              type="number"
              value={form.maxGuests}
              onChange={(event) => setForm({ ...form, maxGuests: event.target.value })}
              required
            />
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Upload property images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageFiles}
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
              />
              <p className="mt-1 text-xs text-gray-500">Choose images from your device to upload directly.</p>
            </div>
          </div>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {imagePreviews.map((preview, index) => (
                <img key={index} src={preview} alt={`Preview ${index + 1}`} className="h-32 w-full rounded-lg object-cover border" />
              ))}
            </div>
          )}

          {/* <Input
            label="Optional image URL"
            value={form.imageUrl}
            onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
          /> */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Upload verification document</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleVerificationFile}
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
            />
            <p className="mt-1 text-xs text-gray-500">Upload an image of your ID or verification documents.</p>
          </div>

          {/* <Input
            label="Verification document URL"
            value={form.verificationDocuments}
            onChange={(event) => setForm({ ...form, verificationDocuments: event.target.value })}
            placeholder="Optional fallback URL"
          />
          {verificationDocumentFile && (
            <p className="text-sm text-gray-500">Document selected: {verificationDocumentFile.name}</p>
          )} */}

          <Input
            label="Amenities (comma separated)"
            value={form.amenities}
            onChange={(event) => setForm({ ...form, amenities: event.target.value })}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" loading={loading}>Create Property</Button>
        </form>
      </Card>
    </div>
  );
}
