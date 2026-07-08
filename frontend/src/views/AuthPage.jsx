"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingBag, CheckCircle2, Shield } from 'lucide-react';
import Loader from '../components/Loader';

const AuthPage = () => {
  const location = usePathname();
  const navigate = useRouter();
  // Check URL params to determine initial mode
  const initialMode = new URLSearchParams(location.search).get('mode') === 'signup' ? 'signup' : 'login';
  
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
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

  // Toggle between login and signup
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual axios call to FastAPI
      /* 
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const payload = isLogin 
        ? new URLSearchParams({ username: formData.email, password: formData.password }) // OAuth2PasswordRequestForm expects form data
        : { email: formData.email, password: formData.password, full_name: formData.fullName };
      
      const response = await axios.post(`http://localhost:8000${endpoint}`, payload);
      localStorage.setItem('token', response.data.access_token);
      */

      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate fake token & redirect
      localStorage.setItem('token', 'dummy_jwt_token_123');
      navigate.push('/dashboard');

    } catch (err) {
      // Handle Axios error (e.g., 401 Unauthorized)
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isPasswordStrong = passwordStrength.length && passwordStrength.hasNumber && passwordStrength.hasSpecial;

  return (
    <div className="min-h-screen flex bg-gray-50">
      
      {/* Left Side - Image/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-blue-600 p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
            <div className="flex items-center gap-2 text-white mb-12 cursor-pointer" onClick={() => navigate('/')}>
              <ShoppingBag className="w-8 h-8" />
              <span className="text-2xl font-bold font-sans tracking-tight">NexusAI</span>
            </div>
            
            <h1 className="text-4xl font-bold text-white leading-tight mb-6">
              {isLogin ? 'Welcome back to the future of shopping.' : 'Join the next generation of e-commerce.'}
            </h1>
            <p className="text-blue-100 text-lg max-w-md">
              Our AI-powered visual search makes finding exactly what you want effortless and intuitive.
            </p>
        </div>

        {/* Abstract decorative background */}
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
           <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
               <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
               <circle cx="80" cy="20" r="40" fill="currentColor" />
               <circle cx="20" cy="80" r="30" fill="currentColor" />
           </svg>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-2 text-blue-600 mb-8 justify-center cursor-pointer" onClick={() => navigate('/')}>
            <ShoppingBag className="w-8 h-8" />
            <span className="text-2xl font-bold font-sans tracking-tight text-gray-900">NexusAI</span>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Log in to your account' : 'Create an account'}
            </h2>
            <p className="text-gray-500 text-sm">
              {isLogin ? 'Enter your credentials to access your dashboard.' : 'Fill in the details below to get started.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm flex items-start gap-2 rounded-r">
               <Shield className="w-5 h-5 shrink-0" />
               <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                 <label className="block text-sm font-medium text-gray-700">Password</label>
                 {isLogin && <a href="#" className="text-xs text-blue-600 hover:text-blue-800 font-medium">Forgot Password?</a>}
              </div>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                />
                {!isLogin && formData.password && (
                   <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isPasswordStrong ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                          <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                      )}
                   </div>
                )}
              </div>
              
              {/* Password strength indicators for signup */}
              {!isLogin && (
                <div className="mt-2 flex gap-2 text-xs">
                  <span className={passwordStrength.length ? 'text-green-600' : 'text-gray-400'}>8+ chars</span>•
                  <span className={passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}>1 number</span>•
                  <span className={passwordStrength.hasSpecial ? 'text-green-600' : 'text-gray-400'}>1 special</span>
                </div>
              )}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || (!isLogin && !isPasswordStrong)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader size={18} dotSize={6} border={3} />
                  {isLogin ? 'Logging in...' : 'Creating account...'}
                </span>
              ) : (
                isLogin ? 'Log In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            {isLogin ? (
              <p>
                New here?{' '}
                <button onClick={toggleMode} className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                  Create an account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button onClick={toggleMode} className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                  Log in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;