import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import { socketService } from '../utils/socket';
import {
  flushNotificationNavigation,
  navigationRef,
  setNavigationAuthenticated,
} from '../utils/navigation';

const Stack = createStackNavigator();

const Routes = ({ setSafeAreaColor }) => {
  const token = useSelector(state => state.auth.token);
  const user = useSelector(state => state.auth.user);
  const isAuthenticated = Boolean(token && user);

  useEffect(() => {
    if (isAuthenticated) {
      socketService.connect(token);
    } else {
      socketService.disconnect();
    }

    return () => socketService.disconnect();
  }, [isAuthenticated, token]);

  useEffect(() => {
    setNavigationAuthenticated(isAuthenticated);
  }, [isAuthenticated]);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={flushNotificationNavigation}>
      <Stack.Navigator
        key={isAuthenticated ? 'main-flow' : 'auth-flow'}
        screenOptions={{
          headerShown: false,
        }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main">
            {props => (
              <MainStack {...props} setSafeAreaColor={setSafeAreaColor} />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Auth">
            {props => (
              <AuthStack {...props} setSafeAreaColor={setSafeAreaColor} />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Routes;
