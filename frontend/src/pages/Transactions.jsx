import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchTransactions = async (pageNumber) => {
    try {
      const res = await api.get(`/wallet/transactions?page=${pageNumber}&size=10`);
      setTransactions(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTransactions(page);
  }, [page]);

  // Client-side search filter for demo purposes (Backend search would be better for prod)
  const filteredTx = transactions.filter(tx => 
    tx.counterpartyName.toLowerCase().includes(search.toLowerCase()) || 
    tx.id.toString().includes(search) ||
    (tx.note && tx.note.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        
        <h1 className="text-3xl font-bold mb-8">All Transactions</h1>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search by name, note, or Tx ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-4 py-3 rounded-xl focus:border-blue-500 outline-none"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          {filteredTx.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No transactions found.</p>
          ) : (
            <div className="space-y-4">
              {filteredTx.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center p-4 bg-black/20 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${tx.type === 'SENT' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                      {tx.type === 'SENT' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-semibold">{tx.counterpartyName}</p>
                      <p className="text-xs text-gray-400">Tx ID: #{tx.id} • {tx.note || 'Transfer'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === 'SENT' ? 'text-red-400' : 'text-green-400'}`}>
                      {tx.type === 'SENT' ? '-' : '+'}₹{tx.amount}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/10">
            <button disabled={page === 0} onClick={() => setPage(page - 1)} className="px-4 py-2 bg-white/10 rounded-lg disabled:opacity-50">Previous</button>
            <span className="text-gray-400 text-sm">Page {page + 1} of {totalPages || 1}</span>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="px-4 py-2 bg-white/10 rounded-lg disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}