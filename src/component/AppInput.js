import React, { useContext, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@react-native-vector-icons/feather';
import { AppColors } from '../utils/AppColors';
import { FontFamily } from '../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../utils/Responsive_Dimensions';
import { KeyboardScrollContext } from './Wrapper';

const AppInput = ({
  label,
  error,
  type = 'default',
  iconName,
  iconColor,
  iconSize,
  leftIcon,
  rightIcon,
  containerStyle,
  inputContainerStyle,
  inputStyle,
  placeholderTextColor = '#8A98A8',
  editable = true,
  secureTextEntry = false,
  onFocus,
  ...rest
}) => {
  const inputRootRef = useRef(null);
  const { scrollToInput } = useContext(KeyboardScrollContext);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isAuth = type === 'auth';
  const isForm = type === 'form';
  const isSearch = type === 'search';
  const isPassword = secureTextEntry;
  const finalIconColor = iconColor ?? (isSearch ? '#777777' : '#8A98A8');
  const finalIconSize =
    iconSize ?? responsiveFontSize(isSearch ? 2.2 : 1.9);
  const finalLeftIcon =
    leftIcon ??
    (iconName ? (
      <Feather name={iconName} color={finalIconColor} size={finalIconSize} />
    ) : null);
  const finalRightIcon =
    rightIcon ??
    (isPassword ? (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsPasswordVisible(prev => !prev)}>
        <Feather
          name={isPasswordVisible ? 'eye' : 'eye-off'}
          color={finalIconColor}
          size={finalIconSize}
        />
      </TouchableOpacity>
    ) : null);

  return (
    <View
      ref={inputRootRef}
      style={[
        styles.container,
        isAuth && styles.authContainer,
        isForm && styles.formContainer,
        containerStyle,
      ]}>
      {!!label && (
        <Text style={[styles.label, isForm && styles.formLabel]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          isAuth && styles.authInputContainer,
          isForm && styles.formInputContainer,
          isSearch && styles.searchInputContainer,
          !editable && styles.disabled,
          error && styles.errorBorder,
          inputContainerStyle,
        ]}>
        {finalLeftIcon}
        <TextInput
          editable={editable}
          onFocus={event => {
            onFocus?.(event);
            scrollToInput(inputRootRef);
          }}
          placeholderTextColor={placeholderTextColor}
          secureTextEntry={isPassword && !isPasswordVisible}
          style={[
            styles.input,
            isAuth && styles.authInput,
            isForm && styles.formInput,
            isSearch && styles.searchInput,
            inputStyle,
          ]}
          {...rest}
        />
        {finalRightIcon}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  authContainer: {
    marginBottom: responsiveHeight(1.2),
  },
  formContainer: {
    marginBottom: responsiveHeight(1.75),
  },
  label: {
    marginBottom: responsiveHeight(0.8),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(1.8),
  },
  inputContainer: {
    minHeight: responsiveHeight(5.6),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9E2EC',
    borderRadius: responsiveWidth(2),
    backgroundColor: AppColors.white,
    paddingHorizontal: responsiveWidth(3.3),
    gap: responsiveWidth(1.8),
  },
  authInputContainer: {
    minHeight: responsiveHeight(5.45),
    borderColor: '#A9B7CB',
    borderRadius: responsiveHeight(2.7),
    backgroundColor: 'transparent',
    paddingHorizontal: responsiveWidth(3.7),
  },
  formInputContainer: {
    minHeight: responsiveHeight(5.55),
    borderColor: '#A9B7CB',
    borderRadius: responsiveHeight(2.65),
    backgroundColor: 'transparent',
    paddingHorizontal: responsiveWidth(4.1),
  },
  searchInputContainer: {
    height: responsiveHeight(6.2),
    borderColor: AppColors.themeTxt2,
    borderRadius: responsiveWidth(1.8),
    backgroundColor: 'transparent',
    paddingHorizontal: responsiveWidth(4.8),
  },
  input: {
    flex: 1,
    color: AppColors.black,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.6),
    paddingVertical: 0,
  },
  authInput: {
    color: AppColors.themeTxt,
    fontSize: responsiveFontSize(1.55),
  },
  formInput: {
    color: AppColors.themeTxt,
    fontSize: responsiveFontSize(1.65),
  },
  formLabel: {
    color: AppColors.bodyText,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.8),
  },
  searchInput: {
    color: AppColors.themeTxt,
    fontSize: responsiveFontSize(1.9),
  },
  disabled: {
    backgroundColor: '#F4F7FA',
  },
  errorBorder: {
    borderColor: '#D92D20',
  },
  errorText: {
    marginTop: responsiveHeight(0.6),
    color: '#D92D20',
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.3),
  },
});

export default AppInput;
