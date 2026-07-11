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
import { useResetPasswordMutation } from '../../redux/Services/authApi';
import { getApiErrorMessage } from '../../utils/apiError';
import { showToast } from '../../utils/Toast';

const ResetPasswordScreen = ({ navigation, route, setSafeAreaColor }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const email = route?.params?.email?.trim()?.toLowerCase();

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  const handleResetPassword = async () => {
    if (!email) {
      showToast('Email missing', 'Please start forgot password again.', 'error');
      return;
    }

    if (!password || !confirmPassword) {
      showToast('Missing fields', 'Please enter and confirm your password.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Password mismatch', 'Both passwords must be the same.', 'error');
      return;
    }

    try {
      const response = await resetPassword({
        email,
        password,
      }).unwrap();

      if (!response?.success) {
        showToast(
          'Unable to reset password',
          response?.message || 'Please try again.',
          'error',
        );
        return;
      }

      showToast('Password reset successfully', 'Please login to continue.');
      navigation.navigate('Login');
    } catch (error) {
      showToast('Unable to reset password', getApiErrorMessage(error), 'error');
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
        <Text style={styles.headingSmall}>Reset</Text>
        <GradientText style={styles.headingLarge}>Password</GradientText>
      </View>

      <View style={styles.form}>
        <AppInput
          type="auth"
          label="New Password"
          iconName="lock"
          placeholder="********"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <AppInput
          type="auth"
          label="Confirm Password"
          iconName="lock"
          placeholder="********"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <AppButton
          title="Reset Password"
          onPress={handleResetPassword}
          loading={isLoading}
          disabled={isLoading}
          showRightArrow
          variant="gradient"
          gradientColors={[
            AppColors.appThemeBlue,
            AppColors.appThemeDimBlue,
            AppColors.appThemeBlue,
          ]}
          style={[styles.authButton, styles.resetButton]}
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
  resetButton: {
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

export default ResetPasswordScreen;
