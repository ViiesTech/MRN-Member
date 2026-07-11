import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

const EnterDetailsScreen = ({ navigation, setSafeAreaColor }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [signup, { isLoading }] = useSignupMutation();

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  const handleSignup = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const payload = {
      email: normalizedEmail,
      password,
      role: 'member',
      name: name.trim(),
      phone: phone.trim(),
    };

    if (!payload.name || !payload.email || !payload.phone || !payload.password) {
      showToast('Missing fields', 'Please fill all signup fields.', 'error');
      return;
    }

    try {
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
    <Wrapper type="keyboard" isScroll contentContainerStyle={styles.container}>
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
          label="Password"
          iconName="lock"
          placeholder="********"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
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
            Already have an account? <Text style={styles.loginText}>Login</Text>
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
