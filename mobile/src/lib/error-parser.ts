import { AxiosError } from 'axios';

export interface ParsedError {
  title: string;
  message: string;
  emoji: string;
  canRetry: boolean;
  actionLabel?: string;
  actionType?: 'RETRY' | 'GO_LOGIN' | 'GO_HOME' | 'CONTACT_ADMIN';
}

export function parseError(error: unknown): ParsedError {
  // Handle Axios errors
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<any>;
    const status = axiosError.response?.status;
    const backendMessage = axiosError.response?.data?.message;
    const backendCode = axiosError.response?.data?.code;

    // No internet / network error
    if (axiosError.code === 'ERR_NETWORK') {
      return {
        title: 'No Internet',
        message: 'Check your connection and try again.',
        emoji: '📡',
        canRetry: true,
        actionLabel: 'Try Again',
        actionType: 'RETRY',
      };
    }

    // Timeout
    if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
      return {
        title: 'Request Timed Out',
        message: 'This is taking too long. Check your connection and retry.',
        emoji: '⏱️',
        canRetry: true,
        actionLabel: 'Try Again',
        actionType: 'RETRY',
      };
    }

    // HTTP Status Codes
    switch (status) {
      case 401:
        if (backendCode === 'AUTH_INVALID_CREDENTIALS') {
          return {
            title: 'Login Failed',
            message: 'Incorrect email or password. Please try again.',
            emoji: '🔑',
            canRetry: false,
          };
        }
        return {
          title: 'Session Expired',
          message: backendMessage || 'Please log in again to continue.',
          emoji: '🔒',
          canRetry: false,
          actionLabel: 'Log In',
          actionType: 'GO_LOGIN',
        };
      case 403:
        return {
          title: 'Access Denied',
          message: backendMessage || "You don't have permission for this action.",
          emoji: '🚫',
          canRetry: false,
          actionLabel: 'Go Home',
          actionType: 'GO_HOME',
        };
      case 404:
        if (backendCode === 'ROUTE_NO_DATA') {
          return {
            title: 'Zone is Clean!',
            message: backendMessage || 'No households are ready for pickup today.',
            emoji: '✨',
            canRetry: true,
            actionLabel: 'Refresh',
            actionType: 'RETRY',
          };
        }
        return {
          title: 'Not Found',
          message: backendMessage || "This item doesn't exist or was removed.",
          emoji: '🔍',
          canRetry: false,
          actionLabel: 'Go Back',
          actionType: 'GO_HOME',
        };
      case 409:
        return {
          title: 'Conflict',
          message: backendMessage || 'This action could not be completed due to a conflict.',
          emoji: '⚠️',
          canRetry: false,
        };
      case 400:
      case 422:
        return {
          title: 'Check Your Info',
          message: backendMessage || 'Some fields are incorrect. Please review.',
          emoji: '📋',
          canRetry: false,
        };
      case 500:
      case 503:
        return {
          title: 'Something Went Wrong',
          message: 'Our servers are having a moment. Please try again shortly.',
          emoji: '🛠️',
          canRetry: true,
          actionLabel: 'Try Again',
          actionType: 'RETRY',
        };
      default:
        break;
    }
  }

  // Generic fallback
  return {
    title: 'Unexpected Error',
    message: (error as Error)?.message || 'Something unexpected happened. Please try again.',
    emoji: '😕',
    canRetry: true,
    actionLabel: 'Try Again',
    actionType: 'RETRY',
  };
}
