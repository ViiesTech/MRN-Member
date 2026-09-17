import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_ENDPOINTS, BASE_URL } from '../constants/apiEndpoints';

export const authApi = createApi({
  reducerPath: 'authApi',
  refetchOnMountOrArgChange: true,
  tagTypes: [
    'ActivityLogs',
    'Chats',
    'Introductions',
    'Messages',
    'Members',
    'Profile',
    'Notifications',
    'Regions',
    'UserServices',
    'UserNetworks',
    'NetworkServices',
    'InformationRequests',
  ],
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
    getActivityLogs: builder.query({
      query: ({ year, month, page = 1, limit = 10 }) => ({
        url: API_ENDPOINTS.activityLogs,
        params: { year, month, page, limit },
      }),
      providesTags: ['ActivityLogs'],
    }),
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
    logoutApiHandler: builder.mutation({
      query: body => ({
        url: API_ENDPOINTS.auth.logOut,
        method: 'POST',
        body,
      }),
    }),
    getProfile: builder.query({
      query: () => API_ENDPOINTS.user.profile,
      providesTags: ['Profile'],
    }),
    getNotifications: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: API_ENDPOINTS.notifications.list,
        params: {
          page,
          limit,
        },
      }),
      async onQueryStarted(args, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log(
            'getNotifications API Response:',
            JSON.stringify(data, null, 2),
          );
        } catch (error) {
          console.log('getNotifications API Error:', error);
        }
      },
      providesTags: ['Notifications'],
    }),
    getChats: builder.query({
      query: () => API_ENDPOINTS.chat.list,
      providesTags: ['Chats'],
    }),
    createChat: builder.mutation({
      query: recipientId => ({
        url: API_ENDPOINTS.chat.getOrCreate,
        method: 'POST',
        body: { recipientId },
      }),
      invalidatesTags: result => (result?.success ? ['Chats'] : []),
    }),
    getChatMessages: builder.query({
      query: ({ chatId, page = 1, limit = 20 }) => ({
        url: API_ENDPOINTS.chat.messages,
        params: { chatId, page, limit },
      }),
      providesTags: (_result, _error, { chatId }) => [
        { type: 'Messages', id: chatId },
      ],
    }),
    sendChatMessage: builder.mutation({
      query: body => ({
        url: API_ENDPOINTS.chat.send,
        method: 'POST',
        body,
      }),
      invalidatesTags: result => (result?.success ? ['Chats'] : []),
    }),
    updateProfile: builder.mutation({
      query: body => ({
        url: API_ENDPOINTS.user.profile,
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
    getRegions: builder.query({
      query: ({ search = '', cursor = '', limit = 10 } = {}) => ({
        url: API_ENDPOINTS.user.regions,
        params: { search, cursor, limit },
      }),
      providesTags: ['Regions'],
    }),
    getUserNetworks: builder.query({
      query: ({ regionId, search = '', cursor = '', limit = 10 }) => ({
        url: API_ENDPOINTS.user.networks,
        params: {
          ...(regionId && { regionId }),
          search,
          cursor,
          limit,
        },
      }),
      providesTags: (_result, _error, { regionId }) => [
        { type: 'UserNetworks', id: regionId },
      ],
    }),
    getUserServices: builder.query({
      query: ({ cursor = '', limit = 10 } = {}) => ({
        url: API_ENDPOINTS.user.services,
        params: { limit, cursor },
      }),
      providesTags: ['UserServices'],
    }),
    getNetworkServices: builder.query({
      query: ({ networkId, search = '', cursor = '', limit = 10 }) => ({
        url: API_ENDPOINTS.user.networkServices(networkId),
        params: { search, cursor, limit },
      }),
      providesTags: (_result, _error, { networkId }) => [
        { type: 'NetworkServices', id: networkId },
      ],
    }),
    createInformationRequest: builder.mutation({
      query: body => ({
        url: API_ENDPOINTS.user.information,
        method: 'POST',
        body,
      }),
      invalidatesTags: result =>
        result?.success ? ['InformationRequests'] : [],
    }),
    getInformationRequests: builder.query({
      query: ({
        type = '',
        status = 'information',
        cursor = '',
        limit = 10,
      } = {}) => ({
        url: API_ENDPOINTS.user.information,
        params: {
          ...(type ? { type } : {}),
          status,
          cursor,
          limit,
        },
      }),
      providesTags: ['InformationRequests'],
    }),
    applyMembership: builder.mutation({
      query: body => ({
        url: API_ENDPOINTS.user.applyMembership,
        method: 'POST',
        body,
      }),
      invalidatesTags: result => (result?.success ? ['Profile'] : []),
    }),
    getIntroductions: builder.query({
      query: ({ status = '', search = '', cursor = '', limit = 10 } = {}) => ({
        url: API_ENDPOINTS.user.introduction,
        params: { status, search, cursor, limit },
      }),
      providesTags: ['Introductions'],
    }),
    getMembers: builder.query({
      query: ({
        networkId = '',
        serviceId = '',
        search = '',
        cursor = '',
        limit = 10,
      } = {}) => ({
        url: API_ENDPOINTS.user.members,
        params: { networkId, serviceId, search, cursor, limit },
      }),
      providesTags: ['Members'],
    }),
    createIntroduction: builder.mutation({
      query: body => ({
        url: API_ENDPOINTS.user.introduction,
        method: 'POST',
        body,
      }),
      invalidatesTags: result =>
        result?.success ? ['Introductions'] : [],
    }),
    getIntroductionDetails: builder.query({
      query: introductionId =>
        API_ENDPOINTS.user.introductionDetails(introductionId),
      providesTags: (_result, _error, id) => [
        { type: 'Introductions', id },
      ],
    }),
    getInformationDetails: builder.query({
      query: informationId =>
        API_ENDPOINTS.user.informationDetails(informationId),
      providesTags: (_result, _error, id) => [
        { type: 'InformationRequests', id },
      ],
    }),
    updateIntroductionStatus: builder.mutation({
      query: ({ introductionId, status }) => ({
        url: API_ENDPOINTS.user.introductionStatus(introductionId),
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: result =>
        result?.success ? ['Introductions'] : [],
    }),
    updateInformationStatus: builder.mutation({
      query: ({ informationId, status }) => ({
        url: API_ENDPOINTS.user.informationStatus(informationId),
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: result =>
        result?.success ? ['InformationRequests'] : [],
    }),
  }),
});

export const {
  useGetActivityLogsQuery,
  useSignupMutation,
  useVerifyOtpMutation,
  useSigninMutation,
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
  useResetPasswordMutation,
  useLogoutApiHandlerMutation,
  useChangePasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetNetworksQuery,
  useGetServicesQuery,
  useGetRegionsQuery,
  useGetUserNetworksQuery,
  useGetUserServicesQuery,
  useGetNetworkServicesQuery,
  useCreateInformationRequestMutation,
  useGetInformationRequestsQuery,
  useGetNotificationsQuery,
  useGetChatsQuery,
  useCreateChatMutation,
  useLazyGetChatMessagesQuery,
  useSendChatMessageMutation,
  useApplyMembershipMutation,
  useGetIntroductionsQuery,
  useGetMembersQuery,
  useCreateIntroductionMutation,
  useGetIntroductionDetailsQuery,
  useGetInformationDetailsQuery,
  useUpdateIntroductionStatusMutation,
  useUpdateInformationStatusMutation,
} = authApi;
