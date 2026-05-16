import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Shield } from 'lucide-react';
import { useAuth } from '../services/AuthContext';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { adminLogin, isAuthenticated, user, isInitializing } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (isInitializing || !isAuthenticated || !user) {
      return;
    }

    if (user.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
      return;
    }

    navigate('/dashboard', { replace: true });
  }, [isAuthenticated, isInitializing, navigate, user]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await adminLogin(formData.email, formData.password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid admin credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-2">Admin Login</h1>
        <p className="text-sm text-gray-400 mb-6">Authorized administrators only.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-950 border border-red-700 text-red-300 rounded-lg flex items-start gap-2">
            <Shield className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 block mb-1">Admin Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-1">Password</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !formData.email || !formData.password}
            className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg py-2.5 font-medium disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign in as Admin'}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-400 text-center">
          Regular user?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300">
            Go to user login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
