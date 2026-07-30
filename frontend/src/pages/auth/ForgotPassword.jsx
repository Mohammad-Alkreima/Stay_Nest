import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      setMessage(res.message || 'A password reset link has been sent to your email');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Forgot password</h1>
        {message ? (
          <div className="text-center">
            <p className="text-green-600 mb-4">{message}</p>
            <Link to="/login" className="text-primary-600 hover:underline">Return to login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)} />
            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">Send reset link</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
