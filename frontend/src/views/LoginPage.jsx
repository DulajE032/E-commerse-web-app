"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiShoppingCart, FiShield, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../services/AuthContext';
import { motion } from 'framer-motion';

import { GoogleLogin } from '@react-oauth/google';
import { api } from '../services/api';
import TurnstileWidget from '../components/TurnstileWidget';

const LoginPage = () => {
  const router = useRouter();
  const { login, establishSession } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState(null);
  const turnstileRef = React.useRef(null);
  
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
      await login(formData.email, formData.password, turnstileToken);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100 font-sans relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

      <div className="w-full flex items-center justify-center p-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100 min-h-[600px]"
        >
          
          {/* Left Side - Image/Branding */}
          <div className="hidden md:flex md:w-1/2 bg-slate-900 p-12 flex-col justify-between relative overflow-hidden text-white">
            <div className="relative z-10">
                <Link href="/" className="flex items-center gap-2 text-white mb-16 hover:opacity-90 group inline-flex">
                  <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20 transition-colors">
                    <FiShoppingCart className="w-6 h-6 text-cyan-400" />
                  </div>
                  <span className="text-2xl font-extrabold tracking-tight">peraStore</span>
                </Link>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-cyan-400 font-bold tracking-widest text-sm uppercase mb-4 block">
                    Welcome Back
                  </span>
                  <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
                    Sign in to <br/> your account.
                  </h1>
                  <p className="text-slate-300 text-lg max-w-md leading-relaxed">
                    Access your personalized shopping experience, view your order history, and checkout faster.
                  </p>
                </motion.div>
            </div>
            {/* Ambient Graphic */}
            <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-cyan-500/20 blur-2xl pointer-events-none"></div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white">
            <div className="max-w-md w-full mx-auto">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Login</h2>
              <p className="text-slate-500 mb-8 text-sm">Welcome back! Please enter your details.</p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm flex items-center gap-2 rounded-r">
                  <FiShield className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-slate-800 placeholder-slate-400"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-slate-800 placeholder-slate-400"
                    placeholder="••••••••"
                  />
                </div>

                <TurnstileWidget
                  ref={turnstileRef}
                  onVerify={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  onError={() => setTurnstileToken(null)}
                  theme="light"
                />

                <button
                  type="submit"
                  disabled={isLoading || !turnstileToken}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-slate-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6 group"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="loader" style={{ width: 20 }} />
                      Logging in...
                    </span>
                  ) : (
                    <>
                      <span>Log In</span>
                      <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center my-6 gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-slate-400 text-sm">or continue with</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Google Sign-In Button */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    setIsLoading(true);
                    setError('');
                    try {
                      const response = await api.googleAuth({ id_token: credentialResponse.credential });
                      await establishSession(response.access_token, response.refresh_token);
                      router.push('/');
                    } catch (err) {
                      setError('Google sign-in failed. Please try again.');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  onError={() => {
                    setError('Google sign-in was cancelled or failed.');
                  }}
                  text="signin_with"
                  shape="rectangular"
                  theme="outline"
                  width={350}
                />
              </div>

              <div className="mt-8 text-center text-sm text-slate-600">
                <p>
                  Don't have an account?{' '}
                  <Link href="/signup" className="text-slate-900 font-bold hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
