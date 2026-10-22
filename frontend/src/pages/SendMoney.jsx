import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function SendMoney() {
  const [step, setStep] = useState(1); // 1 = Form, 2 = Confirmation
  const [formData, setFormData] = useState({ recipientPhone: '', amount: '', note: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProceed = (e) => {
    e.preventDefault();
    if (parseFloat(formData.amount) <= 0) {
      setStatus({ type: 'error', text: 'Amount must be greater than 0' });
      return;
    }
    setStep(2);
  };

  const handleTransfer = async () => {
    setLoading(true);
    setStatus({ type: '', text: '' });

    try {
      const idempotencyKey = crypto.randomUUID();
      
      const response = await api.post('/wallet/transfer', {
        recipientPhone: formData.recipientPhone,
        amount: parseFloat(formData.amount),
        note: formData.note
      }, {
        headers: { 'Idempotency-Key': idempotencyKey }
      });

      setStatus({ type: 'success', text: response.data.message });
      setTimeout(() => navigate('/dashboard'), 2000); // Go back to dashboard after 2s
    } catch (err) {
      setStatus({ type: 'error', text: err.response?.data || 'Transfer failed.' });
      setStep(1); // Go back to form on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 flex justify-center items-center relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
      
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
        
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {status.text && (
          <div className={`p-4 mb-6 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            {status.text}
          </div>
        )}

        {step === 1 ? (
          <>
            <h2 className="text-2xl font-bold mb-6">Send Money</h2>
            <form onSubmit={handleProceed} className="space-y-4">
              <input type="text" name="recipientPhone" placeholder="Recipient Phone Number" value={formData.recipientPhone} onChange={handleChange} required className="w-full bg-black/30 border border-white/10 text-white px-4 py-3 rounded-xl focus:border-blue-500 outline-none" />
              <input type="number" name="amount" placeholder="Amount (₹)" value={formData.amount} onChange={handleChange} required min="1" className="w-full bg-black/30 border border-white/10 text-white px-4 py-3 rounded-xl focus:border-blue-500 outline-none" />
              <input type="text" name="note" placeholder="Note (Optional)" value={formData.note} onChange={handleChange} className="w-full bg-black/30 border border-white/10 text-white px-4 py-3 rounded-xl focus:border-blue-500 outline-none" />
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors">
                Review Transfer
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">Confirm Transfer</h2>
            <div className="bg-black/30 p-6 rounded-2xl mb-6 space-y-3 text-center">
              <p className="text-gray-400 text-sm">Sending to</p>
              <p className="font-semibold text-lg">{formData.recipientPhone}</p>
              <hr className="border-white/10" />
              <p className="text-4xl font-extrabold text-blue-400">₹{parseFloat(formData.amount).toFixed(2)}</p>
              {formData.note && <p className="text-sm text-gray-400">"{formData.note}"</p>}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} disabled={loading} className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50">Cancel</button>
              <button onClick={handleTransfer} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-500 py-3 rounded-xl font-semibold flex justify-center items-center gap-2 transition-colors disabled:opacity-50">
                {loading ? 'Processing...' : <><Send className="w-4 h-4" /> Confirm</>}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}