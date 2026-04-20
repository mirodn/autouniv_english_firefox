import { AxiosError } from "axios";
import { Component, ReactNode } from "react";
import AuthFallback from "@/popup/components/Fallback/Auth/AuthFallback";
import UnexpectedFallback from "@/popup/components/Fallback/Unexpected/UnexpectedFallback";

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorType: null | string;
}

const ERROR_TYPES = {
  Auth: "AUTH",
  Unexpected: "UNEXPECTED",
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorType: null,
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    if ((error as AxiosError)?.response?.status === 401)
      return { hasError: true, errorType: ERROR_TYPES.Auth };
    return { hasError: true, errorType: ERROR_TYPES.Unexpected };
  }

  public componentDidCatch(error: Error) {
    // 401 에러는 의도된 동작이므로 콘솔 에러를 남기지 않습니다 (확장 프로그램 에러 뱃지 방지)
    if ((error as AxiosError)?.response?.status !== 401) {
      console.error("[autouniv] Unexpected Error:", error);
    }
  }

  public render() {
    const { hasError, errorType } = this.state;
    const { children } = this.props;

    if (hasError) {
      if (errorType === ERROR_TYPES.Auth) return <AuthFallback />;
      return <UnexpectedFallback />;
    }

    return children;
  }
}

export default ErrorBoundary;
