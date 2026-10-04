import React from 'react';
import { Database, Store, Upload, Sparkles, ArrowRight, ShieldAlert, Cpu } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
  envKeyHint?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Real Data Synced Yet',
  description = 'Connect your live Shopify or WooCommerce store in .env or the Store Connect Portal, or upload real order CSVs to begin live telemetry.',
  icon: Icon = Database,
  actionLabel = 'Connect Live Store',
  onAction,
  secondaryLabel,
  onSecondaryAction,
  envKeyHint = 'Configure keys in .env for automated live connection',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800/80 my-4 shadow-xl">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600/20 via-blue-600/20 to-indigo-600/20 border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-400 shadow-inner">
        <Icon className="w-8 h-8" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mb-2">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {envKeyHint && (
        <div className="mb-6 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-cyan-300 font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>{envKeyHint}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onAction && (
          <button
            onClick={onAction}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Store className="w-4 h-4" />
            <span>{actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

        {onSecondaryAction && secondaryLabel && (
          <button
            onClick={onSecondaryAction}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>{secondaryLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};
