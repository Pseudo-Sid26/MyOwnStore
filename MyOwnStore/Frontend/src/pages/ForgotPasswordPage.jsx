import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.forgotPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="p-8">
            <div className="text-center">
              <div className="text-6xl mb-6">📧</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Check Your Email
              </h2>
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                If you don't see the email, check your spam folder or try again.
              </p>
              <div className="space-y-4">
                <Button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Try Different Email
                </Button>
                <Link to="/login">
                  <Button variant="primary" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
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
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            No worries! Enter your email and we'll send you a reset link.
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                autoComplete="email"
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !email}
              className="w-full"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </Card>

        {/* Help Section */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Need Help?
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Check your spam or junk folder</li>
            <li>• Make sure you entered the correct email</li>
            <li>• Reset links expire after 1 hour</li>
            <li>• Contact support if you continue having issues</li>
          </ul>
          <div className="mt-4">
            <Link to="/contact" className="text-blue-600 hover:text-blue-500 font-medium text-sm">
              Contact Support →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
