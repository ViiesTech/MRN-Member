import React, { useState } from 'react';
import Feather from '@react-native-vector-icons/feather';
import { Linking, StyleSheet, View } from 'react-native';
import {
  AppButton,
  AppHeader,
  AppText,
  UserAvatar,
  Wrapper,
} from '../../component/Index';
import SVGXml from '../../component/SvgXml';
import { AppIcons } from '../../assets/Icons/Index';
import { AppColors } from '../../utils/AppColors';
import { FontFamily } from '../../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../utils/Responsive_Dimensions';
import { useSafeAreaColor } from '../../utils/useSafeAreaColor';
import { useUpdateIntroductionStatusMutation } from '../../redux/Services/authApi';
import {
  formatIntroductionStatus,
  getNextIntroductionStatus,
} from '../../utils/introductionStatus';
import { getApiErrorMessage } from '../../utils/apiError';
import { showToast } from '../../utils/Toast';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const getValidDate = value => {
  const date = value ? new Date(value) : null;

  return date && !Number.isNaN(date.getTime()) ? date : null;
};

const formatDate = value => {
  const date = getValidDate(value);

  return date
    ? `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
    : 'Not available';
};

const formatTime = value => {
  const date = getValidDate(value);

  if (!date) {
    return 'Not available';
  }

  const hours = date.getHours();
  const minutes = `${date.getMinutes()}`.padStart(2, '0');

  return `${hours % 12 || 12}:${minutes} ${hours >= 12 ? 'PM' : 'AM'}`;
};

const getIntroductionNumber = introduction => {
  const id = introduction?._id ?? introduction?.id;

  return id ? `${id}`.slice(-4).toUpperCase() : 'N/A';
};

const Icon = ({ icon, size = responsiveFontSize(1.9) }) => (
  <SVGXml icon={icon} width={size} height={size} />
);

const IntroductionDetailsScreen = ({
  navigation,
  route,
  setSafeAreaColor,
}) => {
  const introduction = route?.params?.introduction ?? {};
  const client = introduction.client ?? {};
  const consumer = introduction.consumerId ?? {};
  const network = introduction.networkId ?? {};
  const service = introduction.serviceId ?? {};
  const [currentStatus, setCurrentStatus] = useState(introduction.status);
  const [showStatusOption, setShowStatusOption] = useState(false);
  const [updateIntroductionStatus, { isLoading: isUpdatingStatus }] =
    useUpdateIntroductionStatusMutation();
  const activityDate = introduction.updatedAt ?? introduction.createdAt;
  const clientName = client.name ?? consumer.name ?? 'Member';
  const phone = client.phone ?? consumer.phone ?? '';
  const email = client.email ?? consumer.email ?? 'Not available';
  const address = client.address ?? 'Not available';
  const summaryItems = [
    {
      label: 'Network',
      value: network.name ?? 'Not available',
      icon: AppIcons.networkSmall,
    },
    {
      label: 'Provider',
      value: consumer.name ?? 'Not available',
      icon: AppIcons.profileSmall,
    },
    {
      label: 'Recipient',
      value: 'You',
      icon: AppIcons.profileSmall,
    },
    {
      label: 'Last Activity',
      value: formatDate(activityDate),
      icon: AppIcons.calender,
    },
  ];
  const clientInfo = [
    { id: 'phone', value: phone || 'Not available', icon: AppIcons.call },
    { id: 'email', value: email, icon: AppIcons.sms },
    { id: 'address', value: address, icon: AppIcons.locPin },
  ];
  const serviceRows = [
    { label: 'Service', value: service.name ?? 'Not available' },
    { label: 'Date', value: formatDate(introduction.createdAt) },
    { label: 'Time', value: formatTime(introduction.createdAt) },
  ];
  const nextStatus = getNextIntroductionStatus(currentStatus);
  const status = formatIntroductionStatus(currentStatus);
  const nextStatusLabel = formatIntroductionStatus(nextStatus);

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  const handleCall = () => {
    if (phone) {
      Linking.openURL(`tel:${phone.replace(/[^\d+]/g, '')}`);
    }
  };

  const handleStatusUpdate = async () => {
    const introductionId = introduction._id ?? introduction.id;

    if (!introductionId || !nextStatus) {
      return;
    }

    try {
      const response = await updateIntroductionStatus({
        introductionId,
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
        `Introduction moved to ${nextStatus}.`,
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

  return (
    <Wrapper
      isScroll
      backgroundColor={AppColors.appBgColor}
      contentContainerStyle={styles.container}>
      <AppHeader
        variant="left"
        showBack
        title="Introduction Details"
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
          <UserAvatar uri={consumer.profile} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <AppText style={styles.name}>{clientName}</AppText>
            <AppText style={styles.introId}>
              Introduction #{getIntroductionNumber(introduction)}
            </AppText>
            <AppText style={styles.addedAt}>
              Added on {formatDate(introduction.createdAt)},{' '}
              {formatTime(introduction.createdAt)}
            </AppText>
          </View>
        </View>

        <View style={styles.summaryRow}>
          {summaryItems.map((item, index) => (
            <View
              key={item.label}
              style={[
                styles.summaryItem,
                index > 0 && styles.summaryDivider,
              ]}>
              <Icon
                icon={item.icon}
                size={responsiveFontSize(2)}
              />
              <AppText style={styles.summaryLabel}>{item.label}</AppText>
              <AppText style={styles.summaryValue}>{item.value}</AppText>
            </View>
          ))}
        </View>
      </View>

      <AppText style={styles.sectionTitle}>Client Information</AppText>
      <View style={styles.infoCard}>
        {clientInfo.map(item => (
          <View key={item.id} style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Icon
                icon={item.icon}
                size={responsiveFontSize(1.95)}
              />
            </View>
            <AppText style={styles.infoText}>{item.value}</AppText>
          </View>
        ))}
      </View>

      <AppText style={styles.sectionTitle}>Requested Services</AppText>
      <View style={styles.serviceCard}>
        {serviceRows.map(item => (
          <View key={item.label} style={styles.serviceRow}>
            <AppText style={styles.serviceLabel}>{item.label}</AppText>
            <AppText style={styles.serviceValue}>{item.value}</AppText>
          </View>
        ))}
        <View style={styles.serviceRow}>
          <AppText style={styles.serviceLabel}>Status</AppText>
          <AppButton
            title={status}
            onPress={() => setShowStatusOption(isVisible => !isVisible)}
            disabled={!nextStatus || isUpdatingStatus}
            variant="gradient"
            gradientColors={AppColors.appGradient}
            rightIcon={
              nextStatus ? (
                <Feather
                  name={showStatusOption ? 'chevron-up' : 'chevron-down'}
                  color={AppColors.white}
                  size={responsiveFontSize(1.25)}
                />
              ) : null
            }
            style={styles.statusPill}
            contentStyle={styles.statusContent}
            textStyle={styles.statusText}
          />
        </View>
        {showStatusOption && nextStatus ? (
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
          {introduction.note || 'No additional notes provided.'}
        </AppText>
      </View>

      <View style={styles.footer}>
        <AppButton
          title="Call"
          onPress={handleCall}
          disabled={!phone}
          variant="gradient"
          gradientColors={AppColors.appGradient}
          style={styles.footerButton}
          textStyle={styles.footerButtonText}
        />
        <AppButton
          title="Message"
          onPress={() =>
            navigation.navigate('Chat', {
              participantName: clientName,
              introductionId: introduction._id ?? introduction.id,
            })
          }
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
  header: {
    minHeight: responsiveHeight(4.4),
    paddingHorizontal: 0,
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
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: responsiveHeight(10.9),
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(1.25),
  },
  avatar: {
    width: responsiveWidth(13.6),
    height: responsiveWidth(13.6),
    borderRadius: responsiveWidth(6.8),
  },
  profileInfo: {
    marginLeft: responsiveWidth(3.3),
  },
  name: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.85),
    lineHeight: responsiveFontSize(2.2),
  },
  introId: {
    marginTop: responsiveHeight(0.3),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.45),
    lineHeight: responsiveFontSize(1.75),
  },
  addedAt: {
    marginTop: responsiveHeight(0.35),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.45),
    lineHeight: responsiveFontSize(1.75),
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
    paddingHorizontal: responsiveWidth(0.8),
  },
  summaryDivider: {
    borderLeftWidth: 1,
    borderLeftColor: '#8CAFE0',
  },
  summaryLabel: {
    marginTop: responsiveHeight(0.35),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.18),
    lineHeight: responsiveFontSize(1.42),
    textAlign: 'center',
  },
  summaryValue: {
    marginTop: responsiveHeight(0.15),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.03),
    lineHeight: responsiveFontSize(1.26),
    textAlign: 'center',
  },
  sectionTitle: {
    marginTop: responsiveHeight(2.15),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(1.85),
    lineHeight: responsiveFontSize(2.25),
  },
  infoCard: {
    marginTop: responsiveHeight(0.75),
    borderRadius: responsiveWidth(1.8),
    backgroundColor: '#A9C8F6',
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(1),
    gap: responsiveHeight(0.85),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconBox: {
    width: responsiveWidth(6),
    height: responsiveWidth(6),
    borderRadius: responsiveWidth(1),
    backgroundColor: AppColors.appThemeBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    marginLeft: responsiveWidth(2.3),
    color: AppColors.themeTxt,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.5),
    lineHeight: responsiveFontSize(1.82),
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
  },
  serviceLabel: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.semiBold,
    fontSize: responsiveFontSize(1.5),
    lineHeight: responsiveFontSize(1.8),
  },
  serviceValue: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.5),
    lineHeight: responsiveFontSize(1.8),
  },
  statusPill: {
    height: responsiveHeight(3.05),
    minHeight: responsiveHeight(3.05),
    width: responsiveWidth(24),
    borderRadius: responsiveWidth(0.8),
    backgroundColor: AppColors.appThemeBlue,
    paddingHorizontal: 0,
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
    height: responsiveHeight(5.45),
    minHeight: responsiveHeight(5.45),
    borderRadius: responsiveWidth(1.7),
  },
  footerButtonText: {
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(1.7),
  },
});

export default IntroductionDetailsScreen;
