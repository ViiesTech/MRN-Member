import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Feather } from '@react-native-vector-icons/feather';
import {
  AppHeader,
  AppText,
  MenuSection,
  UserAvatar,
  Wrapper,
} from '../../../component/Index';
import { AppColors } from '../../../utils/AppColors';
import { clearCredentials, setUser } from '../../../redux/slices/authSlice';
import {
  authApi,
  useGetProfileQuery,
  useLogoutApiHandlerMutation,
} from '../../../redux/Services/authApi';
import { FontFamily } from '../../../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils/Responsive_Dimensions';
import { useSafeAreaColor } from '../../../utils/useSafeAreaColor';
import DeviceInfo from 'react-native-device-info';
import { getFcmToken } from '../../../utils/notifications';
import { showToast } from '../../../utils/Toast';

const normalizeMembershipStatus = status =>
  `${status ?? ''}`.replace(/\s+/g, '').toLowerCase();

const getMembershipMenuItem = (navigation, status) => {
  switch (normalizeMembershipStatus(status)) {
    case 'pending':
      return {
        label: 'Membership Application Pending',
        iconName: 'award',
        onPress: () => navigation.navigate('MembershipUnderReview'),
      };
    case 'approved':
      return {
        label: 'Membership Approved',
        iconName: 'award',
        onPress: () => navigation.navigate('MembershipApproved'),
      };
    case 'unapplied':
    default:
      return {
        label: 'Apply For Membership',
        iconName: 'award',
        onPress: () => navigation.navigate('MembershipForm'),
      };
  }
};

const formatRole = role => {
  const roles = (Array.isArray(role) ? role : [role]).filter(Boolean);

  if (!roles.length) {
    return 'Consumer';
  }

  return roles
    .map(item => `${item}`.charAt(0).toUpperCase() + `${item}`.slice(1))
    .join(', ');
};

const createSections = (
  navigation,
  membershipStatus,
  onLogout,
  logoutLoading
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
        getMembershipMenuItem(navigation, membershipStatus),
      ],
    },
    {
      title: 'Preferences & Support',
      items: [
        {
          label: 'Help Center',
          iconName: 'help-circle',
          onPress: () =>
            navigation.navigate('WebContent', { page: 'helpCenter' }),
        },
        {
          label: 'Monthly Report',
          iconName: 'file-text',
          onPress: () => navigation.navigate('Reports'),
        },
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
          loading: logoutLoading,
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
  const [logoutApiHandler, { isLoading }] = useLogoutApiHandlerMutation();

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  useEffect(() => {
    if (profileResponse?.success && profileResponse?.data) {
      dispatch(setUser(profileResponse.data));
    }
  }, [dispatch, profileResponse]);

  const handleLogout = async () => {
    try {
      const deviceId = await DeviceInfo.getUniqueId();
      const token = await getFcmToken();

      const payload = {
        deviceId,
        ...(token && { token }),
      };

      console.log('Logout Payload:', payload);

      await logoutApiHandler(payload).unwrap();
    } catch (error) {
      console.log('Logout Error:', error);
    } finally {
      dispatch(clearCredentials());
      dispatch(authApi.util.resetApiState());
      showToast('Logged out successfully.');
    }
  };
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
  const profileUser =
    profileResponse?.success && profileResponse?.data
      ? profileResponse.data
      : user;

  const sections = createSections(
    navigation,
    profileUser?.membership?.status ?? profileUser?.membershipStatus,
    handleLogout,
    isLoading,
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
        <UserAvatar uri={profileUser?.profile} style={styles.avatar} />
        <View style={styles.profileText}>
          <AppText
            size={1.8}
            color={AppColors.black}
            family={FontFamily.bold}
            style={styles.profileName}>
            {profileUser?.name || 'MRN User'}
          </AppText>
          <AppText
            size={1.8}
            color={AppColors.black}
            family={FontFamily.regular}>
            {formatRole(profileUser?.role)}
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
