// src/shared/components/common/ErrorBoundary.tsx
// Chặn lỗi render của bất kỳ component con nào để ứng dụng không bị
// "white screen" khi một màn hình gặp dữ liệu null/undefined bất thường.
//
// - `ErrorBoundary`: class component bọc quanh cây React (dùng ở main.tsx).
// - `RouteErrorElement`: errorElement của react-router cho lỗi ở tầng route.

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { WarningCircle as CircleAlert, ArrowCounterClockwise as RotateCcw } from '@phosphor-icons/react';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-lg rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <CircleAlert className="size-7" aria-hidden />
          </span>
          <h1 className="mt-4 text-lg font-bold text-gray-900">Something went wrong</h1>
          <p className="mt-1 text-[13px] leading-relaxed text-gray-600">
            This screen could not be displayed. The rest of the application is still working — you can go back
            and try again.
          </p>
          {import.meta.env.DEV && (
            <pre className="mt-4 max-h-40 overflow-auto rounded-xl bg-gray-50 p-3 text-left text-[11px] leading-relaxed text-red-700">
              {error.message}
            </pre>
          )}
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-700"
            >
              <RotateCcw className="size-3.5" /> Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.assign('/')}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50"
            >
              Go to home
            </button>
          </div>
        </div>
      </div>
    );
  }
}

/** Error element của react-router: hiển thị khi một route ném lỗi khi render/loader chạy. */
export function RouteErrorElement({ error }: { error?: unknown }) {
  const message =
    error instanceof Error ? error.message : 'This page could not be displayed right now.';

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-lg rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <CircleAlert className="size-7" aria-hidden />
        </span>
        <h1 className="mt-4 text-lg font-bold text-gray-900">This page could not be loaded</h1>
        <p className="mt-1 text-[13px] leading-relaxed text-gray-600">
          The route failed while rendering. Go back to the home page and try again.
        </p>
        {import.meta.env.DEV && (
          <pre className="mt-4 max-h-40 overflow-auto rounded-xl bg-gray-50 p-3 text-left text-[11px] leading-relaxed text-red-700">
            {message}
          </pre>
        )}
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => window.location.assign('/')}
            className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-700"
          >
            Go to home
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50"
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  );
}
