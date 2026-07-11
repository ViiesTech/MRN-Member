import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AppText from './AppText';
import { AppColors } from '../utils/AppColors';
import { FontFamily } from '../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../utils/Responsive_Dimensions';
import { AntDesign } from '@react-native-vector-icons/ant-design';

const AppButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'solid',
  gradientColors = AppColors.appGradient,
  gradientStart = { x: 0, y: 0.5 },
  gradientEnd = { x: 1, y: 0.5 },
  borderColor = AppColors.btnBorder,
  bordered = false,
  showRightArrow = false,
  rightIconColor = AppColors.white,
  leftIcon,
  rightIcon,
  style,
  contentStyle,
  textStyle,
  activeOpacity = 0.85,
}) => {
  const isDisabled = disabled || loading;
  const isGradientOutline = variant === 'gradientOutline';
  const isGradient = variant === 'gradient';
  const finalRightIcon = showRightArrow ? (
    <AntDesign
      name="arrow-right"
      color={rightIconColor}
      size={responsiveFontSize(2)}
    />
  ) : (
    rightIcon
  );
  const finalLeftIcon = showRightArrow ? (
    <View style={styles.iconSpacer} />
  ) : (
    leftIcon
  );

  const buttonContent = loading ? (
    <ActivityIndicator color={AppColors.white} />
  ) : (
    <View
      style={[
        styles.content,
        showRightArrow && styles.arrowContent,
        contentStyle,
      ]}>
      {finalLeftIcon}
      <AppText numberOfLines={1} style={[styles.title, textStyle]}>
        {title}
      </AppText>
      {finalRightIcon}
    </View>
  );

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      activeOpacity={activeOpacity}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.button,
        isGradient && styles.gradientButton,
        bordered && [styles.bordered, { borderColor }],
        isGradientOutline && [
          styles.gradientOutlineButton,
          { borderColor },
        ],
        isDisabled && styles.disabled,
        style,
      ]}>
      {isGradientOutline || isGradient ? (
        <LinearGradient
          colors={gradientColors}
          start={gradientStart}
          end={gradientEnd}
          style={[
            isGradientOutline ? styles.gradientBorder : styles.filledGradient,
          ]}>
          {isGradientOutline ? (
            <View style={styles.gradientInner}>{buttonContent}</View>
          ) : (
            buttonContent
          )}
        </LinearGradient>
      ) : (
        buttonContent
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: responsiveHeight(5.6),
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: responsiveWidth(2),
    backgroundColor: AppColors.themeTxt,
    paddingHorizontal: responsiveWidth(4.2),
    overflow: 'hidden',
  },
  gradientOutlineButton: {
    minHeight: responsiveHeight(4.3),
    backgroundColor: 'transparent',
    borderWidth: 1,
    paddingHorizontal: 0,
    overflow: 'hidden',
  },
  gradientButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  bordered: {
    borderWidth: 1,
  },
  filledGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: responsiveWidth(2),
  },
  gradientBorder: {
    width: '100%',
    height: '100%',
    borderRadius: responsiveWidth(1.5),
  },
  gradientInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: responsiveWidth(4.2),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: responsiveWidth(2),
  },
  arrowContent: {
    width: '100%',
    justifyContent: 'space-between',
    paddingRight: responsiveWidth(3),
  },
  iconSpacer: {
    width: responsiveFontSize(2),
  },
  disabled: {
    opacity: 0.55,
  },
  title: {
    color: AppColors.white,
    fontFamily: FontFamily.semiBold,
    fontSize: responsiveFontSize(1.9),
  },
});

export default AppButton;
