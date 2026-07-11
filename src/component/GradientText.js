import React from 'react';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet, Text } from 'react-native';
import { AppColors } from '../utils/AppColors';

const GradientText = ({
  children,
  colors = [
    AppColors.appThemeBlue,
    AppColors.appThemeDimBlue,
    AppColors.appThemeBlue,
  ],
  start = { x: 0, y: 0.5 },
  end = { x: 1, y: 0.5 },
  style,
}) => {
  return (
    <MaskedView maskElement={<Text style={style}>{children}</Text>}>
      <LinearGradient colors={colors} start={start} end={end}>
        <Text style={[style, styles.hiddenText]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
};

const styles = StyleSheet.create({
  hiddenText: {
    opacity: 0,
  },
});

export default GradientText;
