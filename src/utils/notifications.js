import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  EventType,
} from '@notifee/react-native';
import {
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
} from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { openNotificationDestination } from './navigation';

const CHANNEL_ID = 'mrn-default';
const CHANNEL_NAME = 'MRN Notifications';

let cachedFcmToken = null;
let tokenRequest = null;

const isPermissionGranted = authorizationStatus =>
  authorizationStatus === AuthorizationStatus.AUTHORIZED ||
  authorizationStatus === AuthorizationStatus.PROVISIONAL;

export const requestNotificationPermission = async () => {
  const settings = await notifee.requestPermission();
  return isPermissionGranted(settings.authorizationStatus);
};

export const createNotificationChannel = () =>
  notifee.createChannel({
    id: CHANNEL_ID,
    name: CHANNEL_NAME,
    importance: AndroidImportance.HIGH,
  });

export const getFcmToken = async () => {
  if (cachedFcmToken) {
    return cachedFcmToken;
  }

  if (tokenRequest) {
    return tokenRequest;
  }

  tokenRequest = (async () => {
    try {
      const permissionGranted = await requestNotificationPermission();

      if (!permissionGranted) {
        return null;
      }

      const messaging = getMessaging();

      if (Platform.OS === 'ios') {
        await registerDeviceForRemoteMessages(messaging);
      }

      cachedFcmToken = await getToken(messaging);
      return cachedFcmToken;
    } catch (error) {
      console.warn('Unable to get FCM token:', error);
      return null;
    } finally {
      tokenRequest = null;
    }
  })();

  return tokenRequest;
};

export const displayRemoteNotification = async remoteMessage => {
  const title = remoteMessage?.notification?.title || remoteMessage?.data?.title;
  const body = remoteMessage?.notification?.body || remoteMessage?.data?.body;

  if (!title && !body) {
    return;
  }

  const channelId = await createNotificationChannel();

  await notifee.displayNotification({
    title: title || 'MRN',
    body: body || '',
    data: remoteMessage?.data,
    android: {
      channelId,
      pressAction: { id: 'default' },
      smallIcon: 'ic_launcher',
    },
    ios: {
      foregroundPresentationOptions: {
        alert: true,
        badge: true,
        sound: true,
      },
    },
  });
};

export const initializeNotifications = () => {
  createNotificationChannel().catch(error => {
    console.warn('Unable to create notification channel:', error);
  });

  const messaging = getMessaging();
  const unsubscribeMessage = onMessage(messaging, displayRemoteNotification);
  const unsubscribeNotificationOpened = onNotificationOpenedApp(
    messaging,
    openNotificationDestination,
  );
  const unsubscribeNotifeeEvents = notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
      openNotificationDestination(detail.notification);
    }
  });
  const unsubscribeTokenRefresh = onTokenRefresh(messaging, token => {
    cachedFcmToken = token;
  });

  getInitialNotification(messaging)
    .then(remoteMessage => {
      if (remoteMessage) {
        openNotificationDestination(remoteMessage);
      }
    })
    .catch(error => {
      console.warn('Unable to read initial FCM notification:', error);
    });

  notifee
    .getInitialNotification()
    .then(initialNotification => {
      if (initialNotification) {
        openNotificationDestination(initialNotification.notification);
      }
    })
    .catch(error => {
      console.warn('Unable to read initial Notifee notification:', error);
    });

  return () => {
    unsubscribeMessage();
    unsubscribeNotificationOpened();
    unsubscribeNotifeeEvents();
    unsubscribeTokenRefresh();
  };
};

export const clearCachedFcmToken = () => {
  cachedFcmToken = null;
  tokenRequest = null;
};
