import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorScreen } from "./ErrorScreen";

interface Props {
  children?: ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      //  This will now work perfectly with the updated ErrorScreen
      return <ErrorScreen error={this.state.error} />;
    }
    return this.props.children;
  }
}
