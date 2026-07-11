import React, { useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { AppImages } from '../../assets/Images/Index';
import { AppButton, Wrapper } from '../../component/Index';
import { AppColors } from '../../utils/AppColors';
import { FontFamily } from '../../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../utils/Responsive_Dimensions';
import { useSafeAreaColor } from '../../utils/useSafeAreaColor';

const slides = [
  {
    key: 'connect',
    image: AppImages.onBoarding1,
    title: 'Connect Trusted Professionals',
    description:
      'Build meaningful connections with service\nproviders who support families, caregivers,\nand the mature community.',
  },
  {
    key: 'referrals',
    image: AppImages.onBoarding2,
    title: 'Send Referrals in Seconds',
    description:
      'Capture client needs and instantly connect\nthem with the right trusted provider in\nunder a minute.',
  },
  {
    key: 'growth',
    image: AppImages.onBoarding3,
    title: 'Track Growth & Opportunities',
    description:
      'Monitor introductions, appointments, and\nsuccessful outcomes with simple\nperformance insights.',
  },
];

const SAFE_AREA_BLUE = '#023A7C';

const OnBoardingScreen = ({ navigation, setSafeAreaColor }) => {
  const sliderRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useSafeAreaColor(setSafeAreaColor, SAFE_AREA_BLUE);

  const handleNextPress = () => {
    const nextIndex = activeIndex + 1;

    if (nextIndex >= slides.length) {
      navigation.navigate('Login');
      return;
    }

    sliderRef.current?.goToSlide(nextIndex);
    setActiveIndex(nextIndex);
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.imageSection}>
          <Image
            source={item.image}
            resizeMode="contain"
            style={styles.phoneImage}
          />
        </View>

        <View style={styles.titleBand}>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.title}>
            {item.title}
          </Text>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <Wrapper
      isBgImage
      bgImage={AppImages.bgImage}
      resizeMode="cover"
      showPadding={false}>
      <View style={styles.container}>
        <AppIntroSlider
          ref={sliderRef}
          data={slides}
          renderItem={renderItem}
          renderPagination={() => null}
          onSlideChange={index => setActiveIndex(index)}
          showDoneButton={false}
          showNextButton={false}
        />
        <View style={styles.actions}>
          <AppButton
            bordered
            title="Next"
            onPress={handleNextPress}
            showRightArrow
            variant="gradient"
            gradientColors={[
              AppColors.appThemeBlue,
              AppColors.appThemeDimBlue,
              AppColors.appThemeBlue,
            ]}
            style={styles.authButton}
            textStyle={styles.authButtonText}
          />
        </View>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    // flex: 1,
  },
  imageSection: {
    height: responsiveHeight(59),
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    paddingHorizontal: responsiveHeight(2),
  },
  phoneImage: {
    height: '100%',
    width: '100%',
    // width: responsiveWidth(88),
    // height: responsiveHeight(60.5),
    // marginBottom: -responsiveHeight(1.2),
  },
  titleBand: {
    minHeight: responsiveHeight(5.1),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: responsiveHeight(2.1),
    backgroundColor: AppColors.appBgColor,
    paddingHorizontal: responsiveWidth(4),
  },
  title: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(2.15),
  },
  descriptionSection: {
    // flex: 1,
    alignItems: 'center',
    paddingTop: responsiveHeight(3.3),
    paddingHorizontal: responsiveWidth(7),
  },
  description: {
    color: AppColors.white,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.8),
    lineHeight: responsiveFontSize(2.4),
    textAlign: 'center',
  },
  actions: {
    marginBottom: responsiveHeight(5.5),
    paddingHorizontal: responsiveHeight(2),
    // paddingBottom: responsiveHeight(4.5),
  },
  authButton: {
    alignSelf: 'center',
    height: responsiveHeight(4.8),
    minHeight: responsiveHeight(4.2),
    borderRadius: responsiveWidth(1.5),
  },
  authButtonText: {
    fontSize: responsiveFontSize(1.8),
  },
});

export default OnBoardingScreen;
