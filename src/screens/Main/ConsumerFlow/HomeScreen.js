import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { useSelector } from 'react-redux';
import {
  AppButton,
  AppHeader,
  AppInput,
  AppText,
  NetworkCard,
  NetworkCardsSkeleton,
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
import { useSafeAreaColor } from '../../../utils/useSafeAreaColor';
import { useGetRegionsQuery } from '../../../redux/Services/authApi';

const mergeUniqueItems = (current, incoming) => {
  const items = new Map(current.map(item => [item?._id ?? item?.id, item]));

  incoming.forEach(item => items.set(item?._id ?? item?.id, item));
  return Array.from(items.values());
};

const HomeScreen = ({ navigation, route, setSafeAreaColor }) => {
  const user = useSelector(state => state.auth.user);
  const [searchText, setSearchText] = useState('');
  const [regionSearch, setRegionSearch] = useState('');
  const [cursor, setCursor] = useState('');
  const [regions, setRegions] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    data: regionsResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetRegionsQuery({ search: regionSearch, cursor, limit: 10 });
  const responseRegions = useMemo(
    () => (Array.isArray(regionsResponse?.data) ? regionsResponse.data : []),
    [regionsResponse],
  );
  const hasNextPage = Boolean(regionsResponse?.pagination?.hasNextPage);
  const nextCursor = regionsResponse?.pagination?.nextCursor;
  const isStandalone = route?.name === 'Regions';

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  useEffect(() => {
    const trimmedSearch = searchText.trim();

    if (trimmedSearch.length < 3) {
      if (regionSearch) {
        setRegions([]);
        setCursor('');
        setRegionSearch('');
      }

      return undefined;
    }

    const debounceTimer = setTimeout(() => {
      if (trimmedSearch !== regionSearch) {
        setRegions([]);
        setCursor('');
        setRegionSearch(trimmedSearch);
      }
    }, 400);

    return () => clearTimeout(debounceTimer);
  }, [regionSearch, searchText]);

  useEffect(() => {
    if (!regionsResponse?.success) {
      return;
    }

    setRegions(current =>
      cursor ? mergeUniqueItems(current, responseRegions) : responseRegions,
    );
  }, [cursor, regionsResponse?.success, responseRegions]);

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      if (cursor) {
        setRegions([]);
        setCursor('');
      } else {
        await refetch();
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const emptyMessage = regionSearch
    ? `No regions found for "${regionSearch}".`
    : regionsResponse?.message ||
      error?.data?.message ||
      'No active regions are available yet.';
  const showSkeleton =
    isLoading || (isFetching && !isRefreshing && !cursor && !regions.length);

  return (
    <Wrapper
      isScroll
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      backgroundColor={AppColors.appBgColor}
      contentContainerStyle={styles.container}>
      <AppHeader
        variant="left"
        showBack={isStandalone}
        title={isStandalone ? 'Select Region' : user?.name || 'MRN User'}
        subtitle={isStandalone ? undefined : 'Good Morning'}
        subtitleFirst={!isStandalone}
        onLeftPress={isStandalone ? () => navigation.goBack() : undefined}
        containerStyle={styles.header}
        leftButtonStyle={isStandalone ? styles.backButton : styles.avatarButton}
        titleWrapStyle={styles.headerTitleWrap}
        titleStyle={styles.name}
        subtitleStyle={styles.greeting}
        leftIcon={
          isStandalone ? undefined : (
            <UserAvatar uri={user?.profile} style={styles.avatar} />
          )
        }
        rightContent={
          isStandalone ? undefined : (
            <View style={styles.headerActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Open chats"
                onPress={() => navigation.navigate('ChatList')}
                style={styles.headerActionButton}>
                <Feather
                  name="message-circle"
                  color={AppColors.appThemeBlue}
                  size={responsiveWidth(5.4)}
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Open notifications"
                onPress={() => navigation.navigate('NotificationList')}
                style={styles.headerActionButton}>
                <Feather
                  name="bell"
                  color={AppColors.appThemeBlue}
                  size={responsiveWidth(5.4)}
                />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
            </View>
          )
        }
      />

      <AppInput
        type="search"
        iconName="search"
        iconColor="#777777"
        placeholder="Search Regions"
        placeholderTextColor="#777777"
        containerStyle={styles.searchBox}
        value={searchText}
        onChangeText={setSearchText}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />

      <AppText style={styles.sectionTitle}>Select Region</AppText>

      {showSkeleton ? (
        <NetworkCardsSkeleton />
      ) : regions.length ? (
        <View style={styles.regionList}>
          {regions.map(region => (
            <NetworkCard
              key={region?._id ?? region?.id}
              title={region?.name}
              description={region?.description}
              onPress={() => navigation.navigate('SelectNetworks', { region })}
            />
          ))}

          {hasNextPage && nextCursor ? (
            <AppButton
              title="Load More"
              onPress={() => setCursor(nextCursor)}
              loading={isFetching && Boolean(cursor)}
              disabled={isFetching}
              style={styles.loadMoreButton}
            />
          ) : null}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <AppText style={styles.emptyTitle}>
            {isError ? 'Unable to load regions' : 'No Regions Found'}
          </AppText>
          <AppText style={styles.emptyMessage}>{emptyMessage}</AppText>
        </View>
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.appBgColor,
    paddingHorizontal: responsiveWidth(5.8),
    paddingBottom: responsiveHeight(12),
  },
  header: {
    minHeight: responsiveWidth(13),
    paddingHorizontal: 0,
  },
  avatar: {
    width: responsiveWidth(13),
    height: responsiveWidth(13),
    borderRadius: responsiveWidth(6.5),
  },
  avatarButton: {
    width: responsiveWidth(13),
    height: responsiveWidth(13),
    marginRight: responsiveWidth(2.9),
  },
  backButton: {
    width: responsiveWidth(6.4),
    height: responsiveWidth(6.4),
    marginRight: responsiveWidth(1.7),
  },
  headerTitleWrap: {
    paddingHorizontal: 0,
  },
  greeting: {
    color: '#75859B',
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.3),
  },
  name: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.8),
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveWidth(2.2),
  },
  headerActionButton: {
    width: responsiveWidth(11),
    height: responsiveWidth(11),
    borderRadius: responsiveWidth(5.5),
    borderWidth: 1,
    borderColor: AppColors.appThemeBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: responsiveWidth(2.2),
    right: responsiveWidth(2.7),
    width: responsiveWidth(1.9),
    height: responsiveWidth(1.9),
    borderRadius: responsiveWidth(0.95),
    backgroundColor: '#FF4A55',
    borderWidth: 1,
    borderColor: AppColors.appBgColor,
  },
  searchBox: {
    marginTop: responsiveHeight(3),
  },
  sectionTitle: {
    marginTop: responsiveHeight(2.3),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.semiBold,
    fontSize: responsiveFontSize(2),
  },
  regionList: {
    marginTop: responsiveHeight(1.5),
    gap: responsiveHeight(1.4),
  },
  loadMoreButton: {
    minHeight: responsiveHeight(5),
    marginTop: responsiveHeight(0.6),
  },
  emptyCard: {
    minHeight: responsiveHeight(13),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.themeTxt2,
    borderRadius: responsiveWidth(2.4),
    backgroundColor: '#ADC9F5',
    paddingHorizontal: responsiveWidth(5),
    marginTop: responsiveHeight(1.5),
  },
  emptyTitle: {
    color: AppColors.themeTxt2,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.9),
    textAlign: 'center',
  },
  emptyMessage: {
    marginTop: responsiveHeight(0.7),
    color: AppColors.bodyText,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.45),
    lineHeight: responsiveFontSize(1.9),
    textAlign: 'center',
  },
});

export default HomeScreen;
