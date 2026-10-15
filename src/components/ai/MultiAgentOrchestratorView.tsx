import React, { useState } from 'react';
import { 
  Bot, Sparkles, Zap, ArrowRight, Play, CheckCircle2, 
  Layers, Database, ShieldAlert, Package, Terminal, 
  Activity, Clock, Cpu, Copy, Check 
} from 'lucide-react';
import { api } from '../../lib/api';

export interface AgentStepTrace {
  stepId: string;
  agentName: string;
  state: 'PLAN' | 'DISPATCH' | 'TOOL_CALL' | 'OBSERVE' | 'REFLECT' | 'SYNTHESIZE';
  thought: string;
  toolUsed?: string;
  toolInput?: any;
  toolOutput?: any;
  durationMs: number;
  timestamp: string;
}

export interface AgentExecutionResponse {
  executionId: string;
  userPrompt: string;
  status: 'COMPLETED' | 'FAILED';
  finalAnswer: string;
  totalDurationMs: number;
  tokensConsumed: number;
  tokensSaved: number;
  primaryAgent: string;
  steps: AgentStepTrace[];
  actionItems: string[];
}

export const MultiAgentOrchestratorView: React.FC = () => {
  const [promptInput, setPromptInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const [currentExecution, setCurrentExecution] = useState<AgentExecutionResponse>({
    executionId: 'exec_init_01',
    userPrompt: 'Audit portfolio orders and evaluate high-risk COD returns in Tier 3 circles',
    status: 'COMPLETED',
    totalDurationMs: 19,
    tokensConsumed: 420,
    tokensSaved: 1250,
    primaryAgent: 'RiskDefenseAgent',
    steps: [
      {
        stepId: 'step_1_plan',
        agentName: 'Orchestrator',
        state: 'PLAN',
        thought: 'Deconstructed query into COD risk assessment & pin code logistics evaluation. Routing to RiskDefenseAgent.',
        durationMs: 4,
        timestamp: 'Just now'
      },
      {
        stepId: 'step_2_tool',
        agentName: 'RiskDefenseAgent',
        state: 'TOOL_CALL',
        thought: 'Evaluated order risk vectors using L2-regularized logistic classifier & exact Kernel SHAP attribution.',
        toolUsed: 'ml_shap_risk_inference',
        toolInput: { orderTotal: 2999, paymentMode: 'COD', deliveryZone: 'Tier 3' },
        toolOutput: { rtoProbability: '68%', riskTier: 'HIGH', topShapFactors: ['COD Payment (+28.5%)', 'Tier 3 Zone (+16.5%)'] },
        durationMs: 9,
        timestamp: 'Just now'
      },
      {
        stepId: 'step_3_reflect',
        agentName: 'RiskDefenseAgent',
        state: 'REFLECT',
        thought: 'Validated inference output. Probability bounded at 0.68. Triggering WhatsApp OTP verification prescription.',
        durationMs: 6,
        timestamp: 'Just now'
      }
    ],
    finalAnswer: `🛡️ **RiskDefense Agent Diagnostic**:\n• Calculated RTO Risk: **68% (HIGH Tier)**\n• Key Risk Driver: **Payment Mode (COD) contributing +28.5% risk & Tier 3 circle contributing +16.5%**\n• Recommended Mitigation: **Trigger Automated WhatsApp Address Confirmation Flow + Offer ₹100 Prepaid Conversion Discount**\n*Inference executed in 9ms with mathematical SHAP attribution.*`,
    actionItems: [
      'Enforce automated WhatsApp OTP address verification before courier assignment',
      'Apply dynamic ₹120 prepaid discount for Tier 3 COD orders'
    ]
  });

  const handleExecute = async (overridePrompt?: string) => {
    const textToRun = overridePrompt || promptInput;
    if (!textToRun.trim() || isRunning) return;

    setIsRunning(true);
    try {
      const res = await api.post('/api/agents/execute', { prompt: textToRun });
      if (res && res.success) {
        setCurrentExecution({
          executionId: res.executionId,
          userPrompt: res.userPrompt,
          status: res.status,
          finalAnswer: res.finalAnswer,
          totalDurationMs: res.totalDurationMs,
          tokensConsumed: res.tokensConsumed,
          tokensSaved: res.tokensSaved,
          primaryAgent: res.primaryAgent,
          steps: res.steps || [],
          actionItems: res.actionItems || []
        });
      }
    } catch {
      // Non-blocking
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyAnswer = () => {
    navigator.clipboard.writeText(currentExecution.finalAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const subAgents = [
    {
      id: 'DataAnalystAgent',
      name: 'DataAnalyst Agent',
      icon: Activity,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/30',
      description: 'Executes vectorized OLAP aggregations across 10k orders in DuckDB in sub-5ms.',
      tool: 'duckdb_olap_aggregation',
      query: 'Run vectorized DuckDB OLAP audit across 10,000 order records'
    },
    {
      id: 'RiskDefenseAgent',
      name: 'RiskDefense Agent',
      icon: ShieldAlert,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/30',
      description: 'Calculates COD RTO probability with exact Kernel SHAP waterfall feature attribution.',
      tool: 'ml_shap_risk_inference',
      query: 'Audit portfolio orders and evaluate high-risk COD returns in Tier 3 circles'
    },
    {
      id: 'InventoryKaizenAgent',
      name: 'InventoryKaizen Agent',
      icon: Package,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/30',
      description: 'Calculates Poisson Reorder Points (ROP) & Economic Order Quantity (EOQ) batches.',
      tool: 'economic_order_quantity_solver',
      query: 'Calculate Economic Order Quantity (EOQ) and Reorder Points for top SKUs'
    },
    {
      id: 'SqlGeneratorAgent',
      name: 'SqlGenerator Agent',
      icon: Terminal,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/30',
      description: 'Synthesizes and executes safe AST-validated SQL queries against DuckDB tables.',
      tool: 'duckdb_sql_generator',
      query: 'Write SQL query to rank delivery zones by total revenue and RTO rate'
    }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-cyan-500/30 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </span>
            <span className="text-sm font-bold text-white">
              Multi-Agent Autonomous Orchestrator (LangGraph / ReAct DAG)
            </span>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold">
            4 Autonomous Sub-Agents Active
          </span>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Autonomous multi-agent swarm coordinating task planning, specialized tool calling (DuckDB Columnar OLAP, Kernel SHAP Inference, EOQ Solvers), sanity reflection, and executive synthesis.
        </p>
      </div>

      {/* 4 Agent Specialization Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {subAgents.map((agent) => {
          const Icon = agent.icon;
          const isSelected = currentExecution.primaryAgent === agent.id;
          return (
            <div
              key={agent.id}
              onClick={() => handleExecute(agent.query)}
              className={`p-4 rounded-xl border transition-all cursor-pointer shadow-md group ${
                isSelected 
                  ? 'bg-slate-900 border-cyan-500 shadow-cyan-500/10' 
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg border ${agent.bgColor}`}>
                  <Icon className={`w-4 h-4 ${agent.color}`} />
                </div>
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-cyan-300 flex items-center gap-1">
                  <span>Run</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
              <h4 className="text-xs font-bold text-white mb-1">{agent.name}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{agent.description}</p>
              <div className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 truncate">
                Tool: {agent.tool}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Command Input */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
        <label className="block text-xs font-semibold text-slate-300">
          Dispatch Natural Language Directive to Autonomous Multi-Agent Swarm:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
            placeholder="e.g. Audit why Tier 3 COD returns are elevated and compute EOQ reorder threshold..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <button
            onClick={() => handleExecute()}
            disabled={isRunning || !promptInput.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
          >
            {isRunning ? <Zap className="w-4 h-4 animate-spin text-cyan-300" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? 'Orchestrating...' : 'Dispatch Swarm'}</span>
          </button>
        </div>
      </div>

      {/* DAG Execution State Machine & Trace */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white">LangGraph Step Trace &amp; State-Machine Timeline</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-cyan-400">Total Latency: {currentExecution.totalDurationMs}ms</span>
            <span className="text-purple-300">{currentExecution.tokensConsumed} tokens</span>
            <span className="text-emerald-400">⚡ {currentExecution.tokensSaved} tokens cached</span>
          </div>
        </div>

        {/* State Machine Step Cards */}
        <div className="space-y-3">
          {currentExecution.steps.map((step, idx) => (
            <div
              key={step.stepId}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Step {idx + 1}: {step.state}
                  </span>
                  <span className="font-bold text-slate-200">{step.agentName}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{step.durationMs}ms</span>
                </div>
              </div>

              <p className="text-slate-300 font-sans leading-relaxed text-[11px]">
                {step.thought}
              </p>

              {step.toolUsed && (
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[10px] space-y-1">
                  <div className="flex items-center justify-between text-cyan-400 font-semibold">
                    <span>Tool Executed: {step.toolUsed}</span>
                  </div>
                  <div className="text-slate-400">
                    Output: {JSON.stringify(step.toolOutput)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Synthesized Executive Output & Action Items */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2 font-bold text-white">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Autonomous Swarm Synthesized Decision</span>
          </div>
          <button
            onClick={handleCopyAnswer}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Synthesis'}</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/90 text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed font-sans">
          {currentExecution.finalAnswer}
        </div>

        {currentExecution.actionItems && currentExecution.actionItems.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Autonomous Action Items Formulated:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {currentExecution.actionItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-slate-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span className="text-[11px] leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiAgentOrchestratorView;
