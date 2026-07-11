import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import DropDownPicker from 'react-native-dropdown-picker';
import { useSelector } from 'react-redux';
import {
  AppButton,
  AppHeader,
  AppInput,
  AppText,
  Wrapper,
} from '../../component/Index';
import { AppColors } from '../../utils/AppColors';
import { FontFamily } from '../../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../utils/Responsive_Dimensions';
import { useSafeAreaColor } from '../../utils/useSafeAreaColor';
import {
  useApplyMembershipMutation,
  useGetNetworksQuery,
  useGetServicesQuery,
} from '../../redux/Services/authApi';
import { getApiErrorMessage } from '../../utils/apiError';
import { showToast } from '../../utils/Toast';

const toDropdownItems = items =>
  (items ?? []).map(item => ({
    label: item.name,
    value: item._id,
    item,
  }));

const DropdownArrowDown = () => (
  <Feather
    name="chevron-down"
    color={AppColors.appThemeBlue}
    size={responsiveFontSize(2.15)}
  />
);

const DropdownArrowUp = () => (
  <Feather
    name="chevron-up"
    color={AppColors.appThemeBlue}
    size={responsiveFontSize(2.15)}
  />
);

const MembershipFormScreen = ({ navigation, setSafeAreaColor }) => {
  const user = useSelector(state => state.auth.user);
  const [isNetworkOpen, setIsNetworkOpen] = useState(false);
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [selectedNetworkId, setSelectedNetworkId] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [about, setAbout] = useState(user?.about ?? '');
  const [yearsOfExperience, setYearsOfExperience] = useState(
    user?.yearsOfExperience !== null && user?.yearsOfExperience !== undefined
      ? `${user.yearsOfExperience}`
      : '',
  );
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState(user?.address ?? '');
  const [applyMembership, { isLoading: isApplying }] =
    useApplyMembershipMutation();
  const { data: networksResponse, isLoading: isNetworksLoading } =
    useGetNetworksQuery();
  const { data: servicesResponse, isLoading: isServicesLoading } =
    useGetServicesQuery();

  const networkItems = useMemo(
    () => toDropdownItems(networksResponse?.data),
    [networksResponse?.data],
  );
  const serviceItems = useMemo(
    () => toDropdownItems(servicesResponse?.data),
    [servicesResponse?.data],
  );
  const selectedNetwork = useMemo(
    () => networkItems.find(item => item.value === selectedNetworkId)?.item,
    [networkItems, selectedNetworkId],
  );
  const selectedService = useMemo(
    () => serviceItems.find(item => item.value === selectedServiceId)?.item,
    [serviceItems, selectedServiceId],
  );
  const fields = useMemo(
    () => [
      {
        label: 'About',
        value: about,
        onChangeText: setAbout,
      },
      {
        label: 'Years Of Experience',
        value: yearsOfExperience,
        onChangeText: setYearsOfExperience,
        keyboardType: 'number-pad',
      },
      {
        label: 'Phone Number',
        value: phone,
        onChangeText: setPhone,
        keyboardType: 'phone-pad',
      },
      {
        label: 'Address',
        value: address,
        onChangeText: setAddress,
      },
    ],
    [about, address, phone, yearsOfExperience],
  );

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  const handleSubmit = async () => {
    if (!selectedNetworkId || !selectedServiceId) {
      showToast(
        'Missing selection',
        'Please select network and service.',
        'error',
      );
      return;
    }

    try {
      const response = await applyMembership({
        phone,
        address,
        about,
        serviceId: selectedServiceId,
        networkId: selectedNetworkId,
        yearsOfExperience: Number(yearsOfExperience) || 0,
      }).unwrap();

      if (!response?.success) {
        showToast(
          'Unable to submit application',
          response?.message || 'Please try again.',
          'error',
        );
        return;
      }

      showToast(response?.message || 'Application submitted successfully.');
      navigation.navigate('MembershipUnderReview', {
        networkId: selectedNetworkId,
        network: selectedNetwork,
        serviceId: selectedServiceId,
        service: selectedService,
      });
    } catch (error) {
      showToast(
        'Unable to submit application',
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
        title="Fill Details"
        onLeftPress={() => navigation.goBack()}
        containerStyle={styles.header}
        leftButtonStyle={styles.headerBackButton}
        titleWrapStyle={styles.headerTitleWrap}
        titleStyle={styles.headerTitle}
        backIconColor={AppColors.appThemeBlue}
        backIconSize={responsiveFontSize(2.5)}
      />

      <View style={styles.form}>
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

        <View style={[styles.dropdownRoot, styles.networkDropdownRoot]}>
          <AppText style={styles.dropdownLabel}>Network</AppText>
          <DropDownPicker
            open={isNetworkOpen}
            value={selectedNetworkId}
            items={networkItems}
            setOpen={setIsNetworkOpen}
            setValue={setSelectedNetworkId}
            onOpen={() => setIsServiceOpen(false)}
            placeholder={isNetworksLoading ? 'Loading networks...' : 'Select Network'}
            loading={isNetworksLoading}
            disabled={isNetworksLoading}
            listMode="SCROLLVIEW"
            ArrowDownIconComponent={DropdownArrowDown}
            ArrowUpIconComponent={DropdownArrowUp}
            style={styles.dropdownButton}
            dropDownContainerStyle={styles.dropdownMenu}
            textStyle={styles.dropdownValue}
            labelStyle={styles.dropdownValue}
            arrowIconContainerStyle={styles.dropdownArrowContainer}
            selectedItemLabelStyle={styles.dropdownSelectedText}
            selectedItemContainerStyle={styles.dropdownSelectedItem}
          />
        </View>

        <View style={styles.dropdownRoot}>
          <AppText style={styles.dropdownLabel}>Services Offered</AppText>
          <DropDownPicker
            open={isServiceOpen}
            value={selectedServiceId}
            items={serviceItems}
            setOpen={setIsServiceOpen}
            setValue={setSelectedServiceId}
            onOpen={() => setIsNetworkOpen(false)}
            placeholder={isServicesLoading ? 'Loading services...' : 'Select Service'}
            loading={isServicesLoading}
            disabled={isServicesLoading}
            listMode="SCROLLVIEW"
            ArrowDownIconComponent={DropdownArrowDown}
            ArrowUpIconComponent={DropdownArrowUp}
            style={styles.dropdownButton}
            dropDownContainerStyle={styles.dropdownMenu}
            textStyle={styles.dropdownValue}
            labelStyle={styles.dropdownValue}
            arrowIconContainerStyle={styles.dropdownArrowContainer}
            selectedItemLabelStyle={styles.dropdownSelectedText}
            selectedItemContainerStyle={styles.dropdownSelectedItem}
          />
        </View>

        {fields.map(item =>
          <AppInput
            key={item.label}
            type="form"
            label={item.label}
            value={item.value}
            placeholder={item.label}
            editable={item.editable !== false}
            onChangeText={item.onChangeText}
            keyboardType={item.keyboardType}
            inputContainerStyle={[
              styles.inputContainer,
              item.editable === false && styles.disabledInputContainer,
            ]}
            inputStyle={[
              styles.input,
              item.editable === false && styles.disabledInput,
            ]}
          />,
        )}
      </View>

      <AppButton
        title="Submit Application"
        showRightArrow
        variant="gradient"
        onPress={handleSubmit}
        loading={isApplying}
        disabled={isApplying}
        style={styles.submitButton}
        textStyle={styles.submitText}
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
    color: AppColors.black,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(2.1),
  },
  form: {
    marginTop: responsiveHeight(2.6),
  },
  inputContainer: {
    minHeight: responsiveHeight(5.35),
    borderColor: '#A8B7C8',
    borderRadius: responsiveHeight(2.65),
    paddingHorizontal: responsiveWidth(4),
  },
  input: {
    color: AppColors.themeTxt,
    fontSize: responsiveFontSize(1.5),
  },
  disabledInputContainer: {
    backgroundColor: '#C6D8F3',
  },
  disabledInput: {
    color: AppColors.themeTxt,
  },
  dropdownRoot: {
    width: '100%',
    marginBottom: responsiveHeight(1.75),
    zIndex: 10,
  },
  networkDropdownRoot: {
    zIndex: 20,
  },
  dropdownLabel: {
    marginBottom: responsiveHeight(0.8),
    color: AppColors.bodyText,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.35),
  },
  dropdownButton: {
    minHeight: responsiveHeight(5.35),
    borderWidth: 1,
    borderColor: '#A8B7C8',
    borderRadius: responsiveHeight(2.65),
    backgroundColor: 'transparent',
    paddingHorizontal: responsiveWidth(4),
  },
  dropdownValue: {
    color: '#7C8795',
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.5),
  },
  dropdownArrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  dropdownMenu: {
    backgroundColor: AppColors.appBgColor,
    borderWidth: 1,
    borderColor: '#A8B7C8',
    borderRadius: responsiveHeight(2),
  },
  dropdownSelectedText: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
  },
  dropdownSelectedItem: {
    backgroundColor: '#B9D2F7',
  },
  submitButton: {
    marginTop: responsiveHeight(4.2),
    height: responsiveHeight(5.7),
    minHeight: responsiveHeight(5.7),
    borderRadius: responsiveWidth(1.6),
  },
  submitText: {
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.6),
  },
});

export default MembershipFormScreen;
