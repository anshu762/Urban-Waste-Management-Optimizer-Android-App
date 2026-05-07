import Toast, { ToastShowParams } from 'react-native-toast-message';

export const AppToast = {
  showSuccess: (message: string, description?: string) => {
    Toast.show({
      type: 'success',
      text1: message,
      text2: description,
      position: 'bottom',
    });
  },
  showError: (message: string, description?: string) => {
    Toast.show({
      type: 'error',
      text1: message,
      text2: description,
      position: 'bottom',
    });
  },
  showInfo: (message: string, description?: string) => {
    Toast.show({
      type: 'info',
      text1: message,
      text2: description,
      position: 'bottom',
    });
  },
};
