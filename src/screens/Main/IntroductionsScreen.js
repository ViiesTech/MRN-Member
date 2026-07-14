import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  AppButton,
  AppHeader,
  AppText,
  EmptyState,
  IntroductionCardsSkeleton,
  IntroductionCard,
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
  useGetIntroductionsQuery,
  useUpdateIntroductionStatusMutation,
} from '../../redux/Services/authApi';
import {
  formatIntroductionStatus,
  getNextIntroductionStatus,
} from '../../utils/introductionStatus';
import { getApiErrorMessage } from '../../utils/apiError';
import { showToast } from '../../utils/Toast';

const filters = [
  {
    label: 'Introductions',
    status: 'introduction',
    title: 'View Details',
    type: 'gradient',
    showChevron: false,
    emptyTitle: 'No Introductions Yet',
    emptyMessage: 'New introductions will appear here when they are received.',
  },
  {
    label: 'Appointments',
    status: 'appointment',
    title: 'Schedule',
    type: 'gradient',
    showChevron: true,
    emptyTitle: 'No Appointments Yet',
    emptyMessage: 'Scheduled appointments will appear here.',
  },
  {
    label: 'Pending',
    status: 'pending',
    title: 'Pending',
    type: 'gradient',
    showChevron: true,
    emptyTitle: 'Nothing Pending',
    emptyMessage: 'No pending appointments available yet.',
  },
  {
    label: 'Completed',
    status: 'completed',
    title: 'Completed',
    type: 'outline',
    showChevron: false,
    emptyTitle: 'No Completed Introductions',
    emptyMessage: 'Completed introductions will appear here.',
  },
];

const getIntroductionId = item => item?._id ?? item?.id;
const getIntroductionName = item =>
  item?.client?.name ?? item?.consumerId?.name ?? item?.name ?? 'Member';
const getIntroductionService = item =>
  `Service: ${
    item?.serviceId?.name ??
    item?.service?.name ??
    item?.serviceName ??
    item?.service ??
    'N/A'
  }`;
const getIntroductionLocation = item =>
  item?.client?.address ??
  item?.location ??
  item?.address ??
  'Location unavailable';

const IntroductionsScreen = ({ navigation, setSafeAreaColor }) => {
  const [selectedFilter, setSelectedFilter] = useState(filters[0]);
  const {
    data: introductionsResponse,
    isFetching,
    isError,
    error,
  } = useGetIntroductionsQuery(selectedFilter.status);
  const [updateIntroductionStatus] = useUpdateIntroductionStatusMutation();
  const [updatingIntroductionId, setUpdatingIntroductionId] = useState(null);
  const [openStatusIntroductionId, setOpenStatusIntroductionId] =
    useState(null);
  const introductions = Array.isArray(introductionsResponse?.data)
    ? introductionsResponse.data
    : [];
  const responseMessage =
    introductionsResponse?.message ||
    error?.data?.message ||
    'Introductions are currently unavailable.';
  const isAccessLocked = introductionsResponse?.success === false || isError;

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  const handleStatusUpdate = async item => {
    const introductionId = getIntroductionId(item);
    const nextStatus = getNextIntroductionStatus(item?.status);

    if (!introductionId || !nextStatus) {
      return;
    }

    setUpdatingIntroductionId(introductionId);

    try {
      const response = await updateIntroductionStatus({
        introductionId,
        status: nextStatus,
      }).unwrap();

      if (!response?.success) {
        showToast(
          'Unable to update status',
          response?.message || 'Please try again.',
          'error',
        );
        return;
      }

      showToast(
        'Status updated successfully',
        `Introduction moved to ${nextStatus}.`,
      );
      setOpenStatusIntroductionId(null);
    } catch (updateError) {
      showToast(
        'Unable to update status',
        getApiErrorMessage(updateError),
        'error',
      );
    } finally {
      setUpdatingIntroductionId(null);
    }
  };

  return (
    <Wrapper
      isScroll
      backgroundColor={AppColors.appBgColor}
      contentContainerStyle={styles.container}>
      <AppHeader
        variant="left"
        showBack
        title={selectedFilter.label}
        onLeftPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          }
        }}
        containerStyle={styles.header}
        leftButtonStyle={styles.headerBackButton}
        titleWrapStyle={styles.headerTitleWrap}
        titleStyle={styles.headerTitle}
        backIconColor={AppColors.appThemeBlue}
        backIconSize={responsiveFontSize(2.5)}
      />

      <View style={styles.filterRow}>
        {filters.map(filter => {
          const isSelected = selectedFilter.status === filter.status;

          return (
            <AppButton
              key={`${filter.status}-${isSelected ? 'active' : 'inactive'}`}
              title={filter.label}
              onPress={() => {
                setSelectedFilter(filter);
                setOpenStatusIntroductionId(null);
              }}
              bordered={!isSelected}
              borderColor={AppColors.appThemeBlue}
              variant="solid"
              textColor={
                isSelected ? AppColors.white : AppColors.introTabInactiveText
              }
              style={[
                styles.filterButton,
                isSelected ? styles.filterButtonActive : styles.filterButtonIdle,
              ]}
              contentStyle={styles.filterContent}
              textStyle={styles.filterText}
            />
          );
        })}
      </View>

      {isFetching ? (
        <View style={styles.resultsContainer}>
          <IntroductionCardsSkeleton count={3} />
        </View>
      ) : isAccessLocked ? (
        <View style={styles.messageCard}>
          <AppText style={styles.messageTitle}>Membership Required</AppText>
          <AppText style={styles.messageText}>{responseMessage}</AppText>
        </View>
      ) : introductions.length ? (
        <View style={styles.list}>
          {introductions.map(item => (
            <IntroductionCard
              key={getIntroductionId(item)}
              name={getIntroductionName(item)}
              service={getIntroductionService(item)}
              location={getIntroductionLocation(item)}
              profile={item?.consumerId?.profile}
              actionTitle={selectedFilter.title}
              actionType={selectedFilter.type}
              showChevron={selectedFilter.showChevron}
              loading={updatingIntroductionId === getIntroductionId(item)}
              showStatusOption={
                openStatusIntroductionId === getIntroductionId(item)
              }
              nextStatusLabel={formatIntroductionStatus(
                getNextIntroductionStatus(item?.status),
              )}
              onStatusOptionPress={() => handleStatusUpdate(item)}
              disabled={
                selectedFilter.status === 'completed' ||
                (updatingIntroductionId !== null &&
                  updatingIntroductionId !== getIntroductionId(item))
              }
              onActionPress={
                selectedFilter.status === 'introduction'
                  ? () =>
                      navigation.navigate('IntroductionDetails', {
                        introduction: item,
                      })
                  : selectedFilter.status !== 'completed'
                    ? () =>
                        setOpenStatusIntroductionId(currentId =>
                          currentId === getIntroductionId(item)
                            ? null
                            : getIntroductionId(item),
                        )
                    : undefined
              }
            />
          ))}
        </View>
      ) : (
        <EmptyState
          title={selectedFilter.emptyTitle}
          message={selectedFilter.emptyMessage}
          style={styles.emptyState}
        />
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.appBgColor,
    paddingHorizontal: responsiveWidth(5.6),
    paddingBottom: responsiveHeight(12),
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
    fontSize: responsiveFontSize(2.15),
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: responsiveWidth(1.55),
    marginTop: responsiveHeight(2.2),
  },
  filterButton: {
    width: 'auto',
    alignSelf: 'flex-start',
    flexGrow: 0,
    flexShrink: 0,
    minHeight: responsiveHeight(3.85),
    height: responsiveHeight(3.85),
    borderRadius: responsiveWidth(2),
    paddingHorizontal: responsiveWidth(1.35),
  },
  filterButtonActive: {
    backgroundColor: AppColors.appThemeBlue,
  },
  filterButtonIdle: {
    backgroundColor: 'transparent',
  },
  filterContent: {
    gap: 0,
    flexShrink: 0,
  },
  filterText: {
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(1.45),
    lineHeight: responsiveFontSize(1.75),
  },
  list: {
    marginTop: responsiveHeight(3.3),
    gap: responsiveHeight(1.85),
  },
  resultsContainer: {
    marginTop: responsiveHeight(2.2),
  },
  messageCard: {
    marginTop: responsiveHeight(3.3),
    borderRadius: responsiveWidth(2.2),
    backgroundColor: '#A9C8F6',
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(2.2),
  },
  messageTitle: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.semiBold,
    fontSize: responsiveFontSize(1.9),
    textAlign: 'center',
  },
  messageText: {
    marginTop: responsiveHeight(0.8),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.6),
    lineHeight: responsiveFontSize(2.15),
    textAlign: 'center',
  },
  emptyState: {
    marginTop: responsiveHeight(3.3),
  },
});

export default IntroductionsScreen;
