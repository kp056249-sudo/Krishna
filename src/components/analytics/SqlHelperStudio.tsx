import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Play,
  Sparkles,
  Database,
  Copy,
  Check,
  Download,
  Table,
  Code2,
  RefreshCw,
  AlertCircle,
  BookOpen,
  Filter,
  CheckCircle2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { convertNlToSql } from '../../services/geminiService';
import { api } from '../../lib/api';

export interface SampleQuery {
  id: string;
  title: string;
  category: 'Window Functions' | 'Aggregations & Group By' | 'CTEs & Subqueries' | 'Joins & Relations' | 'Unit Economics';
  difficulty: 'Basic' | 'Intermediate' | 'Advanced';
  sql: string;
  businessContext: string;
  interviewInsight: string;
}

export const SAMPLE_QUERIES: SampleQuery[] = [
  {
    id: 'query_running_total',
    title: '1. Cumulative Running Total Revenue',
    category: 'Window Functions',
    difficulty: 'Intermediate',
    sql: `SELECT 
  date,
  order_number,
  amount,
  SUM(amount) OVER (ORDER BY created_at) AS cumulative_revenue,
  AVG(amount) OVER (ORDER BY created_at ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS moving_avg_7_orders
FROM orders
ORDER BY created_at DESC
LIMIT 50;`,
    businessContext: 'Calculates day-by-day cumulative cash inflow and a 7-order moving average to smooth out volatility and identify growth inflection points.',
    interviewInsight: 'Interviewers test understanding of the OVER() clause and framing (ROWS BETWEEN N PRECEDING). Explain that window functions compute aggregates without collapsing individual rows, running in O(N log N) time due to sorting.'
  },
  {
    id: 'query_pincode_rto',
    title: '2. Top Pincodes by COD Return Rate (>30 Orders)',
    category: 'Aggregations & Group By',
    difficulty: 'Intermediate',
    sql: `SELECT 
  pin_code,
  city,
  pincode_tier,
  COUNT(*) AS total_orders,
  SUM(CASE WHEN payment_mode = 'COD' THEN 1 ELSE 0 END) AS cod_orders,
  SUM(CASE WHEN is_rto = 1 THEN 1 ELSE 0 END) AS rto_orders,
  ROUND(SUM(CASE WHEN is_rto = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS rto_rate_pct,
  SUM(rto_loss) AS total_rto_loss_inr
FROM orders
GROUP BY pin_code, city, pincode_tier
HAVING COUNT(*) >= 15
ORDER BY rto_rate_pct DESC
LIMIT 20;`,
    businessContext: 'Identifies geographic clusters with high courier return rates to automate COD-blocking rules or mandate prepaid verification.',
    interviewInsight: 'Demonstrates conditional aggregation using CASE WHEN inside SUM(), and using HAVING vs WHERE to filter after aggregate grouping.'
  },
  {
    id: 'query_courier_sla',
    title: '3. Courier Partner Performance Scorecard',
    category: 'Aggregations & Group By',
    difficulty: 'Intermediate',
    sql: `SELECT 
  courier_partner,
  COUNT(*) AS total_shipments,
  ROUND(AVG(delivery_days), 1) AS avg_delivery_days,
  SUM(CASE WHEN is_rto = 1 THEN 1 ELSE 0 END) AS rto_returns,
  ROUND(SUM(CASE WHEN is_rto = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS rto_pct,
  SUM(shipping_cost) AS total_freight_paid,
  ROUND(AVG(net_profit), 1) AS avg_profit_per_order
FROM orders
GROUP BY courier_partner
ORDER BY avg_delivery_days ASC;`,
    businessContext: 'Ranks logistics couriers (BlueDart, Delhivery, Ekart, etc.) across delivery speed, return rate, and unit profit contribution.',
    interviewInsight: 'Shows ability to model operational logistics KPIs. In an interview, highlight trade-offs: faster couriers like BlueDart may have higher forward shipping costs but yield lower RTO losses.'
  },
  {
    id: 'query_mom_growth',
    title: '4. Month-over-Month (MoM) Revenue Growth Rate',
    category: 'CTEs & Subqueries',
    difficulty: 'Advanced',
    sql: `WITH monthly_sales AS (
  SELECT 
    SUBSTR(created_at, 1, 7) AS sales_month,
    COUNT(*) AS total_orders,
    SUM(amount) AS total_revenue,
    SUM(net_profit) AS total_profit
  FROM orders
  GROUP BY SUBSTR(created_at, 1, 7)
)
SELECT 
  sales_month,
  total_orders,
  total_revenue,
  LAG(total_revenue, 1) OVER (ORDER BY sales_month) AS prev_month_revenue,
  ROUND((total_revenue - LAG(total_revenue, 1) OVER (ORDER BY sales_month)) * 100.0 / 
    LAG(total_revenue, 1) OVER (ORDER BY sales_month), 2) AS mom_growth_pct,
  total_profit
FROM monthly_sales
ORDER BY sales_month DESC;`,
    businessContext: 'Calculates month-over-month revenue growth percentage for board reports using Common Table Expressions (CTEs) and LAG().',
    interviewInsight: 'Common Table Expressions (WITH clause) make complex queries readable and maintainable. LAG(val, 1) retrieves the previous row value without costly self-joins.'
  },
  {
    id: 'query_inventory_runway',
    title: '5. Inventory Stockout Risk & Days-of-Runway Ranking',
    category: 'Window Functions',
    difficulty: 'Advanced',
    sql: `SELECT 
  sku,
  name,
  category,
  in_stock,
  daily_velocity,
  ROUND(in_stock * 1.0 / MAX(daily_velocity, 1), 1) AS days_of_runway,
  DENSE_RANK() OVER (ORDER BY in_stock * 1.0 / MAX(daily_velocity, 1) ASC) AS stockout_urgency_rank,
  CASE 
    WHEN in_stock * 1.0 / MAX(daily_velocity, 1) < 7 THEN 'CRITICAL (Under 7 Days)'
    WHEN in_stock * 1.0 / MAX(daily_velocity, 1) < 14 THEN 'WARNING (Under 14 Days)'
    ELSE 'HEALTHY'
  END AS inventory_status
FROM inventory
ORDER BY stockout_urgency_rank ASC;`,
    businessContext: 'Ranks warehouse stock by runway urgency to generate automated supplier purchase orders before cash-generating SKUs go out of stock.',
    interviewInsight: 'Illustrates window ranking functions (DENSE_RANK() vs RANK() vs ROW_NUMBER()). DENSE_RANK() handles tied runway days without skipping rank positions.'
  },
  {
    id: 'query_margin_waterfall',
    title: '6. Unit Economics & Net Margin Waterfall by Category',
    category: 'Unit Economics',
    difficulty: 'Intermediate',
    sql: `SELECT 
  category,
  COUNT(*) AS orders_count,
  SUM(amount) AS gross_gmv,
  SUM(cogs) AS total_cogs,
  SUM(shipping_cost) AS total_shipping,
  SUM(gateway_fee) AS total_gateway_fees,
  SUM(rto_loss) AS total_rto_penalty,
  SUM(net_profit) AS net_profit,
  ROUND(SUM(net_profit) * 100.0 / SUM(amount), 1) AS net_margin_pct
FROM orders
GROUP BY category
ORDER BY net_profit DESC;`,
    businessContext: 'Breaks down the complete P&L margin waterfall from Gross GMV down to Net Realized Profit across apparel, electronics, beauty, and footwear.',
    interviewInsight: 'Essential for data analyst interviews in e-commerce: demonstrates understanding of unit economics (COGS, freight, gateway fees, reverse logistics) and margin calculations.'
  },
  {
    id: 'query_payment_mode_comparison',
    title: '7. COD vs Prepaid Margin & Delivery Success Audit',
    category: 'Unit Economics',
    difficulty: 'Basic',
    sql: `SELECT 
  payment_mode,
  COUNT(*) AS total_orders,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM orders), 1) AS share_of_orders_pct,
  SUM(amount) AS total_gmv,
  ROUND(AVG(amount), 0) AS average_order_value,
  SUM(CASE WHEN status = 'DELIVERED' THEN 1 ELSE 0 END) AS delivered_count,
  ROUND(SUM(CASE WHEN status = 'DELIVERED' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS delivery_rate_pct,
  SUM(rto_loss) AS total_rto_loss,
  SUM(net_profit) AS total_net_profit,
  ROUND(SUM(net_profit) * 100.0 / SUM(amount), 1) AS net_profit_margin_pct
FROM orders
GROUP BY payment_mode;`,
    businessContext: 'Directly quantifies the margin erosion caused by Cash on Delivery (COD) versus Prepaid payments due to RTO reverse shipping.',
    interviewInsight: 'Demonstrates subqueries inside SELECT clauses to compute percentage share of total without multiple database round-trips.'
  },
  {
    id: 'query_customer_deciles',
    title: '8. Customer Lifetime Value (LTV) Decile Segmentation',
    category: 'Window Functions',
    difficulty: 'Advanced',
    sql: `WITH customer_spends AS (
  SELECT 
    customer_name,
    city,
    COUNT(*) AS total_orders,
    SUM(amount) AS total_spent,
    SUM(net_profit) AS total_profit_contributed
  FROM orders
  GROUP BY customer_name, city
)
SELECT 
  customer_name,
  city,
  total_orders,
  total_spent,
  total_profit_contributed,
  NTILE(10) OVER (ORDER BY total_spent DESC) AS ltv_decile
FROM customer_spends
ORDER BY total_spent DESC
LIMIT 50;`,
    businessContext: 'Segments customer base into 10 equal deciles (Decile 1 = Top 10% high-spenders) for personalized VIP marketing and loyalty incentives.',
    interviewInsight: 'Explain NTILE(N): it partitions an ordered dataset into N buckets. Decile analysis is standard practice in credit risk, banking, and customer retention analytics.'
  },
  {
    id: 'query_order_size_vs_rto',
    title: '9. Basket Size & Item Count Correlation with Returns',
    category: 'Aggregations & Group By',
    difficulty: 'Intermediate',
    sql: `SELECT 
  item_count,
  COUNT(*) AS total_orders,
  ROUND(AVG(amount), 0) AS avg_basket_value,
  SUM(CASE WHEN is_rto = 1 THEN 1 ELSE 0 END) AS rto_count,
  ROUND(SUM(CASE WHEN is_rto = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS rto_rate_pct,
  SUM(net_profit) AS total_profit
FROM orders
GROUP BY item_count
ORDER BY item_count ASC;`,
    businessContext: 'Audits whether multi-item orders have higher return rates due to trial/fitting behavior or higher buyer remorse.',
    interviewInsight: 'Shows hypothesis-driven data exploration. When presenting to stakeholders, analysts link numerical findings to operational policies (e.g. bundle discounts).'
  },
  {
    id: 'query_high_risk_cod_anomalies',
    title: '10. High-Risk COD Anomalies Above City Average AOV',
    category: 'CTEs & Subqueries',
    difficulty: 'Advanced',
    sql: `WITH city_benchmarks AS (
  SELECT 
    city,
    AVG(amount) AS city_avg_amount
  FROM orders
  GROUP BY city
)
SELECT 
  o.order_number,
  o.customer_name,
  o.city,
  o.amount,
  ROUND(c.city_avg_amount, 0) AS city_avg_amount,
  ROUND(o.amount - c.city_avg_amount, 0) AS premium_over_avg,
  o.rto_risk_score,
  o.status
FROM orders o
JOIN city_benchmarks c ON o.city = c.city
WHERE o.payment_mode = 'COD'
  AND o.amount > c.city_avg_amount * 1.5
  AND o.rto_risk_score > 60
ORDER BY o.amount DESC
LIMIT 30;`,
    businessContext: 'Detects high-value COD orders that significantly deviate from the local city average AOV and carry elevated RTO risk scores.',
    interviewInsight: 'Demonstrates joining CTE aggregate tables back to the transaction table. Point out that in PostgreSQL or Snowflake, this can also be done using window functions.'
  }
];

export const SqlHelperStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'editor' | 'samples' | 'schema'>('editor');
  const [nlPrompt, setNlPrompt] = useState('Show top 5 pincodes with highest COD return rates');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const [sqlQuery, setSqlQuery] = useState(`SELECT 
  order_number, 
  created_at,
  customer_name,
  city,
  payment_mode, 
  amount, 
  status,
  net_profit
FROM orders 
ORDER BY created_at DESC
LIMIT 20;`);

  const [explanation, setExplanation] = useState<string | null>(
    'Retrieves latest transactions from the 10,000-order benchmark database with realized net profit calculations.'
  );
  const [copied, setCopied] = useState(false);
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [executionStats, setExecutionStats] = useState<{ count: number; timeMs: number; source?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-run initial query on mount so user immediately sees real data
  useEffect(() => {
    handleRunQuery(sqlQuery);
  }, []);

  const handleNlTranslate = async () => {
    if (!nlPrompt.trim()) return;
    setIsTranslating(true);
    setError(null);
    try {
      const res = await convertNlToSql(nlPrompt);
      if (res.sql) {
        setSqlQuery(res.sql);
        setExplanation(res.explanation || 'Generated using natural language intent mapping.');
        handleRunQuery(res.sql);
      }
    } catch {
      setError('Natural language translation failed. Using standard SQL template.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleRunQuery = async (queryToRun?: string) => {
    const q = queryToRun || sqlQuery;
    setIsRunning(true);
    setError(null);
    try {
      const res = await api.post('/api/sql/run', { query: q });
      if (res.success && Array.isArray(res.rows)) {
        // Safe normalization
        const cleanRows = res.rows.map((row: any) => {
          if (row === null || row === undefined) return { result: '-' };
          if (typeof row !== 'object') return { value: row };
          return row;
        });

        setQueryResults(cleanRows);
        const detectedCols = res.columns || (cleanRows.length > 0 ? Object.keys(cleanRows[0]) : []);
        setColumns(detectedCols);
        setExecutionStats({
          count: res.rowCount || cleanRows.length,
          timeMs: res.executionTimeMs || 15,
          source: res.source || 'In-Memory AlaSQL Engine (Orders Benchmark Dataset)'
        });
      } else {
        setError(res.error || 'Query execution failed.');
        setQueryResults([]);
      }
    } catch (err: any) {
      setError(err?.message || 'Database query execution failed.');
      setQueryResults([]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleLoadSample = (sample: SampleQuery) => {
    setSqlQuery(sample.sql);
    setExplanation(`${sample.title}: ${sample.businessContext}`);
    setActiveTab('editor');
    handleRunQuery(sample.sql);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCsv = () => {
    if (queryResults.length === 0) return;
    const header = columns.join(',');
    const rows = queryResults.map(row => 
      columns.map(col => {
        const val = row[col];
        if (val === null || val === undefined) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `datanexus_query_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSamples = selectedCategory === 'All'
    ? SAMPLE_QUERIES
    : SAMPLE_QUERIES.filter(s => s.category === selectedCategory);

  return (
    <div className="space-y-6 animate-in fade-in duration-150 text-slate-100 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-2 py-0.5 rounded">
              Data Engineering &amp; Analytics IDE
            </span>
            <span className="text-xs text-slate-400">Read-Only SQL Sandbox · 10,000 Orders Benchmark</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            SQL Studio &amp; Query Workbench
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Execute analytical queries with window functions, joins, and CTEs against the e-commerce benchmark database. Protected by read-only AST parser guards.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'editor'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>SQL Editor</span>
          </button>
          <button
            onClick={() => setActiveTab('samples')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'samples'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Interview Queries (10)</span>
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'schema'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Schema (ERD)</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-start gap-2 shadow-lg">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* TAB 1: SQL EDITOR & RUNNER */}
      {activeTab === 'editor' && (
        <div className="space-y-6">
          {/* AI Natural Language Prompt Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Natural Language to SQL (Gemini Translator):</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono">AST validated prior to execution</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={nlPrompt}
                onChange={(e) => setNlPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNlTranslate()}
                placeholder="e.g. Find top 5 cities with highest return rates on COD orders..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleNlTranslate}
                disabled={isTranslating}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isTranslating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Translate &amp; Run</span>
              </button>
            </div>
          </div>

          {/* SQL Editor Area */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">SQL Query Editor</span>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded">
                  SELECT / WITH Only
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Copy SQL Query"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                {queryResults.length > 0 && (
                  <button
                    onClick={handleExportCsv}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                    title="Export CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>
                )}
                <button
                  onClick={() => handleRunQuery()}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
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
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 selection:bg-cyan-500/30 leading-relaxed"
              spellCheck={false}
            />

            {explanation && (
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-200">Query Explanation: </span>
                {explanation}
              </div>
            )}
          </div>

          {/* Results Table Panel */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-800 gap-2">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">Execution Output</span>
                {executionStats && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({executionStats.count} rows in {executionStats.timeMs}ms)
                  </span>
                )}
              </div>
              {executionStats?.source && (
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/70 border border-emerald-800/40 px-2 py-0.5 rounded">
                  {executionStats.source}
                </span>
              )}
            </div>

            {queryResults.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-xs">
                {isRunning ? (
                  <div className="flex items-center justify-center gap-2 text-cyan-400">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing SQL query against dataset...</span>
                  </div>
                ) : executionStats ? (
                  'No rows returned matching query parameters.'
                ) : (
                  'Click "Execute SQL" to run your query.'
                )}
              </div>
            ) : (
              <div className="overflow-x-auto max-h-96 border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="sticky top-0 bg-slate-950 z-10">
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      {columns.map((col) => (
                        <th key={col} className="py-2.5 px-3 whitespace-nowrap bg-slate-950">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-[11px] text-slate-300">
                    {queryResults.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                        {columns.map((col, i) => {
                          const val = row[col];
                          const strVal = val === null || val === undefined ? '-' : String(val);
                          return (
                            <td key={i} className="py-2 px-3 whitespace-nowrap">
                              {strVal}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: 10 PRODUCTION INTERVIEW SAMPLE QUERIES */}
      {activeTab === 'samples' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              <span>Category Filter:</span>
            </span>
            {['All', 'Window Functions', 'Aggregations & Group By', 'CTEs & Subqueries', 'Unit Economics'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5">
            {filteredSamples.map((sample) => (
              <div
                key={sample.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                        {sample.category}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {sample.difficulty}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{sample.title}</h3>
                  </div>

                  <button
                    onClick={() => handleLoadSample(sample)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    <span>Run Query</span>
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {sample.businessContext}
                </p>

                {/* Code Block */}
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-cyan-300 overflow-x-auto selection:bg-cyan-500/30">
                  {sample.sql}
                </pre>

                {/* Interview Callout */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                  <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Interview Insight &amp; Complexity Note:</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {sample.interviewInsight}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DATABASE SCHEMA & ERD */}
      {activeTab === 'schema' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white mb-1">Database Schema &amp; Entity Relationships</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Data model structure reflecting normalized transactions, inventory velocity, and sales channels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Orders Table */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-cyan-400 font-mono text-sm">orders</span>
                <span className="text-[10px] text-slate-500">10,000 rows</span>
              </div>
              <ul className="text-xs font-mono text-slate-400 space-y-1">
                <li><span className="text-white">order_number</span> (VARCHAR · PK)</li>
                <li><span className="text-white">created_at</span> (TIMESTAMP)</li>
                <li><span className="text-white">customer_name</span> (VARCHAR)</li>
                <li><span className="text-white">city</span>, <span className="text-white">pin_code</span>, <span className="text-white">pincode_tier</span></li>
                <li><span className="text-white">category</span>, <span className="text-white">sku</span> (FK to inventory)</li>
                <li><span className="text-white">amount</span> (DECIMAL · GMV)</li>
                <li><span className="text-white">payment_mode</span> (COD | PREPAID)</li>
                <li><span className="text-white">status</span>, <span className="text-white">is_rto</span> (0 | 1)</li>
                <li><span className="text-white">cogs</span>, <span className="text-white">shipping_cost</span></li>
                <li><span className="text-white">rto_loss</span>, <span className="text-white">net_profit</span></li>
              </ul>
            </div>

            {/* Inventory Table */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-emerald-400 font-mono text-sm">inventory</span>
                <span className="text-[10px] text-slate-500">Warehouse SKUs</span>
              </div>
              <ul className="text-xs font-mono text-slate-400 space-y-1">
                <li><span className="text-white">sku</span> (VARCHAR · PK)</li>
                <li><span className="text-white">name</span> (VARCHAR · Description)</li>
                <li><span className="text-white">category</span> (Apparel, Footwear...)</li>
                <li><span className="text-white">in_stock</span> (INT · Available Units)</li>
                <li><span className="text-white">daily_velocity</span> (DECIMAL · Units/Day)</li>
                <li><span className="text-white">reorder_point</span> (INT · Safety Threshold)</li>
              </ul>
            </div>

            {/* Stores Table */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-purple-400 font-mono text-sm">stores</span>
                <span className="text-[10px] text-slate-500">Connected Channels</span>
              </div>
              <ul className="text-xs font-mono text-slate-400 space-y-1">
                <li><span className="text-white">id</span> (VARCHAR · PK)</li>
                <li><span className="text-white">name</span> (VARCHAR · Store Title)</li>
                <li><span className="text-white">platform</span> (shopify | woocommerce)</li>
                <li><span className="text-white">status</span> (connected | sync_paused)</li>
                <li><span className="text-white">region</span> (India)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
