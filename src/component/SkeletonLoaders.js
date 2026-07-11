import React from 'react';
import { StyleSheet, View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {
  responsiveHeight,
  responsiveWidth,
} from '../utils/Responsive_Dimensions';

const skeletonColors = {
  backgroundColor: '#A9C8F6',
  highlightColor: '#D4E4FF',
};

const StatCardSkeleton = () => (
  <View style={styles.statCard}>
    <SkeletonPlaceholder
      borderRadius={responsiveWidth(2.1)}
      backgroundColor={skeletonColors.backgroundColor}
      highlightColor={skeletonColors.highlightColor}>
      <SkeletonPlaceholder.Item
        width="100%"
        height={responsiveHeight(13.9)}
        borderRadius={responsiveWidth(2.1)}
      />
    </SkeletonPlaceholder>
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
    <SkeletonPlaceholder
      borderRadius={responsiveWidth(1)}
      backgroundColor="#7EA5DA"
      highlightColor={skeletonColors.highlightColor}>
      <SkeletonPlaceholder.Item flexDirection="row" alignItems="center">
        <SkeletonPlaceholder.Item
          width={responsiveWidth(12.2)}
          height={responsiveWidth(12.2)}
          borderRadius={responsiveWidth(6.1)}
        />
        <SkeletonPlaceholder.Item marginLeft={responsiveWidth(3)} flex={1}>
          <SkeletonPlaceholder.Item
            width="55%"
            height={responsiveHeight(1.8)}
            borderRadius={responsiveWidth(0.8)}
          />
          <SkeletonPlaceholder.Item
            marginTop={responsiveHeight(0.7)}
            width="45%"
            height={responsiveHeight(1.35)}
            borderRadius={responsiveWidth(0.8)}
          />
          <SkeletonPlaceholder.Item
            marginTop={responsiveHeight(0.8)}
            width="70%"
            height={responsiveHeight(1.25)}
            borderRadius={responsiveWidth(0.8)}
          />
        </SkeletonPlaceholder.Item>
        <SkeletonPlaceholder.Item
          width={responsiveWidth(28.8)}
          height={responsiveHeight(4.15)}
          borderRadius={responsiveWidth(2.3)}
        />
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  </View>
);

export const IntroductionCardsSkeleton = ({ count = 4 }) => (
  <View style={styles.introductionList}>
    {Array.from({ length: count }, (_, index) => (
      <IntroductionCardSkeleton key={`intro-card-skeleton-${index}`} />
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
    overflow: 'hidden',
  },
  introductionList: {
    marginTop: responsiveHeight(1.1),
    gap: responsiveHeight(1.8),
  },
  introductionCard: {
    minHeight: responsiveHeight(10.55),
    borderRadius: responsiveWidth(2.2),
    backgroundColor: skeletonColors.backgroundColor,
    paddingHorizontal: responsiveWidth(3.2),
    paddingVertical: responsiveHeight(1.2),
    overflow: 'hidden',
  },
});
