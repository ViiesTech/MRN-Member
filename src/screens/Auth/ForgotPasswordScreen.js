import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  AppButton,
  AppHeader,
  AppInput,
  GradientText,
  Wrapper,
} from '../../component/Index';
import { AppColors } from '../../utils/AppColors';
import { FontFamily } from '../../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../utils/Responsive_Dimensions';
import { useSafeAreaColor } from '../../utils/useSafeAreaColor';
import { useForgotPasswordMutation } from '../../redux/Services/authApi';
import { getApiErrorMessage } from '../../utils/apiError';
import { showToast } from '../../utils/Toast';

const ForgotPasswordScreen = ({ navigation, setSafeAreaColor }) => {
  const [email, setEmail] = useState('');
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  const handleSendCode = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      showToast('Email missing', 'Please enter your email address.', 'error');
      return;
    }

    try {
      const response = await forgotPassword({
        email: normalizedEmail,
      }).unwrap();

      if (!response?.success) {
        showToast('Unable to send OTP', response?.message || 'Please try again.', 'error');
        return;
      }

      showToast('OTP sent successfully', 'Please check your email.');
      navigation.navigate('EmailVerification', {
        nextScreen: 'ResetPassword',
        email: normalizedEmail,
        type: 'forgotPassword',
      });
    } catch (error) {
      showToast('Unable to send OTP', getApiErrorMessage(error), 'error');
    }
  };

  return (
    <Wrapper type="keyboard" contentContainerStyle={styles.container}>
      <AppHeader
        variant="left"
        showBack
        title=""
        onLeftPress={() => navigation.goBack()}
        containerStyle={styles.backHeader}
        leftButtonStyle={styles.backButton}
        titleWrapStyle={styles.backTitleWrap}
        backIconSize={responsiveFontSize(3)}
      />
      <View style={styles.header}>
        <Text style={styles.headingSmall}>Forgot</Text>
        <GradientText style={styles.headingLarge}>Password</GradientText>
      </View>

      <View style={styles.form}>
        <Text style={styles.instruction}>
          Enter the email linked to your account and we will send you a verification code.
        </Text>
        <AppInput
          type="auth"
          label="Email"
          iconName="mail"
          placeholder="your@email.com"
          value={email}
          onChangeText={value => setEmail(value.toLowerCase())}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <AppButton
          title="Send Code"
          onPress={handleSendCode}
          loading={isLoading}
          disabled={isLoading}
          showRightArrow
          variant="gradient"
          gradientColors={[
            AppColors.appThemeBlue,
            AppColors.appThemeDimBlue,
            AppColors.appThemeBlue,
          ]}
          style={[styles.authButton, styles.sendButton]}
          textStyle={styles.authButtonText}
        />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.appBgColor,
  },
  backHeader: {
    minHeight: responsiveHeight(3.2),
    paddingHorizontal: 0,
  },
  backButton: {
    width: responsiveWidth(6.4),
    height: responsiveWidth(6.4),
  },
  backTitleWrap: {
    paddingHorizontal: 0,
  },
  header: {
    alignItems: 'center',
    paddingTop: responsiveHeight(2.6),
  },
  headingSmall: {
    color: AppColors.black,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(2),
  },
  headingLarge: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(4.05),
    lineHeight: responsiveFontSize(4.3),
  },
  form: {
    marginTop: responsiveHeight(8),
  },
  instruction: {
    color: AppColors.bodyText,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.8),
    lineHeight: responsiveFontSize(2.35),
    marginBottom: responsiveHeight(3),
    textAlign: 'center',
  },
  sendButton: {
    marginTop: responsiveHeight(4),
  },
  authButton: {
    height: responsiveHeight(4.8),
    minHeight: responsiveHeight(4.2),
    borderRadius: responsiveWidth(1.5),
  },
  authButtonText: {
    fontSize: responsiveFontSize(1.8),
  },
});

export default ForgotPasswordScreen;
