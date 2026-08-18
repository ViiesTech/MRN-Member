import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_ENDPOINTS, BASE_URL } from '../constants/apiEndpoints';

export const authApi = createApi({
  reducerPath: 'authApi',
  tagTypes: ['Introductions', 'Profile'],
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token;

      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),
  endpoints: builder => ({
    signup: builder.mutation({
      query: body => ({
        url: API_ENDPOINTS.auth.signup,
        method: 'POST',
        body,
      }),
    }),
    verifyOtp: builder.mutation({
      query: body => ({
        url: API_ENDPOINTS.auth.verifyOtp,
        method: 'POST',
        body,
      }),
    }),
    signin: builder.mutation({
      query: body => ({
        url: API_ENDPOINTS.auth.signin,
        method: 'POST',
        body,
      }),
    }),
    forgotPassword: builder.mutation({
      query: body => ({
        url: API_ENDPOINTS.auth.forgotPassword,
        method: 'POST',
        body,
      }),
    }),
    verifyResetOtp: builder.mutation({
      query: body => ({
        url: API_ENDPOINTS.auth.verifyResetOtp,
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation({
      query: body => ({
        url: API_ENDPOINTS.auth.resetPassword,
        method: 'POST',
        body,
      }),
    }),
    changePassword: builder.mutation({
      query: body => ({
        url: API_ENDPOINTS.auth.changePassword,
        method: 'PATCH',
        body,
      }),
    }),
    getProfile: builder.query({
      query: () => API_ENDPOINTS.member.profile,
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation({
      query: body => ({
        url: API_ENDPOINTS.member.profile,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: result => (result?.success ? ['Profile'] : []),
    }),
    getNetworks: builder.query({
      query: () => API_ENDPOINTS.member.networks,
    }),
    getServices: builder.query({
      query: () => API_ENDPOINTS.member.services,
    }),
    applyMembership: builder.mutation({
      query: body => ({
        url: API_ENDPOINTS.member.applyProfile,
        method: 'PATCH',
        body,
      }),
    }),
    getIntroductions: builder.query({
      query: status => ({
        url: API_ENDPOINTS.member.introductions,
        params: status ? { status } : undefined,
      }),
      providesTags: ['Introductions'],
    }),
    updateIntroductionStatus: builder.mutation({
      query: ({ introductionId, status }) => ({
        url: API_ENDPOINTS.member.introductionStatus(introductionId),
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: result =>
        result?.success ? ['Introductions'] : [],
    }),
  }),
});

export const {
  useSignupMutation,
  useVerifyOtpMutation,
  useSigninMutation,
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetNetworksQuery,
  useGetServicesQuery,
  useApplyMembershipMutation,
  useGetIntroductionsQuery,
  useUpdateIntroductionStatusMutation,
} = authApi;
