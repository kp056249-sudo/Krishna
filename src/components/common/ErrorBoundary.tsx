import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, showDetails: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 sm:p-10 my-6 max-w-2xl mx-auto rounded-2xl bg-slate-900 border border-red-500/40 shadow-2xl text-slate-200 animate-in fade-in duration-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-950/80 border border-red-500/50 flex items-center justify-center flex-shrink-0 text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {this.props.fallbackTitle || 'Component Error Detected'}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                This screen encountered an unexpected error while processing data. The rest of the platform remains fully functional.
              </p>
              
              {this.state.error && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-red-300 overflow-x-auto">
                  {this.state.error.message || 'Unknown runtime exception'}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reload Screen</span>
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Refresh App</span>
                </button>
                <button
                  onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 ml-auto cursor-pointer"
                >
                  <span>{this.state.showDetails ? 'Hide Stack' : 'View Stack'}</span>
                  {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {this.state.showDetails && this.state.errorInfo && (
                <pre className="mt-3 p-3 bg-slate-950 rounded-lg text-[10px] text-slate-400 font-mono overflow-x-auto border border-slate-800 max-h-48">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
