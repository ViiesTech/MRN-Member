import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
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

const createSections = (navigation, membershipStatus, onLogout) => [
  {
    title: 'Account',
    items: [
      { label: 'Profile', iconName: 'user' },
      { label: 'Change Password', iconName: 'lock' },
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
      { label: 'Notification Settings', iconName: 'bell' },
      { label: 'Help Center', iconName: 'help-circle' },
      { label: 'Weekly / Monthly Report', iconName: 'file-text' },
    ],
  },
  {
    title: 'About',
    items: [
      { label: 'About App', iconName: 'info' },
      { label: 'Terms & Conditions', iconName: 'file-text' },
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
  const { data: profileResponse, refetch: refetchProfile } =
    useGetProfileQuery();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  useEffect(() => {
    if (profileResponse?.success && profileResponse?.data) {
      dispatch(setUser(profileResponse.data));
    }
  }, [dispatch, profileResponse]);

  useFocusEffect(
    useCallback(() => {
      refetchProfile();
    }, [refetchProfile]),
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      await refetchProfile();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchProfile]);

  const sections = createSections(
    navigation,
    user?.membershipStatus,
    () => dispatch(clearCredentials()),
  );

  return (
    <Wrapper
      isScroll
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
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
