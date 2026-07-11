import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { AppButton, AppHeader, AppText, Wrapper } from '../../component/Index';
import SVGXml from '../../component/SvgXml';
import { AppIcons } from '../../assets/Icons/Index';
import { AppColors } from '../../utils/AppColors';
import { FontFamily } from '../../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../utils/Responsive_Dimensions';
import { useSafeAreaColor } from '../../utils/useSafeAreaColor';

const paymentMethods = [
  { id: 'masterCard', icon: AppIcons.masterCard },
  { id: 'visa', icon: AppIcons.visa },
  { id: 'payPal', icon: AppIcons.payPal },
  { id: 'gPay', icon: AppIcons.gPay },
];

const PaymentScreen = ({ navigation, setSafeAreaColor }) => {
  const [selectedMethod, setSelectedMethod] = useState('masterCard');

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  return (
    <Wrapper
      isScroll
      backgroundColor={AppColors.appBgColor}
      contentContainerStyle={styles.container}>
      <AppHeader
        variant="left"
        showBack
        title="Payment"
        onLeftPress={() => navigation.goBack()}
        containerStyle={styles.header}
        leftButtonStyle={styles.headerBackButton}
        titleWrapStyle={styles.headerTitleWrap}
        titleStyle={styles.headerTitle}
        backIconColor={AppColors.appThemeBlue}
        backIconSize={responsiveFontSize(2.5)}
      />

      <View style={styles.planCard}>
        <View style={styles.planTop}>
          <View>
            <AppText style={styles.planTitle}>Member Access</AppText>
            <AppText style={styles.planSubtitle}>Monthly Membership</AppText>
          </View>
          <AppText style={styles.planPrice}>
            $50.00
            <AppText style={styles.planMonth}> / month</AppText>
          </AppText>
        </View>
        <View style={styles.planDivider} />
        <View style={styles.securePlan}>
          <Feather
            name="check-circle"
            color={AppColors.appThemeBlue}
            size={responsiveFontSize(1.35)}
          />
          <AppText style={styles.secureText}>Secure Payment</AppText>
        </View>
      </View>

      <AppText style={styles.sectionTitle}>Choose payment method</AppText>
      <View style={styles.methodsCard}>
        {paymentMethods.map((method, index) => (
          <TouchableOpacity
            key={method.id}
            activeOpacity={0.82}
            onPress={() => setSelectedMethod(method.id)}
            style={[
              styles.methodRow,
              index > 0 && styles.methodDivider,
            ]}>
            <SVGXml
              icon={method.icon}
              width={responsiveWidth(method.id === 'payPal' ? 18 : 12)}
              height={responsiveHeight(3)}
            />
            <View
              style={[
                styles.radioOuter,
                selectedMethod === method.id && styles.radioOuterSelected,
              ]}>
              {selectedMethod === method.id && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <AppText style={styles.sectionTitle}>Price Details</AppText>
      <View style={styles.priceCard}>
        <View style={styles.priceRow}>
          <AppText style={styles.priceLabel}>Membership Access (Monthly)</AppText>
          <AppText style={styles.priceValue}>$50.00</AppText>
        </View>
        <View style={styles.priceRow}>
          <AppText style={styles.priceLabel}>Taxes</AppText>
          <AppText style={styles.priceValue}>$0.00</AppText>
        </View>
        <View style={styles.totalDivider} />
        <View style={styles.priceRow}>
          <AppText style={styles.totalLabel}>Total Amount</AppText>
          <AppText style={styles.totalValue}>$50.00</AppText>
        </View>
      </View>

      <View style={styles.securityBox}>
        <Feather
          name="lock"
          color={AppColors.appThemeBlue}
          size={responsiveFontSize(2)}
        />
        <AppText style={styles.securityText}>
          Your payment is 100% secure. Your details are protected and encrypted.
        </AppText>
      </View>

      <AppButton
        title="Pay $50.00"
        variant="gradient"
        onPress={() => navigation.navigate('PaymentSuccess')}
        style={styles.payButton}
        textStyle={styles.payText}
      />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.appBgColor,
    paddingHorizontal: responsiveWidth(5.6),
    paddingBottom: responsiveHeight(4),
  },
  header: {
    minHeight: responsiveHeight(4.4),
    paddingHorizontal: 0,
  },
  headerBackButton: {
    width: responsiveWidth(6.4),
    height: responsiveWidth(6.4),
    marginRight: responsiveWidth(1.7),
  },
  headerTitleWrap: {
    paddingHorizontal: 0,
  },
  headerTitle: {
    color: AppColors.black,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(2.1),
  },
  planCard: {
    marginTop: responsiveHeight(3),
    borderWidth: 1,
    borderColor: '#AEC0DA',
    borderRadius: responsiveWidth(5),
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(2),
  },
  planTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  planTitle: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(2.05),
  },
  planSubtitle: {
    marginTop: responsiveHeight(0.45),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.25),
  },
  planPrice: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.95),
  },
  planMonth: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.05),
  },
  planDivider: {
    height: 1,
    backgroundColor: '#AEC0DA',
    marginTop: responsiveHeight(2),
  },
  securePlan: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: responsiveWidth(1.1),
    marginTop: responsiveHeight(1.15),
  },
  secureText: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.08),
  },
  sectionTitle: {
    marginTop: responsiveHeight(2.6),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(2.1),
  },
  methodsCard: {
    marginTop: responsiveHeight(1.2),
    borderWidth: 1,
    borderColor: AppColors.appThemeBlue,
    borderRadius: responsiveWidth(1.6),
    overflow: 'hidden',
  },
  methodRow: {
    height: responsiveHeight(7),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveWidth(5),
  },
  methodDivider: {
    borderTopWidth: 1,
    borderTopColor: AppColors.appThemeBlue,
  },
  radioOuter: {
    width: responsiveWidth(5.2),
    height: responsiveWidth(5.2),
    borderRadius: responsiveWidth(2.6),
    borderWidth: 1,
    borderColor: AppColors.appThemeBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderWidth: 1.5,
  },
  radioInner: {
    width: responsiveWidth(2.9),
    height: responsiveWidth(2.9),
    borderRadius: responsiveWidth(1.45),
    backgroundColor: AppColors.appThemeBlue,
  },
  priceCard: {
    marginTop: responsiveHeight(1.2),
    borderWidth: 1,
    borderColor: AppColors.appThemeBlue,
    borderRadius: responsiveWidth(1.7),
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(1.5),
    gap: responsiveHeight(1),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(1.22),
  },
  priceValue: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.25),
  },
  totalDivider: {
    height: 1,
    backgroundColor: AppColors.appThemeBlue,
  },
  totalLabel: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.65),
  },
  totalValue: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(2.1),
  },
  securityBox: {
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(2.2),
    minHeight: responsiveHeight(6.3),
    borderRadius: responsiveWidth(1.5),
    backgroundColor: '#AAC1E3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(4.5),
    gap: responsiveWidth(3),
  },
  securityText: {
    flex: 1,
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.55),
    lineHeight: responsiveFontSize(1.9),
  },
  payButton: {
    height: responsiveHeight(6.2),
    minHeight: responsiveHeight(6.2),
    borderRadius: responsiveWidth(1.7),
  },
  payText: {
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.8),
  },
});

export default PaymentScreen;
