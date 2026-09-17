import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Feather } from '@react-native-vector-icons/feather';
import { launchImageLibrary } from 'react-native-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppButton,
  AppHeader,
  AppInput,
  UserAvatar,
  Wrapper,
} from '../../../component/Index';
import { AppColors } from '../../../utils/AppColors';
import { FontFamily } from '../../../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils/Responsive_Dimensions';
import { showToast } from '../../../utils/Toast';
import { useSafeAreaColor } from '../../../utils/useSafeAreaColor';
import { useUpdateProfileMutation } from '../../../redux/Services/authApi';
import { setUser } from '../../../redux/slices/authSlice';
import { getApiErrorMessage } from '../../../utils/apiError';

const EditProfileScreen = ({ navigation, setSafeAreaColor }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [about, setAbout] = useState(user?.about ?? '');
  const [profileImage, setProfileImage] = useState(user?.profile ?? null);
  const [profileAsset, setProfileAsset] = useState(null);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  const handleSelectPhoto = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.85,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        showToast(
          'Unable to select photo',
          result.errorMessage || 'Please try another photo.',
          'error',
        );
        return;
      }

      const selectedAsset = result.assets?.[0];
      const selectedImage = selectedAsset?.uri;

      if (selectedImage) {
        setProfileImage(selectedImage);
        setProfileAsset(selectedAsset);
      }
    } catch {
      showToast(
        'Unable to select photo',
        'Please try again in a moment.',
        'error',
      );
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      showToast(
        'Missing fields',
        'Please enter your name and phone number.',
        'error',
      );
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('phone', phone.trim());
    formData.append('about', about.trim());

    if (profileAsset?.uri) {
      formData.append('profile', {
        uri: profileAsset.uri,
        type: profileAsset.type || 'image/jpeg',
        name: profileAsset.fileName || `profile-${Date.now()}.jpg`,
      });
    }

    try {
      const response = await updateProfile(formData).unwrap();
      console.log('Update Profile Response:', JSON.stringify(response, null, 2));

      if (!response?.success) {
        showToast(
          'Unable to update profile',
          response?.message || 'Please try again.',
          'error',
        );
        return;
      }

      const responseUser = response?.data?.user ?? response?.data;

      if (responseUser && typeof responseUser === 'object') {
        dispatch(setUser({ ...user, ...responseUser }));
      }

      showToast(response?.message || 'Profile updated successfully.');
      navigation.goBack();
    } catch (error) {
      console.log('Update Profile Error:', error);
      showToast(
        'Unable to update profile',
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
        title="Edit Profile"
        onLeftPress={() => navigation.goBack()}
        containerStyle={styles.header}
        leftButtonStyle={styles.headerBackButton}
        titleWrapStyle={styles.headerTitleWrap}
        titleStyle={styles.headerTitle}
        backIconSize={responsiveFontSize(2.5)}
      />

      <View style={styles.avatarSection}>
        <UserAvatar uri={profileImage} style={styles.avatar} />
        <TouchableOpacity
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
          onPress={handleSelectPhoto}
          style={styles.editPhotoButton}>
          <Feather
            name="camera"
            color={AppColors.white}
            size={responsiveFontSize(1.8)}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <AppInput
          type="form"
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          autoCapitalize="words"
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.input}
        />
        <AppInput
          type="form"
          label="Email"
          value={user?.email ?? ''}
          placeholder="Email"
          editable={false}
          inputContainerStyle={[
            styles.inputContainer,
            styles.disabledInputContainer,
          ]}
          inputStyle={[styles.input, styles.disabledInput]}
        />
        <AppInput
          type="form"
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.input}
        />
        <AppInput
          type="form"
          label="About"
          value={about}
          onChangeText={setAbout}
          placeholder="Tell us about yourself"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          inputContainerStyle={[
            styles.inputContainer,
            styles.aboutInputContainer,
          ]}
          inputStyle={[styles.input, styles.aboutInput]}
        />
      </View>

      <AppButton
        title="Save Changes"
        onPress={handleSave}
        loading={isLoading}
        disabled={isLoading}
        variant="gradient"
        style={styles.saveButton}
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
  avatarSection: {
    width: responsiveWidth(26),
    height: responsiveWidth(26),
    alignSelf: 'center',
    marginTop: responsiveHeight(3),
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: responsiveWidth(13),
  },
  editPhotoButton: {
    position: 'absolute',
    right: 0,
    bottom: responsiveWidth(0.5),
    width: responsiveWidth(8),
    height: responsiveWidth(8),
    borderWidth: responsiveWidth(0.7),
    borderColor: AppColors.appBgColor,
    borderRadius: responsiveWidth(4),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.appThemeBlue,
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
  aboutInputContainer: {
    minHeight: responsiveHeight(14),
    alignItems: 'flex-start',
    paddingTop: responsiveHeight(1.5),
    paddingBottom: responsiveHeight(1.5),
  },
  aboutInput: {
    minHeight: responsiveHeight(10.5),
    paddingTop: 0,
    paddingBottom: 0,
  },
  disabledInputContainer: {
    backgroundColor: '#C6D8F3',
  },
  disabledInput: {
    color: AppColors.bodyText,
  },
  saveButton: {
    height: responsiveHeight(5.7),
    minHeight: responsiveHeight(5.7),
    marginTop: responsiveHeight(3),
    borderRadius: responsiveWidth(1.6),
  },
  buttonText: {
    fontSize: responsiveFontSize(1.65),
  },
});

export default EditProfileScreen;
