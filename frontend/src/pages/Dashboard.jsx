import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Send, LogOut, ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Dashboard() {
  const [balance, setBalance] = useState(0);
  const [userName, setUserName] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [recipientPhone, setRecipientPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const navigate = useNavigate();

  // Fetch Balance and Transactions on load
  const fetchData = async () => {
    try {
      const balanceRes = await api.get('/wallet/balance');
      setBalance(balanceRes.data.balance);
      setUserName(balanceRes.data.fullName);

      const txRes = await api.get('/wallet/transactions?page=0&size=5');
      setTransactions(txRes.data.content);
    } catch (err) {
      console.error("Failed to fetch data", err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const idempotencyKey = crypto.randomUUID(); // Unique key for safety
      
      const response = await api.post('/wallet/transfer', {
        recipientPhone,
        amount: parseFloat(amount),
        note
      }, {
        headers: { 'Idempotency-Key': idempotencyKey }
      });

      setMessage({ type: 'success', text: response.data.message });
      setRecipientPhone('');
      setAmount('');
      setNote('');
      fetchData(); // Refresh balance and history
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data || 'Transfer failed.' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Navbar */}
      <div className="relative z-10 flex justify-between items-center mb-10 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-xl">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">PayFlow</h1>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-lg border border-white/10">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Balance & Transfer Form */}
        <div className="space-y-6">
          
          {/* Balance Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-blue-600 to-purple-700 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-blue-100 mb-1">Welcome back, {userName}</p>
              <h2 className="text-5xl font-extrabold mb-6">₹{balance.toFixed(2)}</h2>
              <div className="flex gap-4 text-sm text-blue-200">
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-400 rounded-full"></div> Active Wallet</span>
              </div>
            </div>
          </motion.div>

          {/* Transfer Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl">
            <h3 className="text-xl font-semibold mb-4">Send Money</h3>
            
            {message.text && (
              <div className={`p-3 mb-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleTransfer} className="space-y-4">
              <input type="text" placeholder="Recipient Phone Number" value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} required className="w-full bg-black/30 border border-white/10 text-white placeholder-gray-500 px-4 py-3 rounded-xl focus:border-blue-500 outline-none" />
              <input type="number" placeholder="Amount (₹)" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1" className="w-full bg-black/30 border border-white/10 text-white placeholder-gray-500 px-4 py-3 rounded-xl focus:border-blue-500 outline-none" />
              <input type="text" placeholder="Note (e.g. Dinner)" value={note} onChange={(e) => setNote(e.target.value)} className="w-full bg-black/30 border border-white/10 text-white placeholder-gray-500 px-4 py-3 rounded-xl focus:border-blue-500 outline-none" />
              
              <button disabled={loading} type="submit" className="w-full flex justify-center items-center gap-2 bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-70">
                {loading ? 'Processing...' : <><Send className="w-5 h-5" /> Transfer</>}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Right Column: Transaction History */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl h-fit">
          <h3 className="text-xl font-semibold mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No transactions yet.</p>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center p-4 bg-black/20 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${tx.type === 'SENT' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
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