import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
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
import { useGetIntroductionsQuery } from '../../../redux/Services/authApi';
import {
  getIntroductionCounterparty,
  getIntroductionDirection,
} from '../../../utils/introduction';

const filters = [
  {
    label: 'Introductions',
    status: '',
    emptyTitle: 'No Introductions Yet',
    emptyMessage: 'New introductions will appear here when they are received.',
  },
  {
    label: 'Appointments',
    status: 'appointment',
    emptyTitle: 'No Appointments Yet',
    emptyMessage: 'Scheduled appointments will appear here.',
  },
  {
    label: 'Pending',
    status: 'pending',
    emptyTitle: 'Nothing Pending',
    emptyMessage: 'No pending appointments available yet.',
  },
  {
    label: 'Completed',
    status: 'completed',
    emptyTitle: 'No Completed Introductions',
    emptyMessage: 'Completed introductions will appear here.',
  },
];

const getIntroductionId = item => item?._id ?? item?.id;

const mergeUniqueItems = (current, incoming) => {
  const items = new Map(current.map(item => [getIntroductionId(item), item]));

  incoming.forEach(item => items.set(getIntroductionId(item), item));
  return Array.from(items.values());
};

const IntroductionSeparator = () => <View style={styles.separator} />;

const IntroductionsScreen = ({ navigation, setSafeAreaColor }) => {
  const user = useSelector(state => state.auth.user);
  const [selectedFilter, setSelectedFilter] = useState(filters[0]);
  const [cursor, setCursor] = useState('');
  const [introductions, setIntroductions] = useState([]);
  const {
    currentData: introductionsResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch: refetchIntroductions,
  } = useGetIntroductionsQuery(
    {
      status: selectedFilter.status,
      search: '',
      cursor,
      limit: 10,
    },
    { refetchOnMountOrArgChange: true },
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const responseItems = useMemo(
    () =>
      Array.isArray(introductionsResponse?.data)
        ? introductionsResponse.data
        : [],
    [introductionsResponse],
  );
  const nextCursor =
    introductionsResponse?.pagination?.nextCursor ??
    responseItems.at(-1)?._id ??
    responseItems.at(-1)?.id;
  const hasNextPage = Boolean(introductionsResponse?.pagination?.hasNextPage);
  const isInitialLoading =
    (isLoading || isFetching) &&
    !cursor &&
    !isRefreshing &&
    introductions.length === 0;
  const requestFailed = introductionsResponse?.success === false || isError;

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  useFocusEffect(
    useCallback(() => {
      refetchIntroductions();
    }, [refetchIntroductions]),
  );

  useEffect(() => {
    if (!introductionsResponse?.success) {
      return;
    }

    setIntroductions(current =>
      cursor ? mergeUniqueItems(current, responseItems) : responseItems,
    );
  }, [cursor, introductionsResponse?.success, responseItems]);

  useEffect(() => {
    if (isRefreshing && !isFetching && !cursor) {
      setIsRefreshing(false);
    }
  }, [cursor, isFetching, isRefreshing]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      if (cursor) {
        setCursor('');
      } else {
        const result = await refetchIntroductions();
        const items = result?.data?.data;
        if (Array.isArray(items)) {
          setIntroductions(items);
        }
      }
    } catch {
      // ignore
    } finally {
      if (!cursor) {
        setIsRefreshing(false);
      }
    }
  }, [cursor, refetchIntroductions]);

  const handleFilterPress = filter => {
    if (filter.status === selectedFilter.status) {
      return;
    }

    setIntroductions([]);
    setCursor('');
    setSelectedFilter(filter);
  };

  const handleLoadMore = useCallback(() => {
    if (!isFetching && hasNextPage && nextCursor) {
      setCursor(current => (current === nextCursor ? current : nextCursor));
    }
  }, [hasNextPage, isFetching, nextCursor]);

  const listHeader = (
    <>
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
        rightButtonStyle={styles.createButtonWrap}
        rightContent={
          <AppButton
            title="Create New"
            variant="gradient"
            gradientColors={AppColors.appGradient}
            onPress={() => navigation.navigate('ViewMembers')}
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
          const isSelected = selectedFilter.status === filter.status;

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
                isSelected ? styles.filterButtonActive : styles.filterButtonIdle,
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

  const renderItem = ({ item }) => {
    const counterparty = getIntroductionCounterparty(item, user);
    const direction = getIntroductionDirection(item, user);

    return (
      <InformationCard
        name={counterparty?.name}
        profile={counterparty?.profile}
        service={item?.serviceId?.name}
        location={counterparty?.address}
        direction={direction}
        onPress={() =>
          navigation.navigate('IntroductionDetails', {
            introduction: item,
          })
        }
      />
    );
  };

  const listEmpty = isInitialLoading ? (
    <InformationCardsSkeleton count={3} />
  ) : requestFailed ? (
    <EmptyState
      title="Unable to Load Introductions"
      message={
        introductionsResponse?.message ||
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
        data={introductions}
        keyExtractor={item => `${getIntroductionId(item)}`}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={
          isFetching && introductions.length ? (
            <ActivityIndicator
              color={AppColors.appThemeBlue}
              style={styles.footerLoader}
            />
          ) : null
        }
        ItemSeparatorComponent={IntroductionSeparator}
        contentContainerStyle={styles.container}
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
  container: {
    flexGrow: 1,
    backgroundColor: AppColors.appBgColor,
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
    alignSelf: 'flex-start',
    flexGrow: 0,
    flexShrink: 0,
    minHeight: responsiveHeight(3.65),
    height: responsiveHeight(3.65),
    borderRadius: responsiveWidth(2),
    paddingHorizontal: responsiveWidth(2.5),
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
    fontSize: responsiveFontSize(1.35),
  },
  separator: {
    height: responsiveHeight(1.85),
  },
  emptyState: {
    marginTop: 0,
  },
  footerLoader: {
    marginVertical: responsiveHeight(2),
  },
});

export default IntroductionsScreen;
