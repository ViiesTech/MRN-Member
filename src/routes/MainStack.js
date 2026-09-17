import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomStack from './BottomStack';
import ChatListScreen from '../screens/Main/Common/ChatListScreen';
import ChatScreen from '../screens/Main/Common/ChatScreen';
import ChangePasswordScreen from '../screens/Main/Common/ChangePasswordScreen';
import IntroductionDetailsScreen from '../screens/Main/MemberFlow/IntroductionDetailsScreen';
import ViewMembersScreen from '../screens/Main/MemberFlow/ViewMembersScreen';
import MembershipFormScreen from '../screens/Main/MemberFlow/MembershipFormScreen';
import MembershipStatusScreen from '../screens/Main/MemberFlow/MembershipStatusScreen';
import NotificationsScreen from '../screens/Main/Common/NotificationsScreen';
import PaymentScreen from '../screens/Main/MemberFlow/PaymentScreen';
import ProfileScreen from '../screens/Main/Common/ProfileScreen';
import EditProfileScreen from '../screens/Main/Common/EditProfileScreen';
import ReportsScreen from '../screens/Main/Common/Reports';
import WebContentScreen from '../screens/Main/Common/WebContentScreen';
import SelectNetworksScreen from '../screens/Main/ConsumerFlow/SelectNetworksScreen';
import SelectServicesScreen from '../screens/Main/ConsumerFlow/SelectServicesScreen';
import AddClientDetailsScreen from '../screens/Main/ConsumerFlow/AddClientDetailsScreen';
import InformationSuccessScreen from '../screens/Main/ConsumerFlow/IntroductionSuccessScreen';
import InformationDetailsScreen from '../screens/Main/Common/InformationDetailsScreen';
import RegionsScreen from '../screens/Main/ConsumerFlow/HomeScreen';

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
      <Stack.Screen name="ViewMembers">
        {props => (
          <ViewMembersScreen
            {...props}
            setSafeAreaColor={setSafeAreaColor}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="SelectNetworks">
        {props => (
          <SelectNetworksScreen
            {...props}
            setSafeAreaColor={setSafeAreaColor}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Regions">
        {props => (
          <RegionsScreen {...props} setSafeAreaColor={setSafeAreaColor} />
        )}
      </Stack.Screen>
      <Stack.Screen name="SelectServices">
        {props => (
          <SelectServicesScreen
            {...props}
            setSafeAreaColor={setSafeAreaColor}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="AddClientDetails">
        {props => (
          <AddClientDetailsScreen
            {...props}
            setSafeAreaColor={setSafeAreaColor}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="InformationSuccess">
        {props => (
          <InformationSuccessScreen
            {...props}
            setSafeAreaColor={setSafeAreaColor}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="InformationDetails">
        {props => (
          <InformationDetailsScreen
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
      <Stack.Screen name="ChatList">
        {props => (
          <ChatListScreen {...props} setSafeAreaColor={setSafeAreaColor} />
        )}
      </Stack.Screen>
      <Stack.Screen name="Profile">
        {props => (
          <ProfileScreen {...props} setSafeAreaColor={setSafeAreaColor} />
        )}
      </Stack.Screen>
      <Stack.Screen name="EditProfile">
        {props => (
          <EditProfileScreen
            {...props}
            setSafeAreaColor={setSafeAreaColor}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ChangePassword">
        {props => (
          <ChangePasswordScreen
            {...props}
            setSafeAreaColor={setSafeAreaColor}
          />
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
      <Stack.Screen name="WebContent">
        {props => (
          <WebContentScreen
            {...props}
            setSafeAreaColor={setSafeAreaColor}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Reports">
        {props => (
          <ReportsScreen
            {...props}
            setSafeAreaColor={setSafeAreaColor}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default MainStack;
