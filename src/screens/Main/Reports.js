import React from 'react';
import { StyleSheet, View } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { AppHeader, AppText, Wrapper } from '../../component/Index';
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

const stats = [
  {
    id: 'introductions',
    icon: AppIcons.introArrow,
    value: '24',
    label: 'Introductions\nReceived',
  },
  {
    id: 'appointments',
    icon: AppIcons.calender,
    value: '42',
    label: 'Appointments\nScheduled',
  },
  {
    id: 'conversions',
    icon: AppIcons.pendingSales,
    value: '31',
    label: 'Successful\nConversions',
  },
  {
    id: 'response',
    icon: AppIcons.clock,
    value: '1.2',
    label: 'Avg Response\nTime',
  },
];

const activities = [
  {
    id: '1',
    title: 'Sales Completed',
    subtitle: 'John Smith - Insurance',
    date: '16 May, 2026',
    time: '18:35 PM',
    iconName: 'dollar-sign',
  },
  {
    id: '2',
    title: 'Sales Completed',
    subtitle: 'John Smith - Insurance',
    date: '15 May, 2026',
    time: '16:15 PM',
    iconName: 'dollar-sign',
  },
  {
    id: '3',
    title: 'New Introduction',
    subtitle: 'John Smith - Insurance',
    date: '15 May, 2026',
    time: '16:15 PM',
    iconName: 'send',
  },
];

const Reports = ({ navigation, setSafeAreaColor }) => {
  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  return (
    <Wrapper
      isScroll
      backgroundColor={AppColors.appBgColor}
      contentContainerStyle={styles.container}>
      <AppHeader
        variant="left"
        showBack
        title="Reports"
        onLeftPress={() => navigation.navigate('Home')}
        containerStyle={styles.header}
        leftButtonStyle={styles.headerBackButton}
        titleWrapStyle={styles.headerTitleWrap}
        titleStyle={styles.headerTitle}
        backIconColor={AppColors.appThemeBlue}
        backIconSize={responsiveFontSize(2.5)}
      />

      <View style={styles.statsRow}>
        {stats.map(item => (
          <View key={item.id} style={styles.statCard}>
            <View style={styles.statTopRow}>
              <View style={styles.statIconCircle}>
                <SVGXml
                  icon={item.icon}
                  width={responsiveWidth(3.9)}
                  height={responsiveWidth(3.9)}
                />
              </View>
              <AppText style={styles.statValue}>{item.value}</AppText>
            </View>
            <AppText style={styles.statLabel}>{item.label}</AppText>
          </View>
        ))}
      </View>

      <AppText style={styles.sectionTitle}>Monthly Activity</AppText>

      <View style={styles.activityList}>
        {activities.map(item => (
          <View key={item.id} style={styles.activityCard}>
            <View style={styles.activityIconCircle}>
              <Feather
                name={item.iconName}
                color={AppColors.appThemeBlue}
                size={responsiveFontSize(2.45)}
              />
            </View>

            <View style={styles.activityContent}>
              <AppText style={styles.activityTitle}>{item.title}</AppText>
              <AppText style={styles.activitySubtitle}>{item.subtitle}</AppText>
            </View>

            <View style={styles.activityTime}>
              <AppText style={styles.activityDate}>{item.date}</AppText>
              <AppText style={styles.activityDate}>{item.time}</AppText>
            </View>
          </View>
        ))}
      </View>
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
    fontFamily: FontFamily.semiBold,
    fontSize: responsiveFontSize(2.15),
  },
  statsRow: {
    flexDirection: 'row',
    gap: responsiveWidth(2.4),
    marginTop: responsiveHeight(2.7),
  },
  statCard: {
    flex: 1,
    minHeight: responsiveHeight(10.4),
    borderRadius: responsiveWidth(2),
    backgroundColor: AppColors.appThemeBlue,
    paddingHorizontal: responsiveWidth(1.7),
    paddingVertical: responsiveHeight(1.05),
  },
  statTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconCircle: {
    width: responsiveWidth(6.1),
    height: responsiveWidth(6.1),
    borderRadius: responsiveWidth(3.05),
    backgroundColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    marginLeft: responsiveWidth(1.8),
    color: AppColors.white,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(2.65),
    lineHeight: responsiveFontSize(3),
  },
  statLabel: {
    marginTop: responsiveHeight(1.2),
    color: AppColors.white,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(1.15),
    lineHeight: responsiveFontSize(1.42),
  },
  sectionTitle: {
    marginTop: responsiveHeight(2.9),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(2.2),
    lineHeight: responsiveFontSize(2.7),
  },
  activityList: {
    marginTop: responsiveHeight(1.25),
    gap: responsiveHeight(1.65),
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: responsiveHeight(9.1),
    borderRadius: responsiveWidth(2),
    backgroundColor: '#A9C8F6',
    paddingHorizontal: responsiveWidth(3.2),
    paddingVertical: responsiveHeight(1.15),
  },
  activityIconCircle: {
    width: responsiveWidth(12.9),
    height: responsiveWidth(12.9),
    borderRadius: responsiveWidth(6.45),
    backgroundColor: '#D4E4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
    marginLeft: responsiveWidth(3.6),
  },
  activityTitle: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.85),
    lineHeight: responsiveFontSize(2.3),
  },
  activitySubtitle: {
    marginTop: responsiveHeight(0.75),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.22),
    lineHeight: responsiveFontSize(1.55),
  },
  activityTime: {
    alignItems: 'flex-end',
    alignSelf: 'center',
    gap: responsiveHeight(0.95),
  },
  activityDate: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.05),
    lineHeight: responsiveFontSize(1.35),
  },
});

export default Reports;
