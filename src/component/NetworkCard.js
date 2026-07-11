import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import SVGXml from './SvgXml';
import { AppIcons } from '../assets/Icons/Index';
import { AppColors } from '../utils/AppColors';
import { FontFamily } from '../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../utils/Responsive_Dimensions';

const ChevronIcon = () => (
  <Svg
    width={responsiveWidth(3)}
    height={responsiveWidth(3)}
    viewBox="0 0 10 10"
    fill="none">
    <Path
      d="M3.75 2.15L6.25 5L3.75 7.85"
      stroke={AppColors.white}
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const NetworkCard = ({
  title = 'Dallas Network',
  description = 'Lorem ipsum simply dummy',
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.card}>
      <View style={styles.iconBox}>
        <SVGXml
          icon={AppIcons.network}
          width={responsiveWidth(7.4)}
          height={responsiveWidth(7.4)}
        />
      </View>

      <View style={styles.textBox}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        <Text numberOfLines={2} style={styles.description}>
          {description}
        </Text>
      </View>

      <View style={styles.arrowCircle}>
        <ChevronIcon />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: responsiveHeight(8.8),
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.themeTxt2,
    borderRadius: responsiveWidth(2.4),
    backgroundColor: '#adc9f5',
    paddingHorizontal: responsiveWidth(2.6),
  },
  iconBox: {
    width: responsiveWidth(13.6),
    height: responsiveWidth(13.6),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: responsiveWidth(1.5),
    backgroundColor: AppColors.appThemeBlue,
  },
  textBox: {
    flex: 1,
    marginLeft: responsiveWidth(3.5),
    paddingRight: responsiveWidth(2),
  },
  title: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.semiBold,
    fontSize: responsiveFontSize(2),
  },
  description: {
    marginTop: responsiveHeight(0.35),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.55),
    lineHeight: responsiveFontSize(1.85),
  },
  arrowCircle: {
    width: responsiveWidth(6),
    height: responsiveWidth(6),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: responsiveWidth(3),
    backgroundColor: AppColors.appThemeBlue,
  },
});

export default NetworkCard;
