import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import { isMemberUser } from '../utils/authRole';

const Stack = createStackNavigator();

const Routes = ({ setSafeAreaColor }) => {
  const token = useSelector(state => state.auth.token);
  const user = useSelector(state => state.auth.user);
  const isMemberAuthenticated = Boolean(token && isMemberUser(user));

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        {isMemberAuthenticated ? (
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
