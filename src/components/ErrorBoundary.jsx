import { Component } from 'react';

/* ---------------------------------------------------------------------------
   ErrorBoundary — keeps a malformed external-API response (e.g. an unexpected
   GitHub payload shape) from crashing the entire page: only the wrapped
   section falls back to a friendly card.
--------------------------------------------------------------------------- */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // Console output is stripped from production builds (see vite.config.js);
    // this is dev-time only diagnostics.
    if (import.meta.env.DEV) console.error('Section crashed:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-card mx-auto my-8 max-w-xl rounded-2xl p-8 text-center">
          <p className="font-display text-sm font-semibold text-ink">This section hit a hiccup.</p>
          <p className="mt-1 text-xs text-muted">Refresh the page to try again.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
