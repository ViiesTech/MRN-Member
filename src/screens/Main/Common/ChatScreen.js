import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Feather from '@react-native-vector-icons/feather';
import FastImage from 'react-native-fast-image';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { AppHeader, AppInput, AppText } from '../../../component/Index';
import {
  useGetChatsQuery,
  useLazyGetChatMessagesQuery,
  useSendChatMessageMutation,
} from '../../../redux/Services/authApi';
import {
  addPendingMessage,
  failPendingMessage,
  markChatMessagesSeen,
  receiveMessage,
  resolvePendingMessage,
  setChatMessages,
  setChats,
  upsertChat,
} from '../../../redux/slices/chatSlice';
import { AppColors } from '../../../utils/AppColors';
import { getApiErrorMessage } from '../../../utils/apiError';
import {
  getChatId,
  getMediaUrl,
  getMessageId,
  getOtherParticipant,
  getParticipantAccountId,
  getParticipantProfile,
  isMessageMine,
} from '../../../utils/chat';
import { FontFamily } from '../../../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils/Responsive_Dimensions';
import { SOCKET_EVENTS, socketService } from '../../../utils/socket';
import { showToast } from '../../../utils/Toast';
import { useSafeAreaColor } from '../../../utils/useSafeAreaColor';

const COMPOSER_BG = '#343434';
const PAGE_SIZE = 20;

const ChatScreen = ({ navigation, route, setSafeAreaColor }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const insets = useSafeAreaInsets();
  const routeChat = route?.params?.chat;
  const requestedChatId = route?.params?.chatId ?? getChatId(routeChat);
  const cachedChat = useSelector(state =>
    state.chat.chats.find(chat => `${getChatId(chat)}` === `${requestedChatId}`),
  );
  const { data: chatsResponse } = useGetChatsQuery(undefined, {
    skip: Boolean(routeChat || cachedChat),
  });
  const fetchedChat = chatsResponse?.data?.find(
    chat => `${getChatId(chat)}` === `${requestedChatId}`,
  );
  const resolvedChat = routeChat ?? cachedChat ?? fetchedChat;
  const chatId = requestedChatId ?? getChatId(resolvedChat);
  const routeParticipant = useMemo(
    () => getOtherParticipant(resolvedChat, user),
    [resolvedChat, user],
  );
  const recipient =
    route?.params?.recipient ?? getParticipantProfile(routeParticipant);
  const recipientAccountId =
    route?.params?.recipientAccountId ??
    getParticipantAccountId(routeParticipant) ??
    recipient?.userAccountId;
  const recipientName =
    route?.params?.participantName ??
    route?.params?.name ??
    recipient?.name ??
    'MRN User';
  const messages = useSelector(
    state => state.chat.messagesByChat[chatId] ?? [],
  );
  const messageMeta = useSelector(
    state => state.chat.messageMetaByChat[chatId] ?? {},
  );
  const hasLoadedMessages = Boolean(messageMeta.hasLoaded);
  const [inputText, setInputText] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(!hasLoadedMessages);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isRecipientOnline, setIsRecipientOnline] = useState(
    Boolean(recipient?.isOnline ?? recipient?.userId?.isOnline),
  );
  const [loadMessages] = useLazyGetChatMessagesQuery();
  const [sendMessage, { isLoading: isSending }] =
    useSendChatMessageMutation();
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const loadingPageRef = useRef(false);
  const hasCachedMessagesRef = useRef(hasLoadedMessages);

  hasCachedMessagesRef.current = hasLoadedMessages;

  const page = messageMeta.page ?? 1;
  const totalPages = messageMeta.totalPages ?? 1;

  useEffect(() => {
    if (Array.isArray(chatsResponse?.data)) {
      dispatch(setChats(chatsResponse.data));
    }
  }, [chatsResponse, dispatch]);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  const emitChatEvent = useCallback(
    event => {
      if (!chatId || !recipientAccountId) {
        return false;
      }

      return socketService.emit(event, {
        chatId,
        recipientId: recipientAccountId,
      });
    },
    [chatId, recipientAccountId],
  );

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (isTypingRef.current) {
      emitChatEvent(SOCKET_EVENTS.STOP_TYPING);
      isTypingRef.current = false;
    }
  }, [emitChatEvent]);

  const fetchMessages = useCallback(
    async (requestedPage = 1, replace = false) => {
      if (!chatId || loadingPageRef.current) {
        return;
      }

      loadingPageRef.current = true;
      setLoadError(null);
      if (replace) {
        setIsInitialLoading(!hasCachedMessagesRef.current);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response = await loadMessages({
          chatId,
          page: requestedPage,
          limit: PAGE_SIZE,
        }).unwrap();

        if (!response?.success) {
          throw new Error(response?.message || 'Unable to load messages.');
        }

        const nextMessages = Array.isArray(response.data) ? response.data : [];

        dispatch(
          setChatMessages({
            chatId,
            messages: nextMessages,
            page: Number(response.page) || requestedPage,
            totalPages: Number(response.totalPages) || 1,
            replace,
          }),
        );
        emitChatEvent(SOCKET_EVENTS.MARK_READ);
      } catch (error) {
        setLoadError(getApiErrorMessage(error));
      } finally {
        loadingPageRef.current = false;
        setIsInitialLoading(false);
        setIsLoadingMore(false);
      }
    },
    [chatId, dispatch, emitChatEvent, loadMessages],
  );

  useEffect(() => {
    fetchMessages(1, true);
  }, [chatId, fetchMessages]);

  useFocusEffect(
    useCallback(() => {
      emitChatEvent(SOCKET_EVENTS.MARK_READ);

      return () => stopTyping();
    }, [emitChatEvent, stopTyping]),
  );

  useEffect(() => {
    const handleNewMessage = payload => {
      if (`${payload?.chatId}` !== `${chatId}` || !payload?.message) {
        return;
      }

      dispatch(
        receiveMessage({
          chatId,
          message: payload.message,
          isMine: isMessageMine(payload.message, user),
        }),
      );

      if (!isMessageMine(payload.message, user)) {
        emitChatEvent(SOCKET_EVENTS.MARK_READ);
      }
    };
    const handleConnect = () => {
      emitChatEvent(SOCKET_EVENTS.MARK_READ);
    };
    const handleDisplayTyping = payload => {
      if (`${payload?.chatId}` === `${chatId}`) {
        setIsRecipientTyping(true);
      }
    };
    const handleHideTyping = payload => {
      if (`${payload?.chatId}` === `${chatId}`) {
        setIsRecipientTyping(false);
      }
    };
    const handleMessagesSeen = payload => {
      if (`${payload?.chatId}` !== `${chatId}`) {
        return;
      }

      dispatch(
        markChatMessagesSeen({
          chatId,
          readAt: payload.readAt,
          currentUserIds: [
            user?._id,
            user?.id,
            user?.userAccountId,
            typeof user?.userId === 'string' ? user.userId : user?.userId?._id,
          ],
        }),
      );
    };
    const handleUserStatus = payload => {
      const recipientIds = [
        recipientAccountId,
        recipient?._id,
        recipient?.id,
      ].filter(Boolean);

      if (recipientIds.includes(payload?.userId)) {
        setIsRecipientOnline(Boolean(payload.isOnline));
      }
    };

    socketService.on(SOCKET_EVENTS.CONNECT, handleConnect);
    socketService.on(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
    socketService.on(SOCKET_EVENTS.DISPLAY_TYPING, handleDisplayTyping);
    socketService.on(SOCKET_EVENTS.HIDE_TYPING, handleHideTyping);
    socketService.on(SOCKET_EVENTS.MESSAGES_SEEN, handleMessagesSeen);
    socketService.on(SOCKET_EVENTS.USER_STATUS, handleUserStatus);

    return () => {
      socketService.off(SOCKET_EVENTS.CONNECT, handleConnect);
      socketService.off(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
      socketService.off(SOCKET_EVENTS.DISPLAY_TYPING, handleDisplayTyping);
      socketService.off(SOCKET_EVENTS.HIDE_TYPING, handleHideTyping);
      socketService.off(SOCKET_EVENTS.MESSAGES_SEEN, handleMessagesSeen);
      socketService.off(SOCKET_EVENTS.USER_STATUS, handleUserStatus);
      stopTyping();
    };
  }, [
    chatId,
    dispatch,
    emitChatEvent,
    recipient,
    recipientAccountId,
    stopTyping,
    user,
  ]);

  const handleTextChange = value => {
    setInputText(value);

    if (!value.trim()) {
      stopTyping();
      return;
    }

    if (!isTypingRef.current) {
      isTypingRef.current = emitChatEvent(SOCKET_EVENTS.TYPING);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(stopTyping, 1500);
  };

  const handleAttachment = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.85,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        showToast(
          'Unable to attach image',
          result.errorMessage || 'Please try again.',
          'error',
        );
        return;
      }

      setAttachment(result.assets?.[0] ?? null);
    } catch {
      showToast('Unable to attach image', 'Please try again.', 'error');
    }
  };

  const handleSend = async () => {
    const trimmedMessage = inputText.trim();

    if ((!trimmedMessage && !attachment) || !chatId || isSending) {
      return;
    }

    const optimisticId = `pending-${Date.now()}`;
    const pendingMessage = {
      _id: optimisticId,
      chatId,
      senderId: {
        _id: user?.id ?? user?._id,
        userId: user?._id ?? user?.userAccountId,
        name: user?.name,
        profile: user?.profile,
      },
      senderModel: (Array.isArray(user?.role) ? user.role : [user?.role])
        .map(role => `${role}`.toLowerCase())
        .includes('member')
        ? 'Member'
        : 'Consumer',
      message: trimmedMessage,
      attachments: attachment?.uri ? [attachment.uri] : [],
      isRead: false,
      readAt: null,
      deliveryStatus: 'sending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const formData = new FormData();
    formData.append('chatId', chatId);
    formData.append('message', trimmedMessage);

    if (attachment?.uri) {
      formData.append('attachments', {
        uri: attachment.uri,
        name: attachment.fileName || `chat-image-${Date.now()}.jpg`,
        type: attachment.type || 'image/jpeg',
      });
    }

    stopTyping();
    dispatch(addPendingMessage({ chatId, message: pendingMessage }));
    setInputText('');
    setAttachment(null);

    try {
      const response = await sendMessage(formData).unwrap();

      if (!response?.success || !response?.data) {
        dispatch(failPendingMessage({ chatId, pendingId: optimisticId }));
        showToast(
          'Message not sent',
          response?.message || 'Please try again.',
          'error',
        );
        return;
      }

      dispatch(
        resolvePendingMessage({
          chatId,
          pendingId: optimisticId,
          message: response.data,
        }),
      );
      if (response.chat) {
        dispatch(upsertChat(response.chat));
      }
    } catch (error) {
      dispatch(failPendingMessage({ chatId, pendingId: optimisticId }));
      showToast('Message not sent', getApiErrorMessage(error), 'error');
    }
  };

  const loadOlderMessages = () => {
    if (!isLoadingMore && page < totalPages) {
      fetchMessages(page + 1);
    }
  };

  const renderMessage = ({ item }) => {
    const isMine = isMessageMine(item, user);
    const attachments = Array.isArray(item.attachments)
      ? item.attachments
      : [];

    return (
      <View
        style={[
          styles.messageBubble,
          isMine ? styles.senderBubble : styles.receiverBubble,
        ]}>
        {attachments.map((path, index) => {
          const uri = getMediaUrl(typeof path === 'string' ? path : path?.url);

          return uri ? (
            <FastImage
              key={`${getMessageId(item)}-attachment-${index}`}
              source={{ uri }}
              resizeMode={FastImage.resizeMode.cover}
              style={styles.messageImage}
            />
          ) : null;
        })}
        {!!item.message && (
          <AppText style={styles.messageText}>{item.message}</AppText>
        )}
        <View style={styles.messageMeta}>
          <AppText style={styles.timestampText}>
            {moment(item.createdAt).isValid()
              ? moment(item.createdAt).format('h:mm a')
              : ''}
          </AppText>
          {isMine &&
            (item.deliveryStatus === 'sending' ? (
              <Feather
                name="clock"
                color="#D7E4F2"
                size={responsiveFontSize(1.15)}
                style={styles.deliveryIcon}
              />
            ) : item.deliveryStatus === 'failed' ? (
              <Feather
                name="alert-circle"
                color="#FFD1CE"
                size={responsiveFontSize(1.2)}
                style={styles.deliveryIcon}
              />
            ) : (
              <AppText
                style={[
                  styles.readReceipt,
                  item.isRead && styles.readReceiptSeen,
                ]}>
                {item.isRead ? '✓✓' : '✓'}
              </AppText>
            ))}
        </View>
      </View>
    );
  };

  const headerSubtitle = isRecipientTyping
    ? 'Typing...'
    : isRecipientOnline
      ? 'Online'
      : undefined;

  if (!chatId) {
    return (
      <View style={styles.screen}>
        <AppHeader
          variant="left"
          showBack
          title={recipientName}
          onLeftPress={() => navigation.goBack()}
          containerStyle={styles.header}
        />
        <View style={styles.centerState}>
          <AppText style={styles.errorText}>
            This conversation could not be opened.
          </AppText>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior="padding"
      keyboardVerticalOffset={0}>
      <AppHeader
        variant="left"
        showBack
        title={recipientName}
        subtitle={headerSubtitle}
        onLeftPress={() => navigation.goBack()}
        containerStyle={styles.header}
        leftButtonStyle={styles.headerBackButton}
        titleWrapStyle={styles.headerTitleWrap}
        titleStyle={styles.headerTitle}
        subtitleStyle={styles.headerSubtitle}
        backIconSize={responsiveFontSize(2.5)}
      />

      {isInitialLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={AppColors.appThemeBlue} />
        </View>
      ) : loadError && !messages.length ? (
        <View style={styles.centerState}>
          <AppText style={styles.errorText}>{loadError}</AppText>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => fetchMessages(1, true)}
            style={styles.retryButton}>
            <AppText style={styles.retryText}>Retry</AppText>
          </TouchableOpacity>
        </View>
      ) : !messages.length ? (
        <View style={styles.emptyMessages}>
          <AppText style={styles.emptyMessagesText}>
            No messages yet. Send a message to start the conversation.
          </AppText>
        </View>
      ) : (
        <FlatList
          inverted
          data={messages}
          keyExtractor={item => getMessageId(item)}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesContent}
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator
                style={styles.loadingMore}
                color={AppColors.appThemeBlue}
              />
            ) : null
          }
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          onEndReached={loadOlderMessages}
          onEndReachedThreshold={0.25}
        />
      )}

      {attachment && (
        <View style={styles.attachmentPreview}>
          <FastImage
            source={{ uri: attachment.uri }}
            resizeMode={FastImage.resizeMode.cover}
            style={styles.attachmentPreviewImage}
          />
          <AppText numberOfLines={1} style={styles.attachmentName}>
            {attachment.fileName || 'Selected image'}
          </AppText>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAttachment(null)}
            style={styles.removeAttachment}>
            <Feather
              name="x"
              color={AppColors.white}
              size={responsiveFontSize(1.8)}
            />
          </TouchableOpacity>
        </View>
      )}

      <View
        style={[
          styles.composerBar,
          {
            paddingBottom:
              isKeyboardVisible && Platform.OS === 'android'
                ? responsiveHeight(2.4)
                : Math.max(insets.bottom, responsiveHeight(1)) +
                  (isKeyboardVisible ? responsiveHeight(2.2) : 0),
          },
        ]}>
        <AppInput
          value={inputText}
          onChangeText={handleTextChange}
          onBlur={stopTyping}
          placeholder="Type a message..."
          multiline
          maxLength={2000}
          containerStyle={styles.inputRoot}
          inputContainerStyle={styles.inputBox}
          inputStyle={styles.inputText}
          rightIcon={
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={isSending}
              onPress={handleAttachment}
              style={styles.attachmentButton}>
              <Feather
                name="paperclip"
                color="#323232"
                size={responsiveFontSize(2.5)}
              />
            </TouchableOpacity>
          }
        />
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={isSending || (!inputText.trim() && !attachment)}
          onPress={handleSend}
          style={styles.sendButton}>
          <Feather
            name="send"
            color={AppColors.white}
            size={responsiveFontSize(3)}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppColors.appBgColor,
  },
  header: {
    minHeight: responsiveHeight(7.2),
    paddingHorizontal: responsiveWidth(5.6),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.black,
    backgroundColor: AppColors.appBgColor,
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
    fontSize: responsiveFontSize(2.1),
  },
  headerSubtitle: {
    color: '#50729A',
    fontSize: responsiveFontSize(1.15),
  },
  messagesContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: responsiveWidth(5.5),
    paddingVertical: responsiveHeight(1.5),
  },
  messageBubble: {
    maxWidth: '76%',
    minWidth: responsiveWidth(20),
    marginVertical: responsiveHeight(0.55),
    paddingHorizontal: responsiveWidth(3.2),
    paddingVertical: responsiveHeight(0.9),
    borderRadius: responsiveWidth(2.2),
  },
  receiverBubble: {
    alignSelf: 'flex-start',
    backgroundColor: AppColors.appThemeBlue,
  },
  senderBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#4476A8',
  },
  messageText: {
    color: AppColors.white,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.6),
    lineHeight: responsiveFontSize(2.15),
  },
  messageImage: {
    width: responsiveWidth(52),
    maxWidth: '100%',
    height: responsiveHeight(20),
    marginBottom: responsiveHeight(0.7),
    borderRadius: responsiveWidth(1.5),
    backgroundColor: '#D4E4FF',
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: responsiveHeight(0.3),
  },
  timestampText: {
    color: '#CFDAEA',
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(0.95),
  },
  readReceipt: {
    marginLeft: responsiveWidth(1),
    color: '#D7E4F2',
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(1.05),
  },
  deliveryIcon: {
    marginLeft: responsiveWidth(1),
  },
  readReceiptSeen: {
    color: '#75D5FF',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: responsiveWidth(8),
  },
  errorText: {
    color: AppColors.bodyText,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(1.55),
    lineHeight: responsiveFontSize(2.1),
    textAlign: 'center',
  },
  retryButton: {
    marginTop: responsiveHeight(1.5),
    paddingHorizontal: responsiveWidth(6),
    paddingVertical: responsiveHeight(1),
    borderRadius: responsiveWidth(2),
    backgroundColor: AppColors.appThemeBlue,
  },
  retryText: {
    color: AppColors.white,
    fontFamily: FontFamily.semiBold,
    fontSize: responsiveFontSize(1.4),
  },
  emptyMessages: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: responsiveWidth(8),
  },
  emptyMessagesText: {
    color: AppColors.bodyText,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.45),
    textAlign: 'center',
    writingDirection: 'ltr',
  },
  loadingMore: {
    marginVertical: responsiveHeight(1.5),
  },
  attachmentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(0.8),
    backgroundColor: COMPOSER_BG,
  },
  attachmentPreviewImage: {
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    borderRadius: responsiveWidth(1.5),
  },
  attachmentName: {
    flex: 1,
    marginHorizontal: responsiveWidth(3),
    color: AppColors.white,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.25),
  },
  removeAttachment: {
    width: responsiveWidth(7),
    height: responsiveWidth(7),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: responsiveWidth(3.5),
    backgroundColor: '#555555',
  },
  composerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveWidth(3),
    paddingHorizontal: responsiveWidth(4),
    paddingTop: responsiveHeight(1),
    backgroundColor: COMPOSER_BG,
  },
  inputRoot: {
    flex: 1,
  },
  inputBox: {
    minHeight: responsiveHeight(5.35),
    maxHeight: responsiveHeight(11),
    borderWidth: 0,
    borderRadius: responsiveWidth(2),
    backgroundColor: AppColors.white,
    paddingHorizontal: responsiveWidth(3.2),
  },
  inputText: {
    color: '#333333',
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.65),
    paddingVertical: responsiveHeight(0.8),
  },
  attachmentButton: {
    padding: responsiveWidth(1),
  },
  sendButton: {
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatScreen;
