import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  AppButton,
  AppHeader,
  AppText,
  ServiceCard,
  ServiceCardsSkeleton,
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
import { useGetNetworkServicesQuery } from '../../../redux/Services/authApi';
import { showToast } from '../../../utils/Toast';

const serviceIconByName = {
  insurance: 'shield',
  'home care': 'heart',
  realtor: 'home',
  'funeral planning': 'feather',
};

const getServiceIcon = serviceName => {
  const key = serviceName?.trim()?.toLowerCase();

  return serviceIconByName[key] || 'briefcase';
};

const SelectServicesScreen = ({ navigation, route, setSafeAreaColor }) => {
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const network = route?.params?.network;
  const networkId = route?.params?.networkId || network?._id || network?.id;
  const {
    data: servicesResponse,
    isFetching: isServicesFetching,
    isError: isServicesError,
    error: servicesError,
  } = useGetNetworkServicesQuery(
    { networkId, search: '', cursor: '', limit: 10 },
    {
    skip: !networkId,
    },
  );
  const services = useMemo(
    () => (Array.isArray(servicesResponse?.data) ? servicesResponse.data : []),
    [servicesResponse],
  );
  const emptyMessage =
    servicesResponse?.message ||
    servicesError?.data?.message ||
    'No services are available for this network yet.';

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  useEffect(() => {
    if (services.length && !selectedServiceId) {
      setSelectedServiceId(services[0]?._id ?? services[0]?.id);
      return;
    }

    if (!services.length && selectedServiceId) {
      setSelectedServiceId(null);
    }
  }, [selectedServiceId, services]);

  const selectedService = services.find(
    item => (item?._id ?? item?.id) === selectedServiceId,
  );
  const isNextDisabled =
    !networkId ||
    !services.length ||
    !selectedServiceId ||
    !selectedService ||
    isServicesFetching ||
    isServicesError;

  const handleNext = () => {
    if (!networkId) {
      showToast(
        'Network missing',
        'Please select a network before choosing services.',
        'error',
      );
      return;
    }

    if (!selectedServiceId) {
      showToast('Service missing', 'Please select a service to continue.', 'error');
      return;
    }

    navigation.navigate('AddClientDetails', {
      network,
      networkId,
      service: selectedService,
      serviceId: selectedServiceId,
    });
  };

  return (
    <Wrapper
      isScroll
      backgroundColor={AppColors.appBgColor}
      contentContainerStyle={styles.container}>
      <AppHeader
        variant="left"
        showBack
        title="Select Services"
        onLeftPress={() => navigation.goBack()}
        containerStyle={styles.header}
        titleStyle={styles.headerTitle}
      />

      {!networkId ? (
        <View style={styles.emptyCard}>
          <AppText style={styles.emptyTitle}>No Network Selected</AppText>
          <AppText style={styles.emptyMessage}>
            Please go back and select a network to view its services.
          </AppText>
        </View>
      ) : isServicesFetching ? (
        <ServiceCardsSkeleton count={2} />
      ) : services.length ? (
        <View style={styles.grid}>
          {services.map(item => {
            const serviceId = item?._id ?? item?.id;

            return (
              <ServiceCard
                key={serviceId}
                title={item?.name}
                description={item?.description}
                iconName={getServiceIcon(item?.name)}
                selected={selectedServiceId === serviceId}
                onPress={() => setSelectedServiceId(serviceId)}
              />
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <AppText style={styles.emptyTitle}>
            {isServicesError ? 'Unable to load services' : 'No Services Found'}
          </AppText>
          <AppText style={styles.emptyMessage}>{emptyMessage}</AppText>
        </View>
      )}

      <View style={styles.footer}>
        <AppButton
          title="Next"
          onPress={handleNext}
          disabled={isNextDisabled}
          showRightArrow
          variant="gradient"
          gradientColors={[
            AppColors.appThemeBlue,
            AppColors.appThemeDimBlue,
            AppColors.appThemeBlue,
          ]}
          style={styles.nextButton}
          textStyle={styles.nextButtonText}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: responsiveHeight(1.9),
    marginTop: responsiveHeight(4.2),
  },
  footer: {
    marginTop: responsiveHeight(4),
    paddingBottom: responsiveHeight(2.6),
  },
  nextButton: {
    height: responsiveHeight(5.5),
    minHeight: responsiveHeight(5),
    borderRadius: responsiveWidth(1.6),
  },
  nextButtonText: {
    fontSize: responsiveFontSize(1.65),
  },
  emptyCard: {
    minHeight: responsiveHeight(18),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.themeTxt2,
    borderRadius: responsiveWidth(2.4),
    backgroundColor: '#ADC9F5',
    paddingHorizontal: responsiveWidth(5),
    marginTop: responsiveHeight(4.2),
  },
  emptyTitle: {
    color: AppColors.themeTxt2,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(2),
    textAlign: 'center',
  },
  emptyMessage: {
    marginTop: responsiveHeight(0.8),
    color: AppColors.bodyText,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.45),
    lineHeight: responsiveFontSize(1.9),
    textAlign: 'center',
  },
});

export default SelectServicesScreen;
