import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import {
  AppButton,
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
import { useSigninMutation } from '../../redux/Services/authApi';
import { setCredentials } from '../../redux/slices/authSlice';
import { getApiErrorMessage } from '../../utils/apiError';
import { showToast } from '../../utils/Toast';
import { getFcmToken } from '../../utils/notifications';
import DeviceInfo from 'react-native-device-info';

const LoginScreen = ({ navigation, setSafeAreaColor }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notificationDevice, setNotificationDevice] = useState(null);
  const [signin, { isLoading }] = useSigninMutation();
  const dispatch = useDispatch();

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);
  useEffect(() => {
    const prepareNotificationDevice = async () => {
      try {
        const [token, deviceId, deviceName] = await Promise.all([
          getFcmToken().catch(() => null),
          DeviceInfo.getUniqueId().catch(() => null),
          DeviceInfo.getDeviceName().catch(() => null),
        ]);

        console.log('Device Info:', {
          token,
          deviceId,
          deviceName,
          platform: Platform.OS,
        });

        // Tumhari requirement:
        // FCM token nahi hai to notificationDevice send hi nahi karna.
        if (!token) {
          setNotificationDevice(null);
          return;
        }

        setNotificationDevice({
          token,
          platform: Platform.OS,
          ...(deviceId && { deviceId }),
          ...(deviceName && { deviceName }),
        });
      } catch (error) {
        console.log('Notification device setup error:', error);
        setNotificationDevice(null);
      }
    };

    prepareNotificationDevice();
  }, []);
  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      showToast(
        'Missing fields',
        'Please enter email and password.',
        'error',
      );
      return;
    }

    try {
      const payload = {
        email: normalizedEmail,
        password,
        ...(notificationDevice && { notificationDevice }),
      };

      console.log('Login Payload:', payload);

      const response = await signin(payload).unwrap();

      if (response?.success && response?.isVerified === false) {
        showToast(response?.message || 'Please verify your email.');
        navigation.navigate('EmailVerification', {
          nextScreen: 'Main',
          email: normalizedEmail,
          password,
          type: 'login',
          notificationDevice,
        });
        return;
      }

      if (!response?.success) {
        showToast('Login failed', response?.message || 'Please try again.', 'error');
        return;
      }

      dispatch(setCredentials(response?.data));
      showToast(response?.message || 'Logged in successfully.');
    } catch (error) {
      showToast('Login failed', getApiErrorMessage(error), 'error');
    }
  };

  return (
    <Wrapper type="keyboard" contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <GradientText style={styles.heading}>Login</GradientText>
      </View>

      <View style={styles.form}>
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
        <AppInput
          type="auth"
          label="Password"
          iconName="lock"
          placeholder="********"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.forgotButton}
          onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <AppButton
          title="Login"
          onPress={handleLogin}
          loading={isLoading}
          disabled={isLoading}
          showRightArrow
          variant="gradient"
          gradientColors={[
            AppColors.appThemeBlue,
            AppColors.appThemeDimBlue,
            AppColors.appThemeBlue,
          ]}
          style={[styles.authButton, styles.loginButton]}
          textStyle={styles.authButtonText}
        />

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.signupPrompt}
          onPress={() => navigation.navigate('EnterDetails')}>
          <Text style={styles.signupPromptText}>
            Don&apos;t have an account?{' '}
            <Text style={styles.signupText}>Signup</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.appBgColor,
  },
  header: {
    alignItems: 'center',
    paddingTop: responsiveHeight(6.8),
  },
  heading: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(4.05),
  },
  form: {
    marginTop: responsiveHeight(7.5),
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: responsiveHeight(0.6),
  },
  forgotText: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.8),
  },
  loginButton: {
    marginTop: responsiveHeight(4.5),
  },
  authButton: {
    height: responsiveHeight(4.8),
    minHeight: responsiveHeight(4.2),
    borderRadius: responsiveWidth(1.5),
  },
  authButtonText: {
    fontSize: responsiveFontSize(1.8),
  },
  signupPrompt: {
    alignItems: 'center',
    marginTop: responsiveHeight(1.8),
  },
  signupPromptText: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(1.8),
  },
  signupText: {
    fontFamily: FontFamily.bold,
  },
});

export default LoginScreen;
