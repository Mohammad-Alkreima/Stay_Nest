import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({ password: '', passwordConfirm: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.passwordConfirm) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await authApi.resetPassword({
        token: params.get('token'),
        password: form.password,
      });
      setMessage(res.message || 'Your password has been updated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Reset password</h1>
        {message ? (
          <div className="text-center">
            <p className="text-green-600 mb-4">{message}</p>
            <Link to="/login" className="text-primary-600 hover:underline">Sign in</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="New password" type="password" required minLength={8}
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <Input label="Confirm password" type="password" required
              value={form.passwordConfirm} onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })} />
            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">Update password</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
