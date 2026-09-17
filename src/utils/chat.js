import { BASE_URL } from '../redux/constants/apiEndpoints';

const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, '');

const collectIds = value => {
  if (!value) {
    return [];
  }

  if (typeof value === 'string') {
    return [value];
  }

  return [
    value._id,
    value.id,
    value.userAccountId,
    typeof value.userId === 'string' ? value.userId : value.userId?._id,
    value.userId?.id,
  ].filter(Boolean);
};

export const getChatId = chat => chat?._id ?? chat?.id;
export const getMessageId = message => message?._id ?? message?.id;
export const getParticipantProfile = participant => participant?.userId ?? {};

export const isCurrentParticipant = (participant, user) => {
  const participantIds = new Set(collectIds(getParticipantProfile(participant)));
  const currentUserIds = collectIds(user);

  return currentUserIds.some(id => participantIds.has(id));
};

export const getCurrentParticipant = (chat, user) =>
  chat?.participants?.find(participant =>
    isCurrentParticipant(participant, user),
  );

export const getOtherParticipant = (chat, user) =>
  chat?.participants?.find(
    participant => !isCurrentParticipant(participant, user),
  ) ?? chat?.participants?.[0];

export const getParticipantAccountId = participant => {
  const profile = getParticipantProfile(participant);

  return (
    profile.userAccountId ??
    (typeof profile.userId === 'string'
      ? profile.userId
      : profile.userId?._id ?? profile.userId?.id) ??
    profile._id ??
    profile.id
  );
};

export const getChatUnreadCount = (chat, user) => {
  const unreadCount = chat?.unreadCount ?? {};
  const currentParticipant = getCurrentParticipant(chat, user);
  const candidateIds = [
    ...collectIds(getParticipantProfile(currentParticipant)),
    ...collectIds(user),
  ];

  for (const id of candidateIds) {
    if (unreadCount[id] != null) {
      return Number(unreadCount[id]) || 0;
    }
  }

  return 0;
};

export const isMessageMine = (message, user) => {
  const senderIds = new Set(collectIds(message?.senderId));

  return collectIds(user).some(id => senderIds.has(id));
};

export const mergeMessages = (currentMessages, incomingMessages) => {
  const messagesById = new Map();

  [...currentMessages, ...incomingMessages].forEach(message => {
    const id = getMessageId(message);

    if (id) {
      messagesById.set(id, message);
    }
  });

  return [...messagesById.values()].sort(
    (first, second) =>
      new Date(second.createdAt ?? 0).getTime() -
      new Date(first.createdAt ?? 0).getTime(),
  );
};

export const mergeChatToTop = (chats, incomingChat) => {
  const incomingId = getChatId(incomingChat);

  if (!incomingId) {
    return chats;
  }

  return [incomingChat, ...chats.filter(chat => getChatId(chat) !== incomingId)];
};

export const getMediaUrl = path => {
  if (!path || typeof path !== 'string') {
    return null;
  }

  if (/^(https?:\/\/|file:|content:|ph:)/i.test(path)) {
    return path;
  }

  return `${API_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
};
