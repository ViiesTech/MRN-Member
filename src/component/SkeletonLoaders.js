import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  responsiveHeight,
  responsiveWidth,
} from '../utils/Responsive_Dimensions';

const skeletonColors = {
  backgroundColor: '#8EB4EA',
  highlightColor: '#DCEAFF',
};

const ShimmerBlock = ({ style }) => {
  const progress = useRef(new Animated.Value(0)).current;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!width) {
      return undefined;
    }

    progress.setValue(0);
    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    animation.start();
    return () => animation.stop();
  }, [progress, width]);

  const shimmerWidth = Math.max(width * 0.62, 110);
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-shimmerWidth, width],
  });
  const cardOpacity = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.72, 1, 0.72],
  });

  return (
    <Animated.View
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
      style={[styles.shimmerBlock, style, { opacity: cardOpacity }]}>
      {width ? (
        <Animated.View
          style={[
            styles.shimmerBand,
            { width: shimmerWidth, transform: [{ translateX }] },
          ]}>
          <LinearGradient
            colors={['#8EB4EA00', '#F4F8FF', '#8EB4EA00']}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
      ) : null}
    </Animated.View>
  );
};

const StatCardSkeleton = () => (
  <View style={styles.statCard}>
    <ShimmerBlock style={styles.statIcon} />
    <ShimmerBlock style={styles.statValue} />
    <ShimmerBlock style={styles.statLabel} />
    <View style={styles.statChangeRow}>
      <ShimmerBlock style={styles.statChangeIcon} />
      <ShimmerBlock style={styles.statChangeValue} />
    </View>
  </View>
);

export const StatCardsSkeleton = ({ count = 4 }) => (
  <View style={styles.statsRow}>
    {Array.from({ length: count }, (_, index) => (
      <StatCardSkeleton key={`stat-card-skeleton-${index}`} />
    ))}
  </View>
);

const IntroductionCardSkeleton = () => (
  <View style={styles.introductionCard}>
    <ShimmerBlock style={styles.introductionAvatar} />
    <View style={styles.introductionText}>
      <ShimmerBlock style={styles.introductionTitle} />
      <ShimmerBlock style={styles.introductionService} />
      <ShimmerBlock style={styles.introductionLocation} />
    </View>
    <ShimmerBlock style={styles.introductionAction} />
  </View>
);

export const IntroductionCardsSkeleton = ({ count = 4 }) => (
  <View style={styles.introductionList}>
    {Array.from({ length: count }, (_, index) => (
      <IntroductionCardSkeleton key={`intro-card-skeleton-${index}`} />
    ))}
  </View>
);

const ReportActivityCardSkeleton = () => (
  <View style={styles.reportCard}>
    <View style={styles.reportRow}>
      <ShimmerBlock style={styles.reportIcon} />
      <View style={styles.reportContent}>
        <View style={styles.reportTitleRow}>
          <ShimmerBlock style={styles.reportTitle} />
          <ShimmerBlock style={styles.reportDate} />
        </View>
        <ShimmerBlock style={styles.reportDescription} />
        <ShimmerBlock style={styles.reportTime} />
      </View>
    </View>
  </View>
);

export const ReportActivitySkeleton = ({ count = 4 }) => (
  <View style={styles.reportList}>
    {Array.from({ length: count }, (_, index) => (
      <ReportActivityCardSkeleton key={`report-skeleton-${index}`} />
    ))}
  </View>
);

const SelectionCardSkeleton = () => (
  <View style={styles.selectionCard}>
    <ShimmerBlock style={styles.selectionIcon} />
    <View style={styles.selectionText}>
      <ShimmerBlock style={styles.selectionTitle} />
      <ShimmerBlock style={styles.selectionDescription} />
    </View>
    <ShimmerBlock style={styles.selectionArrow} />
  </View>
);

export const NetworkCardsSkeleton = ({ count = 4 }) => (
  <View style={styles.selectionList}>
    {Array.from({ length: count }, (_, index) => (
      <SelectionCardSkeleton key={`network-card-skeleton-${index}`} />
    ))}
  </View>
);

const InformationCardSkeleton = () => (
  <View style={styles.informationCard}>
    <ShimmerBlock style={styles.informationAvatar} />
    <View style={styles.informationText}>
      <View style={styles.informationHeaderRow}>
        <ShimmerBlock style={styles.informationTitle} />
        <ShimmerBlock style={styles.informationBadge} />
      </View>
      <ShimmerBlock style={styles.informationService} />
      <ShimmerBlock style={styles.informationLocation} />
    </View>
  </View>
);

export const InformationCardsSkeleton = ({ count = 3 }) => (
  <View style={styles.informationList}>
    {Array.from({ length: count }, (_, index) => (
      <InformationCardSkeleton key={`information-card-skeleton-${index}`} />
    ))}
  </View>
);

const MemberCardSkeleton = () => (
  <View style={styles.memberCard}>
    <View style={styles.memberSkeletonTop}>
      <ShimmerBlock style={styles.memberAvatar} />
      <View style={styles.memberSkeletonText}>
        <ShimmerBlock style={styles.memberNameLine} />
        <ShimmerBlock style={styles.memberContextLine} />
        <ShimmerBlock style={styles.memberContextShortLine} />
      </View>
      <ShimmerBlock style={styles.memberArrow} />
    </View>
    <ShimmerBlock style={styles.memberAboutLabel} />
    <ShimmerBlock style={styles.memberAboutLine} />
    <ShimmerBlock style={styles.memberAboutShortLine} />
    <View style={styles.memberSkeletonDivider} />
    <View style={styles.memberSkeletonDetails}>
      <ShimmerBlock style={styles.memberDetailBlock} />
      <View style={styles.memberDetailDivider} />
      <ShimmerBlock style={styles.memberDetailBlock} />
    </View>
  </View>
);

export const MemberCardsSkeleton = ({ count = 4 }) => (
  <View style={styles.informationList}>
    {Array.from({ length: count }, (_, index) => (
      <MemberCardSkeleton key={`member-card-skeleton-${index}`} />
    ))}
  </View>
);

export const ServiceCardsSkeleton = ({ count = 4 }) => (
  <View style={styles.serviceGrid}>
    {Array.from({ length: count }, (_, index) => (
      <View key={`service-card-skeleton-${index}`} style={styles.serviceCard}>
        <ShimmerBlock style={styles.serviceRadio} />
        <ShimmerBlock style={styles.serviceIcon} />
        <ShimmerBlock style={styles.serviceTitle} />
        <ShimmerBlock style={styles.serviceDescription} />
        <ShimmerBlock style={styles.serviceDescriptionShort} />
      </View>
    ))}
  </View>
);

export const DetailsScreenSkeleton = () => (
  <View style={styles.detailsSkeletonContainer}>
    {/* Profile Card */}
    <View style={styles.detailsProfileCard}>
      <View style={styles.detailsProfileTop}>
        <ShimmerBlock style={styles.detailsAvatar} />
        <View style={styles.detailsProfileText}>
          <ShimmerBlock style={styles.detailsNameLine} />
          <ShimmerBlock style={styles.detailsIdLine} />
          <ShimmerBlock style={styles.detailsDateLine} />
        </View>
      </View>
      <View style={styles.detailsSummaryRow}>
        {Array.from({ length: 4 }, (_, index) => (
          <View
            key={`details-summary-skeleton-${index}`}
            style={styles.detailsSummaryItem}>
            <ShimmerBlock style={styles.detailsSummaryIcon} />
            <ShimmerBlock style={styles.detailsSummaryLabel} />
            <ShimmerBlock style={styles.detailsSummaryValue} />
          </View>
        ))}
      </View>
    </View>

    {/* Client Information Section */}
    <ShimmerBlock style={styles.detailsSectionTitle} />
    <View style={styles.detailsCard}>
      {Array.from({ length: 3 }, (_, index) => (
        <View
          key={`details-info-row-skeleton-${index}`}
          style={styles.detailsInfoRow}>
          <ShimmerBlock style={styles.detailsInfoIconBox} />
          <ShimmerBlock style={styles.detailsInfoText} />
        </View>
      ))}
    </View>

    {/* Requested Services Section */}
    <ShimmerBlock style={styles.detailsSectionTitle} />
    <View style={styles.detailsCard}>
      {Array.from({ length: 4 }, (_, index) => (
        <View
          key={`details-service-row-skeleton-${index}`}
          style={styles.detailsServiceRow}>
          <ShimmerBlock style={styles.detailsServiceLabel} />
          <ShimmerBlock style={styles.detailsServiceValue} />
        </View>
      ))}
    </View>

    {/* Footer Buttons */}
    <View style={styles.detailsFooter}>
      <ShimmerBlock style={styles.detailsFooterButton} />
      <ShimmerBlock style={styles.detailsFooterButton} />
    </View>
  </View>
);

const NotificationCardSkeleton = () => (
  <View style={styles.notificationCard}>
    <ShimmerBlock style={styles.notificationIconBox} />
    <View style={styles.notificationContent}>
      <View style={styles.notificationTitleRow}>
        <ShimmerBlock style={styles.notificationTitle} />
        <ShimmerBlock style={styles.notificationTime} />
      </View>
      <ShimmerBlock style={styles.notificationDescription} />
      <ShimmerBlock style={styles.notificationDescriptionShort} />
    </View>
  </View>
);

export const NotificationCardsSkeleton = ({ count = 5 }) => (
  <View style={styles.notificationList}>
    {Array.from({ length: count }, (_, index) => (
      <NotificationCardSkeleton key={`notification-card-skeleton-${index}`} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: responsiveWidth(2.4),
    marginTop: responsiveHeight(3.1),
  },
  statCard: {
    flex: 1,
    minHeight: responsiveHeight(13.9),
    borderRadius: responsiveWidth(2.1),
    backgroundColor: '#A9C8F6',
    paddingHorizontal: responsiveWidth(2),
    paddingVertical: responsiveHeight(1.15),
    overflow: 'hidden',
  },
  statIcon: {
    width: responsiveWidth(6),
    height: responsiveWidth(6),
    borderRadius: responsiveWidth(3),
  },
  statValue: {
    width: '48%',
    height: responsiveHeight(2.5),
    marginTop: responsiveHeight(1.05),
    borderRadius: responsiveWidth(0.8),
  },
  statLabel: {
    width: '88%',
    height: responsiveHeight(1.25),
    marginTop: responsiveHeight(0.55),
    borderRadius: responsiveWidth(0.65),
  },
  statChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: responsiveHeight(1.05),
  },
  statChangeIcon: {
    width: responsiveWidth(2.4),
    height: responsiveWidth(2.4),
    borderRadius: responsiveWidth(1.2),
  },
  statChangeValue: {
    width: '38%',
    height: responsiveHeight(1.1),
    marginLeft: responsiveWidth(0.75),
    borderRadius: responsiveWidth(0.6),
  },
  introductionList: {
    marginTop: responsiveHeight(1.1),
    gap: responsiveHeight(1.8),
  },
  introductionCard: {
    minHeight: responsiveHeight(10.55),
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: responsiveWidth(2.2),
    backgroundColor: '#A9C8F6',
    paddingHorizontal: responsiveWidth(3.2),
    paddingVertical: responsiveHeight(1.2),
    overflow: 'hidden',
  },
  introductionAvatar: {
    width: responsiveWidth(12.2),
    height: responsiveWidth(12.2),
    borderRadius: responsiveWidth(6.1),
  },
  introductionText: {
    flex: 1,
    marginLeft: responsiveWidth(3),
  },
  introductionTitle: {
    width: '55%',
    height: responsiveHeight(1.5),
    borderRadius: responsiveWidth(0.7),
  },
  introductionService: {
    width: '45%',
    height: responsiveHeight(1.05),
    marginTop: responsiveHeight(0.8),
    borderRadius: responsiveWidth(0.7),
  },
  introductionLocation: {
    width: '70%',
    height: responsiveHeight(1.05),
    marginTop: responsiveHeight(0.7),
    borderRadius: responsiveWidth(0.7),
  },
  introductionAction: {
    width: responsiveWidth(22),
    height: responsiveHeight(3.7),
    borderRadius: responsiveWidth(1.8),
  },
  reportList: {
    marginTop: responsiveHeight(1.2),
    gap: responsiveHeight(1.5),
  },
  reportCard: {
    minHeight: responsiveHeight(10.4),
    borderRadius: responsiveWidth(2.2),
    backgroundColor: '#A9C8F6',
    paddingHorizontal: responsiveWidth(3.2),
    paddingVertical: responsiveHeight(1.5),
    overflow: 'hidden',
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportIcon: {
    width: responsiveWidth(11),
    height: responsiveWidth(11),
    borderRadius: responsiveWidth(5.5),
  },
  reportContent: {
    flex: 1,
    marginLeft: responsiveWidth(3.2),
  },
  reportTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reportTitle: {
    width: '50%',
    height: responsiveHeight(1.6),
    borderRadius: responsiveWidth(0.8),
  },
  reportDate: {
    width: '24%',
    height: responsiveHeight(1.2),
    borderRadius: responsiveWidth(0.6),
  },
  reportDescription: {
    width: '85%',
    height: responsiveHeight(1.3),
    marginTop: responsiveHeight(0.8),
    borderRadius: responsiveWidth(0.6),
  },
  reportTime: {
    width: '18%',
    height: responsiveHeight(1.1),
    marginTop: responsiveHeight(0.7),
    alignSelf: 'flex-end',
    borderRadius: responsiveWidth(0.5),
  },
  selectionList: {
    marginTop: responsiveHeight(1.5),
    gap: responsiveHeight(1.6),
  },
  selectionCard: {
    width: '100%',
    height: responsiveHeight(8.8),
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: responsiveWidth(2.4),
    borderWidth: 1,
    borderColor: '#7B9FCE',
    backgroundColor: '#ADC9F5',
    paddingHorizontal: responsiveWidth(2.6),
  },
  selectionIcon: {
    width: responsiveWidth(13.6),
    height: responsiveWidth(13.6),
    borderRadius: responsiveWidth(1.5),
  },
  selectionText: {
    flex: 1,
    marginLeft: responsiveWidth(3.5),
    paddingRight: responsiveWidth(2),
  },
  selectionTitle: {
    width: '48%',
    height: responsiveHeight(1.55),
    borderRadius: responsiveWidth(0.7),
  },
  selectionDescription: {
    width: '76%',
    height: responsiveHeight(1.15),
    marginTop: responsiveHeight(0.75),
    borderRadius: responsiveWidth(0.7),
  },
  selectionArrow: {
    width: responsiveWidth(6),
    height: responsiveWidth(6),
    borderRadius: responsiveWidth(3),
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: responsiveHeight(1.9),
    marginTop: responsiveHeight(4.2),
  },
  informationList: {
    gap: responsiveHeight(1.5),
  },
  informationCard: {
    minHeight: responsiveHeight(10.4),
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: responsiveWidth(2.1),
    backgroundColor: '#A9C8F6',
    paddingHorizontal: responsiveWidth(3.2),
    paddingVertical: responsiveHeight(1.2),
  },
  memberCard: {
    minHeight: responsiveHeight(18.4),
    borderRadius: responsiveWidth(2.1),
    backgroundColor: '#A9C8F6',
    borderWidth: 1,
    borderColor: '#8CB1E3',
    paddingHorizontal: responsiveWidth(3.4),
    paddingTop: responsiveHeight(1.35),
    paddingBottom: responsiveHeight(1.15),
  },
  memberSkeletonTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: responsiveWidth(13.4),
    height: responsiveWidth(13.4),
    borderRadius: responsiveWidth(6.7),
  },
  memberSkeletonText: {
    flex: 1,
    marginLeft: responsiveWidth(3),
    paddingRight: responsiveWidth(1.5),
  },
  memberNameLine: {
    width: '58%',
    height: responsiveHeight(1.65),
    borderRadius: responsiveWidth(0.7),
  },
  memberContextLine: {
    width: '72%',
    height: responsiveHeight(1.05),
    marginTop: responsiveHeight(0.75),
    borderRadius: responsiveWidth(0.7),
  },
  memberContextShortLine: {
    width: '55%',
    height: responsiveHeight(1.05),
    marginTop: responsiveHeight(0.65),
    borderRadius: responsiveWidth(0.7),
  },
  memberArrow: {
    width: responsiveWidth(6),
    height: responsiveWidth(6),
    borderRadius: responsiveWidth(3),
  },
  memberAboutLabel: {
    width: '14%',
    height: responsiveHeight(0.9),
    marginTop: responsiveHeight(1.1),
    borderRadius: responsiveWidth(0.6),
  },
  memberAboutLine: {
    width: '88%',
    height: responsiveHeight(1.05),
    marginTop: responsiveHeight(0.55),
    borderRadius: responsiveWidth(0.7),
  },
  memberAboutShortLine: {
    width: '64%',
    height: responsiveHeight(1.05),
    marginTop: responsiveHeight(0.45),
    borderRadius: responsiveWidth(0.7),
  },
  memberSkeletonDivider: {
    height: 1,
    marginTop: responsiveHeight(1.05),
    marginBottom: responsiveHeight(1),
    backgroundColor: '#86ABDC',
  },
  memberSkeletonDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberDetailBlock: {
    flex: 1,
    height: responsiveHeight(2.9),
    borderRadius: responsiveWidth(0.8),
  },
  memberDetailDivider: {
    width: 1,
    height: responsiveHeight(3.2),
    marginHorizontal: responsiveWidth(3),
    backgroundColor: '#86ABDC',
  },
  informationAvatar: {
    width: responsiveWidth(12.2),
    height: responsiveWidth(12.2),
    borderRadius: responsiveWidth(6.1),
  },
  informationText: {
    flex: 1,
    marginLeft: responsiveWidth(3),
  },
  informationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  informationTitle: {
    width: '52%',
    height: responsiveHeight(1.5),
    borderRadius: responsiveWidth(0.7),
  },
  informationService: {
    width: '44%',
    height: responsiveHeight(1.05),
    marginTop: responsiveHeight(0.8),
    borderRadius: responsiveWidth(0.7),
  },
  informationLocation: {
    width: '68%',
    height: responsiveHeight(1.05),
    marginTop: responsiveHeight(0.7),
    borderRadius: responsiveWidth(0.7),
  },
  informationBadge: {
    width: responsiveWidth(16),
    height: responsiveHeight(2.7),
    borderRadius: responsiveHeight(1.4),
  },
  serviceCard: {
    width: '47.5%',
    height: responsiveHeight(17.8),
    borderRadius: responsiveWidth(3.3),
    borderWidth: 1,
    borderColor: '#9AB7DC',
    backgroundColor: '#ADC9F5',
    paddingHorizontal: responsiveWidth(3.5),
    paddingTop: responsiveHeight(1.45),
  },
  serviceRadio: {
    position: 'absolute',
    top: responsiveHeight(1.1),
    right: responsiveWidth(2.7),
    width: responsiveHeight(2.15),
    height: responsiveHeight(2.15),
    borderRadius: responsiveHeight(1.1),
  },
  serviceIcon: {
    width: responsiveWidth(16),
    height: responsiveWidth(16),
    borderRadius: responsiveWidth(1.7),
  },
  serviceTitle: {
    width: '68%',
    height: responsiveHeight(1.55),
    marginTop: responsiveHeight(1.35),
    borderRadius: responsiveWidth(0.7),
  },
  serviceDescription: {
    width: '92%',
    height: responsiveHeight(1.05),
    marginTop: responsiveHeight(0.75),
    borderRadius: responsiveWidth(0.7),
  },
  serviceDescriptionShort: {
    width: '62%',
    height: responsiveHeight(1.05),
    marginTop: responsiveHeight(0.5),
    borderRadius: responsiveWidth(0.7),
  },
  detailsSkeletonContainer: {
    paddingBottom: responsiveHeight(4),
  },
  detailsProfileCard: {
    marginTop: responsiveHeight(1.1),
    borderRadius: responsiveWidth(2),
    backgroundColor: '#A9C8F6',
    padding: responsiveWidth(3.2),
    overflow: 'hidden',
  },
  detailsProfileTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsAvatar: {
    width: responsiveWidth(13),
    height: responsiveWidth(13),
    borderRadius: responsiveWidth(6.5),
  },
  detailsProfileText: {
    marginLeft: responsiveWidth(3),
    flex: 1,
  },
  detailsNameLine: {
    width: '60%',
    height: responsiveHeight(2.1),
    borderRadius: responsiveWidth(0.7),
  },
  detailsIdLine: {
    width: '45%',
    height: responsiveHeight(1.5),
    marginTop: responsiveHeight(0.8),
    borderRadius: responsiveWidth(0.6),
  },
  detailsDateLine: {
    width: '75%',
    height: responsiveHeight(1.3),
    marginTop: responsiveHeight(0.6),
    borderRadius: responsiveWidth(0.5),
  },
  detailsSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: responsiveHeight(1.4),
    paddingTop: responsiveHeight(1.2),
    borderTopWidth: 1,
    borderTopColor: '#93B7E9',
  },
  detailsSummaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(1),
  },
  detailsSummaryIcon: {
    width: responsiveWidth(5),
    height: responsiveWidth(5),
    borderRadius: responsiveWidth(2.5),
  },
  detailsSummaryLabel: {
    width: '80%',
    height: responsiveHeight(1.1),
    marginTop: responsiveHeight(0.6),
    borderRadius: responsiveWidth(0.5),
  },
  detailsSummaryValue: {
    width: '90%',
    height: responsiveHeight(1.3),
    marginTop: responsiveHeight(0.4),
    borderRadius: responsiveWidth(0.5),
  },
  detailsSectionTitle: {
    width: '45%',
    height: responsiveHeight(2.2),
    marginTop: responsiveHeight(2.4),
    marginBottom: responsiveHeight(1),
    borderRadius: responsiveWidth(0.7),
  },
  detailsCard: {
    borderRadius: responsiveWidth(2),
    backgroundColor: '#A9C8F6',
    padding: responsiveWidth(3.2),
    gap: responsiveHeight(1.4),
    overflow: 'hidden',
  },
  detailsInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsInfoIconBox: {
    width: responsiveWidth(8.5),
    height: responsiveWidth(8.5),
    borderRadius: responsiveWidth(1.7),
  },
  detailsInfoText: {
    flex: 1,
    height: responsiveHeight(1.8),
    marginLeft: responsiveWidth(2.8),
    borderRadius: responsiveWidth(0.6),
  },
  detailsServiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailsServiceLabel: {
    width: '28%',
    height: responsiveHeight(1.6),
    borderRadius: responsiveWidth(0.6),
  },
  detailsServiceValue: {
    width: '42%',
    height: responsiveHeight(1.6),
    borderRadius: responsiveWidth(0.6),
  },
  detailsFooter: {
    flexDirection: 'row',
    gap: responsiveWidth(4.4),
    marginTop: responsiveHeight(2.8),
  },
  detailsFooterButton: {
    flex: 1,
    height: responsiveHeight(5.45),
    borderRadius: responsiveWidth(1.7),
  },
  notificationList: {
    marginTop: responsiveHeight(1.5),
    gap: responsiveHeight(1.5),
  },
  notificationCard: {
    minHeight: responsiveHeight(8.6),
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: responsiveWidth(2),
    backgroundColor: '#A9C8F6',
    paddingHorizontal: responsiveWidth(3.2),
    paddingVertical: responsiveHeight(1.25),
    overflow: 'hidden',
  },
  notificationIconBox: {
    width: responsiveWidth(10.4),
    height: responsiveWidth(10.4),
    borderRadius: responsiveWidth(1.7),
  },
  notificationContent: {
    flex: 1,
    marginLeft: responsiveWidth(3),
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationTitle: {
    width: '55%',
    height: responsiveHeight(1.7),
    borderRadius: responsiveWidth(0.6),
  },
  notificationTime: {
    width: '18%',
    height: responsiveHeight(1.2),
    borderRadius: responsiveWidth(0.5),
  },
  notificationDescription: {
    width: '92%',
    height: responsiveHeight(1.25),
    marginTop: responsiveHeight(0.6),
    borderRadius: responsiveWidth(0.5),
  },
  notificationDescriptionShort: {
    width: '60%',
    height: responsiveHeight(1.25),
    marginTop: responsiveHeight(0.4),
    borderRadius: responsiveWidth(0.5),
  },
  shimmerBlock: {
    overflow: 'hidden',
    backgroundColor: skeletonColors.backgroundColor,
  },
  shimmerBand: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
});
