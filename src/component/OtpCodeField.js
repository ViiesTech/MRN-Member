import React, { useState } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import { AppColors } from '../utils/AppColors';
import { FontFamily } from '../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../utils/Responsive_Dimensions';

const CELL_COUNT = 4;
const autoComplete = Platform.select({
  android: 'sms-otp',
  default: 'one-time-code',
});

const OtpCodeField = ({ value, onChangeText }) => {
  const [localValue, setLocalValue] = useState('');
  const codeValue = value ?? localValue;
  const setCodeValue = onChangeText ?? setLocalValue;
  const ref = useBlurOnFulfill({ value: codeValue, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: codeValue,
    setValue: setCodeValue,
  });

  return (
    <CodeField
      ref={ref}
      {...props}
      value={codeValue}
      onChangeText={setCodeValue}
      cellCount={CELL_COUNT}
      rootStyle={styles.root}
      keyboardType="number-pad"
      textContentType="oneTimeCode"
      autoComplete={autoComplete}
      renderCell={({ index, symbol, isFocused }) => (
        <Text
          key={index}
          style={[styles.cell, isFocused && styles.focusCell]}
          onLayout={getCellOnLayoutHandler(index)}>
          {symbol || (isFocused && <Cursor />)}
        </Text>
      )}
    />
  );
};

const styles = StyleSheet.create({
  root: {
    marginTop: responsiveHeight(4.5),
  },
  cell: {
    width: responsiveWidth(18.4),
    height: responsiveHeight(5),
    borderWidth: 1,
    borderColor: '#8FA2C1',
    borderRadius: responsiveWidth(1.3),
    color: AppColors.appThemeDimBlue,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(2.15),
    lineHeight: responsiveHeight(4.9),
    textAlign: 'center',
  },
  focusCell: {
    borderColor: AppColors.appThemeBlue,
  },
});

export default OtpCodeField;
