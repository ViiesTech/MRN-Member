import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Feather from '@react-native-vector-icons/feather';
import {
  AppButton,
  AppHeader,
  AppText,
  UserAvatar,
  Wrapper,
} from '../../../component/Index';
import { AppColors } from '../../../utils/AppColors';
import { FontFamily } from '../../../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils/Responsive_Dimensions';
import { useSafeAreaColor } from '../../../utils/useSafeAreaColor';
import { useGetProfileQuery } from '../../../redux/Services/authApi';
import { setUser } from '../../../redux/slices/authSlice';

const ProfileScreen = ({ navigation, setSafeAreaColor }) => {
  const dispatch = useDispatch();
  const storedUser = useSelector(state => state.auth.user);
  const {
    data: profileResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetProfileQuery();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const profile = profileResponse?.data ?? storedUser ?? {};
  const network = profile.networkId ?? {};
  const region = network.regionId ?? {};
  const service = profile.serviceId ?? {};

  const membershipStatus = `${
    profile?.membership?.status ?? profile?.membershipStatus ?? ''
  }`
    .trim()
    .toLowerCase();
  const role = `${profile?.role ?? profile?.roles?.[0] ?? ''}`
    .trim()
    .toLowerCase();
  const isMember = membershipStatus === 'approved' || role === 'member';

  const details = useMemo(() => {
    if (isMember) {
      return [
        {
          id: 'region',
          label: 'Region',
          value: region.name || 'Not available',
          icon: 'map-pin',
        },
        {
          id: 'network',
          label: 'Network',
          value: network.name || 'Not available',
          icon: 'share-2',
        },
        {
          id: 'service',
          label: 'Services Offered',
          value: service.name || 'Not available',
          icon: 'briefcase',
        },
        {
          id: 'phone',
          label: 'Phone',
          value: profile.phone || 'Not available',
          icon: 'phone',
        },
      ];
    }

    return [
      {
        id: 'phone',
        label: 'Phone Number',
        value: profile.phone || 'Not available',
        icon: 'phone',
      },
    ];
  }, [isMember, network.name, profile.phone, region.name, service.name]);

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  useEffect(() => {
    if (profileResponse?.success && profileResponse?.data) {
      dispatch(setUser(profileResponse.data));
    }
  }, [dispatch, profileResponse]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const handleRefresh = useCallback(async () => {
    if (isRefreshing || isFetching) {
      return;
    }

    setIsRefreshing(true);

    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [isFetching, isRefreshing, refetch]);

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
        title="Profile"
        onLeftPress={() => navigation.goBack()}
        containerStyle={styles.header}
        leftButtonStyle={styles.headerBackButton}
        titleWrapStyle={styles.headerTitleWrap}
        titleStyle={styles.headerTitle}
        backIconColor={AppColors.appThemeBlue}
        backIconSize={responsiveFontSize(2.5)}
      />

      {isLoading && !profile?._id ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={AppColors.appThemeBlue} />
        </View>
      ) : (
        <>
          {/* Top Hero Profile Card */}
          <View style={styles.heroCard}>
            <View style={styles.avatarRing}>
              <UserAvatar
                uri={profile.profile}
                size={responsiveWidth(23)}
                style={styles.avatar}
              />
            </View>

            <AppText numberOfLines={1} style={styles.name}>
              {profile.name || 'MRN User'}
            </AppText>

            <View style={styles.emailPill}>
              <Feather
                name="mail"
                color={AppColors.themeTxt2}
                size={responsiveFontSize(1.35)}
              />
              <AppText numberOfLines={1} style={styles.email}>
                {profile.email || 'Email not available'}
              </AppText>
            </View>

            <AppButton
              title="Edit Profile"
              onPress={() => navigation.navigate('EditProfile')}
              variant="gradient"
              gradientColors={AppColors.appGradient}
              leftIcon={
                <Feather
                  name="edit-2"
                  color={AppColors.white}
                  size={responsiveFontSize(1.4)}
                />
              }
              style={styles.editButton}
              contentStyle={styles.editButtonContent}
              textStyle={styles.editButtonText}
            />
          </View>

          {/* About Section */}
          <View style={styles.sectionWrap}>
            <AppText style={styles.sectionTitle}>About</AppText>
            <View style={styles.aboutCard}>
              <AppText style={styles.aboutText}>
                {profile.about || 'No information has been added yet.'}
              </AppText>
            </View>
          </View>

          {/* Details Section */}
          <View style={styles.sectionWrap}>
            <AppText style={styles.sectionTitle}>
              {isMember ? 'Professional Details' : 'Contact Details'}
            </AppText>
            <View
              style={[
                styles.detailsCard,
                !isMember && styles.singleDetailsCard,
              ]}>
              {details.map((item, index) => (
                <React.Fragment key={item.id}>
                  {index > 0 && <View style={styles.divider} />}
                  <View
                    style={[
                      styles.detailRow,
                      !isMember && styles.singleDetailRow,
                    ]}>
                    <View
                      style={[
                        styles.iconBox,
                        !isMember && styles.singleIconBox,
                      ]}>
                      <Feather
                        name={item.icon}
                        color={AppColors.white}
                        size={
                          !isMember
                            ? responsiveFontSize(2.1)
                            : responsiveFontSize(1.85)
                        }
                      />
                    </View>
                    <View style={styles.detailInfo}>
                      <AppText
                        style={[
                          styles.detailLabel,
                          !isMember && styles.singleDetailLabel,
                        ]}>
                        {item.label}
                      </AppText>
                      <AppText
                        style={[
                          styles.detailValue,
                          !isMember && styles.singleDetailValue,
                        ]}>
                        {item.value}
                      </AppText>
                    </View>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </View>
        </>
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: AppColors.appBgColor,
    paddingHorizontal: responsiveWidth(5.6),
    paddingBottom: responsiveHeight(5),
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
  headerTitleWrap: { paddingHorizontal: 0 },
  headerTitle: {
    color: AppColors.appThemeBlue,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(2.05),
  },
  loader: {
    minHeight: responsiveHeight(65),
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    marginTop: responsiveHeight(1.8),
    alignItems: 'center',
    borderRadius: responsiveWidth(2.8),
    backgroundColor: '#A9C8F6',
    borderWidth: 1,
    borderColor: '#7EA5DA',
    paddingVertical: responsiveHeight(2.4),
    paddingHorizontal: responsiveWidth(4),
  },
  avatarRing: {
    padding: responsiveWidth(0.8),
    borderRadius: responsiveWidth(13),
    backgroundColor: AppColors.white,
    shadowColor: AppColors.appThemeBlue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  avatar: {
    width: responsiveWidth(23),
    height: responsiveWidth(23),
    borderRadius: responsiveWidth(11.5),
  },
  name: {
    maxWidth: '90%',
    marginTop: responsiveHeight(1.3),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(2.15),
    lineHeight: responsiveFontSize(2.6),
    textAlign: 'center',
  },
  emailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: responsiveHeight(0.6),
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(0.4),
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: responsiveWidth(3),
    gap: responsiveWidth(1.4),
  },
  email: {
    color: AppColors.themeTxt2,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(1.35),
    lineHeight: responsiveFontSize(1.7),
  },
  editButton: {
    width: responsiveWidth(35),
    minHeight: responsiveHeight(4.3),
    height: responsiveHeight(4.3),
    marginTop: responsiveHeight(1.6),
    borderRadius: responsiveWidth(1.8),
  },
  editButtonContent: {
    gap: responsiveWidth(1.4),
  },
  editButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: responsiveFontSize(1.45),
  },
  sectionWrap: {
    marginTop: responsiveHeight(2.3),
  },
  sectionTitle: {
    marginBottom: responsiveHeight(0.9),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.85),
    lineHeight: responsiveFontSize(2.25),
  },
  aboutCard: {
    borderRadius: responsiveWidth(2.4),
    backgroundColor: '#A9C8F6',
    borderWidth: 1,
    borderColor: '#7EA5DA',
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(1.5),
  },
  aboutText: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.45),
    lineHeight: responsiveFontSize(2.1),
  },
  detailsCard: {
    borderRadius: responsiveWidth(2.4),
    backgroundColor: '#A9C8F6',
    borderWidth: 1,
    borderColor: '#7EA5DA',
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(3.8),
    paddingVertical: responsiveHeight(1.35),
  },
  iconBox: {
    width: responsiveWidth(9.6),
    height: responsiveWidth(9.6),
    borderRadius: responsiveWidth(1.8),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.appThemeBlue,
  },
  detailInfo: {
    flex: 1,
    marginLeft: responsiveWidth(3.2),
  },
  detailLabel: {
    color: AppColors.themeTxt2,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.2),
    lineHeight: responsiveFontSize(1.5),
  },
  detailValue: {
    marginTop: responsiveHeight(0.15),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.semiBold,
    fontSize: responsiveFontSize(1.6),
    lineHeight: responsiveFontSize(2),
  },
  divider: {
    height: 1,
    backgroundColor: '#8CAFE0',
    marginHorizontal: responsiveWidth(3.8),
  },
  singleDetailsCard: {
    paddingVertical: responsiveHeight(0.3),
  },
  singleDetailRow: {
    paddingHorizontal: responsiveWidth(4.2),
    paddingVertical: responsiveHeight(1.6),
  },
  singleIconBox: {
    width: responsiveWidth(10.5),
    height: responsiveWidth(10.5),
    borderRadius: responsiveWidth(2.2),
  },
  singleDetailLabel: {
    fontSize: responsiveFontSize(1.25),
  },
  singleDetailValue: {
    fontSize: responsiveFontSize(1.65),
    marginTop: responsiveHeight(0.2),
  },
});

export default ProfileScreen;
