import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import EmailVerificationScreen from '../screens/Auth/EmailVerificationScreen';
import EnterDetailsScreen from '../screens/Auth/EnterDetailsScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import OnBoardingScreen from '../screens/Auth/OnBoardingScreen';
import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen';
import SplashScreen from '../screens/Auth/SplashScreen';

const Stack = createStackNavigator();

const AuthStack = ({ route, setSafeAreaColor }) => {
  const initialRouteName = route?.params?.screen ?? 'Splash';

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Splash">
        {props => (
          <SplashScreen {...props} setSafeAreaColor={setSafeAreaColor} />
        )}
      </Stack.Screen>
      <Stack.Screen name="OnBoarding">
        {props => (
          <OnBoardingScreen {...props} setSafeAreaColor={setSafeAreaColor} />
        )}
      </Stack.Screen>
      <Stack.Screen name="EnterDetails">
        {props => (
          <EnterDetailsScreen {...props} setSafeAreaColor={setSafeAreaColor} />
        )}
      </Stack.Screen>
      <Stack.Screen name="Login">
        {props => (
          <LoginScreen {...props} setSafeAreaColor={setSafeAreaColor} />
        )}
      </Stack.Screen>
      <Stack.Screen name="ForgotPassword">
        {props => (
          <ForgotPasswordScreen
            {...props}
            setSafeAreaColor={setSafeAreaColor}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="EmailVerification">
        {props => (
          <EmailVerificationScreen
            {...props}
            setSafeAreaColor={setSafeAreaColor}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ResetPassword">
        {props => (
          <ResetPasswordScreen
            {...props}
            setSafeAreaColor={setSafeAreaColor}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default AuthStack;
