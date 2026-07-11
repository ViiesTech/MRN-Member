import React from 'react';
import { StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AntDesign } from '@react-native-vector-icons/ant-design';
import AppButton from './AppButton';
import AppText from './AppText';
import { AppColors } from '../utils/AppColors';
import { FontFamily } from '../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../utils/Responsive_Dimensions';

const SuccessCard = ({
  title,
  subtitle,
  buttonTitle,
  onButtonPress,
  gradientColors = [
    AppColors.appThemeBlue,
    AppColors.appThemeDimBlue,
    AppColors.appThemeBlue,
  ],
}) => {
  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.card}>
      <View style={styles.iconCircle}>
        <AntDesign
          name="check"
          color={AppColors.appThemeDimBlue}
          size={responsiveFontSize(4)}
        />
      </View>

      <AppText
        numberOfLines={1}
        adjustsFontSizeToFit
        color={AppColors.white}
        family={FontFamily.bold}
        style={styles.title}>
        {title}
      </AppText>
      <AppText
        color={AppColors.white}
        family={FontFamily.bold}
        style={styles.subtitle}>
        {subtitle}
      </AppText>

      <AppButton
        title={buttonTitle}
        onPress={onButtonPress}
        showRightArrow
        rightIconColor={AppColors.themeTxt2}
        style={styles.button}
        textStyle={styles.buttonText}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: responsiveHeight(30),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: responsiveWidth(1.7),
    // padding: responsiveHeight(2),
  },
  iconCircle: {
    width: responsiveWidth(16),
    height: responsiveWidth(16),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: responsiveWidth(8),
    backgroundColor: AppColors.white,
  },
  title: {
    marginTop: responsiveHeight(2),
    color: AppColors.white,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(3.25),
    lineHeight: responsiveFontSize(3.8),
  },
  subtitle: {
    marginTop: responsiveHeight(0.2),
    color: AppColors.white,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.65),
  },
  button: {
    width: '85%',
    height: responsiveHeight(4.8),
    minHeight: 0,
    borderRadius: responsiveWidth(1.4),
    backgroundColor: AppColors.white,
    marginTop: responsiveHeight(3.2),
    margin: responsiveWidth(2.5),
    // paddingHorizontal: 0,
  },
  buttonText: {
    color: AppColors.themeTxt2,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.55),
  },
});

export default SuccessCard;
