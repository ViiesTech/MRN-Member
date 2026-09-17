/**
 * @format
 */

import { AppRegistry } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';
import { displayRemoteNotification } from './src/utils/notifications';
import { openNotificationDestination } from './src/utils/navigation';

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
    openNotificationDestination(detail.notification);
  }
});

setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
  // Notification payloads are rendered by the OS while the app is backgrounded.
  if (!remoteMessage?.notification) {
    await displayRemoteNotification(remoteMessage);
  }
});

AppRegistry.registerComponent(appName, () => App);
