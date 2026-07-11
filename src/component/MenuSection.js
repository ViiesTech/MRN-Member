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

const MenuSection = ({ title, items = [], containerStyle }) => {
  return (
    <View style={[styles.section, containerStyle]}>
      <AppText
        size={1.8}
        color={AppColors.themeTxt2}
        family={FontFamily.medium}
        style={styles.sectionTitle}>
        {title}
      </AppText>

      <View style={styles.card}>
        {items.map(item => (
          <TouchableOpacity
            key={item.label}
            activeOpacity={0.8}
            onPress={item.onPress}
            style={styles.row}>
            <View style={styles.iconBox}>
              <Feather
              name={item.iconName}
              color={AppColors.white}
              size={responsiveFontSize(2.1)}
              />
            </View>

            <AppText
              size={1.8}
              color={AppColors.themeTxt}
              family={FontFamily.medium}
              style={styles.label}>
              {item.label}
            </AppText>

            <Feather
              name="chevron-right"
              color={AppColors.themeTxt2}
              size={responsiveFontSize(2.2)}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: responsiveHeight(2.7),
  },
  sectionTitle: {
    marginBottom: responsiveHeight(1),
  },
  card: {
    borderWidth: responsiveWidth(0.2),
    borderColor: AppColors.themeTxt2,
    borderRadius: responsiveWidth(2),
    paddingVertical: responsiveHeight(0.35),
    overflow: 'hidden',
  },
  row: {
    minHeight: responsiveHeight(6.1),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(3.1),
  },
  iconBox: {
    width: responsiveWidth(8.2),
    height: responsiveWidth(8.2),
    borderRadius: responsiveWidth(1.5),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.themeTxt2,
  },
  label: {
    flex: 1,
    marginLeft: responsiveWidth(3.6),
  },
});

export default MenuSection;
