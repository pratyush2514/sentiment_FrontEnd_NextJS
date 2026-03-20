"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  label?: string;
}

interface State {
  hasError: boolean;
}

export class WidgetErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-border-subtle bg-bg-secondary/30 px-6 py-8 text-center">
          <p className="font-body text-xs text-text-tertiary">
            Failed to load {this.props.label ?? "this section"}.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 rounded-lg bg-accent/10 px-3 py-1.5 font-mono text-[10px] text-accent transition-colors hover:bg-accent/20"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
