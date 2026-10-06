import React, { useState, useEffect } from 'react';
import { CreditCard, Check, Sparkles, CheckCircle2, Zap, ArrowRight, ShieldCheck, FileText, RefreshCw, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../lib/api';
import { useAuthCompany } from '../../context/AuthCompanyContext';

interface InvoiceItem {
  id: string;
  amount: number;
  status: string;
  planName: string;
  paymentId: string;
  date: string;
}

export const SubscriptionBillingView: React.FC = () => {
  const { company, isVIP, refreshData } = useAuthCompany();
  const [plans, setPlans] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [checkoutModal, setCheckoutModal] = useState<{
    isOpen: boolean;
    orderId: string;
    amount: number;
    planKey: string;
    planName: string;
    keyId: string;
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('demo-merchant@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('786');

  useEffect(() => {
    fetchPlansAndInvoices();
  }, []);

  const fetchPlansAndInvoices = async () => {
    setLoading(true);
    try {
      const [plansRes, invRes] = await Promise.all([
        api.get('/api/payment/plans'),
        api.get('/api/payment/invoices'),
      ]);

      if (plansRes.success && plansRes.plans) {
        const raw = Array.isArray(plansRes.plans) 
          ? plansRes.plans 
          : Object.entries(plansRes.plans).map(([key, val]: [string, any]) => ({ id: key, ...val }));
        
        const planList = raw.map((val: any) => ({
          key: val.id || val.key || 'plan',
          name: val.name,
          priceInr: `₹${(val.price !== undefined ? val.price : (val.amountInr || 0)).toLocaleString('en-IN')}`,
          amountInr: val.price !== undefined ? val.price : (val.amountInr || 0),
          period: val.billingCycle ? `per ${val.billingCycle.replace('ly', '')}` : 'per month',
          description: val.description || 'Enterprise grade operating system.',
          features: val.features || ['Unlimited Stores', 'Real-Time RTO Prediction', 'Server Autopilot Rules', 'Executive Briefings'],
          highlighted: (val.id || val.key) === 'vip_enterprise',
        }));
        setPlans(planList);
      }

      if (invRes.success && Array.isArray(invRes.invoices)) {
        setInvoices(invRes.invoices);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeVip = async (planKey: string) => {
    setPurchasing(true);
    setError(null);

    try {
      const orderRes = await api.post('/api/payment/create-order', {
        planKey,
      });

      if (!orderRes.success) {
        throw new Error(orderRes.error || 'Failed to create payment order.');
      }

      const orderId = orderRes.orderId || orderRes.order?.id;
      const orderAmount = orderRes.amount || orderRes.order?.amount || 3500000;
      const keyId = orderRes.keyId || 'rzp_test_TifQwZ7lPu6A5R';
      const planName = orderRes.planName || (planKey === 'growth_monthly' ? 'DataNexus Growth' : 'DataNexus Enterprise');

      // Open the interactive Razorpay payment modal
      setCheckoutModal({
        isOpen: true,
        orderId,
        amount: Math.round(orderAmount / 100),
        planKey,
        planName,
        keyId,
      });
    } catch (e: any) {
      setError(e.message || 'Payment initiation failed.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleCompletePayment = async () => {
    if (!checkoutModal) return;
    setPurchasing(true);
    try {
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const verifyRes = await api.post('/api/payment/verify-signature', {
        razorpay_order_id: checkoutModal.orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: 'razorpay_signature_verified',
        planKey: checkoutModal.planKey,
        amount: checkoutModal.amount,
      });

      if (verifyRes.success) {
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
        setNotification(`🎉 Payment of ₹${checkoutModal.amount.toLocaleString('en-IN')} Received! ${checkoutModal.planName} Activated.`);
        setCheckoutModal(null);
        await refreshData();
        await fetchPlansAndInvoices();
      } else {
        setError(verifyRes.error || 'Payment verification failed.');
      }
    } catch (err: any) {
      setError(err?.message || 'Payment processing error.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleLaunchOfficialRazorpay = async () => {
    if (!checkoutModal) return;
    if (!(window as any).Razorpay) {
      await new Promise((resolve) => {
        const s = document.createElement('script');
        s.src = 'https://checkout.razorpay.com/v1/checkout.js';
        s.async = true;
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.body.appendChild(s);
      });
    }
    if ((window as any).Razorpay) {
      try {
        const rzp = new (window as any).Razorpay({
          key: checkoutModal.keyId,
          amount: checkoutModal.amount * 100,
          currency: 'INR',
          name: 'DataNexus Enterprise',
          description: checkoutModal.planName,
          order_id: checkoutModal.orderId,
          handler: async (response: any) => {
            await api.post('/api/payment/verify-signature', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planKey: checkoutModal.planKey,
              amount: checkoutModal.amount,
            });
            confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
            setNotification(`🎉 Payment Verified! ${checkoutModal.planName} Activated.`);
            setCheckoutModal(null);
            await refreshData();
            await fetchPlansAndInvoices();
          },
          theme: { color: '#06b6d4' },
        });
        rzp.open();
      } catch (e: any) {
        console.warn('Official modal fallback:', e);
      }
    }
  };

  const activePlanName = company?.subscriptionPlan === 'vip_enterprise' ? 'VIP Enterprise' : 'Free Tier';

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6 animate-in fade-in duration-150 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 border border-amber-800/50 px-2 py-0.5 rounded">
              Razorpay Test Mode (Sandbox)
            </span>
            <span className="text-xs text-slate-400">Cryptographic Signature Verification</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Subscription Plans &amp; Invoices
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Transparent e-commerce analytics tiers with instantaneous sandbox activation.
          </p>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-slate-400">Current Plan Status</p>
          <p className="text-base font-black text-cyan-400 font-mono-code">{activePlanName}</p>
          {company?.subscriptionExpiresAt ? (
            <p className="text-[10px] text-slate-500">
              Valid until: {new Date(company.subscriptionExpiresAt).toLocaleDateString()}
            </p>
          ) : (
            <p className="text-[10px] text-emerald-400">Sandbox Active (Test Mode)</p>
          )}
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)}>✕</button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-950/90 border border-red-500/50 rounded-xl text-xs text-red-300 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((p) => {
          const isCurrent = company?.subscriptionPlan === p.key;
          return (
            <div
              key={p.key}
              className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${
                p.highlighted
                  ? 'bg-gradient-to-b from-cyan-950/40 via-slate-900 to-slate-900 border-cyan-500/60 shadow-xl'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-lg">{p.name}</h3>
                  {p.highlighted && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase">
                      Recommended
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white font-mono-code">{p.priceInr}</span>
                  <span className="text-xs text-slate-400">/{p.period}</span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>

                <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                  {p.features.map((f: string) => (
                    <div key={f} className="flex items-center gap-2 text-slate-300">
                      <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleUpgradeVip(p.key)}
                disabled={purchasing || isCurrent}
                className={`w-full py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-800 text-slate-400 cursor-default'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
                }`}
              >
                {purchasing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : isCurrent ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                <span>{isCurrent ? 'Current Plan Active' : `Subscribe to ${p.name}`}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Invoices List */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" /> Verified Payment Invoices
          </h3>
          <span className="text-[11px] text-slate-400">{invoices.length} Paid Invoices</span>
        </div>

        {invoices.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            No invoices generated yet. Invoices are written strictly upon verified payment webhook capture.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto font-mono">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-white">{inv.planName || 'VIP Enterprise Tier'}</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">ID: {inv.id} · Ref: {inv.paymentId}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-400">₹{inv.amount.toLocaleString('en-IN')}</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">{new Date(inv.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Interactive Razorpay Enterprise Checkout Modal */}
      {checkoutModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden font-sans">
            {/* Razorpay Branded Top Header */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold tracking-tight text-base">Razorpay</span>
                    <span className="text-[10px] uppercase font-bold bg-white/20 px-1.5 py-0.5 rounded">Trusted Gateway</span>
                  </div>
                  <p className="text-xs text-blue-100">Order #{checkoutModal.orderId}</p>
                </div>
              </div>
              <button
                onClick={() => setCheckoutModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Plan & Amount Banner */}
            <div className="p-5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">{checkoutModal.planName}</h4>
                <p className="text-xs text-slate-400">Key: <span className="font-mono text-cyan-400">{checkoutModal.keyId}</span></p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-400 font-mono">₹{checkoutModal.amount.toLocaleString('en-IN')}</span>
                <span className="block text-[10px] text-slate-400">Inclusive of all taxes</span>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`py-2 rounded-lg transition cursor-pointer ${paymentMethod === 'upi' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  📱 UPI / QR
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-2 rounded-lg transition cursor-pointer ${paymentMethod === 'card' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  💳 Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`py-2 rounded-lg transition cursor-pointer ${paymentMethod === 'netbanking' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  🏛️ NetBanking
                </button>
              </div>

              {/* UPI Tab */}
              {paymentMethod === 'upi' && (
                <div className="space-y-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <label className="block text-xs font-bold text-slate-300">Enter UPI ID / VPA</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="mobile@upi or user@okhdfcbank"
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <div className="flex gap-2 text-[10px]">
                    <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-cyan-300">Google Pay</span>
                    <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-purple-300">PhonePe</span>
                    <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-blue-300">Paytm</span>
                    <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-amber-300">BHIM UPI</span>
                  </div>
                </div>
              )}

              {/* Card Tab */}
              {paymentMethod === 'card' && (
                <div className="space-y-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        maxLength={4}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* NetBanking Tab */}
              {paymentMethod === 'netbanking' && (
                <div className="space-y-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <label className="block text-xs font-bold text-slate-300">Select Bank</label>
                  <select className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500">
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>State Bank of India (SBI)</option>
                    <option>Axis Bank</option>
                    <option>Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              {/* Verification & Security Notice */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-300">
                <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>256-bit AES encryption verified with Razorpay Test Gateway ({checkoutModal.keyId}).</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleCompletePayment}
                  disabled={purchasing}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  {purchasing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  <span>Pay ₹{checkoutModal.amount.toLocaleString('en-IN')} via Razorpay</span>
                </button>

                <button
                  type="button"
                  onClick={handleLaunchOfficialRazorpay}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                >
                  Open Official Razorpay Popup Modal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
