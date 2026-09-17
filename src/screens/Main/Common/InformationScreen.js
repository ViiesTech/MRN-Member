import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  AppButton,
  AppHeader,
  EmptyState,
  InformationCard,
  InformationCardsSkeleton,
} from '../../../component/Index';
import { AppColors } from '../../../utils/AppColors';
import { FontFamily } from '../../../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils/Responsive_Dimensions';
import { useSafeAreaColor } from '../../../utils/useSafeAreaColor';
import { useGetInformationRequestsQuery } from '../../../redux/Services/authApi';

const filters = [
  {
    label: 'Information',
    status: 'information',
    emptyTitle: 'No Information Requests',
    emptyMessage: 'Your information requests will appear here.',
  },
  {
    label: 'Appointments',
    status: 'appointment',
    emptyTitle: 'No Appointments Yet',
    emptyMessage: 'Your information requests with appointments will appear here.',
  },
  {
    label: 'Pending',
    status: 'pending',
    emptyTitle: 'Nothing Pending',
    emptyMessage: 'No pending information requests are available yet.',
  },
  {
    label: 'Completed',
    status: 'completed',
    emptyTitle: 'No Completed Requests',
    emptyMessage: 'Completed information requests will appear here.',
  },
];

const mergeUniqueItems = (current, incoming) => {
  const items = new Map(current.map(item => [item?._id ?? item?.id, item]));

  incoming.forEach(item => items.set(item?._id ?? item?.id, item));
  return Array.from(items.values());
};

const InformationSeparator = () => <View style={styles.separator} />;

const InformationScreen = ({ navigation, setSafeAreaColor }) => {
  const [selectedFilter, setSelectedFilter] = useState(filters[0]);
  const [cursor, setCursor] = useState('');
  const [requests, setRequests] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    currentData: informationResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetInformationRequestsQuery({
    status: selectedFilter.status,
    cursor,
    limit: 10,
  });
  const responseItems = useMemo(
    () =>
      Array.isArray(informationResponse?.data) ? informationResponse.data : [],
    [informationResponse],
  );
  const nextCursor = informationResponse?.pagination?.nextCursor;
  const hasNextPage = Boolean(informationResponse?.pagination?.hasNextPage);
  const isInitialLoading =
    (isLoading || isFetching) && !cursor && !isRefreshing && requests.length === 0;
  const requestFailed = informationResponse?.success === false || isError;

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  useEffect(() => {
    if (!informationResponse?.success) {
      return;
    }

    setRequests(current =>
      cursor ? mergeUniqueItems(current, responseItems) : responseItems,
    );
  }, [cursor, informationResponse?.success, responseItems]);

  useEffect(() => {
    if (isRefreshing && !isFetching && !cursor) {
      setIsRefreshing(false);
    }
  }, [cursor, isFetching, isRefreshing]);

  const handleFilterPress = filter => {
    if (filter.status === selectedFilter.status) {
      return;
    }

    setRequests([]);
    setCursor('');
    setSelectedFilter(filter);
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      if (cursor) {
        setCursor('');
      } else {
        const result = await refetch();
        const items = result?.data?.data;
        if (Array.isArray(items)) {
          setRequests(items);
        }
      }
    } catch {
      // ignore
    } finally {
      if (!cursor) {
        setIsRefreshing(false);
      }
    }
  }, [cursor, refetch]);

  const handleLoadMore = useCallback(() => {
    if (!isFetching && hasNextPage && nextCursor) {
      setCursor(nextCursor);
    }
  }, [hasNextPage, isFetching, nextCursor]);

  const renderItem = ({ item }) => {
    const direction = item?.type === 'received' ? 'received' : 'sent';
    const counterparty =
      direction === 'received' ? item?.senderId : item?.receiverId;

    return (
      <InformationCard
        name={counterparty?.name}
        profile={counterparty?.profile}
        service={item?.serviceId?.name}
        location={counterparty?.address ?? item?.client?.address}
        direction={direction}
        onPress={() =>
          navigation.navigate('InformationDetails', { information: item })
        }
      />
    );
  };

  const listHeader = (
    <>
      <AppHeader
        variant="left"
        showBack
        title="Information"
        onLeftPress={() => navigation.navigate('Home')}
        containerStyle={styles.header}
        leftButtonStyle={styles.headerBackButton}
        titleWrapStyle={styles.headerTitleWrap}
        titleStyle={styles.headerTitle}
        backIconSize={responsiveFontSize(2.5)}
        rightButtonStyle={styles.createButtonWrap}
        rightContent={
          <AppButton
            title="Create New"
            variant="gradient"
            gradientColors={AppColors.appGradient}
            onPress={() => navigation.navigate('Regions')}
            style={styles.createButton}
            contentStyle={styles.createButtonContent}
            textStyle={styles.createButtonText}
          />
        }
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
        contentContainerStyle={styles.filterScrollContent}>
        {filters.map(filter => {
          const isSelected = filter.status === selectedFilter.status;

          return (
            <AppButton
              key={`${filter.status}-${isSelected ? 'active' : 'inactive'}`}
              title={filter.label}
              onPress={() => handleFilterPress(filter)}
              bordered={!isSelected}
              borderColor={AppColors.appThemeBlue}
              variant="solid"
              textColor={
                isSelected ? AppColors.white : AppColors.introTabInactiveText
              }
              style={[
                styles.filterButton,
                isSelected
                  ? styles.activeFilterButton
                  : styles.inactiveFilterButton,
              ]}
              contentStyle={styles.filterContent}
              textStyle={[
                styles.filterText,
                {
                  color: isSelected
                    ? AppColors.white
                    : AppColors.introTabInactiveText,
                },
              ]}
            />
          );
        })}
      </ScrollView>
    </>
  );

  const listEmpty = isInitialLoading ? (
    <InformationCardsSkeleton count={3} />
  ) : requestFailed ? (
    <EmptyState
      title="Unable to Load Information"
      message={
        informationResponse?.message ||
        error?.data?.message ||
        'Please try again in a moment.'
      }
      iconName="alert-circle"
      style={styles.emptyState}
    />
  ) : (
    <EmptyState
      title={selectedFilter.emptyTitle}
      message={selectedFilter.emptyMessage}
      iconName="inbox"
      style={styles.emptyState}
    />
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={requests}
        keyExtractor={item => `${item?._id ?? item?.id}`}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={
          isFetching && requests.length ? (
            <ActivityIndicator
              color={AppColors.appThemeBlue}
              style={styles.footerLoader}
            />
          ) : null
        }
        ItemSeparatorComponent={InformationSeparator}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.35}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={AppColors.appThemeBlue}
            colors={[AppColors.appThemeBlue]}
            progressBackgroundColor={AppColors.white}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppColors.appBgColor,
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: responsiveHeight(2),
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
  createButtonWrap: {
    marginLeft: responsiveWidth(2),
  },
  createButton: {
    width: responsiveWidth(23.5),
    minHeight: responsiveHeight(3.65),
    height: responsiveHeight(3.65),
    borderRadius: responsiveWidth(2),
  },
  createButtonContent: {
    gap: 0,
  },
  createButtonText: {
    fontSize: responsiveFontSize(1.35),
  },
  filterScrollView: {
    marginHorizontal: -responsiveWidth(5.6),
    marginTop: responsiveHeight(1.6),
    marginBottom: responsiveHeight(2),
  },
  filterScrollContent: {
    paddingHorizontal: responsiveWidth(5.6),
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveWidth(1.6),
  },
  filterButton: {
    width: 'auto',
    minHeight: responsiveHeight(3.65),
    height: responsiveHeight(3.65),
    borderRadius: responsiveWidth(2),
    paddingHorizontal: responsiveWidth(2.5),
  },
  activeFilterButton: {
    backgroundColor: AppColors.appThemeBlue,
  },
  inactiveFilterButton: {
    backgroundColor: 'transparent',
  },
  filterContent: {
    gap: 0,
  },
  filterText: {
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(1.35),
  },
  separator: {
    height: responsiveHeight(1.5),
  },
  emptyState: {
    marginTop: responsiveHeight(1),
  },
  footerLoader: {
    marginVertical: responsiveHeight(2),
  },
});

export default InformationScreen;
