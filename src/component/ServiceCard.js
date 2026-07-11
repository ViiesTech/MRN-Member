import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SVGXml from './SvgXml';
import { AppColors } from '../utils/AppColors';
import { FontFamily } from '../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../utils/Responsive_Dimensions';

const ServiceCard = ({ title, description, icon, selected = false, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, selected && styles.selectedCard]}>
      <View style={styles.radioWrap}>
        <View style={[styles.radio, selected && styles.selectedRadio]}>
          {selected && <View style={styles.radioDot} />}
        </View>
      </View>

      <View style={styles.iconBox}>
        <SVGXml
          icon={icon}
          width={responsiveWidth(9)}
          height={responsiveWidth(9)}
        />
      </View>

      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>
      <Text numberOfLines={2} style={styles.description}>
        {description}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '47.5%',
    minHeight: responsiveHeight(17.8),
    borderRadius: responsiveWidth(3.3),
    backgroundColor: '#ADC9F5',
    paddingHorizontal: responsiveWidth(3.5),
    paddingTop: responsiveHeight(1.45),
    paddingBottom: responsiveHeight(1.6),
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderWidth: 1.4,
    borderColor: AppColors.themeTxt2,
  },
  radioWrap: {
    position: 'absolute',
    top: responsiveHeight(1.1),
    right: responsiveWidth(2.7),
  },
  radio: {
    width: responsiveHeight(2.15),
    height: responsiveHeight(2.15),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: AppColors.themeTxt2,
  },
  selectedRadio: {
    backgroundColor: AppColors.white,
  },
  radioDot: {
    width: responsiveHeight(1.15),
    height: responsiveHeight(1.15),
    borderRadius: 999,
    backgroundColor: AppColors.themeTxt2,
  },
  iconBox: {
    width: responsiveWidth(16),
    height: responsiveWidth(16),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: responsiveWidth(1.7),
    backgroundColor: AppColors.themeTxt2,
  },
  title: {
    marginTop: responsiveHeight(1.35),
    color: AppColors.themeTxt2,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.85),
  },
  description: {
    marginTop: responsiveHeight(0.35),
    color: AppColors.themeTxt2,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.2),
    lineHeight: responsiveFontSize(1.55),
  },
});

export default ServiceCard;
