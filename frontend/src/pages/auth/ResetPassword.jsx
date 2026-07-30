import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function ResetPassword() {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP code');
      return;
    }
    setStep(2);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await authApi.resetPassword({
        token: otp,
        newPassword: password,
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
        ) : step === 1 ? (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <p className="text-sm text-gray-500 text-center">Enter the OTP code sent to your email</p>
            <Input label="OTP Code" required value={otp}
              onChange={(e) => setOtp(e.target.value)} placeholder="Enter 6-digit code" />
            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
            <Button type="submit" className="w-full">Verify OTP</Button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input label="New password" type="password" required minLength={8}
              value={password} onChange={(e) => setPassword(e.target.value)} />
            <Input label="Confirm password" type="password" required
              value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">Update password</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
