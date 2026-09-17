import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import AppText from './AppText';
import UserAvatar from './UserAvatar';
import { AppColors } from '../utils/AppColors';
import { FontFamily } from '../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../utils/Responsive_Dimensions';

const InformationCard = ({
  name,
  profile,
  service,
  location,
  direction = 'sent',
  onPress,
}) => {
  const isSent = direction === 'sent';

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={`View ${name || 'information'} details`}
      disabled={!onPress}
      onPress={onPress}
      style={styles.card}>
      <UserAvatar uri={profile} style={styles.avatar} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <AppText numberOfLines={1} style={styles.name}>
            {name || 'Service Provider'}
          </AppText>
          <View style={styles.badge}>
            <AppText style={styles.badgeText}>{isSent ? 'Sent' : 'Received'}</AppText>
            <Feather
              name={isSent ? 'arrow-up-right' : 'arrow-down-left'}
              color={AppColors.white}
              size={responsiveFontSize(1.4)}
            />
          </View>
        </View>
        <AppText numberOfLines={1} style={styles.service}>
          Service: {service || 'Not available'}
        </AppText>
        <View style={styles.locationRow}>
          <Feather
            name="map-pin"
            color={AppColors.themeTxt2}
            size={responsiveFontSize(1.35)}
          />
          <AppText numberOfLines={1} style={styles.location}>
            {location || 'Location unavailable'}
          </AppText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: responsiveHeight(10.4),
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: responsiveWidth(2.1),
    backgroundColor: '#A9C8F6',
    paddingHorizontal: responsiveWidth(3.2),
    paddingVertical: responsiveHeight(1.2),
  },
  avatar: {
    width: responsiveWidth(12.2),
    height: responsiveWidth(12.2),
    borderRadius: responsiveWidth(6.1),
  },
  content: {
    flex: 1,
    marginLeft: responsiveWidth(3),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: responsiveWidth(2),
  },
  name: {
    flex: 1,
    color: AppColors.themeTxt,
    fontFamily: FontFamily.semiBold,
    fontSize: responsiveFontSize(1.72),
    lineHeight: responsiveFontSize(2.15),
  },
  service: {
    marginTop: responsiveHeight(0.35),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.23),
    lineHeight: responsiveFontSize(1.6),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: responsiveHeight(0.5),
  },
  location: {
    flex: 1,
    marginLeft: responsiveWidth(0.8),
    color: AppColors.themeTxt2,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.18),
    lineHeight: responsiveFontSize(1.5),
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: responsiveWidth(1),
    borderRadius: responsiveHeight(1.4),
    backgroundColor: AppColors.appThemeBlue,
    paddingHorizontal: responsiveWidth(2.6),
    paddingVertical: responsiveHeight(0.35),
    minHeight: responsiveHeight(2.7),
  },
  badgeText: {
    color: AppColors.white,
    fontFamily: FontFamily.semiBold,
    fontSize: responsiveFontSize(1.3),
    includeFontPadding: false,
  },
});

export default InformationCard;
