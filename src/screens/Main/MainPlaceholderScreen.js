import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Wrapper } from '../../component/Index';
import { AppColors } from '../../utils/AppColors';
import { FontFamily } from '../../utils/Fonts';
import { responsiveFontSize } from '../../utils/Responsive_Dimensions';
import { useSafeAreaColor } from '../../utils/useSafeAreaColor';

const MainPlaceholderScreen = ({ setSafeAreaColor, title }) => {
  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  return (
    <Wrapper backgroundColor={AppColors.appBgColor}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(2.4),
  },
});

export default MainPlaceholderScreen;
