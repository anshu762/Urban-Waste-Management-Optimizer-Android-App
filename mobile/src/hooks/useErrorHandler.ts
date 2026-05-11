import Toast from 'react-native-toast-message';
import { parseError } from '../lib/error-parser';

export function useErrorHandler() {
  const showError = (error: unknown) => {
    const parsed = parseError(error);
    
    Toast.show({
      type: 'error',
      text1: parsed.title,
      text2: parsed.message,
      visibilityTime: 4000,
      position: 'top',
      topOffset: 60,
    });
  };

  const showSuccess = (message: string, title?: string) => {
    Toast.show({
      type: 'success',
      text1: title || message,
      text2: title ? message : undefined,
      visibilityTime: 3000,
      position: 'top',
      topOffset: 60,
    });
  };

  const showInfo = (message: string, title?: string) => {
    Toast.show({
      type: 'info',
      text1: title || message,
      text2: title ? message : undefined,
      visibilityTime: 3000,
      position: 'top',
      topOffset: 60,
    });
  };

  return { showError, showSuccess, showInfo, parseError };
}
