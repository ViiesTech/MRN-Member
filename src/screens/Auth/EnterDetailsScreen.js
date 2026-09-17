import React, { useEffect, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
import { useSignupMutation } from '../../redux/Services/authApi';
import { getApiErrorMessage } from '../../utils/apiError';
import { showToast } from '../../utils/Toast';
import { getFcmToken } from '../../utils/notifications';
import DeviceInfo from 'react-native-device-info';
const EnterDetailsScreen = ({ navigation, setSafeAreaColor }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [about, setAbout] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notificationDevice, setNotificationDevice] = useState(null);
  const [signup, { isLoading }] = useSignupMutation();
  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  useEffect(() => {
    const prepareNotificationDevice = async () => {
      try {
        const [token, deviceId, deviceName] = await Promise.all([
          getFcmToken().catch(() => null),
          DeviceInfo.getUniqueId().catch(() => null),
          DeviceInfo.getDeviceName().catch(() => null),
        ]);

        if (__DEV__) {
          console.log('[Member Signup Device Info]:', {
            token,
            deviceId,
            deviceName,
            platform: Platform.OS,
          });
        }

        // FCM token nahi hai to notificationDevice bilkul nahi bhejna
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
        console.log('Signup notification device error:', error);
        setNotificationDevice(null);
      }
    };

    prepareNotificationDevice();
  }, []);

  const handleSignup = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();
    const trimmedAbout = about.trim();

    if (
      !trimmedName ||
      !normalizedEmail ||
      !trimmedPhone ||
      !trimmedAddress ||
      !trimmedAbout ||
      !password ||
      !confirmPassword
    ) {
      showToast('Missing fields', 'Please fill all signup fields.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast(
        'Passwords do not match',
        'Please enter the same password in both fields.',
        'error',
      );
      return;
    }

    try {
      const payload = {
        email: normalizedEmail,
        password,
        name: trimmedName,
        phone: trimmedPhone,
        address: trimmedAddress,
        about: trimmedAbout,
        ...(notificationDevice?.token && { notificationDevice }),
      };
      const response = await signup(payload).unwrap();

      if (!response?.success) {
        showToast('Signup failed', response?.message || 'Please try again.', 'error');
        return;
      }

      showToast(response?.message || 'Signup successful.');
      navigation.navigate('EmailVerification', {
        nextScreen: 'Main',
        email: normalizedEmail,
        type: 'signup',
        signupPayload: payload,
      });
    } catch (error) {
      showToast('Signup failed', getApiErrorMessage(error), 'error');
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.fixedHeader}>
        <AppHeader
          variant="left"
          showBack
          title=""
          onLeftPress={() => navigation.navigate('Login')}
          containerStyle={styles.backHeader}
          leftButtonStyle={styles.backButton}
          titleWrapStyle={styles.backTitleWrap}
          backIconSize={responsiveFontSize(3)}
        />
      </View>

      <Wrapper
        type="keyboard"
        isScroll
        showPadding={false}
        style={styles.scrollArea}
        contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headingSmall}>Enter Your</Text>
          <GradientText style={styles.headingLarge}>Details</GradientText>
        </View>

        <View style={styles.form}>
          <AppInput
            type="auth"
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
          />
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
            label="Phone Number"
            placeholder="123-456-7890"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <AppInput
            type="auth"
            label="Address"
            iconName="map-pin"
            placeholder="123 Main St"
            value={address}
            onChangeText={setAddress}
          />
          <AppInput
            type="auth"
            label="About"
            placeholder="Tell us a little about yourself"
            value={about}
            onChangeText={setAbout}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            inputContainerStyle={styles.aboutInputContainer}
            inputStyle={styles.aboutInput}
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
          <AppInput
            type="auth"
            label="Confirm Password"
            iconName="lock"
            placeholder="********"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            returnKeyType="done"
            onSubmitEditing={handleSignup}
          />
        </View>

        <View style={styles.footer}>
          <AppButton
            title="Sign Up"
            onPress={handleSignup}
            loading={isLoading}
            disabled={isLoading}
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
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.loginPrompt}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginPromptText}>
              Already have an account?{' '}
              <Text style={styles.loginText}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </Wrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppColors.appBgColor,
  },
  fixedHeader: {
    paddingTop: responsiveHeight(2),
    paddingHorizontal: responsiveHeight(2),
    backgroundColor: AppColors.appBgColor,
  },
  scrollArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    backgroundColor: AppColors.appBgColor,
    paddingHorizontal: responsiveHeight(2),
    paddingBottom: responsiveHeight(2),
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
    marginTop: responsiveHeight(6.5),
  },
  aboutInputContainer: {
    minHeight: responsiveHeight(9),
    alignItems: 'flex-start',
    borderRadius: responsiveWidth(4),
  },
  aboutInput: {
    minHeight: responsiveHeight(8.7),
    paddingTop: responsiveHeight(1.4),
    paddingBottom: responsiveHeight(1.2),
  },
  footer: {
    marginTop: responsiveHeight(3.5),
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
  loginPrompt: {
    alignItems: 'center',
    marginTop: responsiveHeight(1.8),
  },
  loginPromptText: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(1.8),
  },
  loginText: {
    fontFamily: FontFamily.bold,
  },
});

export default EnterDetailsScreen;
