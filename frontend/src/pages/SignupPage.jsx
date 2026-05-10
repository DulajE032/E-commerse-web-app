import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Loader2, CheckCircle2, Shield } from 'lucide-react';

const SignupPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    hasNumber: false,
    hasSpecial: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      setPasswordStrength({
        length: value.length >= 8,
        hasNumber: /\d/.test(value),
        hasSpecial: /[!@#$%^&*]/.test(value)
      });
    }
  };

  const isPasswordStrong = passwordStrength.length && passwordStrength.hasNumber && passwordStrength.hasSpecial;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      localStorage.setItem('token', 'dummy_jwt_token_123');
      navigate('/dashboard');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-1/2 bg-orange-100 p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2 text-teal-900 mb-12 hover:opacity-80">
              <ShoppingBag className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold tracking-tight">NexusAI</span>
            </Link>
            
            <h1 className="text-4xl font-bold text-teal-900 leading-tight mb-6">
              Join the next generation of e-commerce.
            </h1>
            <p className="text-teal-800 text-lg max-w-md">
              Create an account to use visual search matching and personalized offers.
            </p>
        </div>
        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none text-orange-300">
           <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
               <circle cx="20" cy="80" r="30" fill="currentColor" />
           </svg>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <ShoppingBag className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold tracking-tight text-gray-900">NexusAI</span>
          </div>

          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create an account</h2>
            <p className="text-gray-500 text-sm">Fill in the details below to get started.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm flex items-start gap-2 rounded-r">
               <Shield className="w-5 h-5 shrink-0" />
               <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                placeholder="John Doe"
              />
            </div>

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  placeholder="••••••••"
                />
                {formData.password && (
                   <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isPasswordStrong ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                          <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                      )}
                   </div>
                )}
              </div>
              <div className="mt-2 flex gap-2 text-xs">
                <span className={passwordStrength.length ? 'text-green-600' : 'text-gray-400'}>8+ chars</span>•
                <span className={passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}>1 number</span>•
                <span className={passwordStrength.hasSpecial ? 'text-green-600' : 'text-gray-400'}>1 special char</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !isPasswordStrong}
              className="w-full bg-teal-800 hover:bg-teal-900 text-white font-medium py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
            >
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-700 font-semibold hover:text-teal-900 underline underline-offset-4">
               Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;