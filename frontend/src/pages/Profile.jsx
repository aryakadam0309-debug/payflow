import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, LogOut, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [userInfo, setUserInfo] = useState({ email: '', fullName: '' });
  const navigate = useNavigate();

  useEffect(() => {
    // Decode the JWT token to get the user's email (Subject)
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserInfo({ email: payload.sub, fullName: 'Arya Kadam' }); // We'll fetch the real name from DB in a real app
      } catch (e) {
        console.error("Invalid token");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Profile & Security</h1>
        <p className="text-gray-400 mt-1">Manage your personal information and account security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Personal Info Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 p-8 rounded-3xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" /> Personal Information
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
              <div className="p-4 bg-black/30 border border-white/5 rounded-xl text-white">
                {userInfo.fullName}
              </div>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Email Address</label>
              <div className="p-4 bg-black/30 border border-white/5 rounded-xl text-white flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500" />
                {userInfo.email}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security & Session Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 border border-white/10 p-8 rounded-3xl flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" /> Security & Session
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-black/30 border border-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">JWT Authentication</p>
                    <p className="text-xs text-gray-400">Session active</p>
                  </div>
                </div>
                <span className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="mt-8 w-full flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 py-3 rounded-xl font-semibold transition-all"
          >
            <LogOut className="w-5 h-5" /> Logout from this device
          </button>
        </motion.div>

      </div>
    </div>
  );
}