import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { Dropdown } from 'react-native-element-dropdown';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppButton,
  AppHeader,
  AppInput,
  AppText,
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
  useApplyMembershipMutation,
  useGetProfileQuery,
  useGetUserServicesQuery,
  useGetUserNetworksQuery,
} from '../../../redux/Services/authApi';
import { getApiErrorMessage } from '../../../utils/apiError';
import { showToast } from '../../../utils/Toast';
import { setUser } from '../../../redux/slices/authSlice';

const toDropdownItems = items =>
  (items ?? []).map(item => ({
    label: item.name,
    value: item._id,
    item,
  }));

const mergeUniqueItems = (current, incoming) => {
  const items = new Map(current.map(item => [item?._id ?? item?.id, item]));

  incoming.forEach(item => items.set(item?._id ?? item?.id, item));
  return Array.from(items.values());
};

const DropdownArrow = () => (
  <Feather
    name="chevron-down"
    color={AppColors.appThemeBlue}
    size={responsiveFontSize(2.15)}
  />
);

const MembershipFormScreen = ({ navigation, setSafeAreaColor }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const hasNavigatedRef = useRef(false);
  const [selectedNetworkId, setSelectedNetworkId] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [serviceCursor, setServiceCursor] = useState('');
  const [services, setServices] = useState([]);
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
  const { data: profileResponse } = useGetProfileQuery();
  const { data: networksResponse, isLoading: isNetworksLoading } =
    useGetUserNetworksQuery({ search: '', cursor: '', limit: 50 });
  const {
    currentData: servicesResponse,
    isLoading: isServicesLoading,
    isFetching: isServicesFetching,
  } = useGetUserServicesQuery({ cursor: serviceCursor, limit: 50 });

  const serviceResponseItems = useMemo(
    () => (Array.isArray(servicesResponse?.data) ? servicesResponse.data : []),
    [servicesResponse?.data],
  );
  const hasMoreServices = Boolean(
    servicesResponse?.pagination?.hasNextPage,
  );
  const serviceNextCursor =
    servicesResponse?.pagination?.nextCursor ??
    serviceResponseItems.at(-1)?._id ??
    serviceResponseItems.at(-1)?.id;

  const networkItems = useMemo(
    () => toDropdownItems(networksResponse?.data),
    [networksResponse?.data],
  );
  const serviceItems = useMemo(
    () => toDropdownItems(services),
    [services],
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
      {
        label: 'About',
        value: about,
        onChangeText: setAbout,
        placeholder: 'Tell us about yourself',
        multiline: true,
        numberOfLines: 4,
        textAlignVertical: 'top',
        inputContainerStyle: styles.aboutInputContainer,
        inputStyle: styles.aboutInput,
      },
    ],
    [about, address, phone, yearsOfExperience],
  );

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  useEffect(() => {
    if (hasNavigatedRef.current) {
      return;
    }

    const profileUser = profileResponse?.data;

    if (!profileResponse?.success || !profileUser) {
      return;
    }

    dispatch(setUser(profileUser));

    const membershipStatus = `${
      profileUser?.membership?.status ?? profileUser?.membershipStatus ?? ''
    }`.toLowerCase();

    if (membershipStatus === 'pending') {
      hasNavigatedRef.current = true;
      navigation.replace('MembershipUnderReview');
    } else if (membershipStatus === 'approved') {
      hasNavigatedRef.current = true;
      navigation.replace('MembershipApproved');
    }
  }, [dispatch, navigation, profileResponse]);

  useEffect(() => {
    if (!servicesResponse?.success) {
      return;
    }

    setServices(current =>
      serviceCursor
        ? mergeUniqueItems(current, serviceResponseItems)
        : serviceResponseItems,
    );
  }, [serviceCursor, serviceResponseItems, servicesResponse?.success]);

  const handleServiceEndReached = useCallback(() => {
    if (hasMoreServices && serviceNextCursor && !isServicesFetching) {
      setServiceCursor(current =>
        current === serviceNextCursor ? current : serviceNextCursor,
      );
    }
  }, [hasMoreServices, isServicesFetching, serviceNextCursor]);

  const renderDropdownItem = useCallback((item, selected) => {
    return (
      <View
        style={[
          styles.dropdownItem,
          selected && styles.dropdownItemSelected,
        ]}>
        <AppText
          style={[
            styles.dropdownItemText,
            selected && styles.dropdownSelectedText,
          ]}
          numberOfLines={1}>
          {item.label}
        </AppText>
        {selected && (
          <Feather
            name="check"
            color={AppColors.appThemeBlue}
            size={responsiveFontSize(1.8)}
          />
        )}
      </View>
    );
  }, []);

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
      hasNavigatedRef.current = true;
      const response = await applyMembership({
        phone,
        address,
        about,
        serviceId: selectedServiceId,
        networkId: selectedNetworkId,
        yearsOfExperience: Number(yearsOfExperience) || 0,
      }).unwrap();

      if (!response?.success) {
        hasNavigatedRef.current = false;
        showToast(
          'Unable to submit application',
          response?.message || 'Please try again.',
          'error',
        );
        return;
      }

      if (response?.data) {
        dispatch(setUser(response.data));
      }

      showToast(response?.message || 'Application submitted successfully.');
      navigation.replace('MembershipUnderReview', {
        networkId: selectedNetworkId,
        network: selectedNetwork,
        serviceId: selectedServiceId,
        service: selectedService,
      });
    } catch (error) {
      hasNavigatedRef.current = false;
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

        <View style={styles.dropdownRoot}>
          <AppText style={styles.dropdownLabel}>Network</AppText>
          <Dropdown
            dropdownPosition="bottom"
            autoScroll={false}
            style={styles.dropdownButton}
            containerStyle={styles.dropdownMenu}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownValue}
            activeColor="#C4D9F7"
            data={networkItems}
            maxHeight={responsiveHeight(32)}
            labelField="label"
            valueField="value"
            placeholder={
              isNetworksLoading ? 'Loading networks...' : 'Select Network'
            }
            value={selectedNetworkId}
            disable={isNetworksLoading}
            onChange={item => setSelectedNetworkId(item.value)}
            renderItem={renderDropdownItem}
            renderRightIcon={DropdownArrow}
            showsVerticalScrollIndicator
          />
        </View>

        <View style={styles.dropdownRoot}>
          <AppText style={styles.dropdownLabel}>Services Offered</AppText>
          <Dropdown
            dropdownPosition="bottom"
            autoScroll={false}
            style={styles.dropdownButton}
            containerStyle={styles.dropdownMenu}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownValue}
            activeColor="#C4D9F7"
            data={serviceItems}
            maxHeight={responsiveHeight(32)}
            labelField="label"
            valueField="value"
            placeholder={
              isServicesLoading && !services.length
                ? 'Loading services...'
                : 'Select Service'
            }
            value={selectedServiceId}
            disable={isServicesLoading && !services.length}
            onChange={item => setSelectedServiceId(item.value)}
            renderItem={renderDropdownItem}
            renderRightIcon={DropdownArrow}
            showsVerticalScrollIndicator
            flatListProps={{
              onEndReached: handleServiceEndReached,
              onEndReachedThreshold: 0.3,
            }}
          />
        </View>

        {fields.map(item =>
          <AppInput
            key={item.label}
            type="form"
            label={item.label}
            value={item.value}
            placeholder={item.placeholder ?? item.label}
            editable={item.editable !== false}
            onChangeText={item.onChangeText}
            keyboardType={item.keyboardType}
            multiline={item.multiline}
            numberOfLines={item.numberOfLines}
            textAlignVertical={item.textAlignVertical}
            inputContainerStyle={[
              styles.inputContainer,
              item.inputContainerStyle,
              item.editable === false && styles.disabledInputContainer,
            ]}
            inputStyle={[
              styles.input,
              item.inputStyle,
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
  aboutInputContainer: {
    minHeight: responsiveHeight(13),
    alignItems: 'flex-start',
    borderRadius: responsiveHeight(2),
    paddingTop: responsiveHeight(1.4),
    paddingBottom: responsiveHeight(1.4),
  },
  aboutInput: {
    minHeight: responsiveHeight(9.5),
    textAlignVertical: 'top',
    paddingTop: 0,
    paddingBottom: 0,
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
  },
  dropdownLabel: {
    marginBottom: responsiveHeight(0.8),
    color: AppColors.bodyText,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.35),
  },
  dropdownButton: {
    minHeight: responsiveHeight(5.35),
    height: responsiveHeight(5.35),
    borderWidth: 1,
    borderColor: '#A8B7C8',
    borderRadius: responsiveHeight(2.65),
    backgroundColor: 'transparent',
    paddingHorizontal: responsiveWidth(4),
  },
  dropdownPlaceholder: {
    color: '#7C8795',
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.5),
  },
  dropdownValue: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.5),
  },
  dropdownMenu: {
    marginTop: Platform.OS === 'android' ? -(StatusBar.currentHeight || 0) : 0,
    backgroundColor: AppColors.appBgColor,
    borderWidth: 1,
    borderColor: '#A8B7C8',
    borderRadius: responsiveHeight(2),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  dropdownItem: {
    minHeight: responsiveHeight(5.2),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(1.2),
  },
  dropdownItemSelected: {
    backgroundColor: '#C4D9F7',
  },
  dropdownItemText: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.45),
    flex: 1,
  },
  dropdownSelectedText: {
    color: AppColors.appThemeBlue,
    fontFamily: FontFamily.bold,
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
