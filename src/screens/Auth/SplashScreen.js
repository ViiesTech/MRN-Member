import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
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

const SAFE_AREA_BLUE = '#023A7C';

const SplashScreen = ({ navigation, setSafeAreaColor }) => {
  useSafeAreaColor(setSafeAreaColor, SAFE_AREA_BLUE);

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.92);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(responsiveHeight(1.2));
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(responsiveHeight(2.5));

  useEffect(() => {
    const smoothEase = Easing.out(Easing.cubic);

    logoOpacity.value = withTiming(1, {
      duration: 950,
      easing: smoothEase,
    });
    logoScale.value = withTiming(1, {
      duration: 1050,
      easing: smoothEase,
    });
    subtitleOpacity.value = withDelay(
      520,
      withTiming(1, {
        duration: 700,
        easing: smoothEase,
      }),
    );
    subtitleTranslateY.value = withDelay(
      520,
      withTiming(0, {
        duration: 700,
        easing: smoothEase,
      }),
    );
    buttonOpacity.value = withDelay(
      900,
      withTiming(1, {
        duration: 750,
        easing: smoothEase,
      }),
    );
    buttonTranslateY.value = withDelay(
      900,
      withTiming(0, {
        duration: 750,
        easing: smoothEase,
      }),
    );
  }, [
    buttonOpacity,
    buttonTranslateY,
    logoOpacity,
    logoScale,
    subtitleOpacity,
    subtitleTranslateY,
  ]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  return (
    <Wrapper
      isBgImage
      bgImage={AppImages.bgImage}
      contentContainerStyle={styles.content}
      style={styles.wrapper}>
      <StatusBar backgroundColor={SAFE_AREA_BLUE} barStyle="light-content" />
      <View style={styles.logoWrap}>
        <Animated.View
          style={[
            styles.logoTextWrap,
            logoAnimatedStyle,
          ]}>
          <Text style={styles.logoTitle}>MRN</Text>
        </Animated.View>
        <Animated.Text
          style={[
            styles.logoSubtitle,
            subtitleAnimatedStyle,
          ]}>
          Mature Resource Network, LLC
        </Animated.Text>
      </View>

      <Animated.View
        style={[
          styles.footer,
          buttonAnimatedStyle,
        ]}>
        <AppButton
          title="Let’s start"
          onPress={() => navigation.navigate('OnBoarding')}
          variant="gradientOutline"
          gradientColors={[
            AppColors.appThemeBlue,
            AppColors.appThemeDimBlue,
            AppColors.appThemeBlue,
          ]}
          borderColor={AppColors.btnBorder}
          style={styles.button}
          textStyle={styles.buttonText}
        />
      </Animated.View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  logoWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: responsiveHeight(8),
  },
  logoTextWrap: {
    alignItems: 'center',
  },
  logoTitle: {
    color: AppColors.white,
    fontFamily: FontFamily.extraBold,
    fontSize: responsiveFontSize(9.8),
    lineHeight: responsiveFontSize(10),
  },
  logoSubtitle: {
    marginTop: responsiveHeight(0.15),
    color: AppColors.white,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.85),
  },
  footer: {
    alignItems: 'center',
    paddingBottom: responsiveHeight(7),
  },
  button: {
    width: responsiveWidth(36),
    height: responsiveHeight(4.6),
    borderRadius: responsiveWidth(1.7),
  },
  buttonText: {
    fontSize: responsiveFontSize(1.65),
  },
});

export default SplashScreen;
