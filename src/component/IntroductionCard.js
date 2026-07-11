import React from 'react';
import { StyleSheet, View } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import AppButton from './AppButton';
import AppText from './AppText';
import UserAvatar from './UserAvatar';
import { AppColors } from '../utils/AppColors';
import { FontFamily } from '../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../utils/Responsive_Dimensions';

const IntroductionCard = ({
  name = 'Andrew Ainsley',
  service = 'Service: Insurance',
  location = 'California, United states',
  actionTitle = 'View Details',
  actionType = 'gradient',
  showChevron = false,
  onActionPress,
  profile,
  loading = false,
  disabled = false,
  showStatusOption = false,
  nextStatusLabel,
  onStatusOptionPress,
  style,
}) => {
  const isOutline = actionType === 'outline';

  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardContent}>
        <UserAvatar uri={profile} style={styles.avatar} />
        <View style={styles.info}>
          <AppText style={styles.name}>{name}</AppText>
          <AppText style={styles.service}>{service}</AppText>
          <View style={styles.locationRow}>
            <Feather
              name="map-pin"
              color={AppColors.themeTxt2}
              size={responsiveFontSize(1.5)}
            />
            <AppText style={styles.location}>{location}</AppText>
          </View>
        </View>
        <AppButton
          title={actionTitle}
          onPress={onActionPress}
          disabled={disabled || loading}
          variant={isOutline ? 'solid' : 'gradient'}
          gradientColors={AppColors.appGradient}
          bordered={isOutline}
          borderColor={AppColors.appThemeBlue}
          rightIcon={
            showChevron ? (
              <Feather
                name={showStatusOption ? 'chevron-up' : 'chevron-down'}
                color={AppColors.white}
                size={responsiveFontSize(1.35)}
              />
            ) : null
          }
          style={[
            styles.actionButton,
            isOutline && styles.outlineButton,
            showChevron && styles.dropdownButton,
          ]}
          contentStyle={[
            styles.actionContent,
            showChevron && styles.dropdownContent,
          ]}
          textStyle={[styles.actionText, isOutline && styles.outlineText]}
        />
      </View>
      {showStatusOption && nextStatusLabel ? (
        <View style={styles.statusOptionPanel}>
          <View style={styles.statusOptionCopy}>
            <AppText style={styles.statusOptionCaption}>Next status</AppText>
            <AppText style={styles.statusOptionValue}>{nextStatusLabel}</AppText>
          </View>
          <AppButton
            title={`Move to ${nextStatusLabel}`}
            onPress={onStatusOptionPress}
            loading={loading}
            variant="gradient"
            gradientColors={AppColors.appGradient}
            showRightArrow
            style={styles.statusOptionButton}
            contentStyle={styles.statusOptionButtonContent}
            textStyle={styles.statusOptionButtonText}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: responsiveHeight(10.55),
    borderRadius: responsiveWidth(2.2),
    backgroundColor: '#A9C8F6',
    paddingHorizontal: responsiveWidth(3.2),
    paddingVertical: responsiveHeight(1.2),
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: responsiveHeight(8.15),
  },
  avatar: {
    width: responsiveWidth(12.2),
    height: responsiveWidth(12.2),
    borderRadius: responsiveWidth(6.1),
  },
  info: {
    flex: 1,
    marginLeft: responsiveWidth(3),
  },
  name: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.78),
    lineHeight: responsiveFontSize(2.25),
  },
  service: {
    marginTop: responsiveHeight(0.35),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(1.3),
    lineHeight: responsiveFontSize(1.7),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: responsiveHeight(0.55),
  },
  location: {
    marginLeft: responsiveWidth(0.9),
    color: AppColors.themeTxt2,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.2),
    lineHeight: responsiveFontSize(1.6),
  },
  actionButton: {
    width: responsiveWidth(28.8),
    height: responsiveHeight(4.15),
    minHeight: responsiveHeight(4.15),
    borderRadius: responsiveWidth(2.3),
    paddingHorizontal: responsiveWidth(2.5),
  },
  dropdownButton: {
    width: responsiveWidth(23.8),
    paddingHorizontal: responsiveWidth(1.8),
  },
  outlineButton: {
    width: responsiveWidth(25.3),
    backgroundColor: 'transparent',
    paddingHorizontal: responsiveWidth(1.8),
  },
  actionContent: {
    gap: 0,
  },
  dropdownContent: {
    gap: responsiveWidth(1),
  },
  actionText: {
    color: AppColors.white,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.32),
    lineHeight: responsiveFontSize(1.65),
  },
  outlineText: {
    color: AppColors.appThemeBlue,
  },
  statusOptionPanel: {
    minHeight: responsiveHeight(6.2),
    marginTop: responsiveHeight(0.8),
    paddingTop: responsiveHeight(1.1),
    borderTopWidth: 1,
    borderTopColor: '#7EA5DA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusOptionCopy: {
    flex: 1,
  },
  statusOptionCaption: {
    color: AppColors.themeTxt2,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.1),
  },
  statusOptionValue: {
    marginTop: responsiveHeight(0.15),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.semiBold,
    fontSize: responsiveFontSize(1.45),
  },
  statusOptionButton: {
    width: responsiveWidth(36),
    minHeight: responsiveHeight(4),
    height: responsiveHeight(4),
    borderRadius: responsiveWidth(1.5),
  },
  statusOptionButtonContent: {
    paddingRight: responsiveWidth(1.5),
  },
  statusOptionButtonText: {
    fontSize: responsiveFontSize(1.15),
  },
});

export default IntroductionCard;
