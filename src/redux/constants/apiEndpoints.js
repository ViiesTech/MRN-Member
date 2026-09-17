export const BASE_URL = 'https://mrn.apiforapp.link/api/';
export const SOCKET_URL = BASE_URL.replace(/\/api\/?$/, '');

export const API_ENDPOINTS = {
  activityLogs: 'activity-logs/',
  auth: {
    signup: 'auth/signup',
    verifyOtp: 'auth/verifyOtp',
    signin: 'auth/signin',
    forgotPassword: 'auth/forgotPassword',
    verifyResetOtp: 'auth/verifyResetOtp',
    resetPassword: 'auth/resetPassword',
    changePassword: 'auth/changePassword',
    logOut: 'auth/logout',
  },
  member: {
    networks: 'member/networks/',
    services: 'member/services',
    introductions: 'member/introductions/',
    introductionDetails: introductionId =>
      `member/introductions/${introductionId}`,

  },
  user: {
    profile: 'user/profile',
    introduction: 'user/introduction',
    introductionDetails: introductionId =>
      `user/introduction/${introductionId}`,
    members: 'user/members',
    regions: 'user/regions',
    networks: 'user/networks',
    services: 'user/services',
    applyMembership: 'user/profile/apply-membership',
    networkServices: networkId => `user/networks/${networkId}/services`,
    information: 'user/information',
    informationDetails: informationId =>
      `user/information/${informationId}`,
    informationStatus: informationId =>
      `user/information/${informationId}/status`,
    introductionStatus: introductionId =>
      `user/introduction/${introductionId}/status`,
  },
  notifications: {
    list: 'notifications',
  },
  chat: {
    list: 'chat/',
    getOrCreate: 'chat/get-or-create',
    send: 'chat/send',
    messages: 'chat/messages',
  },
};
