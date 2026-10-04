import React, { useState, useEffect } from 'react';
import { RotateCcw, Send, CheckCircle2, ShoppingBag, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';

interface AbandonedCheckout {
  id: string;
  customerName?: string;
  customerPhone?: string;
  totalAmount?: number;
  cartValue?: number;
  itemsSummary?: string;
  createdAt?: string;
  recoveryStatus?: string;
}

export const RecoveryCommandCenter: React.FC = () => {
  const [checkouts, setCheckouts] = useState<AbandonedCheckout[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCheckouts();
  }, []);

  const fetchCheckouts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/checkouts');
      if (res.success && Array.isArray(res.checkouts)) {
        setCheckouts(res.checkouts);
      } else {
        setCheckouts([]);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load abandoned checkouts');
    } finally {
      setLoading(false);
    }
  };

  const handleRescueCart = async (id: string, customer: string) => {
    try {
      const res = await api.post(`/api/checkouts/${id}/recover`);
      if (res.success) {
        setNotification(res.message || `Recovery message dispatched to ${customer}`);
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (e: any) {
      setNotification(`Failed to dispatch recovery: ${e.message}`);
    }
  };



  return (
    <div className="space-y-6 animate-in fade-in duration-150 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
              High-Intent Revenue Recovery
            </span>
            <span className="text-xs text-slate-400">Automated WhatsApp &amp; SMS Links</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Abandoned Cart &amp; Dropoff Recovery Deck
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Real-time webhook interception of abandoned Shopify/WooCommerce checkouts. Dispatches 1-tap pre-filled checkout journeys.
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/90 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading abandoned checkout telemetry from storefronts...</p>
        </div>
      ) : checkouts.length === 0 ? (
        <div className="p-10 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3 max-w-xl mx-auto my-8">
          <ShoppingBag className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Abandoned Checkouts Recorded</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            As soon as buyers drop off at checkout in your connected Shopify store, real webhooks immediately surface the lead here for automated WhatsApp recovery.
          </p>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white">Pending High-Intent Recoveries</h2>
          <div className="divide-y divide-slate-800">
            {checkouts.map((cart) => (
              <div key={cart.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">{cart.customerName || 'Anonymous Buyer'}</p>
                  <p className="text-[11px] text-slate-400 font-mono-code">{cart.customerPhone || 'Phone hidden'} · {cart.itemsSummary || 'Cart'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-white">₹{(cart.totalAmount || cart.cartValue || 0).toLocaleString('en-IN')}</span>
                  <button
                    onClick={() => handleRescueCart(cart.id, cart.customerName || 'Buyer')}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send Recovery Voucher</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
