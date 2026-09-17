import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  AppButton,
  AppHeader,
  AppInput,
  AppText,
  NetworkCard,
  NetworkCardsSkeleton,
  Wrapper,
} from '../../../component/Index';
import { AppColors } from '../../../utils/AppColors';
import { FontFamily } from '../../../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils/Responsive_Dimensions';
import { useGetUserNetworksQuery } from '../../../redux/Services/authApi';
import { useSafeAreaColor } from '../../../utils/useSafeAreaColor';

const mergeUniqueItems = (current, incoming) => {
  const items = new Map(current.map(item => [item?._id ?? item?.id, item]));

  incoming.forEach(item => items.set(item?._id ?? item?.id, item));
  return Array.from(items.values());
};

const SelectNetworksScreen = ({ navigation, route, setSafeAreaColor }) => {
  const region = route?.params?.region;
  const regionId = region?._id ?? region?.id;
  const [searchText, setSearchText] = useState('');
  const [networkSearch, setNetworkSearch] = useState('');
  const [cursor, setCursor] = useState('');
  const [networks, setNetworks] = useState([]);
  const {
    data: networksResponse,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetUserNetworksQuery(
    { regionId, search: networkSearch, cursor, limit: 10 },
    { skip: !regionId },
  );
  const responseNetworks = useMemo(
    () =>
      Array.isArray(networksResponse?.data) ? networksResponse.data : [],
    [networksResponse],
  );
  const hasNextPage = Boolean(networksResponse?.pagination?.hasNextPage);
  const nextCursor = networksResponse?.pagination?.nextCursor;

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  useEffect(() => {
    const trimmedSearch = searchText.trim();

    if (trimmedSearch.length < 3) {
      if (networkSearch) {
        setNetworks([]);
        setCursor('');
        setNetworkSearch('');
      }

      return undefined;
    }

    const debounceTimer = setTimeout(() => {
      if (trimmedSearch !== networkSearch) {
        setNetworks([]);
        setCursor('');
        setNetworkSearch(trimmedSearch);
      }
    }, 400);

    return () => clearTimeout(debounceTimer);
  }, [networkSearch, searchText]);

  useEffect(() => {
    if (!networksResponse?.success) {
      return;
    }

    setNetworks(current =>
      cursor ? mergeUniqueItems(current, responseNetworks) : responseNetworks,
    );
  }, [cursor, networksResponse?.success, responseNetworks]);

  const emptyMessage = networkSearch
    ? `No networks found for "${networkSearch}".`
    : networksResponse?.message ||
      error?.data?.message ||
      'No active networks are available in this region.';

  return (
    <Wrapper
      isScroll
      backgroundColor={AppColors.appBgColor}
      contentContainerStyle={styles.container}>
      <AppHeader
        variant="left"
        showBack
        title={region?.name || 'Select Network'}
        onLeftPress={() => navigation.goBack()}
        containerStyle={styles.header}
        titleStyle={styles.headerTitle}
      />

      <AppInput
        type="search"
        iconName="search"
        iconColor="#777777"
        placeholder="Search Networks"
        placeholderTextColor="#777777"
        containerStyle={styles.searchBox}
        value={searchText}
        onChangeText={setSearchText}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />

      <AppText style={styles.sectionTitle}>Select Network</AppText>

      {!regionId ? (
        <View style={styles.emptyCard}>
          <AppText style={styles.emptyTitle}>No Region Selected</AppText>
          <AppText style={styles.emptyMessage}>
            Please go back and select a region first.
          </AppText>
        </View>
      ) : isLoading || (isFetching && !cursor && !networks.length) ? (
        <NetworkCardsSkeleton />
      ) : networks.length ? (
        <View style={styles.networkList}>
          {networks.map(network => (
            <NetworkCard
              key={network?._id ?? network?.id}
              title={network?.name}
              description={network?.description}
              iconName="share-2"
              onPress={() =>
                navigation.navigate('SelectServices', { region, network })
              }
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
            {isError ? 'Unable to load networks' : 'No Networks Found'}
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
    paddingBottom: responsiveHeight(4),
  },
  header: {
    marginTop: responsiveHeight(1.1),
    paddingHorizontal: 0,
  },
  headerTitle: {
    color: AppColors.headerText,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(2),
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
  networkList: {
    marginTop: responsiveHeight(1.5),
    gap: responsiveHeight(1.4),
  },
  loadMoreButton: {
    minHeight: responsiveHeight(5),
    marginTop: responsiveHeight(0.6),
  },
  emptyCard: {
    minHeight: responsiveHeight(14),
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

export default SelectNetworksScreen;
