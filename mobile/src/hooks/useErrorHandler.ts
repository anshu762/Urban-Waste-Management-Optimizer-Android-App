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
    });
  };

  const showSuccess = (message: string, title = "Success") => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      visibilityTime: 3000,
    });
  };

  const showInfo = (message: string, title = "Info") => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      visibilityTime: 3000,
    });
  };

  return { showError, showSuccess, showInfo, parseError };
}
