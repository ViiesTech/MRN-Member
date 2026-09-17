import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import Feather from '@react-native-vector-icons/feather';
import LinearGradient from 'react-native-linear-gradient';
import {
  AppButton,
  AppHeader,
  AppText,
  DetailsScreenSkeleton,
  UserAvatar,
  Wrapper,
} from '../../../component/Index';
import SVGXml from '../../../component/SvgXml';
import { AppIcons } from '../../../assets/Icons/Index';
import { AppColors } from '../../../utils/AppColors';
import { FontFamily } from '../../../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils/Responsive_Dimensions';
import { useSafeAreaColor } from '../../../utils/useSafeAreaColor';
import {
  useCreateChatMutation,
  useGetInformationDetailsQuery,
  useUpdateInformationStatusMutation,
} from '../../../redux/Services/authApi';
import { upsertChat } from '../../../redux/slices/chatSlice';
import {
  getChatId,
  getOtherParticipant,
  getParticipantAccountId,
  getParticipantProfile,
} from '../../../utils/chat';
import { showToast } from '../../../utils/Toast';
import { identitiesMatch } from '../../../utils/introduction';
import { getApiErrorMessage } from '../../../utils/apiError';

const Icon = ({ icon, size = responsiveFontSize(1.9) }) => (
  <SVGXml icon={icon} width={size} height={size} />
);

const getNextInformationStatus = status => {
  const normalized = (status || '').toLowerCase().trim();
  if (normalized === 'information' || normalized === 'introduction') {
    return 'appointment';
  }
  if (normalized === 'appointment') {
    return 'pending';
  }
  if (normalized === 'pending') {
    return 'completed';
  }
  return null;
};

const formatStatus = value => {
  if (!value) {
    return 'Not available';
  }
  const status = `${value}`
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ');

  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getShortId = information => {
  const id = information?._id ?? information?.id;

  return id ? `${id}`.slice(-4).toUpperCase() : 'N/A';
};

const InformationDetailsScreen = ({ navigation, route, setSafeAreaColor }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const chats = useSelector(state => state.chat.chats);
  const routeInformation = route?.params?.information;
  const informationId =
    route?.params?.informationId ??
    routeInformation?._id ??
    routeInformation?.id;
  const {
    data: informationDetailsResponse,
    isLoading: isLoadingDetails,
    isError: isDetailsError,
    refetch: refetchDetails,
  } = useGetInformationDetailsQuery(informationId, {
    skip: !informationId || Boolean(routeInformation),
  });
  const information =
    routeInformation ??
    informationDetailsResponse?.data ??
    (informationDetailsResponse?._id ? informationDetailsResponse : {});
  const direction = information.type === 'received' ? 'received' : 'sent';
  const sender = information.senderId ?? {};
  const receiver = information.receiverId ?? {};
  const counterparty = direction === 'received' ? sender : receiver;
  const client = information.client ?? {};
  const network = information.networkId ?? {};
  const service = information.serviceId ?? {};
  const recipientId =
    counterparty._id ?? counterparty.id ?? counterparty.userAccountId;
  const [preparedChat, setPreparedChat] = useState(null);
  const chatPreparationRef = useRef(null);
  const [createChat] = useCreateChatMutation();

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  const existingChat = useMemo(
    () =>
      chats.find(chat => {
        const participant = getOtherParticipant(chat, user);
        const profile = getParticipantProfile(participant);
        const ids = [
          getParticipantAccountId(participant),
          profile._id,
          profile.id,
          profile.userAccountId,
        ].filter(Boolean);

        return ids.includes(recipientId);
      }),
    [chats, recipientId, user],
  );

  const prepareChat = useCallback(async () => {
    if (existingChat) {
      setPreparedChat(existingChat);
      return existingChat;
    }

    if (!recipientId) {
      return null;
    }

    if (chatPreparationRef.current) {
      return chatPreparationRef.current;
    }

    const request = createChat(recipientId)
      .unwrap()
      .then(response => {
        if (!response?.success || !response?.data) {
          return null;
        }

        dispatch(upsertChat(response.data));
        setPreparedChat(response.data);
        return response.data;
      })
      .catch(() => null)
      .finally(() => {
        chatPreparationRef.current = null;
      });

    chatPreparationRef.current = request;
    return request;
  }, [createChat, dispatch, existingChat, recipientId]);

  useEffect(() => {
    prepareChat();
  }, [prepareChat]);

  const createdAt = information.createdAt;
  const activityDate = information.updatedAt ?? createdAt;
  const callPhone =
    direction === 'received'
      ? client.phone ?? sender.phone
      : receiver.phone ?? client.phone;
  const summaryItems = [
    {
      label: 'Network',
      value: network.name ?? 'Not available',
      icon: AppIcons.networkSmall,
    },
    {
      label: 'Requester',
      value: sender.name ?? 'Not available',
      icon: AppIcons.profileSmall,
    },
    {
      label: 'Provider',
      value: receiver.name ?? 'Not available',
      icon: AppIcons.profileSmall,
    },
    {
      label: 'Last Activity',
      value: activityDate ? moment(activityDate).format('DD MMM YYYY') : 'N/A',
      icon: AppIcons.calender,
    },
  ];
  const clientInfo = [
    { id: 'phone', value: client.phone || 'Not available', icon: AppIcons.call },
    { id: 'email', value: client.email || 'Not available', icon: AppIcons.sms },
    {
      id: 'address',
      value: client.address || 'Not available',
      icon: AppIcons.locPin,
    },
  ];

  const isReceived =
    identitiesMatch(user, receiver)
      ? true
      : identitiesMatch(user, sender)
      ? false
      : `${information?.type ?? direction}`.toLowerCase() === 'received';
  const [currentStatus, setCurrentStatus] = useState(information.status);
  const [showStatusOption, setShowStatusOption] = useState(false);
  const [updateInformationStatus, { isLoading: isUpdatingStatus }] =
    useUpdateInformationStatusMutation();

  useEffect(() => {
    if (information.status) {
      setCurrentStatus(information.status);
      setShowStatusOption(false);
    }
  }, [information.status]);

  const nextStatus = getNextInformationStatus(currentStatus);
  const statusLabel = formatStatus(currentStatus);
  const nextStatusLabel = formatStatus(nextStatus);
  const canUpdateStatus = isReceived && Boolean(nextStatus);

  const handleStatusUpdate = async () => {
    if (!canUpdateStatus) {
      return;
    }

    const infoId =
      information._id ?? information.id ?? route?.params?.informationId;

    if (!infoId || !nextStatus) {
      return;
    }

    try {
      const response = await updateInformationStatus({
        informationId: infoId,
        status: nextStatus,
      }).unwrap();

      if (!response?.success) {
        showToast(
          'Unable to update status',
          response?.message || 'Please try again.',
          'error',
        );
        return;
      }

      setCurrentStatus(nextStatus);
      setShowStatusOption(false);
      showToast(
        'Status updated successfully',
        `Request moved to ${nextStatusLabel}.`,
      );
      navigation.goBack();
    } catch (error) {
      showToast(
        'Unable to update status',
        getApiErrorMessage(error),
        'error',
      );
    }
  };

  const handleCall = () => {
    if (!callPhone) {
      showToast('No phone number', 'Phone number is not available.', 'error');
      return;
    }

    Linking.openURL(`tel:${`${callPhone}`.replace(/[^\d+]/g, '')}`).catch(() =>
      showToast('Unable to call', 'Please try again.', 'error'),
    );
  };

  const handleMessage = () => {
    if (!recipientId) {
      showToast(
        'Unable to start chat',
        'Recipient information is not available.',
        'error',
      );
      return;
    }

    const chat = preparedChat ?? existingChat;

    if (!chat) {
      showToast('Preparing conversation', 'Please try again in a moment.');
      return;
    }

    const participant = getOtherParticipant(chat, user);
    const profile = getParticipantProfile(participant);

    navigation.navigate('Chat', {
      chat,
      chatId: getChatId(chat),
      name: profile.name || counterparty.name || 'MRN User',
      recipient: profile,
      recipientAccountId: getParticipantAccountId(participant),
      recipientId: profile._id ?? profile.id ?? recipientId,
    });
  };

  if (!routeInformation && isLoadingDetails) {
    return (
      <Wrapper
        isScroll
        backgroundColor={AppColors.appBgColor}
        contentContainerStyle={styles.container}>
        <AppHeader
          variant="left"
          showBack
          title="Information Details"
          onLeftPress={() => navigation.goBack()}
          containerStyle={styles.header}
          leftButtonStyle={styles.headerBackButton}
          titleWrapStyle={styles.headerTitleWrap}
          titleStyle={styles.headerTitle}
          backIconColor={AppColors.appThemeBlue}
          backIconSize={responsiveFontSize(2.5)}
        />
        <DetailsScreenSkeleton />
      </Wrapper>
    );
  }

  if (
    !routeInformation &&
    (isDetailsError || !(information?._id ?? information?.id))
  ) {
    return (
      <Wrapper
        backgroundColor={AppColors.appBgColor}
        contentContainerStyle={styles.container}>
        <AppHeader
          variant="left"
          showBack
          title="Information Details"
          onLeftPress={() => navigation.goBack()}
        />
        <View style={styles.deepLinkState}>
          <AppText style={styles.deepLinkError}>
            Unable to load information details.
          </AppText>
          <AppButton
            title="Retry"
            onPress={refetchDetails}
            variant="gradient"
            gradientColors={AppColors.appGradient}
            style={styles.retryButton}
          />
        </View>
      </Wrapper>
    );
  }

  return (
    <Wrapper
      isScroll
      backgroundColor={AppColors.appBgColor}
      contentContainerStyle={styles.container}>
      <AppHeader
        variant="left"
        showBack
        title="Information Details"
        onLeftPress={() => navigation.goBack()}
        containerStyle={styles.header}
        leftButtonStyle={styles.headerBackButton}
        titleWrapStyle={styles.headerTitleWrap}
        titleStyle={styles.headerTitle}
        backIconColor={AppColors.appThemeBlue}
        backIconSize={responsiveFontSize(2.5)}
      />

      <View style={styles.profileCard}>
        <View style={styles.profileTop}>
          <UserAvatar uri={counterparty.profile} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <AppText numberOfLines={1} style={styles.name}>
              {counterparty.name || 'MRN User'}
            </AppText>
            <AppText style={styles.requestId}>
              Information #{getShortId(information)}
            </AppText>
            <AppText style={styles.addedAt}>
              Added on {createdAt ? moment(createdAt).format('DD MMM YYYY, hh:mm A') : 'N/A'}
            </AppText>
          </View>
        </View>

        <View style={styles.summaryRow}>
          {summaryItems.map((item, index) => (
            <View
              key={item.label}
              style={[styles.summaryItem, index > 0 && styles.summaryDivider]}>
              <Icon icon={item.icon} size={responsiveFontSize(1.8)} />
              <AppText style={styles.summaryLabel}>{item.label}</AppText>
              <AppText numberOfLines={2} style={styles.summaryValue}>
                {item.value}
              </AppText>
            </View>
          ))}
        </View>
      </View>

      <AppText style={styles.sectionTitle}>Client Information</AppText>
      <View style={styles.infoCard}>
        {clientInfo.map(item => (
          <View key={item.id} style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Icon icon={item.icon} size={responsiveFontSize(1.8)} />
            </View>
            <AppText style={styles.infoText}>{item.value}</AppText>
          </View>
        ))}
      </View>

      <AppText style={styles.sectionTitle}>Requested Services</AppText>
      <View style={styles.serviceCard}>
        <View style={styles.serviceRow}>
          <AppText style={styles.serviceLabel}>Service</AppText>
          <AppText style={styles.serviceValue}>
            {service.name || 'Not available'}
          </AppText>
        </View>
        <View style={styles.serviceRow}>
          <AppText style={styles.serviceLabel}>Date</AppText>
          <AppText style={styles.serviceValue}>
            {createdAt ? moment(createdAt).format('DD MMM YYYY') : 'N/A'}
          </AppText>
        </View>
        <View style={styles.serviceRow}>
          <AppText style={styles.serviceLabel}>Time</AppText>
          <AppText style={styles.serviceValue}>
            {createdAt ? moment(createdAt).format('hh:mm A') : 'N/A'}
          </AppText>
        </View>
        <View style={styles.serviceRow}>
          <AppText style={styles.serviceLabel}>Status</AppText>
          {canUpdateStatus ? (
            <AppButton
              title={statusLabel}
              onPress={() => setShowStatusOption(isVisible => !isVisible)}
              disabled={isUpdatingStatus}
              variant="gradient"
              gradientColors={AppColors.appGradient}
              rightIcon={
                <Feather
                  name={showStatusOption ? 'chevron-up' : 'chevron-down'}
                  color={AppColors.white}
                  size={responsiveFontSize(1.25)}
                />
              }
              style={styles.statusPill}
              contentStyle={styles.statusContent}
              textStyle={styles.statusText}
            />
          ) : (
            <LinearGradient
              colors={AppColors.appGradient}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.staticStatusPill}>
              <AppText style={styles.statusText}>{statusLabel}</AppText>
            </LinearGradient>
          )}
        </View>
        {canUpdateStatus && showStatusOption ? (
          <View style={styles.statusOptionPanel}>
            <View style={styles.statusOptionCopy}>
              <AppText style={styles.statusOptionCaption}>Next status</AppText>
              <AppText style={styles.statusOptionValue}>
                {nextStatusLabel}
              </AppText>
            </View>
            <AppButton
              title={`Move to ${nextStatusLabel}`}
              onPress={handleStatusUpdate}
              loading={isUpdatingStatus}
              variant="gradient"
              gradientColors={AppColors.appGradient}
              showRightArrow
              style={styles.statusOptionButton}
              contentStyle={styles.statusOptionButtonContent}
              textStyle={styles.statusOptionButtonText}
            />
          </View>
        ) : null}
      </View>

      <AppText style={styles.sectionTitle}>Additional Notes</AppText>
      <View style={styles.notesCard}>
        <AppText style={styles.notesText}>
          {information.note || 'No additional notes provided.'}
        </AppText>
      </View>

      <View style={styles.footer}>
        <AppButton
          title="Call"
          onPress={handleCall}
          disabled={!callPhone}
          variant="gradient"
          gradientColors={AppColors.appGradient}
          style={styles.footerButton}
          textStyle={styles.footerButtonText}
        />
        <AppButton
          title="Message"
          onPress={handleMessage}
          disabled={!recipientId}
          variant="gradient"
          gradientColors={AppColors.appGradient}
          style={styles.footerButton}
          textStyle={styles.footerButtonText}
        />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.appBgColor,
    paddingHorizontal: responsiveWidth(5.6),
    paddingBottom: responsiveHeight(4.2),
  },
  header: { minHeight: responsiveHeight(4.4), paddingHorizontal: 0 },
  headerBackButton: {
    width: responsiveWidth(6.4),
    height: responsiveWidth(6.4),
    marginRight: responsiveWidth(1.7),
  },
  headerTitleWrap: { paddingHorizontal: 0 },
  headerTitle: {
    color: AppColors.black,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(2.1),
  },
  profileCard: {
    marginTop: responsiveHeight(2.3),
    borderWidth: 1,
    borderColor: '#7EA5DA',
    borderRadius: responsiveWidth(2),
    backgroundColor: '#A9C8F6',
    overflow: 'hidden',
  },
  profileTop: {
    minHeight: responsiveHeight(10.9),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(1.25),
  },
  avatar: {
    width: responsiveWidth(13.6),
    height: responsiveWidth(13.6),
    borderRadius: responsiveWidth(6.8),
  },
  profileInfo: {
    flex: 1,
    marginLeft: responsiveWidth(3.3),
  },
  name: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.85),
  },
  requestId: {
    marginTop: responsiveHeight(0.3),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.35),
  },
  addedAt: {
    marginTop: responsiveHeight(0.35),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.25),
  },
  summaryRow: {
    minHeight: responsiveHeight(6.6),
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#8CAFE0',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: responsiveWidth(0.7),
  },
  summaryDivider: { borderLeftWidth: 1, borderLeftColor: '#8CAFE0' },
  summaryLabel: {
    marginTop: responsiveHeight(0.3),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.05),
    textAlign: 'center',
  },
  summaryValue: {
    marginTop: responsiveHeight(0.15),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(0.95),
    textAlign: 'center',
  },
  sectionTitle: {
    marginTop: responsiveHeight(2.15),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(1.85),
  },
  infoCard: {
    marginTop: responsiveHeight(0.75),
    borderRadius: responsiveWidth(1.8),
    backgroundColor: '#A9C8F6',
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(1),
    gap: responsiveHeight(0.85),
  },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoIconBox: {
    width: responsiveWidth(6),
    height: responsiveWidth(6),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: responsiveWidth(1),
    backgroundColor: AppColors.appThemeBlue,
  },
  infoText: {
    flex: 1,
    marginLeft: responsiveWidth(2.3),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.4),
  },
  serviceCard: {
    marginTop: responsiveHeight(0.75),
    borderRadius: responsiveWidth(1.8),
    backgroundColor: '#A9C8F6',
    paddingHorizontal: responsiveWidth(3.5),
    paddingVertical: responsiveHeight(1.25),
    gap: responsiveHeight(1),
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: responsiveWidth(3),
  },
  serviceLabel: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.semiBold,
    fontSize: responsiveFontSize(1.4),
  },
  serviceValue: {
    flexShrink: 1,
    color: AppColors.themeTxt,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.4),
    textAlign: 'right',
  },
  statusPill: {
    height: responsiveHeight(3.05),
    minHeight: responsiveHeight(3.05),
    width: responsiveWidth(24),
    borderRadius: responsiveWidth(0.8),
    backgroundColor: AppColors.appThemeBlue,
    paddingHorizontal: 0,
  },
  staticStatusPill: {
    height: responsiveHeight(3.05),
    minHeight: responsiveHeight(3.05),
    width: responsiveWidth(24),
    borderRadius: responsiveWidth(0.8),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  statusText: {
    color: AppColors.white,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.25),
    lineHeight: responsiveFontSize(1.5),
  },
  statusContent: {
    gap: responsiveWidth(0.6),
  },
  statusOptionPanel: {
    marginTop: responsiveHeight(0.4),
    paddingTop: responsiveHeight(1.1),
    borderTopWidth: 1,
    borderTopColor: '#7EA5DA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusOptionCopy: {
    flex: 1,
  },
  statusOptionCaption: {
    color: AppColors.themeTxt2,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.15),
  },
  statusOptionValue: {
    marginTop: responsiveHeight(0.15),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.semiBold,
    fontSize: responsiveFontSize(1.5),
  },
  statusOptionButton: {
    width: responsiveWidth(39),
    height: responsiveHeight(4.1),
    minHeight: responsiveHeight(4.1),
    borderRadius: responsiveWidth(1.4),
  },
  statusOptionButtonContent: {
    paddingRight: responsiveWidth(1.5),
  },
  statusOptionButtonText: {
    fontSize: responsiveFontSize(1.18),
  },
  notesCard: {
    marginTop: responsiveHeight(0.75),
    borderRadius: responsiveWidth(1.8),
    backgroundColor: '#A9C8F6',
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(1.15),
  },
  notesText: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.35),
    lineHeight: responsiveFontSize(1.78),
  },
  footer: {
    flexDirection: 'row',
    gap: responsiveWidth(4.4),
    marginTop: responsiveHeight(2.4),
    paddingTop: responsiveHeight(2),
  },
  footerButton: {
    flex: 1,
    minHeight: responsiveHeight(5.45),
    height: responsiveHeight(5.45),
    borderRadius: responsiveWidth(1.7),
  },
  footerButtonText: {
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(1.7),
  },
  deepLinkState: {
    minHeight: responsiveHeight(65),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: responsiveWidth(8),
  },
  deepLinkError: {
    color: AppColors.bodyText,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(1.55),
    textAlign: 'center',
  },
  retryButton: {
    width: responsiveWidth(42),
    marginTop: responsiveHeight(2),
  },
});

export default InformationDetailsScreen;
