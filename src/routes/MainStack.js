import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomStack from './BottomStack';
import ChatScreen from '../screens/Main/ChatScreen';
import IntroductionDetailsScreen from '../screens/Main/IntroductionDetailsScreen';
import MembershipFormScreen from '../screens/Main/MembershipFormScreen';
import MembershipStatusScreen from '../screens/Main/MembershipStatusScreen';
import NotificationsScreen from '../screens/Main/NotificationsScreen';
import PaymentScreen from '../screens/Main/PaymentScreen';

const Stack = createStackNavigator();

const MainStack = ({ setSafeAreaColor }) => {
  return (
    <Stack.Navigator
      initialRouteName="BottomStack"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="BottomStack">
        {props => (
          <BottomStack {...props} setSafeAreaColor={setSafeAreaColor} />
        )}
      </Stack.Screen>
      <Stack.Screen name="IntroductionDetails">
        {props => (
          <IntroductionDetailsScreen
            {...props}
            setSafeAreaColor={setSafeAreaColor}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Chat">
        {props => (
          <ChatScreen {...props} setSafeAreaColor={setSafeAreaColor} />
        )}
      </Stack.Screen>
      <Stack.Screen name="MembershipForm">
        {props => (
          <MembershipFormScreen
            {...props}
            setSafeAreaColor={setSafeAreaColor}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="MembershipUnderReview">
        {props => (
          <MembershipStatusScreen
            {...props}
            type="review"
            setSafeAreaColor={setSafeAreaColor}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="MembershipApproved">
        {props => (
          <MembershipStatusScreen
            {...props}
            type="approved"
            setSafeAreaColor={setSafeAreaColor}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="MembershipRejected">
        {props => (
          <MembershipStatusScreen
            {...props}
            type="rejected"
            setSafeAreaColor={setSafeAreaColor}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Payment">
        {props => (
          <PaymentScreen {...props} setSafeAreaColor={setSafeAreaColor} />
        )}
      </Stack.Screen>
      <Stack.Screen name="PaymentSuccess">
        {props => (
          <MembershipStatusScreen
            {...props}
            type="paymentSuccess"
            setSafeAreaColor={setSafeAreaColor}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="NotificationList">
        {props => (
          <NotificationsScreen
            {...props}
            setSafeAreaColor={setSafeAreaColor}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default MainStack;
