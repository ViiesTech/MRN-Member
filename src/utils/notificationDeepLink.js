const parseObject = value => {
  if (!value) {
    return {};
  }

  if (typeof value === 'object') {
    return value;
  }

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

export const getNotificationTarget = payload => {
  if (!payload) {
    return { name: 'none', params: {} };
  }

  const rootData = parseObject(payload?.data);
  const nestedData = parseObject(rootData?.data);
  const details = parseObject(nestedData?.data);

  const type = `${
    payload?.type ??
    rootData.type ??
    nestedData.type ??
    details.type ??
    ''
  }`.toLowerCase();

  const action = `${
    payload?.action ??
    rootData.action ??
    nestedData.action ??
    details.action ??
    ''
  }`.toUpperCase();

  // If notification type is system or account creation, no navigation is needed
  if (type === 'system' || action === 'ACCOUNT_CREATED') {
    return { name: 'none', params: {} };
  }

  const chatId =
    payload?.chatId ??
    rootData.chatId ??
    nestedData.chatId ??
    details.chatId;

  if (
    chatId &&
    (type.includes('chat') ||
      type.includes('message') ||
      action.includes('MESSAGE'))
  ) {
    return { name: 'chat', params: { chatId: `${chatId}` } };
  }

  const introductionId =
    payload?.introductionId ??
    payload?.introId ??
    rootData.introductionId ??
    rootData.introId ??
    nestedData.introductionId ??
    nestedData.introId ??
    details.introductionId ??
    details.introId ??
    (type.includes('introduction')
      ? rootData._id ?? rootData.id ?? payload._id ?? payload.id
      : null);

  if (
    introductionId &&
    (type.includes('introduction') || action.includes('INTRODUCTION'))
  ) {
    return {
      name: 'introduction',
      params: { introductionId: `${introductionId}` },
    };
  }

  const informationId =
    payload?.informationId ??
    payload?.infoId ??
    rootData.informationId ??
    rootData.infoId ??
    nestedData.informationId ??
    nestedData.infoId ??
    details.informationId ??
    details.infoId ??
    (type.includes('information')
      ? rootData._id ?? rootData.id ?? payload._id ?? payload.id
      : null);

  if (
    informationId &&
    (type.includes('information') || action.includes('INFORMATION'))
  ) {
    return {
      name: 'information',
      params: { informationId: `${informationId}` },
    };
  }

  const title = `${
    payload?.title ??
    payload?.notification?.title ??
    rootData.title ??
    nestedData.title ??
    details.title ??
    ''
  }`.toLowerCase();

  if (
    type.includes('membership') ||
    action.includes('MEMBERSHIP') ||
    title.includes('membership')
  ) {
    const status = `${
      payload?.status ??
      rootData.status ??
      nestedData.status ??
      ''
    }`.toLowerCase();

    if (
      action.includes('APPROVED') ||
      status === 'approved' ||
      title.includes('approved')
    ) {
      return {
        name: 'membership_approved',
        params: {
          memberId: rootData.memberId ?? nestedData.memberId,
          networkId: rootData.networkId ?? nestedData.networkId,
        },
      };
    }

    if (
      action.includes('REJECTED') ||
      status === 'rejected' ||
      title.includes('rejected')
    ) {
      return {
        name: 'membership_rejected',
        params: {},
      };
    }
  }

  return { name: 'none', params: {} };
};
