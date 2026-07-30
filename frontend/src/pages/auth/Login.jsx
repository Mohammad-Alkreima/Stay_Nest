import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const ERROR_MESSAGES = {
  'Invalid Data': 'Invalid email or password. Please try again.',
  'You can not login now': 'Account temporarily locked due to multiple failed attempts. Please try again in 30 minutes.',
  'Please log in using Google authentication.': 'This account uses Google authentication. Please sign in with Google.',
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const profile = await login(form);
      const target = profile.role === 'admin' ? '/admin' : profile.role === 'host' ? '/host' : '/';
      navigate(target, { replace: true });
    } catch (err) {
      setError(ERROR_MESSAGES[err.message] || err.message || 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to StayNest</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Password" type="password" required value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />

          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

          <Button type="submit" loading={loading} className="w-full">Sign In</Button>
        </form>

        <div className="mt-4 text-center space-y-3">
          <a
            href="/api/v1/auth/google"
            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Continue with Google
          </a>
          <div className="text-sm text-gray-500">
            <Link to="/forgot-password" className="text-primary-600 hover:underline">Forgot password?</Link>
          </div>
          <p className="text-gray-500">
            Don&apos;t have an account? <Link to="/signup" className="text-primary-600 hover:underline">Sign up</Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
