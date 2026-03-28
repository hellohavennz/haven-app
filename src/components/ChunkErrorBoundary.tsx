import { Component, type ReactNode, Suspense } from 'react';

interface State { hasError: boolean; }

class ChunkErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    const isChunkError =
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Importing a module script failed') ||
      error.name === 'ChunkLoadError';
    if (isChunkError) {
      window.location.reload();
    }
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

/** Wraps a lazy-loaded page in both an error boundary (auto-reload on stale chunk)
 *  and a Suspense fallback. Use this instead of bare <Suspense> for all lazy routes. */
export function LazyRoute({ children }: { children: ReactNode }) {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<div className="min-h-screen" />}>
        {children}
      </Suspense>
    </ChunkErrorBoundary>
  );
}
