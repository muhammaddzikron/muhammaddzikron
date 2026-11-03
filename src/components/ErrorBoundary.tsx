import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught runtime exception in child component:', {
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      fallbackTitle: this.props.fallbackTitle
    });
  }

  public handleReset = () => {
    console.log('[ErrorBoundary] User triggered error recovery reset');
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  public handleClearCacheAndReset = () => {
    console.log('[ErrorBoundary] Clearing local storage cache and reloading');
    try {
      localStorage.removeItem('dzikron_cached_songs');
      localStorage.removeItem('dzikron_cached_orders');
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 sm:p-10 my-4 max-w-xl mx-auto rounded-3xl bg-white border border-rose-200 shadow-xl text-center space-y-4 animate-in fade-in">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-bold text-slate-900">
              {this.props.fallbackTitle || 'Terjadi Kendala Memuat Dasbor Admin'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              Komponen mengalami gangguan sementara saat memuat data. Anda dapat memuat ulang komponen atau membersihkan cache data lokal.
            </p>
            {this.state.error?.message && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Detail Error:
                </span>
                <p className="text-[11px] font-mono text-rose-700 overflow-x-auto whitespace-pre-wrap break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={this.handleReset}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-sm active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Muat Ulang Dasbor</span>
            </button>
            <button
              onClick={this.handleClearCacheAndReset}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
              <span>Bersihkan Cache & Reset</span>
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (this.props.onReset) this.props.onReset();
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Ke Beranda</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
