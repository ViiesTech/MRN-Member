import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import SVGXml from '../component/SvgXml';
import { AppIcons } from '../assets/Icons/Index';
import HomeScreen from '../screens/Main/HomeScreen';
import IntroductionsScreen from '../screens/Main/IntroductionsScreen';
import MoreScreen from '../screens/Main/MoreScreen';
import Reports from '../screens/Main/Reports';
import { AppColors } from '../utils/AppColors';
import { FontFamily } from '../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../utils/Responsive_Dimensions';

const Tab = createBottomTabNavigator();

const tabIcons = {
  Home: AppIcons.home,
  Introductions: AppIcons.introduction,
  Reports: AppIcons.reports,
  More: AppIcons.more2 || AppIcons.more,
};

const getIconSize = routeName => {
  switch (routeName) {
    case 'Introductions':
      return { width: responsiveWidth(5.4), height: responsiveWidth(4.9) };
    case 'Reports':
      return { width: responsiveWidth(5.1), height: responsiveWidth(6.2) };
    default:
      return { width: responsiveWidth(5.6), height: responsiveWidth(5.8) };
  }
};

const TabIcon = ({ routeName, focused }) => {
  const iconSize = getIconSize(routeName);

  return (
    <View style={[styles.iconWrap, focused && styles.activeIconWrap]}>
      <SVGXml
        icon={tabIcons[routeName]}
        width={iconSize.width}
        height={iconSize.height}
      />
    </View>
  );
};

const TabBarGradient = () => (
  <LinearGradient
    colors={AppColors.appGradient}
    start={{ x: 0, y: 0.5 }}
    end={{ x: 1, y: 0.5 }}
    style={styles.tabBarGradient}
  />
);

const getScreenOptions = ({ route, bottomInset }) => ({
  headerShown: false,
  tabBarActiveTintColor: AppColors.white,
  tabBarInactiveTintColor: AppColors.white,
  tabBarAllowFontScaling: false,
  tabBarLabelStyle: styles.tabLabel,
  tabBarStyle: [
    styles.tabBar,
    {
      height: responsiveHeight(6.8) + bottomInset,
      paddingBottom: Math.max(bottomInset, responsiveHeight(0.8)),
    },
  ],
  tabBarItemStyle: styles.tabBarItem,
  tabBarBackground: TabBarGradient,
  tabBarIcon: ({ focused }) => (
    <TabIcon routeName={route.name} focused={focused} />
  ),
});

const BottomStack = ({ setSafeAreaColor }) => {
  const { bottom: bottomInset } = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) =>
        getScreenOptions({ route, bottomInset })
      }>
      <Tab.Screen name="Home">
        {props => (
          <HomeScreen {...props} setSafeAreaColor={setSafeAreaColor} />
        )}
      </Tab.Screen>
      <Tab.Screen name="Introductions">
        {props => (
          <IntroductionsScreen
            {...props}
            setSafeAreaColor={setSafeAreaColor}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Reports">
        {props => (
          <Reports {...props} setSafeAreaColor={setSafeAreaColor} />
        )}
      </Tab.Screen>
      <Tab.Screen name="More">
        {props => (
          <MoreScreen {...props} setSafeAreaColor={setSafeAreaColor} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: 'transparent',
    paddingTop: responsiveHeight(0.55),
    overflow: 'hidden',
  },
  tabBarGradient: {
    flex: 1,
  },
  tabBarItem: {
    paddingTop: responsiveHeight(0.25),
    paddingBottom: responsiveHeight(0.45),
  },
  tabLabel: {
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.4),
    lineHeight: responsiveFontSize(1.9),
    marginTop: responsiveHeight(0.35),
    marginBottom: 0,
    includeFontPadding: false,
  },
  iconWrap: {
    width: responsiveWidth(8),
    height: responsiveHeight(3.05),
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.82,
  },
  activeIconWrap: {
    opacity: 1,
  },
});

export default BottomStack;
