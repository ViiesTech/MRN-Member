import React from 'react';
import { StyleSheet, View } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import AppText from './AppText';
import { AppColors } from '../utils/AppColors';
import { FontFamily } from '../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../utils/Responsive_Dimensions';

const EmptyState = ({
  title = 'Nothing Here Yet',
  message,
  iconName = 'inbox',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Feather
          name={iconName}
          color={AppColors.white}
          size={responsiveFontSize(3.2)}
        />
      </View>

      <AppText style={styles.title}>{title}</AppText>
      {!!message && <AppText style={styles.message}>{message}</AppText>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: responsiveHeight(18),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#7EA5DA',
    borderRadius: responsiveWidth(2),
    backgroundColor: '#A9C8F6',
    paddingHorizontal: responsiveWidth(6),
    paddingVertical: responsiveHeight(2.4),
  },
  iconContainer: {
    width: responsiveWidth(13),
    height: responsiveWidth(13),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: responsiveWidth(6.5),
    backgroundColor: AppColors.themeTxt2,
  },
  title: {
    marginTop: responsiveHeight(1.4),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.9),
    textAlign: 'center',
  },
  message: {
    marginTop: responsiveHeight(0.7),
    color: AppColors.bodyText,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.5),
    lineHeight: responsiveFontSize(2),
    textAlign: 'center',
  },
});

export default EmptyState;
