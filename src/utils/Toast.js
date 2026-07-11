import Toast from 'react-native-toast-message';

export const showToast = (message, text2, type = 'success') => {
  Toast.show({
    type,
    text1: message,
    text2: text2,
    text1NumberOfLines: 2,
    text2NumberOfLines: 2,
    position: 'top',
    visibilityTime: 4000,
    autoHide: true,
  });
};
