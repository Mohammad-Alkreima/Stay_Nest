import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('');
    setLoading(true);
    try {
      const updated = await authApi.update(user._id || user.id, {
        name: form.name,
        phone: form.phone,
      });
      setUser(updated.user || updated);
      setStatus('Profile updated successfully.');
    } catch (err) {
      setStatus(err.message || 'Unable to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">My profile</h1>
        <p className="mt-2 text-gray-600">Manage your account details and contact information.</p>
      </div>

      <Card>
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="mt-1 text-gray-900">{user?.email || 'Not available'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
            <Input
              label="Phone number"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
            />
            {status && <p className="text-sm text-gray-700">{status}</p>}
            <Button type="submit" loading={loading}>Save changes</Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
