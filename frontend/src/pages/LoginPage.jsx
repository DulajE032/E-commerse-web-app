import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiShoppingCart, FiShield, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../services/AuthContext';
import { motion } from 'framer-motion';
import Loader from '../components/Loader';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
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
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans relative overflow-hidden">
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
                <Link to="/" className="flex items-center gap-2 text-white mb-16 hover:opacity-90 group inline-flex">
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
            <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-blue-500/30 rounded-full blur-3xl pointer-events-none"></div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-white">
            <div className="w-full max-w-sm">
              
              {/* Mobile Logo */}
              <div className="flex md:hidden items-center gap-2 mb-10 justify-center">
                <div className="bg-slate-900 p-2 rounded-xl">
                  <FiShoppingCart className="w-6 h-6 text-cyan-400" />
                </div>
                <span className="text-2xl font-extrabold tracking-tight text-slate-900">peraStore</span>
              </div>

              <div className="mb-8 text-center md:text-left">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Log in</h2>
                <p className="text-gray-500 font-medium">Welcome back! Please enter your details.</p>
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

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 font-medium"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                     <label className="block text-sm font-bold text-gray-900">Password</label>
                     <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-bold transition-colors">Forgot Password?</a>
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 font-medium"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !formData.email || !formData.password}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2 group"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader size={18} dotSize={6} border={3} />
                      Authenticating...
                    </span>
                  ) : (
                    <>Sign In <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center text-gray-600 font-medium">
                 Don't have an account?{' '}
                 <Link to="/signup" className="text-blue-600 font-bold hover:text-blue-700 underline-offset-4 hover:underline transition-all">
                    Sign up
                 </Link>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
