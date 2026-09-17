import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  AppButton,
  AppHeader,
  AppInput,
  Wrapper,
} from '../../../component/Index';
import { AppColors } from '../../../utils/AppColors';
import { FontFamily } from '../../../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils/Responsive_Dimensions';
import { useSafeAreaColor } from '../../../utils/useSafeAreaColor';
import {
  useCreateInformationRequestMutation,
  useCreateIntroductionMutation,
} from '../../../redux/Services/authApi';
import { getApiErrorMessage } from '../../../utils/apiError';
import { showToast } from '../../../utils/Toast';

const AddClientDetailsScreen = ({ navigation, route, setSafeAreaColor }) => {
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [createInformationRequest, { isLoading: isCreatingInformation }] =
    useCreateInformationRequestMutation();
  const [createIntroduction, { isLoading: isCreatingIntroduction }] =
    useCreateIntroductionMutation();
  const isIntroduction = route?.params?.flowType === 'introduction';
  const isLoading = isIntroduction
    ? isCreatingIntroduction
    : isCreatingInformation;
  const receiverId = route?.params?.receiverId;
  const networkId = route?.params?.networkId;
  const serviceId = route?.params?.serviceId;

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  const handleSubmit = async () => {
    const payload = {
      ...(isIntroduction && { receiverId }),
      networkId,
      serviceId,
      client: {
        name: clientName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
      },
      note: note.trim(),
    };

    if (
      !payload.networkId ||
      !payload.serviceId ||
      (isIntroduction && !payload.receiverId)
    ) {
      showToast(
        'Selection missing',
        isIntroduction
          ? 'Please select a member before sending the introduction.'
          : 'Please select a network and service before submitting your request.',
        'error',
      );
      return;
    }

    if (
      !payload.client.name ||
      !payload.client.phone ||
      !payload.client.email ||
      !payload.client.address
    ) {
      showToast('Missing fields', 'Please fill all client details.', 'error');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(payload.client.email)) {
      showToast('Invalid email', 'Please enter a valid email address.', 'error');
      return;
    }

    try {
      const response = await (isIntroduction
        ? createIntroduction(payload)
        : createInformationRequest(payload)
      ).unwrap();

      if (!response?.success) {
        showToast(
          isIntroduction
            ? 'Unable to send introduction'
            : 'Unable to submit request',
          response?.message || 'Please try again.',
          'error',
        );
        return;
      }

      showToast(
        response?.message ||
          (isIntroduction
            ? 'Introduction sent successfully.'
            : 'Information request submitted successfully.'),
      );
      navigation.navigate('InformationSuccess', {
        flowType: isIntroduction ? 'introduction' : 'information',
      });
    } catch (error) {
      showToast(
        isIntroduction
          ? 'Unable to send introduction'
          : 'Unable to submit request',
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
        title="Client Details"
        onLeftPress={() => navigation.goBack()}
        containerStyle={styles.header}
        titleStyle={styles.headerTitle}
      />

      <View style={styles.form}>
        <AppInput
          type="form"
          label="Client Full Name"
          placeholder="John Doe"
          placeholderTextColor="#8A98A8"
          value={clientName}
          onChangeText={setClientName}
        />
        <AppInput
          type="form"
          label="Email"
          placeholder="Johndoe@gmail.com"
          placeholderTextColor="#8A98A8"
          value={email}
          onChangeText={value => setEmail(value.toLowerCase())}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <AppInput
          type="form"
          label="Phone Number"
          placeholder="123-456-7890"
          placeholderTextColor="#8A98A8"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <AppInput
          type="form"
          label="Address"
          placeholder="7211 Jewel Lake Rd, Anchorage, Alaska"
          placeholderTextColor="#8A98A8"
          value={address}
          onChangeText={setAddress}
        />
        <AppInput
          type="form"
          label="Additional Notes"
          multiline
          value={note}
          onChangeText={setNote}
          inputContainerStyle={styles.notesInputContainer}
          inputStyle={styles.notesInput}
        />
      </View>

      <View style={styles.footer}>
      <AppButton
          title={isIntroduction ? 'Send Introduction' : 'Submit Request'}
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          showRightArrow
          variant="gradient"
          gradientColors={[
            AppColors.appThemeBlue,
            AppColors.appThemeDimBlue,
            AppColors.appThemeBlue,
          ]}
          style={styles.submitButton}
          textStyle={styles.submitButtonText}
        />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: AppColors.appBgColor,
  },
  header: {
    marginTop: responsiveHeight(1.1),
  },
  headerTitle: {
    color: AppColors.headerText,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(2),
  },
  form: {
    marginTop: responsiveHeight(3.6),
  },
  notesInputContainer: {
    height: responsiveHeight(16.4),
    alignItems: 'flex-start',
    borderRadius: responsiveWidth(2.2),
    paddingTop: responsiveHeight(1.2),
  },
  notesInput: {
    minHeight: responsiveHeight(13.5),
    textAlignVertical: 'top',
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: responsiveHeight(2.4),
  },
  submitButton: {
    height: responsiveHeight(5.5),
    minHeight: responsiveHeight(5),
    borderRadius: responsiveWidth(1.6),
  },
  submitButtonText: {
    fontSize: responsiveFontSize(1.65),
  },
});

export default AddClientDetailsScreen;
