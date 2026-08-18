import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  AppButton,
  AppHeader,
  AppInput,
  Wrapper,
} from '../../component/Index';
import { AppColors } from '../../utils/AppColors';
import { FontFamily } from '../../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../utils/Responsive_Dimensions';
import { showToast } from '../../utils/Toast';
import { useSafeAreaColor } from '../../utils/useSafeAreaColor';
import { useChangePasswordMutation } from '../../redux/Services/authApi';
import { getApiErrorMessage } from '../../utils/apiError';

const ChangePasswordScreen = ({ navigation, setSafeAreaColor }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast(
        'Missing fields',
        'Please complete all password fields.',
        'error',
      );
      return;
    }

    if (newPassword.length < 8) {
      showToast(
        'Password is too short',
        'New password must contain at least 8 characters.',
        'error',
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast(
        'Password mismatch',
        'New password and confirmation must match.',
        'error',
      );
      return;
    }

    try {
      const response = await changePassword({
        currentPassword,
        newPassword,
      }).unwrap();

      if (!response?.success) {
        showToast(
          'Unable to change password',
          response?.message || 'Please try again.',
          'error',
        );
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast(response?.message || 'Password changed successfully.');
      navigation.goBack();
    } catch (error) {
      showToast(
        'Unable to change password',
        getApiErrorMessage(error),
        'error',
      );
    }
  };

  return (
    <Wrapper
      type="keyboard"
      isScroll
      backgroundColor={AppColors.appBgColor}
      contentContainerStyle={styles.container}>
      <AppHeader
        variant="left"
        showBack
        title="Change Password"
        onLeftPress={() => navigation.goBack()}
        containerStyle={styles.header}
        leftButtonStyle={styles.headerBackButton}
        titleWrapStyle={styles.headerTitleWrap}
        titleStyle={styles.headerTitle}
        backIconSize={responsiveFontSize(2.5)}
      />

      <View style={styles.form}>
        <AppInput
          type="form"
          label="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Enter current password"
          secureTextEntry
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.input}
        />
        <AppInput
          type="form"
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
          secureTextEntry
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.input}
        />
        <AppInput
          type="form"
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
          secureTextEntry
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.input}
        />
      </View>

      <AppButton
        title="Update Password"
        onPress={handleChangePassword}
        loading={isLoading}
        disabled={isLoading}
        variant="gradient"
        style={styles.submitButton}
        textStyle={styles.buttonText}
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
    color: AppColors.appThemeBlue,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(2),
  },
  form: {
    marginTop: responsiveHeight(3.5),
  },
  inputContainer: {
    minHeight: responsiveHeight(5.6),
    borderColor: '#A8B7C8',
    backgroundColor: 'transparent',
  },
  input: {
    color: AppColors.themeTxt,
    fontSize: responsiveFontSize(1.6),
  },
  submitButton: {
    height: responsiveHeight(5.7),
    minHeight: responsiveHeight(5.7),
    marginTop: responsiveHeight(3),
    borderRadius: responsiveWidth(1.6),
  },
  buttonText: {
    fontSize: responsiveFontSize(1.65),
  },
});

export default ChangePasswordScreen;
