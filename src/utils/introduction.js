const getIdentityIds = entity => {
  if (!entity) {
    return [];
  }

  if (typeof entity === 'string') {
    return [entity];
  }

  return [entity._id, entity.id, entity.userAccountId]
    .filter(Boolean)
    .map(value => `${value}`);
};

export const identitiesMatch = (first, second) => {
  const firstIds = getIdentityIds(first);
  const secondIds = new Set(getIdentityIds(second));

  return firstIds.some(id => secondIds.has(id));
};

export const getIntroductionDirection = (introduction, currentUser) => {
  if (identitiesMatch(currentUser, introduction?.senderId)) {
    return 'sent';
  }

  if (identitiesMatch(currentUser, introduction?.receiverId)) {
    return 'received';
  }

  return `${introduction?.type ?? ''}`.toLowerCase() === 'sent'
    ? 'sent'
    : 'received';
};

export const getIntroductionCounterparty = (introduction, currentUser) =>
  getIntroductionDirection(introduction, currentUser) === 'sent'
    ? introduction?.receiverId ?? {}
    : introduction?.senderId ?? {};

export const getIntroductionParties = (introduction, currentUser) => ({
  sender: introduction?.senderId ?? {},
  receiver: introduction?.receiverId ?? {},
  direction: getIntroductionDirection(introduction, currentUser),
  counterparty: getIntroductionCounterparty(introduction, currentUser),
});
