import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Feather } from '@react-native-vector-icons/feather';
import AppText from './AppText';
import { AppColors } from '../utils/AppColors';
import { FontFamily } from '../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../utils/Responsive_Dimensions';

const NotificationCard = ({
  title,
  description,
  time,
  iconName = 'bell',
  onPress,
  disabled = false,
}) => {
  const isInteractive = Boolean(onPress) && !disabled;

  return (
    <TouchableOpacity
      activeOpacity={isInteractive ? 0.85 : 1}
      disabled={!isInteractive}
      onPress={isInteractive ? onPress : undefined}
      style={styles.card}>
      <View style={styles.iconBox}>
        <Feather
          name={iconName}
          color={AppColors.white}
          size={responsiveFontSize(2.1)}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <AppText
            size={1.7}
            color={AppColors.themeTxt2}
            family={FontFamily.bold}
            style={styles.title}>
            {title}
          </AppText>
          {!!time && (
            <AppText
              size={1.25}
              color={AppColors.themeTxt}
              family={FontFamily.regular}>
              {time}
            </AppText>
          )}
        </View>

        <AppText
          size={1.45}
          color={AppColors.themeTxt}
          family={FontFamily.regular}
          style={styles.description}>
          {description}
        </AppText>
      </View>

      {/* Unread indicator is temporarily hidden. */}
      {/* {isUnread && <View style={styles.unreadDot} />} */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: responsiveHeight(8.6),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: responsiveWidth(0.22),
    borderColor: AppColors.themeTxt2,
    borderRadius: responsiveWidth(2),
    backgroundColor: '#ADC9F5',
    paddingHorizontal: responsiveWidth(3.2),
    paddingVertical: responsiveHeight(1.25),
  },
  iconBox: {
    width: responsiveWidth(10.4),
    height: responsiveWidth(10.4),
    borderRadius: responsiveWidth(1.7),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.themeTxt2,
  },
  content: {
    flex: 1,
    marginLeft: responsiveWidth(3),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    marginRight: responsiveWidth(2),
  },
  description: {
    marginTop: responsiveHeight(0.45),
    lineHeight: responsiveFontSize(1.85),
  },
  // unreadDot: {
  //   width: responsiveWidth(2.1),
  //   height: responsiveWidth(2.1),
  //   borderRadius: responsiveWidth(1.05),
  //   backgroundColor: AppColors.appThemeDimBlue,
  //   marginLeft: responsiveWidth(1.6),
  // },
});

export default NotificationCard;
