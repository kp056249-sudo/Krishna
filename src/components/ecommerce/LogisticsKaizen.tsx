import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, AlertTriangle, Clock, RefreshCw, Send, ArrowUpRight, Gauge, Activity } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';
import { api } from '../../lib/api';

export const LogisticsKaizen: React.FC = () => {
  const [couriers, setCouriers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertNotice, setAlertNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchCouriers();
  }, []);

  const fetchCouriers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/couriers');
      if (res.success && Array.isArray(res.couriers)) {
        setCouriers(res.couriers);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSyncCouriers = async () => {
    setAlertNotice('Fetching live courier telemetry from configured 3PL credentials in .env...');
    try {
      const res = await api.get('/api/env-status');
      if (res.delhivery || res.shiprocket) {
        setAlertNotice('Connected to configured 3PL credentials. Live tracking enabled.');
        await fetchCouriers();
      } else {
        setAlertNotice('No 3PL credentials detected in .env. Configure DELHIVERY_API_KEY or SHIPROCKET_API_TOKEN in .env to auto-connect.');
      }
    } catch (e) {
      setAlertNotice('Error connecting to courier gateway.');
    }
    setTimeout(() => setAlertNotice(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 border border-cyan-800/50 px-2 py-0.5 rounded">
              Logistics Precision
            </span>
            <span className="text-xs text-slate-400">Toyota Production System (TPS) Kaizen</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            3PL Logistics Kaizen &amp; NDR Command
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time courier SLA tracking, automated NDR escalation recovery, and smart parcel routing algorithms.
          </p>
        </div>

        <button
          onClick={handleSyncCouriers}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-medium text-xs shadow-md transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync 3PL Gateways</span>
        </button>
      </div>

      {alertNotice && (
        <div className="p-3 bg-cyan-950/90 border border-cyan-500/50 rounded-xl text-xs text-cyan-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>{alertNotice}</span>
          </div>
          <button onClick={() => setAlertNotice(null)}>✕</button>
        </div>
      )}

      {couriers.length === 0 ? (
        <EmptyState
          title="No 3PL Courier Accounts Synced"
          description="Configure your Delhivery, Shiprocket, or BlueDart API keys in the .env file. DataNexus will automatically connect and pull live AWB statuses and NDR queues."
          icon={Truck}
          actionLabel="Check .env Keys Status"
          onAction={handleSyncCouriers}
          envKeyHint="DELHIVERY_API_KEY / SHIPROCKET_API_TOKEN in .env"
        />
      ) : (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-3 pl-1">Courier Partner</th>
                  <th className="pb-3">Shipments (30D)</th>
                  <th className="pb-3">On-Time Delivery</th>
                  <th className="pb-3">RTO Failure %</th>
                  <th className="pb-3">Avg Transit Speed</th>
                  <th className="pb-3">Cost per 500g</th>
                  <th className="pb-3">NDR Resolution Rate</th>
                  <th className="pb-3">SLA Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {couriers.map((c: any) => (
                  <tr key={c.courier} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 pl-1 font-semibold text-white">{c.courier}</td>
                    <td className="py-3 text-slate-300 font-mono-code">{(c.totalShipments || 0).toLocaleString()}</td>
                    <td className="py-3 font-bold text-emerald-400 font-mono-code">{c.onTimeDeliveryRate || 0}%</td>
                    <td className="py-3 font-bold font-mono-code text-red-400">{c.rtoPercent || 0}%</td>
                    <td className="py-3 text-slate-300 font-mono-code">{c.avgDeliveryDays || 'N/A'} Days</td>
                    <td className="py-3 text-slate-300 font-mono-code">₹{c.avgShippingCost || 'N/A'}</td>
                    <td className="py-3 text-slate-300 font-mono-code">{c.ndrResolutionRate || 0}%</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'error' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {c.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
