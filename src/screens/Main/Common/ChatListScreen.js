import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Feather from '@react-native-vector-icons/feather';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppHeader,
  AppInput,
  AppText,
  UserAvatar,
  Wrapper,
} from '../../../component/Index';
import { useGetChatsQuery } from '../../../redux/Services/authApi';
import {
  setChats,
  updateChatUserStatus,
  upsertChat,
} from '../../../redux/slices/chatSlice';
import { AppColors } from '../../../utils/AppColors';
import {
  getChatId,
  getChatUnreadCount,
  getMediaUrl,
  getOtherParticipant,
  getParticipantAccountId,
  getParticipantProfile,
} from '../../../utils/chat';
import { FontFamily } from '../../../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils/Responsive_Dimensions';
import { SOCKET_EVENTS, socketService } from '../../../utils/socket';
import { useSafeAreaColor } from '../../../utils/useSafeAreaColor';

const CARD_BG = '#ADC9F5';

const formatChatTime = value => {
  if (!value || !moment(value).isValid()) {
    return '';
  }

  const date = moment(value);

  if (date.isSame(moment(), 'day')) {
    return date.format('h:mm a');
  }

  if (date.isSame(moment().subtract(1, 'day'), 'day')) {
    return 'Yesterday';
  }

  return date.format('DD MMM');
};

const safeText = value => {
  if (typeof value === 'string') {
    return value.toLowerCase();
  }
  if (typeof value === 'number') {
    return String(value).toLowerCase();
  }
  if (value && typeof value === 'object') {
    if (typeof value.name === 'string') {
      return value.name.toLowerCase();
    }
    if (typeof value.title === 'string') {
      return value.title.toLowerCase();
    }
    if (typeof value.role === 'string') {
      return value.role.toLowerCase();
    }
  }
  return '';
};

const ChatListScreen = ({ navigation, setSafeAreaColor }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const chats = useSelector(state => state.chat.chats);
  const hasLoadedChats = useSelector(state => state.chat.hasLoadedChats);
  const [searchText, setSearchText] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    data: chatsResponse,
    isLoading,
    isError,
    refetch,
  } = useGetChatsQuery(undefined, { refetchOnMountOrArgChange: true });

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  useEffect(() => {
    if (Array.isArray(chatsResponse?.data)) {
      dispatch(setChats(chatsResponse.data));
    }
  }, [chatsResponse, dispatch]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  useEffect(() => {
    const handleInbox = updatedChat => {
      dispatch(upsertChat(updatedChat));
    };
    const handleConnect = () => refetch();
    const handleUserStatus = payload =>
      dispatch(updateChatUserStatus(payload));

    socketService.on(SOCKET_EVENTS.CONNECT, handleConnect);
    socketService.on(SOCKET_EVENTS.INBOX, handleInbox);
    socketService.on(SOCKET_EVENTS.USER_STATUS, handleUserStatus);

    return () => {
      socketService.off(SOCKET_EVENTS.CONNECT, handleConnect);
      socketService.off(SOCKET_EVENTS.INBOX, handleInbox);
      socketService.off(SOCKET_EVENTS.USER_STATUS, handleUserStatus);
    };
  }, [dispatch, refetch]);

  const conversationItems = useMemo(
    () =>
      chats
        .filter(chat => {
          const lastMessage = chat.lastMessage;
          const hasText = Boolean(lastMessage?.message?.trim?.());
          const hasAttachment = Boolean(lastMessage?.attachments?.length);

          return hasText || hasAttachment;
        })
        .map(chat => {
          const participant = getOtherParticipant(chat, user);
          const profile = getParticipantProfile(participant);
          const lastMessage = chat.lastMessage;
          const attachmentCount = lastMessage?.attachments?.length ?? 0;

          return {
            avatar: getMediaUrl(profile.profile),
            chat,
            id: getChatId(chat),
            lastMessage:
              lastMessage?.message ||
              (attachmentCount ? 'Attachment' : ''),
            name: profile.name || 'MRN User',
            online: Boolean(profile.isOnline ?? profile.userId?.isOnline),
            participant,
            role:
              typeof profile.role === 'string'
                ? profile.role
                : typeof profile.role?.name === 'string'
                ? profile.role.name
                : typeof participant?.userModel === 'string'
                ? participant.userModel
                : '',
            time: formatChatTime(lastMessage?.createdAt ?? chat.updatedAt),
            unreadCount: getChatUnreadCount(chat, user),
          };
        }),
    [chats, user],
  );

  const filteredConversations = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return conversationItems;
    }

    return conversationItems.filter(item => {
      const name = safeText(item?.name);
      const lastMessage = safeText(item?.lastMessage);
      const role = safeText(item?.role);

      return (
        name.includes(query) ||
        lastMessage.includes(query) ||
        role.includes(query)
      );
    });
  }, [conversationItems, searchText]);

  const handleOpenChat = item => {
    const profile = getParticipantProfile(item.participant);

    navigation.navigate('Chat', {
      chat: item.chat,
      chatId: item.id,
      name: item.name,
      recipient: profile,
      recipientAccountId: getParticipantAccountId(item.participant),
      recipientId: profile._id ?? profile.id,
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const showInitialLoader = isLoading && !hasLoadedChats && !chats.length;
  const hasApiError = isError || chatsResponse?.success === false;
  const showEmptyState = !showInitialLoader && !filteredConversations.length;

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
        title="Chats"
        onLeftPress={() => navigation.goBack()}
        containerStyle={styles.header}
        titleStyle={styles.headerTitle}
      />

      <View style={styles.searchWrap}>
        <AppInput
          type="search"
          placeholder="Search conversations..."
          value={searchText}
          onChangeText={setSearchText}
          iconName="search"
          iconColor={AppColors.themeTxt2}
          containerStyle={styles.searchInputContainer}
          inputContainerStyle={styles.searchInputBox}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      {showInitialLoader ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={AppColors.appThemeBlue} />
        </View>
      ) : showEmptyState ? (
        <View style={styles.centerState}>
          <Feather
            name={hasApiError ? 'wifi-off' : 'message-square'}
            size={responsiveFontSize(4.5)}
            color={AppColors.themeTxt2}
          />
          <AppText style={styles.emptyTitle}>
            {hasApiError
              ? 'Unable to Load Chats'
              : searchText
              ? 'No Conversations Found'
              : 'No Chats Yet'}
          </AppText>
          <AppText style={styles.emptySubtitle}>
            {hasApiError
              ? chatsResponse?.message ||
                'Pull down to try loading your conversations again.'
              : searchText
              ? `No messages matching "${searchText}".`
              : 'Your conversations will appear here after you send or receive a message.'}
          </AppText>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {filteredConversations.map(item => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.82}
              onPress={() => handleOpenChat(item)}
              style={styles.chatCard}>
              <View style={styles.avatarWrap}>
                <UserAvatar
                  uri={item.avatar}
                  size={responsiveWidth(13)}
                  style={styles.avatar}
                />
                {item.online && <View style={styles.onlineDot} />}
              </View>

              <View style={styles.chatInfo}>
                <View style={styles.topRow}>
                  <AppText numberOfLines={1} style={styles.nameText}>
                    {item.name}
                  </AppText>
                  <AppText style={styles.timeText}>{item.time}</AppText>
                </View>
                <View style={styles.bottomRow}>
                  <AppText
                    numberOfLines={1}
                    style={[
                      styles.lastMessageText,
                      item.unreadCount > 0 && styles.unreadMessageText,
                    ]}>
                    {item.lastMessage}
                  </AppText>
                  {item.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <AppText style={styles.unreadCount}>
                        {item.unreadCount > 99 ? '99+' : item.unreadCount}
                      </AppText>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
    marginBottom: responsiveHeight(1),
  },
  headerTitle: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(2.4),
  },
  searchWrap: {
    marginBottom: responsiveHeight(1.5),
  },
  searchInputContainer: {
    marginVertical: 0,
  },
  searchInputBox: {
    height: responsiveHeight(5.5),
    borderWidth: 1,
    borderColor: 'rgba(1, 56, 120, 0.25)',
    borderRadius: responsiveWidth(3),
    backgroundColor: CARD_BG,
  },
  listContainer: {
    gap: responsiveHeight(1.4),
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: responsiveWidth(3.5),
    borderWidth: responsiveWidth(0.22),
    borderColor: 'rgba(1, 56, 120, 0.22)',
    borderRadius: responsiveWidth(3.5),
    backgroundColor: CARD_BG,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    borderWidth: 1.5,
    borderColor: AppColors.white,
  },
  onlineDot: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: responsiveWidth(3),
    height: responsiveWidth(3),
    borderWidth: 1.5,
    borderColor: AppColors.white,
    borderRadius: responsiveWidth(1.5),
    backgroundColor: '#34C759',
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: responsiveWidth(3.5),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: responsiveHeight(0.3),
  },
  nameText: {
    flex: 1,
    marginRight: responsiveWidth(2),
    color: AppColors.themeTxt2,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.75),
  },
  timeText: {
    color: '#4B6F96',
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(1.2),
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessageText: {
    flex: 1,
    marginRight: responsiveWidth(2),
    color: AppColors.bodyText,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.35),
  },
  unreadMessageText: {
    color: AppColors.themeTxt2,
    fontFamily: FontFamily.semiBold,
  },
  unreadBadge: {
    minWidth: responsiveWidth(4.8),
    height: responsiveWidth(4.8),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: responsiveWidth(1.2),
    borderRadius: responsiveWidth(2.4),
    backgroundColor: AppColors.appThemeBlue,
  },
  unreadCount: {
    color: AppColors.white,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.1),
  },
  centerState: {
    minHeight: responsiveHeight(35),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: responsiveWidth(6),
  },
  emptyTitle: {
    marginTop: responsiveHeight(2),
    color: AppColors.themeTxt2,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.8),
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: responsiveHeight(0.8),
    color: AppColors.bodyText,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.4),
    lineHeight: responsiveFontSize(2),
    textAlign: 'center',
  },
});

export default ChatListScreen;
