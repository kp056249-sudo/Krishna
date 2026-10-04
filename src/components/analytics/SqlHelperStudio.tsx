import React, { useState } from 'react';
import { Terminal, Play, Sparkles, Database, Copy, Check, Download, Table, Code2, RefreshCw, AlertCircle } from 'lucide-react';
import { convertNlToSql } from '../../services/geminiService';
import { api } from '../../lib/api';

export const SqlHelperStudio: React.FC = () => {
  const [nlPrompt, setNlPrompt] = useState('Show top 5 pincodes with highest COD return-to-origin rates in the last 30 days');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [sqlQuery, setSqlQuery] = useState(`SELECT 
    order_number, 
    amount, 
    mode, 
    status, 
    city 
FROM orders 
LIMIT 20;`);

  const [explanation, setExplanation] = useState('Queries tenant orders collection from Firestore database securely.');
  const [copied, setCopied] = useState(false);
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [executionStats, setExecutionStats] = useState<{ count: number; timeMs: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleNlTranslate = async () => {
    setIsTranslating(true);
    setError(null);
    try {
      const res = await convertNlToSql(nlPrompt);
      setSqlQuery(res.sql);
      setExplanation(res.explanation);
    } catch (e: any) {
      setError('Failed to generate SQL from prompt.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleRunQuery = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const res = await api.post('/api/sql/run', { query: sqlQuery });
      if (res.success) {
        setQueryResults(res.rows || []);
        setExecutionStats({ count: res.rowCount || (res.rows || []).length, timeMs: res.executionTimeMs || 12 });
      } else {
        setError(res.error || 'Query execution failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Database query failed.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-2 py-0.5 rounded">
              Data Engineering IDE
            </span>
            <span className="text-xs text-slate-400">Scoped Database Engine</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            SQL Studio &amp; AI Natural Language Query Builder
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Type plain-English questions to generate optimized queries against your company database with safe read-only execution limits.
          </p>
        </div>
      </div>

      {/* AI Prompt Input Bar */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <label className="block text-xs font-semibold text-white">Ask in Plain English (Gemini NL-to-SQL):</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={nlPrompt}
            onChange={(e) => setNlPrompt(e.target.value)}
            placeholder="e.g. Find customers who placed 3+ orders on COD and had 0 returns..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleNlTranslate}
            disabled={isTranslating}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isTranslating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>Generate SQL</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-950/90 border border-red-500/50 rounded-xl text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* SQL Editor & Schema Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SQL Editor Area */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white">SQL Query Editor</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Copy SQL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleRunQuery}
                disabled={isRunning}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>Execute SQL</span>
              </button>
            </div>
          </div>

          <textarea
            rows={7}
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 selection:bg-cyan-500/30"
          />

          {explanation && (
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400">
              <span className="font-semibold text-white">Query Explanation: </span>
              {explanation}
            </div>
          )}
        </div>

        {/* Schema Info Panel */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white">Available Tables</span>
          </div>
          <div className="space-y-2 text-[11px] font-mono text-slate-400">
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-white font-bold block">orders</span>
              <span>id, orderNumber, totalAmount, paymentMode, status, city, pincode</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-white font-bold block">stores</span>
              <span>id, name, platform, url, status</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-white font-bold block">inventory</span>
              <span>sku, name, inStock, dailyVelocity</span>
            </div>
          </div>
        </div>
      </div>

      {/* Query Execution Results */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white">Query Results</span>
            {executionStats && (
              <span className="text-[10px] text-slate-400 font-mono">
                ({executionStats.count} rows returned in {executionStats.timeMs}ms)
              </span>
            )}
          </div>
        </div>

        {queryResults.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            {executionStats ? 'No rows found matching query parameters.' : 'Click "Execute SQL" to run the query against your company database.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  {Object.keys(queryResults[0] || {}).map((k) => (
                    <th key={k} className="py-2 px-3">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-[11px] text-slate-300">
                {queryResults.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    {Object.values(row).map((val: any, i) => (
                      <td key={i} className="py-2 px-3">{String(val ?? '-')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
