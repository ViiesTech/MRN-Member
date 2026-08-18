import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import SVGXml from '../component/SvgXml';
import { FilledTabIcons } from '../assets/Icons/FilledTabIcons';
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
const isAndroid = Platform.OS === 'android';
const inactiveIconColor = '#AAC1E3';

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
  const iconColor = focused ? AppColors.white : inactiveIconColor;
  const icon = FilledTabIcons[routeName].replace(/white/g, iconColor);

  return (
    <View
      style={[
        styles.iconWrap,
        isAndroid && styles.androidIconWrap,
        focused && styles.activeIconWrap,
      ]}>
      <SVGXml
        icon={icon}
        width={iconSize.width}
        height={iconSize.height}
      />
    </View>
  );
};

const TabBarGradient = () => {
  if (isAndroid) {
    return (
      <View style={styles.androidTabBarGradientFallback}>
        <LinearGradient
          colors={[
            AppColors.appThemeBlue,
            AppColors.appThemeDimBlue,
            AppColors.appThemeBlue,
          ]}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.androidTabBarGradient}
        />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={AppColors.appGradient}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.tabBarGradient}
    />
  );
};

const getScreenOptions = ({ route, bottomInset }) => ({
  headerShown: false,
  tabBarActiveTintColor: AppColors.white,
  tabBarInactiveTintColor: AppColors.white,
  tabBarAllowFontScaling: false,
  tabBarLabelStyle: isAndroid ? styles.androidTabLabel : styles.tabLabel,
  tabBarStyle: isAndroid
    ? [styles.tabBar, styles.androidTabBar]
    : [
        styles.tabBar,
        {
          height: responsiveHeight(6.8) + bottomInset,
          paddingBottom: Math.max(bottomInset, responsiveHeight(0.8)),
        },
      ],
  tabBarItemStyle: isAndroid
    ? styles.androidTabBarItem
    : styles.tabBarItem,
  tabBarBackground: () => <TabBarGradient />,
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
  androidTabBar: {
    height: responsiveHeight(10.2),
    backgroundColor: 'transparent',
    paddingTop: 0,
    paddingBottom: 0,
  },
  androidTabBarGradientFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: AppColors.appThemeBlue,
  },
  androidTabBarGradient: {
    ...StyleSheet.absoluteFillObject,
    height: responsiveHeight(10.2),
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
  androidTabBarItem: {
    paddingTop: responsiveHeight(0.8),
    paddingBottom: responsiveHeight(1),
  },
  androidTabLabel: {
    paddingBottom: 0,
    marginTop: responsiveHeight(0.35),
    color: AppColors.white,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(1.45),
    lineHeight: responsiveFontSize(2),
    includeFontPadding: false,
  },
  iconWrap: {
    width: responsiveWidth(8),
    height: responsiveHeight(3.05),
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 1,
  },
  androidIconWrap: {
    height: responsiveHeight(3),
  },
  activeIconWrap: {
    opacity: 1,
  },
});

export default BottomStack;
