import React from 'react';
import { StyleSheet, View } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import AppText from './AppText';
import SVGXml from './SvgXml';
import { StatCardsSkeleton } from './SkeletonLoaders';
import { AppIcons } from '../assets/Icons/Index';
import { AppColors } from '../utils/AppColors';
import { FontFamily } from '../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../utils/Responsive_Dimensions';

const cards = [
  {
    id: 'introductions',
    statKey: 'introductions',
    icon: AppIcons.introArrow,
    label: 'Introductions',
  },
  {
    id: 'appointments',
    statKey: 'appointments',
    icon: AppIcons.calender,
    label: 'Appointments',
  },
  {
    id: 'pending-sales',
    statKey: 'pendingSales',
    icon: AppIcons.pendingSales,
    label: 'Pending Sales',
  },
  {
    id: 'sales-closed',
    statKey: 'salesClosed',
    icon: AppIcons.pendingSales,
    label: 'Sales Closed',
  },
];

const getChange = stat => {
  const change = Number(stat?.change ?? 0);
  return Number.isFinite(change) ? change : 0;
};

const StatCards = ({ stats = {}, loading = false, style }) => {
  if (loading) {
    return <StatCardsSkeleton />;
  }

  return (
    <View style={[styles.row, style]}>
      {cards.map(item => {
        const stat = stats[item.statKey];
        const change = getChange(stat);

        return (
          <View key={item.id} style={styles.card}>
            <View style={styles.iconCircle}>
              <SVGXml
                icon={item.icon}
                width={responsiveWidth(3.9)}
                height={responsiveWidth(3.9)}
              />
            </View>
            <AppText style={styles.value}>{stat?.value ?? 0}</AppText>
            <AppText style={styles.label} numberOfLines={1}>
              {item.label}
            </AppText>
            <View style={styles.changeRow}>
              <Feather
                name={change < 0 ? 'arrow-down' : 'arrow-up'}
                color={AppColors.white}
                size={responsiveFontSize(1.25)}
              />
              <AppText style={styles.change}>{Math.abs(change)}%</AppText>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: responsiveWidth(2.4),
    marginTop: responsiveHeight(3.1),
  },
  card: {
    flex: 1,
    minHeight: responsiveHeight(13.9),
    borderRadius: responsiveWidth(2.1),
    backgroundColor: AppColors.appThemeBlue,
    paddingHorizontal: responsiveWidth(2),
    paddingVertical: responsiveHeight(1.15),
  },
  iconCircle: {
    width: responsiveWidth(6),
    height: responsiveWidth(6),
    borderRadius: responsiveWidth(3),
    backgroundColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    marginTop: responsiveHeight(1.05),
    color: AppColors.white,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(3.1),
    lineHeight: responsiveFontSize(3.35),
  },
  label: {
    marginTop: responsiveHeight(0.45),
    color: AppColors.white,
    fontFamily: FontFamily.semiBold,
    fontSize: responsiveFontSize(1.22),
    lineHeight: responsiveFontSize(1.6),
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: responsiveHeight(1.05),
  },
  change: {
    marginLeft: responsiveWidth(0.75),
    color: AppColors.white,
    fontFamily: FontFamily.semiBold,
    fontSize: responsiveFontSize(1.15),
    lineHeight: responsiveFontSize(1.45),
  },
});

export default StatCards;
