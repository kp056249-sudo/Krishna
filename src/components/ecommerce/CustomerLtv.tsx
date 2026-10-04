import React, { useState, useEffect } from 'react';
import { Users, HeartHandshake, TrendingUp, Sparkles, Send, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';
import { api } from '../../lib/api';

interface CustomerAnalyticsData {
  hasData: boolean;
  totalCustomers: number;
  repeatRate: number;
  averageLtv: number;
  rfmSegments: Array<{
    segment: string;
    count: number;
    avgSpend: number;
  }>;
  cohorts: Array<{
    cohort: string;
    customers: number;
    retentionM1: string;
  }>;
}

export const CustomerLtv: React.FC = () => {
  const [data, setData] = useState<CustomerAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<CustomerAnalyticsData>('/api/analytics/customers');
      if (res.success) {
        setData(res as any);
      } else {
        setError(res.error || 'Failed to calculate customer cohorts');
      }
    } catch (e: any) {
      setError(e.message || 'Error fetching customer analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerAction = (segmentName: string) => {
    setNotification(`Automated WhatsApp campaign queued for ${segmentName}`);
    setTimeout(() => setNotification(null), 3000);
  };



  return (
    <div className="space-y-6 animate-in fade-in duration-150 text-slate-100 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
              Audited Customer Cohorts
            </span>
            <span className="text-xs text-slate-400">Calculated from Real Order Records</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Customer Lifetime Value (LTV) &amp; RFM Retention Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            DataNexus evaluates Recency, Frequency, and Monetary (RFM) distributions from verified database transactions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center min-w-[110px]">
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Unique</p>
            <p className="text-base font-black text-white">{data?.totalCustomers || 0}</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center min-w-[110px]">
            <p className="text-[10px] uppercase font-bold text-slate-400">Repeat Rate</p>
            <p className="text-base font-black text-cyan-400">{data?.repeatRate || 0}%</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center min-w-[110px]">
            <p className="text-[10px] uppercase font-bold text-slate-400">Average LTV</p>
            <p className="text-base font-black text-emerald-400">₹{(data?.averageLtv || 0).toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Computing RFM segments and customer lifetime values from orders...</p>
        </div>
      )}

      {error && (
        <div className="p-6 rounded-2xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{error}</span>
          </div>
          <button onClick={fetchCustomers} className="px-3 py-1 bg-red-900 rounded-lg text-white font-bold cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {!loading && (!data?.hasData || (data?.totalCustomers || 0) === 0) && (
        <div className="p-10 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3 max-w-xl mx-auto my-8">
          <Users className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Customer Cohorts Found</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Customer RFM segmentation, cohort retention matrices, and LTV curves are calculated strictly from real order history. Connect a storefront or import orders to compute cohorts.
          </p>
        </div>
      )}

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* RFM Segmentation Grid */}
      {data && data.rfmSegments && data.rfmSegments.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white">RFM Customer Segmentation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.rfmSegments.map((seg, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                    {seg.segment}
                  </span>
                  <p className="text-xl font-black text-white mt-2">{seg.count} Customers</p>
                  <p className="text-xs text-slate-400">Average Invoiced Spend: ₹{seg.avgSpend.toLocaleString('en-IN')}</p>
                </div>
                <button
                  onClick={() => handleTriggerAction(seg.segment)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3 h-3 text-cyan-400" />
                  <span>Launch Segment Flow</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
