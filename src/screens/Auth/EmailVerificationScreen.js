import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import {
  AppButton,
  AppHeader,
  GradientText,
  OtpCodeField,
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
import {
  useForgotPasswordMutation,
  useSigninMutation,
  useSignupMutation,
  useVerifyResetOtpMutation,
  useVerifyOtpMutation,
} from '../../redux/Services/authApi';
import { setCredentials } from '../../redux/slices/authSlice';
import { getApiErrorMessage } from '../../utils/apiError';
import { showToast } from '../../utils/Toast';

const RESEND_SECONDS = 159;

const EmailVerificationScreen = ({ navigation, route, setSafeAreaColor }) => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [verifyResetOtp, { isLoading: isVerifyingResetOtp }] =
    useVerifyResetOtpMutation();
  const [signin, { isLoading: isResending }] = useSigninMutation();
  const [signup, { isLoading: isResendingSignup }] = useSignupMutation();
  const [forgotPassword, { isLoading: isResendingForgotPassword }] =
    useForgotPasswordMutation();
  const dispatch = useDispatch();

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);
  const nextScreen = route?.params?.nextScreen ?? 'Login';
  const email = route?.params?.email;
  const password = route?.params?.password;
  const type = route?.params?.type;
  const signupPayload = route?.params?.signupPayload;
  const isResendLoading =
    isResending || isResendingSignup || isResendingForgotPassword;
  const isVerifyLoading = isLoading || isVerifyingResetOtp;
  const isApiLoading = isVerifyLoading || isResendLoading;
  const formattedTimer = useMemo(() => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }, [timer]);

  useEffect(() => {
    if (timer <= 0) {
      return undefined;
    }

    const interval = setInterval(() => {
      setTimer(prev => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleVerifyOtp = async () => {
    if (!email) {
      showToast('Email missing', 'Please go back and try again.', 'error');
      return;
    }

    if (otp.length < 4) {
      showToast('OTP missing', 'Please enter the 4 digit code.', 'error');
      return;
    }

    try {
      const verifyMutation = type === 'forgotPassword' ? verifyResetOtp : verifyOtp;
      const response = await verifyMutation({
        email,
        otp,
      }).unwrap();

      if (!response?.success) {
        showToast(
          'Verification failed',
          response?.message || 'Please try again.',
          'error',
        );
        return;
      }

      showToast(response?.message || 'Email verified successfully.');
      if (nextScreen === 'Main') {
        dispatch(setCredentials(response?.data));
        return;
      }

      navigation.navigate(nextScreen, { email });
    } catch (error) {
      showToast('Verification failed', getApiErrorMessage(error), 'error');
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      showToast('Email missing', 'Please go back and try again.', 'error');
      return;
    }

    try {
      let response;

      if (type === 'login') {
        if (!password) {
          showToast(
            'Password missing',
            'Please login again to resend OTP.',
            'error',
          );
          return;
        }

        response = await signin({
          email,
          password,
        }).unwrap();
      } else if (type === 'signup') {
        if (!signupPayload) {
          showToast('Unable to resend OTP', 'Please signup again.', 'error');
          return;
        }

        response = await signup(signupPayload).unwrap();
      } else if (type === 'forgotPassword') {
        response = await forgotPassword({ email }).unwrap();
      } else {
        showToast(
          'Unable to resend OTP',
          'Please go back and try again.',
          'error',
        );
        return;
      }

      if (response?.success) {
        showToast('OTP resent successfully', 'Please check your email.');
        setTimer(RESEND_SECONDS);
        return;
      }

      showToast('Unable to resend OTP', 'Please try again.', 'error');
    } catch (_error) {
      showToast('Unable to resend OTP', 'Please try again.', 'error');
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
        <Text style={styles.headingSmall}>Email</Text>
        <GradientText style={styles.headingLarge}>Verification</GradientText>
      </View>

      <View style={styles.content}>
        <Text style={styles.instruction}>
          Please enter the OTP code that we just sent you
        </Text>

        <OtpCodeField value={otp} onChangeText={setOtp} />

        {timer > 0 ? (
          <Text style={styles.resendText}>Resend on {formattedTimer}</Text>
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={isApiLoading}
            onPress={handleResendOtp}
            style={styles.resendButton}>
            <Text style={[styles.resendText, styles.resendActiveText]}>
              {isResendLoading ? 'Resending...' : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        <AppButton
          title="Submit Code"
          onPress={handleVerifyOtp}
          loading={isVerifyLoading}
          disabled={isApiLoading || otp.length < 4}
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
  content: {
    marginTop: responsiveHeight(8.5),
  },
  instruction: {
    color: AppColors.bodyText,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.8),
    textAlign: 'center',
  },
  resendText: {
    alignSelf: 'flex-end',
    marginTop: responsiveHeight(1.3),
    color: AppColors.bodyText,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.8),
  },
  resendButton: {
    alignSelf: 'flex-end',
  },
  resendActiveText: {
    color: AppColors.appThemeBlue,
    fontFamily: FontFamily.bold,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: responsiveHeight(3.4),
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

export default EmailVerificationScreen;
