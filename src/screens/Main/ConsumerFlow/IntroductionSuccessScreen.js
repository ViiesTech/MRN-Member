import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SuccessCard, Wrapper } from '../../../component/Index';
import { AppColors } from '../../../utils/AppColors';
import {
  responsiveHeight,
  responsiveWidth,
} from '../../../utils/Responsive_Dimensions';
import { useSafeAreaColor } from '../../../utils/useSafeAreaColor';

const IntroductionSuccessScreen = ({
  navigation,
  route,
  setSafeAreaColor,
}) => {
  const isIntroduction = route?.params?.flowType === 'introduction';

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  return (
    <Wrapper
      backgroundColor={AppColors.appBgColor}
      contentContainerStyle={styles.container}>
      <View style={styles.cardWrap}>
        <SuccessCard
          title={isIntroduction ? 'Introduction' : 'Information Request'}
          subtitle={isIntroduction ? 'Sent Successfully' : 'Submitted Successfully'}
          buttonTitle={isIntroduction ? 'View Introductions' : 'Back To Home'}
          onButtonPress={() => {
            navigation.navigate('BottomStack', {
              screen: isIntroduction ? 'Introductions' : 'Home',
            });
          }}
        />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.appBgColor,
  },
  cardWrap: {
    width: responsiveWidth(88),
    marginBottom: responsiveHeight(2.2),
  },
});

export default IntroductionSuccessScreen;
