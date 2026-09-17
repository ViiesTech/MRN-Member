import { createNavigationContainerRef } from '@react-navigation/native';
import { getNotificationTarget } from './notificationDeepLink';

export const navigationRef = createNavigationContainerRef();

let isAuthenticated = false;
let pendingNotificationTarget = null;
let lastNavigationAt = 0;
let lastNavigationKey = null;

export const flushNotificationNavigation = () => {
  if (
    !pendingNotificationTarget ||
    !isAuthenticated ||
    !navigationRef.isReady()
  ) {
    return;
  }

  const target = pendingNotificationTarget;
  pendingNotificationTarget = null;

  if (!target || target.name === 'none') {
    return;
  }

  const currentRouteName = navigationRef.getCurrentRoute()?.name;

  if (
    target.name === 'notifications' &&
    ['Notification', 'NotificationList'].includes(currentRouteName)
  ) {
    return;
  }

  const screenByTarget = {
    chat: 'Chat',
    introduction: 'IntroductionDetails',
    information: 'InformationDetails',
    membership_approved: 'MembershipApproved',
    membership_rejected: 'MembershipRejected',
    notifications: 'NotificationList',
  };

  const targetScreen = screenByTarget[target.name];
  if (!targetScreen) {
    return;
  }

  navigationRef.navigate('Main', {
    screen: targetScreen,
    params: target.params,
  });
};

export const setNavigationAuthenticated = value => {
  isAuthenticated = Boolean(value);

  if (isAuthenticated) {
    flushNotificationNavigation();
  }
};

export const openNotificationDestination = payload => {
  const target = getNotificationTarget(payload);

  if (!target || target.name === 'none') {
    return;
  }

  const now = Date.now();
  const navigationKey = JSON.stringify(target);

  if (
    navigationKey === lastNavigationKey &&
    now - lastNavigationAt < 1000
  ) {
    return;
  }

  lastNavigationAt = now;
  lastNavigationKey = navigationKey;
  pendingNotificationTarget = target;
  flushNotificationNavigation();
};
