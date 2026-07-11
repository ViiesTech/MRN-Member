import React from 'react';
import { StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import Feather from '@react-native-vector-icons/feather';
import LinearGradient from 'react-native-linear-gradient';
import {
  AppButton,
  AppText,
  GradientText,
  Wrapper,
} from '../../component/Index';
import { AppImages } from '../../assets/Images/Index';
import { AppColors } from '../../utils/AppColors';
import { FontFamily } from '../../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../utils/Responsive_Dimensions';
import { useSafeAreaColor } from '../../utils/useSafeAreaColor';

const statusConfig = {
  review: {
    image: true,
    eyebrow: 'Your Profile is',
    title: 'Under Review',
    description:
      'Your profile has been submitted & will be reviewed by our team. You will be notified if any extra information is needed.',
    buttonTitle: 'Back To Home',
  },
  approved: {
    card: true,
    eyebrow: 'Your Profile is',
    title: 'Approved',
    description: 'Your profile is approved. Complete payment to unlock all features.',
    buttonTitle: 'Back To Home',
    nextRoute: 'BottomStack',
  },
  rejected: {
    card: true,
    eyebrow: 'Your Profile is',
    title: 'Rejected',
    description:
      'Your membership application was not approved. Please contact support for more details.',
    buttonTitle: 'Go To Home Page',
    nextRoute: 'BottomStack',
  },
  paymentSuccess: {
    card: true,
    eyebrow: 'Payment',
    title: 'Successful',
    description: 'All Features are now unlocked.',
    buttonTitle: 'Go To Home Page',
    nextRoute: 'BottomStack',
  },
};

const MembershipStatusScreen = ({ navigation, setSafeAreaColor, type = 'review' }) => {
  const status = statusConfig[type];

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  if (status.card) {
    return (
      <Wrapper
        isScroll
        backgroundColor={AppColors.appBgColor}
        contentContainerStyle={styles.cardContainer}>
        <LinearGradient
          colors={AppColors.appGradient}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.statusCard}>
          <View style={styles.statusContent}>
            <View style={styles.checkCircle}>
              <Feather
                name="check"
                color={AppColors.appThemeDimBlue}
                size={responsiveFontSize(5.2)}
              />
            </View>
            <AppText style={styles.cardEyebrow}>{status.eyebrow}</AppText>
            <AppText style={styles.cardTitle}>{status.title}</AppText>
            <AppText style={styles.cardDescription}>{status.description}</AppText>
          </View>
          <AppButton
            title={status.buttonTitle}
            showRightArrow
            rightIconColor={AppColors.appThemeBlue}
            onPress={() => navigation.navigate(status.nextRoute)}
            style={styles.cardButton}
            textStyle={styles.cardButtonText}
          />
        </LinearGradient>
      </Wrapper>
    );
  }

  return (
    <Wrapper
      isScroll
      backgroundColor={AppColors.appBgColor}
      contentContainerStyle={styles.reviewContainer}>
      <FastImage
        source={AppImages.reviewImg}
        resizeMode={FastImage.resizeMode.contain}
        style={styles.reviewImage}
      />
      <AppText style={styles.reviewEyebrow}>{status.eyebrow}</AppText>
      <GradientText style={styles.reviewTitle}>{status.title}</GradientText>
      <AppText style={styles.reviewDescription}>{status.description}</AppText>
      <AppButton
        title={status.buttonTitle}
        showRightArrow
        variant="gradient"
        gradientColors={AppColors.appGradient}
        onPress={() =>
          navigation.navigate('BottomStack', { screen: 'Home' })
        }
        style={styles.reviewButton}
        textStyle={styles.reviewButtonText}
      />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  reviewContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.appBgColor,
    paddingHorizontal: responsiveWidth(10),
    paddingVertical: responsiveHeight(5),
  },
  reviewImage: {
    width: responsiveWidth(78),
    height: responsiveHeight(31),
    marginBottom: responsiveHeight(2.8),
  },
  reviewEyebrow: {
    color: AppColors.black,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(2.15),
    lineHeight: responsiveFontSize(2.7),
    textAlign: 'center',
  },
  reviewTitle: {
    marginTop: responsiveHeight(0.35),
    color: '#2E66CF',
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(4.45),
    lineHeight: responsiveFontSize(5.1),
    textAlign: 'center',
  },
  reviewDescription: {
    marginTop: responsiveHeight(2),
    color: AppColors.bodyText,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.55),
    lineHeight: responsiveFontSize(2.05),
    textAlign: 'center',
  },
  reviewButton: {
    width: '100%',
    marginTop: responsiveHeight(3),
    height: responsiveHeight(5.8),
    minHeight: responsiveHeight(5.8),
    borderRadius: responsiveWidth(1.7),
  },
  reviewButtonText: {
    fontSize: responsiveFontSize(1.8),
  },
  cardContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: AppColors.appBgColor,
    paddingVertical: responsiveHeight(5),
  },
  statusCard: {
    width: '100%',
    minHeight: responsiveHeight(51),
    borderRadius: responsiveWidth(2),
    alignItems: 'center',
    paddingTop: responsiveHeight(4.2),
    paddingBottom: responsiveHeight(3.6),
    overflow: 'hidden',
  },
  statusContent: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(7),
  },
  checkCircle: {
    width: responsiveWidth(23),
    height: responsiveWidth(23),
    borderRadius: responsiveWidth(11.5),
    backgroundColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEyebrow: {
    marginTop: responsiveHeight(2.7),
    color: AppColors.white,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(2.35),
    textAlign: 'center',
  },
  cardTitle: {
    marginTop: responsiveHeight(0.25),
    color: AppColors.white,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(4.55),
    lineHeight: responsiveFontSize(5.1),
    textAlign: 'center',
  },
  cardDescription: {
    marginTop: responsiveHeight(1.8),
    color: AppColors.white,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.6),
    lineHeight: responsiveFontSize(2.08),
    textAlign: 'center',
  },
  cardButton: {
    width: '85%',
    alignSelf: 'center',
    marginTop: responsiveHeight(2.7),
    height: responsiveHeight(5.8),
    minHeight: responsiveHeight(5.8),
    borderRadius: responsiveWidth(1.7),
    backgroundColor: AppColors.white,
  },
  cardButtonText: {
    color: AppColors.appThemeBlue,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.65),
  },
});

export default MembershipStatusScreen;
