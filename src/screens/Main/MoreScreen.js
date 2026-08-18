import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  Linking,
  StyleSheet,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Feather } from '@react-native-vector-icons/feather';
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import {
  AppHeader,
  AppText,
  MenuSection,
  UserAvatar,
  Wrapper,
} from '../../component/Index';
import { AppColors } from '../../utils/AppColors';
import { clearCredentials, setUser } from '../../redux/slices/authSlice';
import { useGetProfileQuery } from '../../redux/Services/authApi';
import { FontFamily } from '../../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../utils/Responsive_Dimensions';
import { useSafeAreaColor } from '../../utils/useSafeAreaColor';
import {
  DEFAULT_NOTIFICATION_PREFERENCE,
  loadNotificationPreferences,
  saveNotificationPreferences,
} from '../../utils/notificationPreferences';
import { showToast } from '../../utils/Toast';

const normalizeMembershipStatus = status =>
  `${status ?? ''}`.replace(/\s+/g, '').toLowerCase();

const getMembershipRoute = status => {
  switch (normalizeMembershipStatus(status)) {
    case 'pending':
      return 'MembershipUnderReview';
    case 'approved':
      return 'MembershipApproved';
    case 'rejected':
      return 'MembershipRejected';
    case 'unapplied':
    default:
      return 'MembershipForm';
  }
};

const formatRole = role => {
  if (!role) {
    return 'Member';
  }

  return role.charAt(0).toUpperCase() + role.slice(1);
};

const isNotificationPermissionGranted = status =>
  status === AuthorizationStatus.AUTHORIZED ||
  status === AuthorizationStatus.PROVISIONAL;

const createSections = (
  navigation,
  membershipStatus,
  notificationToggle,
  onLogout,
) => [
  {
    title: 'Account',
    items: [
      {
        label: 'Profile',
        iconName: 'user',
        onPress: () => navigation.navigate('Profile'),
      },
      {
        label: 'Change Password',
        iconName: 'lock',
        onPress: () => navigation.navigate('ChangePassword'),
      },
      {
        label: 'Apply For Membership',
        iconName: 'award',
        onPress: () => navigation.navigate(getMembershipRoute(membershipStatus)),
      },
    ],
  },
  {
    title: 'Preferences & Support',
    items: [
      {
        label: 'Notification Settings',
        iconName: 'bell',
        ...notificationToggle,
      },
      {
        label: 'Help Center',
        iconName: 'help-circle',
        onPress: () =>
          navigation.navigate('WebContent', { page: 'helpCenter' }),
      },
      { label: 'Weekly / Monthly Report', iconName: 'file-text' },
    ],
  },
  {
    title: 'About',
    items: [
      {
        label: 'About App',
        iconName: 'info',
        onPress: () =>
          navigation.navigate('WebContent', { page: 'aboutApp' }),
      },
      {
        label: 'Terms & Conditions',
        iconName: 'file-text',
        onPress: () =>
          navigation.navigate('WebContent', { page: 'termsAndConditions' }),
      },
      {
        label: 'Logout',
        iconName: 'log-out',
        onPress: onLogout,
      },
    ],
  },
];

const MoreScreen = ({ navigation, setSafeAreaColor }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const {
    data: profileResponse,
    isFetching: isProfileFetching,
    refetch: refetchProfile,
  } = useGetProfileQuery();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notificationPreference, setNotificationPreference] = useState(
    DEFAULT_NOTIFICATION_PREFERENCE,
  );
  const [notificationAuthorization, setNotificationAuthorization] = useState(
    AuthorizationStatus.NOT_DETERMINED,
  );
  const [isNotificationLoading, setIsNotificationLoading] = useState(true);
  const [isNotificationUpdating, setIsNotificationUpdating] = useState(false);

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  useEffect(() => {
    if (profileResponse?.success && profileResponse?.data) {
      dispatch(setUser(profileResponse.data));
    }
  }, [dispatch, profileResponse]);

  const refreshNotificationAuthorization = useCallback(async () => {
    const settings = await notifee.getNotificationSettings();
    setNotificationAuthorization(settings.authorizationStatus);
    return settings.authorizationStatus;
  }, []);

  useEffect(() => {
    const loadNotificationSetting = async () => {
      try {
        const [storedPreference] = await Promise.all([
          loadNotificationPreferences(user?._id),
          refreshNotificationAuthorization(),
        ]);
        setNotificationPreference(storedPreference);
      } catch {
        showToast(
          'Unable to load notification setting',
          'Please try again in a moment.',
          'error',
        );
      } finally {
        setIsNotificationLoading(false);
      }
    };

    loadNotificationSetting();
  }, [refreshNotificationAuthorization, user?._id]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        refreshNotificationAuthorization().catch(() => undefined);
      }
    });

    return () => subscription.remove();
  }, [refreshNotificationAuthorization]);

  useFocusEffect(
    useCallback(() => {
      refetchProfile();
    }, [refetchProfile]),
  );

  const handlePullRefresh = useCallback(async () => {
    if (isRefreshing || isProfileFetching) {
      return;
    }

    setIsRefreshing(true);

    try {
      await refetchProfile();
    } finally {
      setIsRefreshing(false);
    }
  }, [isProfileFetching, isRefreshing, refetchProfile]);

  const handleHeaderRefresh = useCallback(() => {
    if (!isRefreshing && !isProfileFetching) {
      refetchProfile();
    }
  }, [isProfileFetching, isRefreshing, refetchProfile]);

  const showHeaderSpinner = isProfileFetching && !isRefreshing;

  const handleNotificationToggle = async nextValue => {
    if (isNotificationUpdating) {
      return;
    }

    setIsNotificationUpdating(true);

    try {
      if (nextValue) {
        let nextAuthorization = notificationAuthorization;

        if (!isNotificationPermissionGranted(nextAuthorization)) {
          const settings = await notifee.requestPermission();
          nextAuthorization = settings.authorizationStatus;
          setNotificationAuthorization(nextAuthorization);
        }

        if (!isNotificationPermissionGranted(nextAuthorization)) {
          Alert.alert(
            'Notifications are disabled',
            'Enable notifications from your device settings to receive updates.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => Linking.openSettings(),
              },
            ],
          );
          return;
        }
      }

      await saveNotificationPreferences(user?._id, nextValue);
      setNotificationPreference(nextValue);
      showToast(
        nextValue ? 'Notifications enabled' : 'Notifications disabled',
      );
    } catch {
      showToast(
        'Unable to update notifications',
        'Please try again in a moment.',
        'error',
      );
    } finally {
      setIsNotificationUpdating(false);
    }
  };

  const notificationsEnabled =
    isNotificationPermissionGranted(notificationAuthorization) &&
    notificationPreference;

  const sections = createSections(
    navigation,
    user?.membershipStatus,
    {
      toggleValue: notificationsEnabled,
      toggleLoading: isNotificationLoading || isNotificationUpdating,
      toggleDisabled: isNotificationLoading || isNotificationUpdating,
      onToggle: handleNotificationToggle,
    },
    () => dispatch(clearCredentials()),
  );

  return (
    <Wrapper
      isScroll
      refreshing={isRefreshing}
      onRefresh={handlePullRefresh}
      backgroundColor={AppColors.appBgColor}
      contentContainerStyle={styles.container}>
      <AppHeader
        variant="left"
        showBack
        title="More"
        onLeftPress={() => navigation.navigate('Home')}
        containerStyle={styles.header}
        leftButtonStyle={styles.headerBackButton}
        titleWrapStyle={styles.headerTitleWrap}
        titleStyle={styles.headerTitle}
        backIconColor={AppColors.appThemeBlue}
        backIconSize={responsiveFontSize(2.5)}
        onRightPress={handleHeaderRefresh}
        rightIcon={
          showHeaderSpinner ? (
            <ActivityIndicator
              color={AppColors.appThemeBlue}
              size="small"
            />
          ) : (
            <Feather
              name="refresh-cw"
              color={AppColors.appThemeBlue}
              size={responsiveFontSize(2.2)}
            />
          )
        }
        rightButtonStyle={styles.headerRefreshButton}
      />

      <View style={styles.profileRow}>
        <UserAvatar uri={user?.profile} style={styles.avatar} />
        <View style={styles.profileText}>
          <AppText
            size={1.8}
            color={AppColors.black}
            family={FontFamily.bold}
            style={styles.profileName}>
            {user?.name || 'Andrew Ainsley'}
          </AppText>
          <AppText
            size={1.8}
            color={AppColors.black}
            family={FontFamily.regular}>
            {formatRole(user?.role)}
          </AppText>
        </View>
      </View>

      {sections.map(section => (
        <MenuSection
          key={section.title}
          title={section.title}
          items={section.items}
        />
      ))}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.appBgColor,
    paddingHorizontal: responsiveWidth(5.6),
    paddingBottom: responsiveHeight(12),
  },
  header: {
    minHeight: responsiveHeight(4.4),
    paddingHorizontal: 0,
  },
  headerBackButton: {
    width: responsiveWidth(6.4),
    height: responsiveWidth(6.4),
    marginRight: responsiveWidth(1.7),
  },
  headerTitleWrap: {
    paddingHorizontal: 0,
  },
  headerTitle: {
    color: AppColors.appThemeBlue,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(2),
  },
  headerRefreshButton: {
    width: responsiveWidth(8),
    height: responsiveWidth(8),
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: responsiveHeight(2.8),
  },
  avatar: {
    width: responsiveWidth(13.6),
    height: responsiveWidth(13.6),
    borderRadius: responsiveWidth(6.8),
  },
  profileText: {
    marginLeft: responsiveWidth(3),
  },
  profileName: {
    marginBottom: responsiveHeight(0.15),
  },
});

export default MoreScreen;
