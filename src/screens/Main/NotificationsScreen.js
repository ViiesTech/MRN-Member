import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppHeader, AppText, NotificationCard, Wrapper } from '../../component/Index';
import { AppColors } from '../../utils/AppColors';
import { FontFamily } from '../../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../utils/Responsive_Dimensions';
import { useSafeAreaColor } from '../../utils/useSafeAreaColor';

const notifications = [
  {
    id: '1',
    title: 'Membership Under Review',
    description: 'Your membership application has been submitted successfully.',
    time: 'Just now',
    iconName: 'clock',
    isUnread: true,
  },
  {
    id: '2',
    title: 'New Introduction',
    description: 'Tony Mora sent you a new message about an introduction.',
    time: '9:42 am',
    iconName: 'send',
    isUnread: true,
  },
  {
    id: '3',
    title: 'Payment Reminder',
    description: 'Complete payment to unlock all membership features.',
    time: 'Today',
    iconName: 'credit-card',
  },
  {
    id: '4',
    title: 'Report Generated',
    description: 'Your weekly / monthly report is ready to view.',
    time: 'Yesterday',
    iconName: 'file-text',
  },
];

const NotificationsScreen = ({ navigation, setSafeAreaColor }) => {
  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  return (
    <Wrapper
      isScroll
      backgroundColor={AppColors.appBgColor}
      contentContainerStyle={styles.container}>
      <AppHeader
        variant="left"
        showBack
        title="Notifications"
        onLeftPress={() => navigation.goBack()}
        containerStyle={styles.header}
        leftButtonStyle={styles.headerBackButton}
        titleWrapStyle={styles.headerTitleWrap}
        titleStyle={styles.headerTitle}
        backIconColor={AppColors.appThemeBlue}
        backIconSize={responsiveFontSize(2.5)}
      />

      <View style={styles.summary}>
        <AppText style={styles.summaryTitle}>Today</AppText>
        <AppText style={styles.summaryText}>
          Stay updated with introductions, membership, payments, and reports.
        </AppText>
      </View>

      <View style={styles.list}>
        {notifications.map(item => (
          <NotificationCard
            key={item.id}
            title={item.title}
            description={item.description}
            time={item.time}
            iconName={item.iconName}
            isUnread={item.isUnread}
          />
        ))}
      </View>
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
});

export default NotificationsScreen;
