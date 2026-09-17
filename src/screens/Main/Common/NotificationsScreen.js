import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import moment from 'moment';

import {
  AppHeader,
  AppText,
  NotificationCard,
  NotificationCardsSkeleton,
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
  useGetNotificationsQuery,
} from '../../../redux/Services/authApi';
import { openNotificationDestination } from '../../../utils/navigation';
import { getNotificationTarget } from '../../../utils/notificationDeepLink';

const getNotificationIcon = type => {
  switch (`${type}`.toLowerCase()) {
    case 'introduction':
      return 'user-check';
    case 'information':
      return 'file-text';
    case 'membership_application':
      return 'award';
    case 'chat':
    case 'message':
      return 'message-circle';
    case 'system':
    default:
      return 'bell';
  }
};

const isNotificationTappable = item => {
  if (`${item?.type}`.toLowerCase() === 'system') {
    return false;
  }
  const target = getNotificationTarget(item);
  return Boolean(target && target.name && target.name !== 'none');
};

const NotificationsScreen = ({
  navigation,
  setSafeAreaColor,
  isTab = false,
  audience = 'member',
}) => {
  useSafeAreaColor(
    setSafeAreaColor,
    AppColors.appBgColor,
  );

  const {
    data: notificationsResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetNotificationsQuery({
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    if (notificationsResponse) {
      console.log(
        'NotificationsScreen Response:',
        JSON.stringify(notificationsResponse, null, 2),
      );
    }
    if (error) {
      console.log('NotificationsScreen Error:', error);
    }
  }, [notificationsResponse, error]);

  const notifications =
    notificationsResponse?.data || [];
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleNotificationPress = item => {
    openNotificationDestination(item);
  };

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
        title="Notifications"
        onLeftPress={() =>
          isTab ? navigation.navigate('Home') : navigation.goBack()
        }
        containerStyle={styles.header}
        leftButtonStyle={styles.headerBackButton}
        titleWrapStyle={styles.headerTitleWrap}
        titleStyle={styles.headerTitle}
        backIconColor={AppColors.appThemeBlue}
        backIconSize={responsiveFontSize(2.5)}
      />

      <View style={styles.summary}>
        <AppText style={styles.summaryTitle}>
          Today
        </AppText>

        <AppText style={styles.summaryText}>
          {audience === 'consumer'
            ? 'Stay updated with information requests, services, and account activity.'
            : 'Stay updated with introductions, membership, payments, and reports.'}
        </AppText>
      </View>

      {(isLoading || isFetching) && !isRefreshing && notifications.length === 0 ? (
        <NotificationCardsSkeleton count={5} />
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AppText
            size={1.6}
            color={AppColors.bodyText}
            family={FontFamily.medium}>
            No notifications yet.
          </AppText>
        </View>
      ) : (
        <View style={styles.list}>
          {notifications.map(item => {
            const tappable = isNotificationTappable(item);

            return (
              <NotificationCard
                key={item._id}
                title={item.title}
                description={item.body}
                time={
                  item.createdAt
                    ? moment(item.createdAt).fromNow()
                    : ''
                }
                iconName={getNotificationIcon(item.type)}
                isUnread={!item.isRead}
                disabled={!tappable}
                onPress={tappable ? () => handleNotificationPress(item) : undefined}
              />
            );
          })}
        </View>
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.appBgColor,
    paddingHorizontal: responsiveWidth(5.6),
    paddingBottom: responsiveHeight(4),
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
    fontSize: responsiveFontSize(2.15),
  },

  summary: {
    marginTop: responsiveHeight(2.6),
  },

  summaryTitle: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(2.15),
  },

  summaryText: {
    marginTop: responsiveHeight(0.65),
    color: AppColors.bodyText,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.45),
    lineHeight: responsiveFontSize(1.9),
  },

  list: {
    marginTop: responsiveHeight(2),
    gap: responsiveHeight(1.55),
  },

  loaderContainer: {
    minHeight: responsiveHeight(52),
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyContainer: {
    marginTop: responsiveHeight(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default NotificationsScreen;
