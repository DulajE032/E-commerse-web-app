"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiShoppingCart, FiShield, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../services/AuthContext';
import { motion } from 'framer-motion';

import { GoogleLogin } from '@react-oauth/google';
import { api } from '../services/api';

const SignupPage = () => {
  const router = useRouter();
  const { signup, establishSession } = useAuth();
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
    
    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      setError('Full name must be at least 3 characters long.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!isPasswordStrong) {
      setError('Password does not meet the strength requirements.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const user = await signup({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans relative overflow-hidden py-10">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-96 h-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

      <div className="w-full flex items-center justify-center p-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row-reverse border border-gray-100 min-h-[600px]"
        >
          
          {/* Left Side (Actually Right structurally because of row-reverse) - Branding */}
          <div className="hidden md:flex md:w-1/2 bg-blue-100 p-12 flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
                <Link href="/" className="flex items-center gap-2 text-slate-900 mb-16 hover:opacity-80 group inline-flex">
                  <div className="bg-white p-2 rounded-xl shadow-sm group-hover:shadow-md transition-all">
                    <FiShoppingCart className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-2xl font-extrabold tracking-tight">peraStore</span>
                </Link>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-blue-600 font-bold tracking-widest text-sm uppercase mb-4 block">
                    Join The Community
                  </span>
                  <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
                    Start your <br/> premium journey.
                  </h1>
                  <p className="text-slate-600 text-lg max-w-md leading-relaxed font-medium">
                    Create an account to unlock exclusive offers, personalized recommendations, and a faster checkout experience.
                  </p>
                </motion.div>
            </div>
            
            {/* Geometric Pattern */}
            <div className="absolute bottom-[-10%] left-[-10%] w-[120%] h-[50%] opacity-20 pointer-events-none">
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                 <path d="M0,100 L100,0 L100,100 Z" fill="#FFB84D" />
              </svg>
            </div>
          </div>

          {/* Right Side (Actually Left) - Form */}
          <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-white overflow-y-auto">
            <div className="w-full max-w-sm">
              
              {/* Mobile Logo */}
              <div className="flex md:hidden items-center gap-2 mb-10 justify-center">
                <div className="bg-blue-100 p-2 rounded-xl">
                  <FiShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-2xl font-extrabold tracking-tight text-slate-900">peraStore</span>
              </div>

              <div className="mb-8 text-center md:text-left">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Create Account</h2>
                <p className="text-gray-500 font-medium">Fill in the details below to get started.</p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-3 rounded-2xl"
                >
                   <FiShield className="w-5 h-5 shrink-0 text-red-500" />
                   <p className="font-medium">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 font-medium"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 font-medium"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 font-medium pr-10"
                      placeholder="••••••••"
                    />
                    {formData.password && (
                       <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          {isPasswordStrong ? (
                              <FiCheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          )}
                       </div>
                    )}
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] font-bold tracking-wide uppercase">
                    <span className={passwordStrength.length ? 'text-green-600' : 'text-gray-400'}>8+ chars</span><span className="text-gray-300">•</span>
                    <span className={passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}>1 number</span><span className="text-gray-300">•</span>
                    <span className={passwordStrength.hasSpecial ? 'text-green-600' : 'text-gray-400'}>1 special</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 font-medium"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !isPasswordStrong}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4 group"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="loader" style={{ width: 20 }} />
                      Creating Account...
                    </span>
                  ) : (
                    <>Sign Up <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center my-6 gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400 text-sm font-medium">or continue with</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Google Sign-Up Button */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    setIsLoading(true);
                    setError('');
                    try {
                      const response = await api.googleAuth({ id_token: credentialResponse.credential });
                      await establishSession(response.access_token);
                      router.push('/dashboard');
                    } catch (err) {
                      setError('Google sign-up failed. Please try again.');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  onError={() => {
                    setError('Google sign-up was cancelled or failed.');
                  }}
                  text="signup_with"
                  shape="rectangular"
                  theme="outline"
                  width={350}
                />
              </div>

              <div className="mt-6 text-center text-gray-600 font-medium">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 font-bold hover:text-blue-700 underline-offset-4 hover:underline transition-all">
                   Log in
                </Link>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;
