import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Feather } from '@react-native-vector-icons/feather';
import AppText from './AppText';
import { FontFamily } from '../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../utils/Responsive_Dimensions';

const HEADER_COLOR = '#02061C';

const AppHeader = ({
  title,
  subtitle,
  subtitleFirst = false,
  variant = 'center',
  showBack = false,
  leftIcon,
  rightIcon,
  rightContent,
  onLeftPress,
  onRightPress,
  containerStyle,
  leftButtonStyle,
  rightButtonStyle,
  titleWrapStyle,
  titleStyle,
  subtitleStyle,
  backIconSize = responsiveFontSize(2.8),
}) => {
  const isLeftVariant = variant === 'left';
  const finalLeftIcon =
    leftIcon ??
    (showBack ? (
      <Feather name="arrow-left" color={HEADER_COLOR} size={backIconSize} />
    ) : null);
  const titleContent = (
    <>
      <AppText
        numberOfLines={1}
        style={[styles.title, titleStyle, styles.headerColor]}>
        {title}
      </AppText>
      {!!subtitle && (
        <AppText numberOfLines={1} style={[styles.subtitle, subtitleStyle]}>
          {subtitle}
        </AppText>
      )}
    </>
  );
  const subtitleFirstContent = (
    <>
      {!!subtitle && (
        <AppText numberOfLines={1} style={[styles.subtitle, subtitleStyle]}>
          {subtitle}
        </AppText>
      )}
      <AppText
        numberOfLines={1}
        style={[styles.title, titleStyle, styles.headerColor]}>
        {title}
      </AppText>
    </>
  );

  return (
    <View
      style={[
        styles.container,
        isLeftVariant && styles.leftContainer,
        containerStyle,
      ]}>
      <TouchableOpacity
        activeOpacity={0.8}
        accessibilityRole={onLeftPress ? 'button' : undefined}
        disabled={!onLeftPress}
        onPress={onLeftPress}
        style={[
          styles.iconButton,
          isLeftVariant && styles.leftIconButton,
          leftButtonStyle,
        ]}>
        {finalLeftIcon}
      </TouchableOpacity>

      <View
        style={[
          styles.titleWrap,
          isLeftVariant && styles.leftTitleWrap,
          titleWrapStyle,
        ]}>
        {subtitleFirst ? subtitleFirstContent : titleContent}
      </View>

      {rightContent ? (
        <View style={rightButtonStyle}>{rightContent}</View>
      ) : (
        <TouchableOpacity
          activeOpacity={0.8}
          accessibilityRole={onRightPress ? 'button' : undefined}
          disabled={!onRightPress}
          onPress={onRightPress}
          style={[styles.iconButton, rightButtonStyle]}>
          {rightIcon}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: responsiveHeight(6),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(3.7),
  },
  leftContainer: {
    minHeight: responsiveHeight(3),
    paddingHorizontal: 0,
  },
  iconButton: {
    width: responsiveWidth(9.3),
    height: responsiveWidth(9.3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIconButton: {
    width: responsiveWidth(5.2),
    height: responsiveWidth(5.2),
    marginRight: responsiveWidth(1.6),
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: responsiveWidth(1.8),
  },
  leftTitleWrap: {
    alignItems: 'flex-start',
    paddingHorizontal: 0,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(2),
  },
  headerColor: {
    color: HEADER_COLOR,
  },
  subtitle: {
    marginTop: responsiveHeight(0.2),
    color: '#687789',
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.3),
  },
});

export default AppHeader;
