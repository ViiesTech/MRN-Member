import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  chats: [],
  hasLoadedChats: false,
  messagesByChat: {},
  messageMetaByChat: {},
};

const getId = item => item?._id ?? item?.id;

const mergeMessages = (current, incoming) => {
  const byId = new Map();

  [...current, ...incoming].forEach(message => {
    const id = getId(message);

    if (id) {
      byId.set(id, message);
    }
  });

  return [...byId.values()].sort(
    (first, second) =>
      new Date(second.createdAt ?? 0).getTime() -
      new Date(first.createdAt ?? 0).getTime(),
  );
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChats: (state, action) => {
      state.chats = Array.isArray(action.payload) ? action.payload : [];
      state.hasLoadedChats = true;

      state.chats.forEach(chat => {
        const chatId = getId(chat);

        if (
          chatId &&
          chat.lastMessage &&
          state.messageMetaByChat[chatId]?.hasLoaded
        ) {
          state.messagesByChat[chatId] = mergeMessages(
            state.messagesByChat[chatId] ?? [],
            [chat.lastMessage],
          );
        }
      });
    },
    upsertChat: (state, action) => {
      const chat = action.payload;
      const chatId = getId(chat);

      if (!chatId) {
        return;
      }

      state.chats = [
        chat,
        ...state.chats.filter(item => getId(item) !== chatId),
      ];
      state.hasLoadedChats = true;

      if (
        chat.lastMessage &&
        state.messageMetaByChat[chatId]?.hasLoaded
      ) {
        state.messagesByChat[chatId] = mergeMessages(
          state.messagesByChat[chatId] ?? [],
          [chat.lastMessage],
        );
      }
    },
    updateChatUserStatus: (state, action) => {
      const { userId, isOnline, lastActive } = action.payload ?? {};

      state.chats.forEach(chat => {
        chat.participants?.forEach(participant => {
          const profile = participant?.userId ?? {};
          const accountId =
            profile.userAccountId ??
            (typeof profile.userId === 'string'
              ? profile.userId
              : profile.userId?._id ?? profile.userId?.id);

          if (![accountId, profile._id, profile.id].includes(userId)) {
            return;
          }

          profile.isOnline = Boolean(isOnline);
          profile.lastActive = lastActive;
        });
      });
    },
    setChatMessages: (state, action) => {
      const {
        chatId,
        messages = [],
        page = 1,
        totalPages = 1,
        replace = false,
      } = action.payload ?? {};

      if (!chatId) {
        return;
      }

      const current = state.messagesByChat[chatId] ?? [];
      const localMessages = replace
        ? current.filter(message =>
            ['sending', 'failed'].includes(message.deliveryStatus),
          )
        : current;
      state.messagesByChat[chatId] = replace
        ? mergeMessages(messages, localMessages)
        : mergeMessages(localMessages, messages);
      state.messageMetaByChat[chatId] = {
        hasLoaded: true,
        page,
        totalPages,
      };
    },
    addPendingMessage: (state, action) => {
      const { chatId, message } = action.payload ?? {};

      if (!chatId || !message) {
        return;
      }

      state.messagesByChat[chatId] = mergeMessages(
        state.messagesByChat[chatId] ?? [],
        [message],
      );
    },
    receiveMessage: (state, action) => {
      const { chatId, message, isMine = false } = action.payload ?? {};

      if (!chatId || !message) {
        return;
      }

      let current = state.messagesByChat[chatId] ?? [];

      if (isMine) {
        const pendingMessage = current.find(
          item =>
            item.deliveryStatus === 'sending' &&
            item.message === message.message,
        );

        if (pendingMessage) {
          current = current.filter(item => getId(item) !== getId(pendingMessage));
        }
      }

      state.messagesByChat[chatId] = mergeMessages(current, [message]);
    },
    resolvePendingMessage: (state, action) => {
      const { chatId, pendingId, message } = action.payload ?? {};

      if (!chatId || !pendingId || !message) {
        return;
      }

      const current = (state.messagesByChat[chatId] ?? []).filter(
        item => getId(item) !== pendingId,
      );
      state.messagesByChat[chatId] = mergeMessages(current, [
        { ...message, deliveryStatus: 'sent' },
      ]);
    },
    failPendingMessage: (state, action) => {
      const { chatId, pendingId } = action.payload ?? {};

      if (!chatId || !pendingId) {
        return;
      }

      const messages = state.messagesByChat[chatId] ?? [];
      const message = messages.find(item => getId(item) === pendingId);

      if (message) {
        message.deliveryStatus = 'failed';
      }
    },
    markChatMessagesSeen: (state, action) => {
      const { chatId, readAt, currentUserIds = [] } = action.payload ?? {};
      const currentIds = new Set(currentUserIds.filter(Boolean));

      (state.messagesByChat[chatId] ?? []).forEach(message => {
        const sender = message.senderId ?? {};
        const senderIds = [
          sender._id,
          sender.id,
          typeof sender.userId === 'string'
            ? sender.userId
            : sender.userId?._id ?? sender.userId?.id,
        ];

        if (senderIds.some(id => currentIds.has(id))) {
          message.isRead = true;
          message.readAt = readAt ?? message.readAt;
        }
      });
    },
    clearChatState: () => initialState,
  },
});

export const {
  addPendingMessage,
  clearChatState,
  failPendingMessage,
  markChatMessagesSeen,
  receiveMessage,
  resolvePendingMessage,
  setChatMessages,
  setChats,
  updateChatUserStatus,
  upsertChat,
} = chatSlice.actions;

export default chatSlice.reducer;
