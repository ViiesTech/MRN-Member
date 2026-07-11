export const BASE_URL = 'https://mrn.apiforapp.link/api/';

export const API_ENDPOINTS = {
  auth: {
    signup: 'auth/signup',
    verifyOtp: 'auth/verifyOtp',
    signin: 'auth/signin',
    forgotPassword: 'auth/forgotPassword',
    verifyResetOtp: 'auth/verifyResetOtp',
    resetPassword: 'auth/resetPassword',
  },
  member: {
    profile: 'member/profile/',
    networks: 'member/networks/',
    services: 'member/services',
    applyProfile: 'member/profile/apply',
    introductions: 'member/introductions/',
    introductionStatus: introductionId =>
      `member/introductions/${introductionId}/status`,
  },
};
