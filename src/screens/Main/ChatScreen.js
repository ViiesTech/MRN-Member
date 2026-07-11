import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader, AppInput, AppText, Wrapper } from '../../component/Index';
import { AppColors } from '../../utils/AppColors';
import { FontFamily } from '../../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../utils/Responsive_Dimensions';
import { useSafeAreaColor } from '../../utils/useSafeAreaColor';

const COMPOSER_BG = '#343434';

const ChatBubble = ({ text, time, outgoing = false }) => (
  <View style={[styles.bubble, outgoing ? styles.outgoingBubble : styles.incomingBubble]}>
    <AppText style={[styles.bubbleText, outgoing && styles.outgoingBubbleText]}>
      {text}
    </AppText>
    <AppText style={styles.bubbleTime}>{time}</AppText>
  </View>
);

const ChatScreen = ({ navigation, route, setSafeAreaColor }) => {
  const [message, setMessage] = useState('Hello where');
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Let me know when reached',
      time: '9:42 am',
      outgoing: false,
    },
    {
      id: '2',
      text: 'I’m here',
      time: '9:42 am',
      outgoing: true,
    },
  ]);
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, responsiveHeight(1));
  const keyboardGap = responsiveHeight(1.2);

  useSafeAreaColor(setSafeAreaColor, AppColors.appBgColor);

  const handleSend = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    setMessages(prev => [
      ...prev,
      {
        id: `${Date.now()}`,
        text: trimmedMessage,
        time: new Date().toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        }),
        outgoing: true,
      },
    ]);
    setMessage('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Wrapper
        backgroundColor={COMPOSER_BG}
        showPadding={false}
        contentContainerStyle={styles.container}>
        <AppHeader
          variant="left"
          showBack
          title={route?.params?.participantName || 'Tony Mora'}
          onLeftPress={() => navigation.goBack()}
          containerStyle={styles.header}
          leftButtonStyle={styles.headerBackButton}
          titleWrapStyle={styles.headerTitleWrap}
          titleStyle={styles.headerTitle}
          backIconColor={AppColors.appThemeBlue}
          backIconSize={responsiveFontSize(2.5)}
        />

        <View style={styles.chatArea}>
          {messages.map(item => (
            <ChatBubble
              key={item.id}
              text={item.text}
              time={item.time}
              outgoing={item.outgoing}
            />
          ))}
        </View>

        <View
          style={[
            styles.composerBar,
            {
              minHeight: responsiveHeight(7.4) + bottomInset,
              paddingBottom: bottomInset,
              transform: [{ translateY: -keyboardGap }],
            },
          ]}>
          <AppInput
            value={message}
            onChangeText={setMessage}
            containerStyle={styles.inputRoot}
            inputContainerStyle={styles.inputBox}
            inputStyle={styles.inputText}
            rightIcon={
              <Feather
                name="paperclip"
                color="#323232"
                size={responsiveFontSize(2.6)}
              />
            }
          />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSend}
            style={styles.sendButton}>
            <Feather
              name="send"
              color={AppColors.white}
              size={responsiveFontSize(3.5)}
            />
          </TouchableOpacity>
        </View>
      </Wrapper>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COMPOSER_BG,
  },
  header: {
    minHeight: responsiveHeight(7.2),
    paddingHorizontal: responsiveWidth(5.6),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.black,
    backgroundColor: AppColors.appBgColor,
  },
  headerBackButton: {
    width: responsiveWidth(6.4),
    height: responsiveWidth(6.4),
    marginRight: responsiveWidth(1.7),
  },
  headerTitleWrap: {
    paddingHorizontal: 0,
  },
  headerTitle: {
    color: AppColors.appThemeBlue,
    fontFamily: FontFamily.medium,
    fontSize: responsiveFontSize(2.1),
  },
  chatArea: {
    flex: 1,
    backgroundColor: AppColors.appBgColor,
    paddingHorizontal: responsiveWidth(6),
    paddingTop: responsiveHeight(2.1),
  },
  bubble: {
    maxWidth: responsiveWidth(38),
    minHeight: responsiveHeight(6.3),
    borderRadius: responsiveWidth(1.4),
    paddingHorizontal: responsiveWidth(2.4),
    paddingTop: responsiveHeight(1),
    paddingBottom: responsiveHeight(0.6),
  },
  incomingBubble: {
    alignSelf: 'flex-start',
    backgroundColor: AppColors.appThemeBlue,
  },
  outgoingBubble: {
    alignSelf: 'flex-end',
    marginTop: responsiveHeight(1.6),
    backgroundColor: '#4476A8',
  },
  bubbleText: {
    color: AppColors.white,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.65),
    lineHeight: responsiveFontSize(2.05),
  },
  outgoingBubbleText: {
    fontSize: responsiveFontSize(1.6),
  },
  bubbleTime: {
    alignSelf: 'flex-end',
    marginTop: responsiveHeight(0.3),
    color: '#CFDAEA',
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(0.78),
    lineHeight: responsiveFontSize(1),
  },
  composerBar: {
    backgroundColor: COMPOSER_BG,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(4),
    paddingTop: responsiveHeight(1),
    gap: responsiveWidth(4),
  },
  inputRoot: {
    flex: 1,
  },
  inputBox: {
    height: responsiveHeight(5.35),
    minHeight: responsiveHeight(5.35),
    borderWidth: 0,
    borderRadius: responsiveWidth(1.2),
    backgroundColor: AppColors.white,
    paddingHorizontal: responsiveWidth(3.2),
    gap: responsiveWidth(1.8),
  },
  inputText: {
    color: '#555555',
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.9),
  },
  sendButton: {
    width: responsiveWidth(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatScreen;
