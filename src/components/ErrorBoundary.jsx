import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("HackathonHelper Error Boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
          <div className="glass-panel-glow rounded-3xl p-8 max-w-lg w-full border border-rose-500/40 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white">Something went off track</h2>
            <p className="text-xs text-slate-300 mt-2 mb-6">
              {this.state.error?.message || 'A rendering or 3D canvas glitch occurred in this view.'}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white border-0 font-bold px-4"
              >
                <RefreshCw className="w-4 h-4 mr-1.5" />
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-sm btn-outline border-slate-700 text-slate-300"
              >
                Reload App
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
