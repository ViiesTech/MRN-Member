import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './src/redux/store';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast, { BaseToast } from 'react-native-toast-message';
import Routes from './src/routes/Index';
import { AppColors } from './src/utils/AppColors';
import { FontFamily } from './src/utils/Fonts';
import {
  getFcmToken,
  initializeNotifications,
} from './src/utils/notifications';

const toastConfig = {
  success: props => (
    <BaseToast
      {...props}
      text1NumberOfLines={2}
      text2NumberOfLines={2}
      style={[styles.toast, styles.successToast]}
      contentContainerStyle={styles.toastContent}
      text1Style={styles.toastTitle}
      text2Style={styles.toastMessage}
    />
  ),
  error: props => (
    <BaseToast
      {...props}
      text1NumberOfLines={2}
      text2NumberOfLines={2}
      style={[styles.toast, styles.errorToast]}
      contentContainerStyle={styles.toastContent}
      text1Style={styles.toastTitle}
      text2Style={styles.toastMessage}
    />
  ),
  info: props => (
    <BaseToast
      {...props}
      text1NumberOfLines={2}
      text2NumberOfLines={2}
      style={[styles.toast, styles.infoToast]}
      contentContainerStyle={styles.toastContent}
      text1Style={styles.toastTitle}
      text2Style={styles.toastMessage}
    />
  ),
};

const App = () => {
  const [safeAreaColor, setSafeAreaColor] = useState(AppColors.appThemeBlue);

  useEffect(() => {
    // hide nav bar when app loads
    SystemNavigationBar.stickyImmersive();
    const unsubscribeNotifications = initializeNotifications();

    getFcmToken().then(token => {
      console.log('[Member App FCM Token]:', token || 'Not available');
    });

    return unsubscribeNotifications;
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaView
          edges={['top']}
          style={[styles.safeArea, { backgroundColor: safeAreaColor }]}>
          <Routes setSafeAreaColor={setSafeAreaColor} />
          <Toast config={toastConfig} />
        </SafeAreaView>
      </PersistGate>
    </Provider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  toast: {
    width: '86%',
    minHeight: 82,
    height: 'auto',
    borderRadius: 8,
  },
  successToast: {
    borderLeftColor: '#69C779',
  },
  errorToast: {
    borderLeftColor: '#FE6301',
  },
  infoToast: {
    borderLeftColor: '#87CEFA',
  },
  toastContent: {
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  toastTitle: {
    color: AppColors.black,
    fontSize: 13,
    lineHeight: 17,
    fontFamily: FontFamily.regular,
    fontWeight: '400',
  },
  toastMessage: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: FontFamily.regular,
    fontWeight: '400',
  },
});

export default App;
