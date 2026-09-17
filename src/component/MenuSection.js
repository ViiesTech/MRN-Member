import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
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
            disabled={item.loading || item.disabled}
            accessibilityState={{ disabled: Boolean(item.disabled) }}
            style={[
              styles.row,
              item.onToggle && styles.toggleRow,
              item.disabled && styles.disabledRow,
            ]}>
            <View
              style={[styles.iconBox, item.disabled && styles.disabledIconBox]}>
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

            {item.onToggle ? (
              item.toggleLoading ? (
                <View style={styles.toggleLoader}>
                  <ActivityIndicator
                    color={AppColors.appThemeBlue}
                    size="small"
                  />
                </View>
              ) : (
                <View style={styles.toggleWrap}>
                  <Switch
                    value={item.toggleValue}
                    disabled={item.toggleDisabled}
                    onValueChange={item.onToggle}
                    trackColor={{
                      false: '#AAC1E3',
                      true: AppColors.appThemeDimBlue,
                    }}
                    thumbColor={AppColors.white}
                    ios_backgroundColor="#AAC1E3"
                    style={styles.compactSwitch}
                  />
                </View>
              )
            ) : item.loading ? (
              <ActivityIndicator
                color={AppColors.appThemeBlue}
                size="small"
              />
            ) : item.rightIcon ? (
              <Feather
                name={item.rightIcon}
                color={
                  item.disabled ? AppColors.bodyText : AppColors.themeTxt2
                }
                size={responsiveFontSize(2.05)}
              />
            ) : (
              <Feather
                name="chevron-right"
                color={AppColors.themeTxt2}
                size={responsiveFontSize(2.2)}
              />
            )}
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
  toggleRow: {
    paddingRight: responsiveWidth(4.5),
  },
  disabledRow: {
    opacity: 0.62,
  },
  iconBox: {
    width: responsiveWidth(8.2),
    height: responsiveWidth(8.2),
    borderRadius: responsiveWidth(1.5),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.themeTxt2,
  },
  disabledIconBox: {
    backgroundColor: '#7896BD',
  },
  label: {
    flex: 1,
    marginLeft: responsiveWidth(3.6),
  },
  toggleLoader: {
    width: responsiveWidth(9.5),
    height: responsiveHeight(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleWrap: {
    width: responsiveWidth(9.5),
    height: responsiveHeight(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactSwitch: {
    transform: [{ scaleX: 0.64 }, { scaleY: 0.64 }],
  },
});

export default MenuSection;
