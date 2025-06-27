import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      return;
    }

    // Verify token validity on component mount
    const verifyToken = async () => {
      try {
        await authAPI.verifyResetToken(token);
      } catch (err) {
        setTokenValid(false);
        setError('Invalid or expired reset token');
      }
    };

    verifyToken();
  }, [token]);

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="p-8 text-center">
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Invalid Reset Link
            </h2>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired.
            </p>
            <div className="space-y-4">
              <Link to="/forgot-password">
                <Button className="w-full">
                  Request New Reset Link
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="p-8 text-center">
            <div className="text-6xl mb-6">✅</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Password Reset Successful
            </h2>
            <p className="text-gray-600 mb-6">
              Your password has been successfully reset. You will be redirected to the login page in a few seconds.
            </p>
            <Link to="/login">
              <Button className="w-full">
                Continue to Login
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Reset Your Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                autoComplete="new-password"
                className="w-full"
              />
              <div className="mt-2 text-xs text-gray-500">
                <p>Password must contain:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li className={password.length >= 8 ? 'text-green-600' : ''}>
                    At least 8 characters
                  </li>
                  <li className={/(?=.*[a-z])/.test(password) ? 'text-green-600' : ''}>
                    One lowercase letter
                  </li>
                  <li className={/(?=.*[A-Z])/.test(password) ? 'text-green-600' : ''}>
                    One uppercase letter
                  </li>
                  <li className={/(?=.*\d)/.test(password) ? 'text-green-600' : ''}>
                    One number
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                autoComplete="new-password"
                className="w-full"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || !password || !confirmPassword || password !== confirmPassword}
              className="w-full"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium text-sm">
              Back to Login
            </Link>
          </div>
        </Card>

        {/* Security Notice */}
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            🔒 Security Notice
          </h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Choose a strong, unique password</li>
            <li>• Don't reuse passwords from other accounts</li>
            <li>• Consider using a password manager</li>
            <li>• Log out from all devices after reset</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
