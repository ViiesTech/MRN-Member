import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppHeader,
  AppText,
  EmptyState,
  IntroductionCardsSkeleton,
  IntroductionCard,
  StatCardsSkeleton,
  UserAvatar,
  Wrapper,
} from '../../component/Index';
import SVGXml from '../../component/SvgXml';
import { AppIcons } from '../../assets/Icons/Index';
import { AppColors } from '../../utils/AppColors';
import { FontFamily } from '../../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../utils/Responsive_Dimensions';
import { useSafeAreaColor } from '../../utils/useSafeAreaColor';
import {
  useGetIntroductionsQuery,
  useGetProfileQuery,
} from '../../redux/Services/authApi';
import { setUser } from '../../redux/slices/authSlice';

const statCards = [
  {
    id: 'introductions',
    statKey: 'introductions',
    icon: AppIcons.introArrow,
    label: 'Introductions',
  },
  {
    id: 'appointments',
    statKey: 'appointments',
    icon: AppIcons.calender,
    label: 'Appointments',
  },
  {
    id: 'pending-sales',
    statKey: 'pendingSales',
    icon: AppIcons.pendingSales,
    label: 'Pending Sales',
  },
  {
    id: 'sales-closed',
    statKey: 'salesClosed',
    icon: AppIcons.pendingSales,
    label: 'Sales Closed',
  },
];

const getStatValue = stat => `${stat?.value ?? 0}`;
const getNumericStatChange = stat => {
  const change = Number(stat?.change ?? 0);

  return Number.isFinite(change) ? change : 0;
};
const getStatChange = stat => `${Math.abs(getNumericStatChange(stat))}%`;
const getStatChangeIcon = stat =>
  getNumericStatChange(stat) < 0 ? 'arrow-down' : 'arrow-up';

const getIntroductionId = item => item?._id ?? item?.id;
const getIntroductionName = item =>
  item?.client?.name ??
  item?.consumerId?.name ??
  item?.name ??
  'Member';
const getIntroductionService = item =>
  `Service: ${
    item?.serviceId?.name ??
    item?.service?.name ??
    item?.serviceName ??
    item?.service ??
    'N/A'
  }`;
const getIntroductionLocation = item =>
  item?.client?.address ??
  item?.location ??
  item?.address ??
  'Location unavailable';

const HomeScreen = ({ navigation, setSafeAreaColor }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const {
    data: profileResponse,
    isFetching: isProfileFetching,
    refetch: refetchProfile,
  } = useGetProfileQuery();
  const {
    data: introductionsResponse,
    isFetching: isIntroductionsFetching,
    isError: isIntroductionsError,
    error: introductionsError,
    refetch: refetchIntroductions,
  } = useGetIntroductionsQuery();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const userStats = user?.stats ?? {};
  const introductions = Array.isArray(introductionsResponse?.data)
    ? introductionsResponse.data
    : [];
  const introductionsMessage =
    introductionsResponse?.message ||
    introductionsError?.data?.message ||
    'Introductions are currently unavailable.';
  const isIntroductionsLocked =
    introductionsResponse?.success === false || isIntroductionsError;

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  useEffect(() => {
    if (profileResponse?.success && profileResponse?.data) {
      dispatch(setUser(profileResponse.data));
    }
  }, [dispatch, profileResponse]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      await Promise.all([refetchProfile(), refetchIntroductions()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchIntroductions, refetchProfile]);

  return (
    <Wrapper
      isScroll
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      backgroundColor={AppColors.appBgColor}
      contentContainerStyle={styles.container}>
      <AppHeader
        variant="left"
        title={user?.name || 'Andrew Ainsley'}
        subtitle="Good Morning 👋"
        subtitleFirst
        containerStyle={styles.header}
        leftButtonStyle={styles.avatarButton}
        titleWrapStyle={styles.headerTitleWrap}
        titleStyle={styles.name}
        subtitleStyle={styles.greeting}
        rightButtonStyle={styles.notificationBtn}
        leftIcon={
          <UserAvatar uri={user?.profile} style={styles.avatar} />
        }
        rightIcon={
          <>
            <Feather
              name="bell"
              color={AppColors.appThemeBlue}
              size={responsiveWidth(5.4)}
            />
            <View style={styles.notificationDot} />
          </>
        }
        onRightPress={() => navigation.navigate('NotificationList')}
      />

      {isProfileFetching && !profileResponse?.data ? (
        <StatCardsSkeleton />
      ) : (
        <View style={styles.statsRow}>
          {statCards.map(item => {
            const stat = userStats[item.statKey];

            return (
              <View key={item.id} style={styles.statCard}>
                <View style={styles.statIconCircle}>
                  <SVGXml
                    icon={item.icon}
                    width={responsiveWidth(3.9)}
                    height={responsiveWidth(3.9)}
                  />
                </View>
                <AppText style={styles.statValue}>{getStatValue(stat)}</AppText>
                <AppText style={styles.statLabel} numberOfLines={1}>
                  {item.label}
                </AppText>
                <View style={styles.statChangeRow}>
                  <Feather
                    name={getStatChangeIcon(stat)}
                    color={AppColors.white}
                    size={responsiveFontSize(1.25)}
                  />
                  <AppText style={styles.statChange}>
                    {getStatChange(stat)}
                  </AppText>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <AppText style={styles.sectionTitle}>Recent Introductions</AppText>

      {isIntroductionsFetching && !introductionsResponse ? (
        <IntroductionCardsSkeleton />
      ) : isIntroductionsLocked ? (
        <View style={styles.lockedCard}>
          <AppText style={styles.lockedTitle}>Membership Required</AppText>
          <AppText style={styles.lockedMessage}>{introductionsMessage}</AppText>
        </View>
      ) : introductions.length ? (
        <View style={styles.introductionList}>
          {introductions.map(item => (
            <IntroductionCard
              key={getIntroductionId(item)}
              name={getIntroductionName(item)}
              service={getIntroductionService(item)}
              location={getIntroductionLocation(item)}
              profile={item?.consumerId?.profile}
              onActionPress={() =>
                navigation.navigate('IntroductionDetails', {
                  introduction: item,
                })
              }
            />
          ))}
        </View>
      ) : (
        <EmptyState
          title="No Introductions Yet"
          message="Your latest introductions will appear here when they are received."
          style={styles.emptyIntroductions}
        />
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.appBgColor,
    paddingHorizontal: responsiveWidth(5.8),
    paddingBottom: responsiveHeight(11),
  },
  header: {
    minHeight: responsiveWidth(13),
    paddingHorizontal: 0,
  },
  avatar: {
    width: responsiveWidth(13),
    height: responsiveWidth(13),
    borderRadius: responsiveWidth(6.5),
  },
  avatarButton: {
    width: responsiveWidth(13),
    height: responsiveWidth(13),
    marginRight: responsiveWidth(2.9),
  },
  headerTitleWrap: {
    paddingHorizontal: 0,
  },
  greeting: {
    color: '#75859B',
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.42),
    marginTop: 0,
    marginBottom: responsiveHeight(0.25),
  },
  name: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.82),
  },
  notificationBtn: {
    width: responsiveWidth(11),
    height: responsiveWidth(11),
    borderRadius: responsiveWidth(5.5),
    borderWidth: 1,
    borderColor: AppColors.appThemeBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: responsiveWidth(2.2),
    right: responsiveWidth(2.7),
    width: responsiveWidth(1.9),
    height: responsiveWidth(1.9),
    borderRadius: responsiveWidth(0.95),
    backgroundColor: '#FF4A55',
    borderWidth: 1,
    borderColor: AppColors.appBgColor,
  },
  statsRow: {
    flexDirection: 'row',
    gap: responsiveWidth(2.4),
    marginTop: responsiveHeight(3.1),
  },
  statCard: {
    flex: 1,
    minHeight: responsiveHeight(13.9),
    borderRadius: responsiveWidth(2.1),
    backgroundColor: AppColors.appThemeBlue,
    paddingHorizontal: responsiveWidth(2),
    paddingVertical: responsiveHeight(1.15),
  },
  statIconCircle: {
    width: responsiveWidth(6),
    height: responsiveWidth(6),
    borderRadius: responsiveWidth(3),
    backgroundColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    marginTop: responsiveHeight(1.05),
    color: AppColors.white,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(3.1),
    lineHeight: responsiveFontSize(3.35),
  },
  statLabel: {
    marginTop: responsiveHeight(0.45),
    color: AppColors.white,
    fontFamily: FontFamily.semiBold,
    fontSize: responsiveFontSize(1.22),
    lineHeight: responsiveFontSize(1.6),
  },
  statChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: responsiveHeight(1.05),
  },
  statChange: {
    marginLeft: responsiveWidth(0.75),
    color: AppColors.white,
    fontFamily: FontFamily.semiBold,
    fontSize: responsiveFontSize(1.15),
    lineHeight: responsiveFontSize(1.45),
  },
  sectionTitle: {
    marginTop: responsiveHeight(2.3),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(2.35),
    lineHeight: responsiveFontSize(2.9),
  },
  introductionList: {
    marginTop: responsiveHeight(1.1),
    gap: responsiveHeight(1.8),
  },
  lockedCard: {
    marginTop: responsiveHeight(1.1),
    minHeight: responsiveHeight(10.55),
    borderRadius: responsiveWidth(2.2),
    backgroundColor: '#A9C8F6',
    justifyContent: 'center',
    paddingHorizontal: responsiveWidth(4.5),
    paddingVertical: responsiveHeight(1.6),
  },
  lockedTitle: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.9),
    lineHeight: responsiveFontSize(2.4),
  },
  lockedMessage: {
    marginTop: responsiveHeight(0.6),
    color: AppColors.themeTxt2,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(1.6),
    lineHeight: responsiveFontSize(2.15),
  },
  emptyIntroductions: {
    marginTop: responsiveHeight(1.1),
  },
});

export default HomeScreen;
