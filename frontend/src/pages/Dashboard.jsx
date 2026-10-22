import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, ArrowUpRight, ArrowDownLeft, Loader2, History } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Dashboard() {
  const [balance, setBalance] = useState(0);
  const [userName, setUserName] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const balanceRes = await api.get('/wallet/balance');
        setBalance(balanceRes.data.balance);
        setUserName(balanceRes.data.fullName);

        const txRes = await api.get('/wallet/transactions?page=0&size=5');
        setTransactions(txRes.data.content);
      } catch (err) {
        if (err.response?.status === 403 || err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [navigate]);

  if (fetching) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-10 h-10 text-blue-500 animate-spin" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-400">Hello, {userName}. Here is your financial overview.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Balance Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1 bg-gradient-to-br from-blue-600 to-purple-700 p-8 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <p className="text-blue-100 mb-1">Available Balance</p>
            <h2 className="text-4xl font-extrabold mb-8">₹{balance.toFixed(2)}</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Link to="/send" className="flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-gray-100 py-3 rounded-xl font-semibold transition-all">
              <Send className="w-4 h-4" /> Send
            </Link>
            <Link to="/transactions" className="flex items-center justify-center gap-2 bg-blue-900/40 hover:bg-blue-900/60 text-white py-3 rounded-xl font-semibold transition-all">
              <History className="w-4 h-4" /> History
            </Link>
          </div>
        </motion.div>

        {/* Right Column: Recent Transactions */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Recent Activity</h3>
            <Link to="/transactions" className="text-blue-400 text-sm hover:underline">View All</Link>
          </div>
          
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No recent transactions.</p>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center p-4 bg-black/20 rounded-2xl border border-white/5 hover:bg-black/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${tx.type === 'SENT' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                      {tx.type === 'SENT' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{tx.counterpartyName}</p>
                      <p className="text-xs text-gray-400">{tx.note || 'Transfer'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === 'SENT' ? 'text-red-400' : 'text-green-400'}`}>
                      {tx.type === 'SENT' ? '-' : '+'}₹{tx.amount}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}