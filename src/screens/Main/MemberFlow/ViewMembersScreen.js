import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';
import {
  AppHeader,
  AppInput,
  AppText,
  EmptyState,
  MemberCardsSkeleton,
  UserAvatar,
} from '../../../component/Index';
import { useGetMembersQuery } from '../../../redux/Services/authApi';
import { AppColors } from '../../../utils/AppColors';
import { FontFamily } from '../../../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils/Responsive_Dimensions';
import { useSafeAreaColor } from '../../../utils/useSafeAreaColor';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const getMemberId = member => member?._id ?? member?.id;

const mergeUniqueItems = (current, incoming) => {
  const items = new Map(current.map(item => [getMemberId(item), item]));

  incoming.forEach(item => items.set(getMemberId(item), item));
  return Array.from(items.values());
};

const MemberContextRow = ({ icon, value }) => (
  <View style={styles.contextRow}>
    <Feather
      name={icon}
      color={AppColors.themeTxt2}
      size={responsiveFontSize(1.35)}
    />
    <AppText numberOfLines={1} style={styles.contextText}>
      {value || 'Not available'}
    </AppText>
  </View>
);

const MemberDetail = ({ icon, label, value }) => (
  <View style={styles.detailItem}>
    <Feather
      name={icon}
      color={AppColors.appThemeBlue}
      size={responsiveFontSize(1.7)}
    />
    <View style={styles.detailCopy}>
      <AppText style={styles.detailLabel}>{label}</AppText>
      <AppText numberOfLines={1} style={styles.detailValue}>
        {value || 'Not available'}
      </AppText>
    </View>
  </View>
);

const MemberCard = ({ member, expanded, onToggle, onSelect }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withTiming(expanded ? 1 : 0, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
  }, [expanded, rotation]);

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(rotation.value, [0, 1], [0, 180])}deg` },
    ],
  }));

  return (
    <AnimatedTouchable
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={`Select ${member?.name || 'member'}`}
      onPress={onSelect}
      layout={LinearTransition.duration(300).easing(Easing.out(Easing.ease))}
      style={styles.memberCard}>
      <View style={styles.memberTopRow}>
        <View style={styles.memberSelectArea}>
          <View style={styles.avatarWrap}>
            <UserAvatar uri={member?.profile} style={styles.avatar} />
          </View>
          <View style={styles.memberInfo}>
            <AppText numberOfLines={1} style={styles.memberName}>
              {member?.name || 'MRN Member'}
            </AppText>
            <MemberContextRow
              icon="briefcase"
              value={member?.serviceId?.name}
            />
            <MemberContextRow
              icon="clock"
              value={`${member?.yearsOfExperience ?? 0} years experience`}
            />
          </View>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={
            expanded ? 'Hide member details' : 'Show member details'
          }
          onPress={e => {
            e.stopPropagation();
            onToggle();
          }}
          style={[styles.expandButton, expanded && styles.expandButtonActive]}>
          <Animated.View style={arrowStyle}>
            <Feather
              name="chevron-down"
              color={expanded ? AppColors.white : AppColors.appThemeBlue}
              size={responsiveFontSize(1.7)}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {expanded ? (
        <Animated.View
          entering={FadeIn.duration(250).easing(Easing.out(Easing.ease))}
          exiting={FadeOut.duration(150)}>
          <View style={styles.aboutBlock}>
            <AppText style={styles.aboutLabel}>About</AppText>
            <AppText numberOfLines={2} style={styles.aboutText}>
              {member?.about || 'No information has been added yet.'}
            </AppText>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.detailsRow}>
            <MemberDetail
              icon="share-2"
              label="Network"
              value={member?.networkId?.name}
            />
            <View style={styles.detailDivider} />
            <MemberDetail
              icon="map"
              label="Region"
              value={member?.networkId?.regionId?.name}
            />
          </View>

          <View style={styles.expandedSection}>
            <MemberContextRow icon="phone" value={member?.phone} />
            <MemberContextRow icon="map-pin" value={member?.address} />
          </View>
        </Animated.View>
      ) : null}
    </AnimatedTouchable>
  );
};

const MemberSeparator = () => <View style={styles.separator} />;

const ViewMembersScreen = ({ navigation, setSafeAreaColor }) => {
  const [searchText, setSearchText] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [cursor, setCursor] = useState('');
  const [members, setMembers] = useState([]);
  const [expandedMemberId, setExpandedMemberId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    currentData: membersResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetMembersQuery({
    networkId: '',
    serviceId: '',
    search: memberSearch,
    cursor,
    limit: 10,
  });
  const responseMembers = useMemo(
    () => (Array.isArray(membersResponse?.data) ? membersResponse.data : []),
    [membersResponse],
  );
  const hasNextPage = Boolean(membersResponse?.pagination?.hasNextPage);
  const nextCursor =
    membersResponse?.pagination?.nextCursor ??
    responseMembers.at(-1)?._id ??
    responseMembers.at(-1)?.id;
  const isInitialLoading =
    (isLoading || isFetching) && !cursor && members.length === 0;
  const requestFailed = membersResponse?.success === false || isError;

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  useEffect(() => {
    const trimmedSearch = searchText.trim();

    if (trimmedSearch.length < 3) {
      if (memberSearch) {
        setMembers([]);
        setCursor('');
        setMemberSearch('');
      }

      return undefined;
    }

    const debounceTimer = setTimeout(() => {
      if (trimmedSearch !== memberSearch) {
        setMembers([]);
        setCursor('');
        setMemberSearch(trimmedSearch);
      }
    }, 400);

    return () => clearTimeout(debounceTimer);
  }, [memberSearch, searchText]);

  useEffect(() => {
    if (!membersResponse?.success) {
      return;
    }

    setMembers(current =>
      cursor ? mergeUniqueItems(current, responseMembers) : responseMembers,
    );
  }, [cursor, membersResponse?.success, responseMembers]);

  useEffect(() => {
    if (isRefreshing && !isFetching && !cursor) {
      setIsRefreshing(false);
    }
  }, [cursor, isFetching, isRefreshing]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setMembers([]);
    setExpandedMemberId(null);

    if (cursor) {
      setCursor('');
    } else {
      refetch();
    }
  }, [cursor, refetch]);

  const handleLoadMore = useCallback(() => {
    if (!isFetching && hasNextPage && nextCursor) {
      setCursor(current => (current === nextCursor ? current : nextCursor));
    }
  }, [hasNextPage, isFetching, nextCursor]);

  const handleSelectMember = member => {
    const receiverId = getMemberId(member);
    const networkId = member?.networkId?._id ?? member?.networkId?.id;
    const serviceId = member?.serviceId?._id ?? member?.serviceId?.id;

    if (!receiverId || !networkId || !serviceId) {
      return;
    }

    navigation.navigate('AddClientDetails', {
      flowType: 'introduction',
      member,
      receiverId,
      networkId,
      serviceId,
    });
  };

  const listHeader = (
    <>
      <AppHeader
        variant="left"
        showBack
        title="Select Member"
        onLeftPress={() => navigation.goBack()}
        containerStyle={styles.header}
        leftButtonStyle={styles.headerBackButton}
        titleWrapStyle={styles.headerTitleWrap}
        titleStyle={styles.headerTitle}
        backIconColor={AppColors.appThemeBlue}
        backIconSize={responsiveFontSize(2.5)}
      />
      <AppInput
        type="search"
        iconName="search"
        iconColor="#777777"
        placeholder="Search Members"
        placeholderTextColor="#777777"
        containerStyle={styles.searchBox}
        value={searchText}
        onChangeText={setSearchText}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      <AppText style={styles.sectionTitle}>Recommended</AppText>
    </>
  );

  const listEmpty = isInitialLoading ? (
    <MemberCardsSkeleton count={4} />
  ) : requestFailed ? (
    <EmptyState
      title="Unable to Load Members"
      message={
        membersResponse?.message ||
        error?.data?.message ||
        'Please try again in a moment.'
      }
      iconName="alert-circle"
      style={styles.emptyState}
    />
  ) : (
    <EmptyState
      title="No Members Found"
      message={
        memberSearch
          ? `No members found for "${memberSearch}".`
          : 'No approved members are available yet.'
      }
      iconName="users"
      style={styles.emptyState}
    />
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={members}
        keyExtractor={item => `${getMemberId(item)}`}
        renderItem={({ item }) => (
          <MemberCard
            member={item}
            expanded={expandedMemberId === getMemberId(item)}
            onToggle={() =>
              setExpandedMemberId(currentId =>
                currentId === getMemberId(item) ? null : getMemberId(item),
              )
            }
            onSelect={() => handleSelectMember(item)}
          />
        )}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={
          isFetching && members.length ? (
            <ActivityIndicator
              color={AppColors.appThemeBlue}
              style={styles.footerLoader}
            />
          ) : null
        }
        ItemSeparatorComponent={MemberSeparator}
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
    paddingHorizontal: responsiveWidth(5.6),
    paddingBottom: responsiveHeight(5),
  },
  header: {
    minHeight: responsiveHeight(4.4),
    paddingHorizontal: 0,
    marginTop: responsiveHeight(1),
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
    fontSize: responsiveFontSize(2.05),
  },
  searchBox: {
    marginTop: responsiveHeight(2.5),
  },
  sectionTitle: {
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(1.3),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.semiBold,
    fontSize: responsiveFontSize(1.75),
  },
  memberCard: {
    borderRadius: responsiveWidth(2.1),
    backgroundColor: '#A9C8F6',
    borderWidth: 1,
    borderColor: '#8CB1E3',
    paddingHorizontal: responsiveWidth(3.4),
    paddingTop: responsiveHeight(1.35),
    paddingBottom: responsiveHeight(1.15),
  },
  memberTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberSelectArea: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: responsiveWidth(13.4),
    height: responsiveWidth(13.4),
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: responsiveWidth(6.7),
  },
  memberInfo: {
    flex: 1,
    marginLeft: responsiveWidth(3),
    paddingRight: responsiveWidth(1.5),
  },
  memberName: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.85),
    lineHeight: responsiveFontSize(2.3),
    marginBottom: responsiveHeight(0.35),
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: responsiveHeight(1.8),
    marginTop: responsiveHeight(0.15),
  },
  contextText: {
    flex: 1,
    marginLeft: responsiveWidth(1),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(1.25),
    lineHeight: responsiveFontSize(1.65),
  },
  expandButton: {
    width: responsiveWidth(6),
    height: responsiveWidth(6),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.appThemeBlue,
    borderRadius: responsiveWidth(3),
    backgroundColor: 'transparent',
  },
  expandButtonActive: {
    backgroundColor: AppColors.appThemeBlue,
  },
  aboutBlock: {
    marginTop: responsiveHeight(1.1),
  },
  aboutLabel: {
    color: AppColors.bodyText,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(1.05),
    lineHeight: responsiveFontSize(1.4),
  },
  aboutText: {
    marginTop: responsiveHeight(0.25),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.25),
    lineHeight: responsiveFontSize(1.7),
  },
  cardDivider: {
    height: 1,
    marginTop: responsiveHeight(1.05),
    marginBottom: responsiveHeight(1),
    backgroundColor: '#86ABDC',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: responsiveWidth(1.7),
  },
  detailLabel: {
    color: AppColors.bodyText,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.05),
    lineHeight: responsiveFontSize(1.35),
  },
  detailValue: {
    marginTop: responsiveHeight(0.1),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.semiBold,
    fontSize: responsiveFontSize(1.3),
    lineHeight: responsiveFontSize(1.65),
  },
  detailDivider: {
    width: 1,
    height: responsiveHeight(3.8),
    marginHorizontal: responsiveWidth(3),
    backgroundColor: '#86ABDC',
  },
  expandedSection: {
    marginTop: responsiveHeight(1.05),
    paddingTop: responsiveHeight(0.8),
    borderTopWidth: 1,
    borderTopColor: '#86ABDC',
    gap: responsiveHeight(0.2),
  },
  separator: {
    height: responsiveHeight(1.4),
  },
  emptyState: {
    marginTop: 0,
  },
  footerLoader: {
    marginVertical: responsiveHeight(2),
  },
});

export default ViewMembersScreen;
