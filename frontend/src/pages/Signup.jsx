import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, ArrowRight, Wallet } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/signup', formData);
      // On success, redirect to login
      navigate('/login');
    } catch (err) {
      setError(err.response?.data || 'Signup failed. Try a different email/phone.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden py-10">
      {/* Animated Background Gradients */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }} 
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/30 blur-[120px] rounded-full"
      />
      <motion.div 
        animate={{ scale: [1, 1.5, 1], rotate: [0, 90, 0] }} 
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/30 blur-[120px] rounded-full"
      />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl shadow-lg">
            <Wallet className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white text-center mb-2">Create Account</h2>
        <p className="text-gray-400 text-center mb-8">Join PayFlow today</p>

        {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm text-center">{error}</div>}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="relative group">
            <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
            <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} required className="w-full bg-black/30 border border-white/10 text-white placeholder-gray-500 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-all" />
          </div>

          <div className="relative group">
            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
            <input type="email" name="email" placeholder="Email address" onChange={handleChange} required className="w-full bg-black/30 border border-white/10 text-white placeholder-gray-500 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-all" />
          </div>

          <div className="relative group">
            <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
            <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} required className="w-full bg-black/30 border border-white/10 text-white placeholder-gray-500 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-all" />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
            <input type="password" name="password" placeholder="Password (min 6 chars)" onChange={handleChange} required minLength="6" className="w-full bg-black/30 border border-white/10 text-white placeholder-gray-500 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-all" />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit" 
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg mt-4 hover:shadow-blue-600/50 transition-all disabled:opacity-70"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </motion.button>
        </form>

        <p className="text-gray-400 text-center mt-6 text-sm">
          Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}