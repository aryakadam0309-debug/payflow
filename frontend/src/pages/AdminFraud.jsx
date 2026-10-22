import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Bot, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function AdminFraud() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const response = await api.get('/admin/fraud-flags');
        // Sort by newest first
        const sortedFlags = response.data.sort((a, b) => new Date(b.flaggedAt) - new Date(a.flaggedAt));
        setFlags(sortedFlags);
      } catch (err) {
        setError('Failed to load fraud alerts. You might not have admin permissions.');
      } finally {
        setLoading(false);
      }
    };
    fetchFlags();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-10 h-10 text-red-500 animate-spin" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-500" />
            Fraud Detection Center
          </h1>
          <p className="text-gray-400 mt-1">Review suspicious transactions flagged by the Kafka rules engine.</p>
        </div>
      </div>

      {error && <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300">{error}</div>}

      {/* Fraud List */}
      <div className="space-y-4">
        {flags.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
            <ShieldAlert className="w-12 h-12 text-green-500 mx-auto mb-4 opacity-50" />
            <p className="text-xl font-semibold">No Fraud Alerts</p>
            <p className="text-gray-400">The system is clean. No suspicious activity detected.</p>
          </div>
        ) : (
          flags.map((flag) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              key={flag.id} 
              className="bg-white/5 border border-red-500/30 rounded-2xl p-6 relative overflow-hidden"
            >
              {/* Red accent line on the left */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
              
              <div className="flex flex-col md:flex-row justify-between gap-6">
                
                {/* Left Side: Tx Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full border border-red-500/30">
                      {flag.reason}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(flag.flaggedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-lg font-semibold">
                    ₹{flag.amount.toFixed(2)} 
                    <span className="text-gray-400 text-sm font-normal ml-2">
                      from {flag.senderEmail} to {flag.receiverName}
                    </span>
                  </p>
                </div>

                {/* Right Side: AI Explanation */}
                <div className="flex-1 bg-black/30 p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Gemini AI Analysis</span>
                  </div>
                  <p className="text-sm text-gray-300 italic">"{flag.aiExplanation}"</p>
                </div>
                
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}