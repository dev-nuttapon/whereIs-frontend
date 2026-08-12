import { Component, type ErrorInfo, type ReactNode } from 'react';
import { getSafeErrorMessage } from '@/lib/error-message';
import { formatErrorLog } from '@/lib/error-log';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const details = formatErrorLog(error, import.meta.env.MODE);
    if (import.meta.env.MODE === 'development') {
      console.error('WhereIs application error', details, errorInfo.componentStack);
    } else {
      console.error('WhereIs application error', details);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-900">
        <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">WhereIs</p>
          <h1 className="mt-3 text-2xl font-semibold">หน้านี้ทำงานต่อไม่ได้</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">ลองโหลดหน้าใหม่อีกครั้ง หากยังพบปัญหาให้ติดต่อผู้ดูแลระบบ</p>
          <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-left text-xs text-slate-500">{getSafeErrorMessage(this.state.error)}</p>
          <button type="button" onClick={this.handleReload} className="mt-6 rounded-full bg-teal-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-800">
            โหลดหน้าใหม่
          </button>
        </section>
      </main>
    );
  }
}
