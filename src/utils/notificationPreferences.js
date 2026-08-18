import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = '@mrn_member_notification_preferences';

export const DEFAULT_NOTIFICATION_PREFERENCE = true;

const getStorageKey = userId => `${STORAGE_PREFIX}:${userId || 'device'}`;

export const loadNotificationPreferences = async userId => {
  const storedPreferences = await AsyncStorage.getItem(getStorageKey(userId));

  if (!storedPreferences) {
    return DEFAULT_NOTIFICATION_PREFERENCE;
  }

  try {
    const parsedPreferences = JSON.parse(storedPreferences);

    if (typeof parsedPreferences === 'boolean') {
      return parsedPreferences;
    }

    return typeof parsedPreferences?.pushEnabled === 'boolean'
      ? parsedPreferences.pushEnabled
      : DEFAULT_NOTIFICATION_PREFERENCE;
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCE;
  }
};

export const saveNotificationPreferences = (userId, enabled) =>
  AsyncStorage.setItem(getStorageKey(userId), JSON.stringify({
    pushEnabled: enabled,
  }));
