import React from 'react';
import { Text } from 'react-native';
import { AppColors } from '../utils/AppColors';
import { FontFamily } from '../utils/Fonts';
import { responsiveFontSize } from '../utils/Responsive_Dimensions';

const AppText = ({
  children,
  color = AppColors.themeTxt,
  family = FontFamily.regular,
  size = 1.6,
  style,
  ...rest
}) => {
  return (
    <Text
      style={[
        {
          color,
          fontFamily: family,
          fontSize: responsiveFontSize(size),
        },
        style,
      ]}
      {...rest}>
      {children}
    </Text>
  );
};

export default AppText;
