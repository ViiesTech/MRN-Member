import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import AuthStack from './AuthStack';
import MainStack from './MainStack';

const Stack = createStackNavigator();

const Routes = ({ setSafeAreaColor }) => {
  const token = useSelector(state => state.auth.token);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        {token ? (
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
