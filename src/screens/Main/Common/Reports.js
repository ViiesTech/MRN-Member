import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { Dropdown } from 'react-native-element-dropdown';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppButton,
  AppHeader,
  AppText,
  EmptyState,
  ReportActivitySkeleton,
  StatCards,
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
  useGetActivityLogsQuery,
  useGetProfileQuery,
} from '../../../redux/Services/authApi';
import { setUser } from '../../../redux/slices/authSlice';

const PAGE_LIMIT = 10;
const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear();

const monthOptions = moment.months().map((label, index) => ({
  label,
  value: index + 1,
}));

const yearOptions = Array.from({ length: 10 }, (_, index) => ({
  label: `${currentYear - index}`,
  value: currentYear - index,
}));

const DROPDOWN_ITEM_HEIGHT = Math.round(responsiveHeight(5.2));

const getActivityIcon = activity => {
  if (activity?.success === false || activity?.type === 'error') {
    return 'alert-circle';
  }

  if (`${activity?.resourceModel}`.toLowerCase().includes('introduction')) {
    return 'send';
  }

  if (`${activity?.resourceModel}`.toLowerCase().includes('profile')) {
    return 'user';
  }

  switch (`${activity?.type}`.toLowerCase()) {
    case 'create':
      return 'plus-circle';
    case 'update':
      return 'edit-3';
    case 'delete':
      return 'trash-2';
    case 'read':
      return 'eye';
    default:
      return 'activity';
  }
};

const getActivities = response => {
  const groups = response?.data?.logs;

  if (!Array.isArray(groups)) {
    return [];
  }

  return groups.flatMap(group =>
    Array.isArray(group?.logs) ? group.logs : [],
  );
};

const Reports = ({ navigation, setSafeAreaColor }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const queryParams = useMemo(
    () => ({ year, month, page, limit: PAGE_LIMIT }),
    [month, page, year],
  );
  const {
    data: activitiesResponse,
    error: activitiesError,
    isError: isActivitiesError,
    isLoading: isActivitiesLoading,
    isFetching: isActivitiesFetching,
    refetch: refetchActivities,
  } = useGetActivityLogsQuery(queryParams);
  const {
    data: profileResponse,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
    refetch: refetchProfile,
  } = useGetProfileQuery();

  const isActivitiesBusy =
    (isActivitiesLoading || isActivitiesFetching) && !isRefreshing;

  const activities = getActivities(activitiesResponse);
  const pagination = activitiesResponse?.pagination;
  const selectedMonth = monthOptions.find(item => item.value === month)?.label;
  const activityErrorMessage =
    activitiesError?.data?.message ||
    activitiesResponse?.message ||
    'Monthly activity is currently unavailable.';

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  useEffect(() => {
    if (profileResponse?.success && profileResponse?.data) {
      dispatch(setUser(profileResponse.data));
    }
  }, [dispatch, profileResponse]);

  const handleMonthChange = item => {
    setMonth(item.value);
    setPage(1);
  };

  const handleYearChange = item => {
    setYear(item.value);
    setPage(1);
  };

  const monthIndex = useMemo(
    () => Math.max(0, monthOptions.findIndex(item => item.value === month)),
    [month],
  );

  const yearIndex = useMemo(
    () => Math.max(0, yearOptions.findIndex(item => item.value === year)),
    [year],
  );

  const getDropdownItemLayout = useCallback(
    (_, index) => ({
      length: DROPDOWN_ITEM_HEIGHT,
      offset: DROPDOWN_ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

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
          ]}>
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

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      await Promise.all([refetchActivities(), refetchProfile()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchActivities, refetchProfile]);

  const handleHeaderBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  return (
    <Wrapper
      isScroll
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      backgroundColor={AppColors.appBgColor}
      contentContainerStyle={styles.container}>
      <AppHeader
        variant="left"
        showBack
        title="Reports"
        onLeftPress={handleHeaderBack}
        containerStyle={styles.header}
        leftButtonStyle={styles.headerBackButton}
        titleWrapStyle={styles.headerTitleWrap}
        titleStyle={styles.headerTitle}
        backIconColor={AppColors.appThemeBlue}
        backIconSize={responsiveFontSize(2.5)}
      />

      <StatCards
        stats={user?.stats}
        loading={
          (isProfileLoading || isProfileFetching) &&
          !user?.stats &&
          !isRefreshing
        }
      />

      <View style={styles.reportHeadingRow}>
        <View>
          <AppText style={styles.sectionTitle}>Monthly Activity</AppText>
          <AppText style={styles.sectionSubtitle}>
            {selectedMonth} {year}
          </AppText>
        </View>
        {!!pagination?.total && (
          <AppText style={styles.resultCount}>
            {pagination.total} {pagination.total === 1 ? 'activity' : 'activities'}
          </AppText>
        )}
      </View>

      <View style={styles.filtersRow}>
        <View style={styles.filterField}>
          <AppText style={styles.filterLabel}>Month</AppText>
          <Dropdown
            dropdownPosition="bottom"
            autoScroll={false}
            accessibilityLabel="Select report month"
            style={styles.dropdown}
            containerStyle={styles.dropdownMenu}
            placeholderStyle={styles.dropdownText}
            selectedTextStyle={styles.dropdownText}
            itemTextStyle={styles.dropdownItemText}
            activeColor="#C4D9F7"
            data={monthOptions}
            labelField="label"
            valueField="value"
            value={month}
            onChange={handleMonthChange}
            renderItem={renderDropdownItem}
            flatListProps={{
              initialScrollIndex: monthIndex,
              getItemLayout: getDropdownItemLayout,
              initialNumToRender: 12,
              maxToRenderPerBatch: 12,
              windowSize: 5,
              onScrollToIndexFailed: () => {},
            }}
            renderRightIcon={() => (
              <Feather
                name="chevron-down"
                color={AppColors.appThemeBlue}
                size={responsiveFontSize(1.9)}
              />
            )}
          />
        </View>

        <View style={styles.filterField}>
          <AppText style={styles.filterLabel}>Year</AppText>
          <Dropdown
            dropdownPosition="bottom"
            autoScroll={false}
            accessibilityLabel="Select report year"
            style={styles.dropdown}
            containerStyle={styles.dropdownMenu}
            placeholderStyle={styles.dropdownText}
            selectedTextStyle={styles.dropdownText}
            itemTextStyle={styles.dropdownItemText}
            activeColor="#C4D9F7"
            data={yearOptions}
            labelField="label"
            valueField="value"
            value={year}
            onChange={handleYearChange}
            renderItem={renderDropdownItem}
            flatListProps={{
              initialScrollIndex: yearIndex,
              getItemLayout: getDropdownItemLayout,
              initialNumToRender: 10,
              maxToRenderPerBatch: 10,
              windowSize: 5,
              onScrollToIndexFailed: () => {},
            }}
            renderRightIcon={() => (
              <Feather
                name="chevron-down"
                color={AppColors.appThemeBlue}
                size={responsiveFontSize(1.9)}
              />
            )}
          />
        </View>
      </View>

      {isActivitiesBusy ? (
        <ReportActivitySkeleton />
      ) : isActivitiesError || activitiesResponse?.success === false ? (
        <EmptyState
          title="Unable to Load Report"
          message={activityErrorMessage}
          iconName="alert-circle"
          style={styles.emptyState}
        />
      ) : activities.length ? (
        <View style={styles.activityList}>
          {activities.map(activity => {
            const activityDate = moment(activity.createdAt);
            const failed = activity.success === false || activity.type === 'error';

            return (
              <View key={activity._id} style={styles.activityCard}>
                <View
                  style={[
                    styles.activityIconCircle,
                    failed && styles.failedIconCircle,
                  ]}>
                  <Feather
                    name={getActivityIcon(activity)}
                    color={failed ? '#B42318' : AppColors.appThemeBlue}
                    size={responsiveFontSize(2.35)}
                  />
                </View>

                <View style={styles.activityContent}>
                  <View style={styles.activityTitleRow}>
                    <AppText style={styles.activityTitle} numberOfLines={2}>
                      {activity.action || 'Activity'}
                    </AppText>
                    <AppText style={styles.activityDate}>
                      {activityDate.isValid()
                        ? activityDate.format('DD MMM, YYYY')
                        : ''}
                    </AppText>
                  </View>
                  <AppText style={styles.activityDescription} numberOfLines={3}>
                    {activity.description || 'Activity details are unavailable.'}
                  </AppText>
                  <AppText style={styles.activityTime}>
                    {activityDate.isValid() ? activityDate.format('hh:mm A') : ''}
                  </AppText>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <EmptyState
          title="No Monthly Activity"
          message={`No activities are available for ${selectedMonth} ${year}.`}
          iconName="calendar"
          style={styles.emptyState}
        />
      )}

      {(pagination?.totalPages ?? 0) > 1 && (
        <View style={styles.paginationRow}>
          <AppButton
            title="Previous"
            variant="gradient"
            disabled={!pagination?.hasPrevPage || isActivitiesFetching}
            onPress={() => setPage(value => Math.max(1, value - 1))}
            style={styles.pageButton}
            textStyle={styles.pageButtonText}
          />
          <AppText style={styles.pageLabel}>
            {pagination.page} / {pagination.totalPages}
          </AppText>
          <AppButton
            title="Next"
            variant="gradient"
            disabled={!pagination?.hasNextPage || isActivitiesFetching}
            onPress={() => setPage(value => value + 1)}
            style={styles.pageButton}
            textStyle={styles.pageButtonText}
          />
        </View>
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
    fontFamily: FontFamily.semiBold,
    fontSize: responsiveFontSize(2.15),
  },
  reportHeadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: responsiveHeight(2.5),
  },
  sectionTitle: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(2.2),
    lineHeight: responsiveFontSize(2.7),
  },
  sectionSubtitle: {
    marginTop: responsiveHeight(0.2),
    color: AppColors.bodyText,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(1.35),
  },
  resultCount: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(1.3),
  },
  filtersRow: {
    flexDirection: 'row',
    gap: responsiveWidth(3),
    marginTop: responsiveHeight(1.6),
    zIndex: 5,
  },
  filterField: {
    flex: 1,
  },
  filterLabel: {
    marginBottom: responsiveHeight(0.55),
    color: AppColors.bodyText,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(1.35),
  },
  dropdown: {
    minHeight: responsiveHeight(5.2),
    borderWidth: 1,
    borderColor: '#7EA5DA',
    borderRadius: responsiveWidth(2),
    backgroundColor: '#C4D9F7',
    paddingHorizontal: responsiveWidth(3),
  },
  dropdownMenu: {
    marginTop: Platform.OS === 'android' ? -(StatusBar.currentHeight || 0) : 0,
    borderColor: '#7EA5DA',
    borderRadius: responsiveWidth(2),
    backgroundColor: AppColors.appBgColor,
    overflow: 'hidden',
  },
  dropdownItem: {
    height: DROPDOWN_ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveWidth(3.5),
  },
  dropdownItemSelected: {
    backgroundColor: '#C4D9F7',
  },
  dropdownSelectedText: {
    color: AppColors.appThemeBlue,
    fontFamily: FontFamily.bold,
  },
  dropdownText: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(1.5),
  },
  dropdownItemText: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.45),
  },
  activityList: {
    marginTop: responsiveHeight(1.35),
    gap: responsiveHeight(1.5),
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: responsiveHeight(10.4),
    borderRadius: responsiveWidth(2.2),
    backgroundColor: '#A9C8F6',
    paddingHorizontal: responsiveWidth(3.2),
    paddingVertical: responsiveHeight(1.5),
  },
  activityIconCircle: {
    width: responsiveWidth(11),
    height: responsiveWidth(11),
    borderRadius: responsiveWidth(5.5),
    backgroundColor: '#D4E4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  failedIconCircle: {
    backgroundColor: '#FEE4E2',
  },
  activityContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: responsiveWidth(3.2),
  },
  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: responsiveWidth(2),
  },
  activityTitle: {
    flex: 1,
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.72),
    lineHeight: responsiveFontSize(2.15),
  },
  activityDate: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(1.08),
    lineHeight: responsiveFontSize(1.45),
  },
  activityDescription: {
    marginTop: responsiveHeight(0.5),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.25),
    lineHeight: responsiveFontSize(1.65),
  },
  activityTime: {
    marginTop: responsiveHeight(0.55),
    color: AppColors.bodyText,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(1.08),
    textAlign: 'right',
  },
  emptyState: {
    marginTop: responsiveHeight(1.35),
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(1.5),
  },
  pageButton: {
    width: responsiveWidth(25),
    height: responsiveHeight(4.6),
    minHeight: responsiveHeight(4.6),
    maxHeight: responsiveHeight(4.6),
  },
  pageButtonText: {
    fontSize: responsiveFontSize(1.45),
  },
  pageLabel: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.semiBold,
    fontSize: responsiveFontSize(1.4),
  },
});

export default Reports;
