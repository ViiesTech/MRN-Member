import React from 'react';
import { StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import Feather from '@react-native-vector-icons/feather';
import { AppColors } from '../utils/AppColors';
import {
  responsiveFontSize,
  responsiveWidth,
} from '../utils/Responsive_Dimensions';

const UserAvatar = ({ uri, size = responsiveWidth(13), style }) => {
  const avatarStyle = [
    {
      width: size,
      height: size,
      borderRadius: size / 2,
    },
    style,
  ];

  if (uri) {
    return (
      <FastImage
        source={{ uri }}
        resizeMode={FastImage.resizeMode.cover}
        style={avatarStyle}
      />
    );
  }

  return (
    <View style={[styles.placeholder, avatarStyle]}>
      <Feather
        name="user"
        color={AppColors.appThemeBlue}
        size={responsiveFontSize(3)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B9D2F7',
  },
});

export default UserAvatar;
