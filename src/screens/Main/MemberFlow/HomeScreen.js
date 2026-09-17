import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Feather from '@react-native-vector-icons/feather';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppHeader,
  AppText,
  EmptyState,
  InformationCardsSkeleton,
  InformationCard,
  StatCards,
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
import {
  useGetIntroductionsQuery,
  useGetProfileQuery,
} from '../../../redux/Services/authApi';
import { setUser } from '../../../redux/slices/authSlice';
import {
  getIntroductionCounterparty,
  getIntroductionDirection,
} from '../../../utils/introduction';

const getIntroductionId = item => item?._id ?? item?.id;
const getIntroductionService = item =>
  item?.serviceId?.name ??
  item?.service?.name ??
  item?.serviceName ??
  item?.service ??
  '';

const HomeScreen = ({ navigation, setSafeAreaColor }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const {
    data: profileResponse,
    isFetching: isProfileFetching,
    refetch: refetchProfile,
  } = useGetProfileQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const {
    data: introductionsResponse,
    isFetching: isIntroductionsFetching,
    isError: isIntroductionsError,
    refetch: refetchIntroductions,
  } = useGetIntroductionsQuery(
    { status: '', search: '', cursor: '', limit: 10 },
    {
      refetchOnMountOrArgChange: true,
    },
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const userStats = user?.stats ?? {};
  const introductions = Array.isArray(introductionsResponse?.data)
    ? introductionsResponse.data
    : [];
  const introductionsRequestFailed =
    introductionsResponse?.success === false || isIntroductionsError;

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  useEffect(() => {
    if (profileResponse?.success && profileResponse?.data) {
      dispatch(setUser(profileResponse.data));
    }
  }, [dispatch, profileResponse]);

  useFocusEffect(
    useCallback(() => {
      refetchProfile();
      refetchIntroductions();
    }, [refetchProfile, refetchIntroductions]),
  );

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
        leftIcon={
          <UserAvatar uri={user?.profile} style={styles.avatar} />
        }
        rightContent={
          <View style={styles.headerActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Open chats"
              onPress={() => navigation.navigate('ChatList')}
              style={styles.headerActionButton}>
              <Feather
                name="message-circle"
                color={AppColors.appThemeBlue}
                size={responsiveWidth(5.4)}
              />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Open notifications"
              onPress={() => navigation.navigate('NotificationList')}
              style={styles.headerActionButton}>
              <Feather
                name="bell"
                color={AppColors.appThemeBlue}
                size={responsiveWidth(5.4)}
              />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>
        }
      />

      <StatCards
        stats={userStats}
        loading={isProfileFetching && !profileResponse?.data}
      />

      <AppText style={styles.sectionTitle}>Recent Introductions</AppText>

      {isIntroductionsFetching && !introductionsResponse ? (
        <InformationCardsSkeleton />
      ) : introductionsRequestFailed ? (
        <View style={styles.lockedCard}>
          <AppText style={styles.lockedTitle}>
            Unable to Load Introductions
          </AppText>
          <AppText style={styles.lockedMessage}>
            {introductionsResponse?.message || 'Please try again in a moment.'}
          </AppText>
        </View>
      ) : introductions.length ? (
        <View style={styles.introductionList}>
          {introductions.map(item => {
            const counterparty = getIntroductionCounterparty(item, user);
            const direction = getIntroductionDirection(item, user);

            return (
              <InformationCard
                key={getIntroductionId(item)}
                name={counterparty?.name || 'MRN Member'}
                service={getIntroductionService(item)}
                location={counterparty?.address || 'Location unavailable'}
                profile={counterparty?.profile}
                direction={direction}
                onPress={() =>
                  navigation.navigate('IntroductionDetails', {
                    introduction: item,
                  })
                }
              />
            );
          })}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveWidth(2.2),
  },
  headerActionButton: {
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
