import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Loader2, Shield } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      localStorage.setItem('token', 'dummy_jwt_token_123');
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Left Side - Image/Branding */}
      <div className="hidden lg:flex w-1/2 bg-teal-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2 text-white mb-12 hover:opacity-90">
              <ShoppingBag className="w-8 h-8 text-orange-400" />
              <span className="text-2xl font-bold tracking-tight">NexusAI</span>
            </Link>
            
            <h1 className="text-4xl font-bold text-white leading-tight mb-6">
              Welcome back to the future of shopping.
            </h1>
            <p className="text-teal-100 text-lg max-w-md">
              Log in to access your personalized recommendations and lightning-fast visual search.
            </p>
        </div>
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
           <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
               <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
               <circle cx="80" cy="20" r="40" fill="currentColor" />
           </svg>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <ShoppingBag className="w-8 h-8 text-teal-800" />
            <span className="text-2xl font-bold tracking-tight text-gray-900">NexusAI</span>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Log in</h2>
            <p className="text-gray-500 text-sm">Enter your credentials to access your account.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm flex items-start gap-2 rounded-r">
               <Shield className="w-5 h-5 shrink-0" />
               <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                 <label className="block text-sm font-medium text-gray-700">Password</label>
                 <a href="#" className="text-xs text-teal-700 hover:text-teal-900 font-medium">Forgot Password?</a>
              </div>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !formData.email || !formData.password}
              className="w-full bg-teal-800 hover:bg-teal-900 text-white font-medium py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
            >
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Logging in...</> : 'Log In'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
             New here?{' '}
             <Link to="/signup" className="text-teal-700 font-semibold hover:text-teal-900 underline underline-offset-4">
                Create an account
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;