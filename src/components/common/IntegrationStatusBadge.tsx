import React from 'react';
import { CheckCircle2, AlertTriangle, Key, ArrowUpRight } from 'lucide-react';

interface IntegrationStatusBadgeProps {
  isConfigured: boolean;
  serviceName: string;
  envVarName: string;
  onConfigureClick?: () => void;
}

export const IntegrationStatusBadge: React.FC<IntegrationStatusBadgeProps> = ({
  isConfigured,
  serviceName,
  envVarName,
  onConfigureClick,
}) => {
  if (isConfigured) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        <span>{serviceName}: Active</span>
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 p-1.5 px-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-xs">
      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
      <span className="text-[11px] text-amber-300 font-medium">
        {serviceName} Not Configured (<code className="font-mono text-[10px] text-amber-200">{envVarName}</code>)
      </span>
      {onConfigureClick && (
        <button
          onClick={onConfigureClick}
          className="ml-1 text-[10px] text-cyan-400 hover:underline font-bold"
        >
          Setup →
        </button>
      )}
    </div>
  );
};
