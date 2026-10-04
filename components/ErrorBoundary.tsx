"use client";
import { Component, ReactNode } from "react";
export default class ErrorBoundary extends Component<{ children: ReactNode }, { err?: Error }> {
  state: { err?: Error } = {};
  static getDerivedStateFromError(err: Error) { return { err }; }
  componentDidCatch(e: Error) { console.error("[ErrorBoundary]", e); }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div role="alert" className="m-6 glass rounded-2xl p-6 text-center">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="mt-1 text-sm text-muted">{this.state.err.message}</p>
        <button className="btn btn-primary mt-4" onClick={() => this.setState({ err: undefined })}>Try again</button>
      </div>
    );
  }
}
