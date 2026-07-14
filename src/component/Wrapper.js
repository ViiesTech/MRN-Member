import React, {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { AppColors } from '../utils/AppColors';
import { responsiveHeight } from '../utils/Responsive_Dimensions';

export const KeyboardScrollContext = createContext({
  scrollToInput: () => {},
});

const Wrapper = ({
  children,
  isScroll = false,
  isBgImage = false,
  bgImage,
  type = 'default',
  backgroundColor = AppColors.appBgColor,
  style,
  contentContainerStyle,
  showPadding = true,
  resizeMode = 'cover',
  keyboardVerticalOffset = 0,
  dismissKeyboardOnTap = true,
  refreshing = false,
  onRefresh,
  refreshControlColor = AppColors.appThemeBlue,
}) => {
  const scrollRef = useRef(null);
  const scrollContentRef = useRef(null);
  const scrollYRef = useRef(0);
  const keyboardTopRef = useRef(0);
  const focusedInputRef = useRef(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const contentStyle = showPadding ? styles.content : styles.contentWithoutPadding;
  const scrollContentStyle = showPadding
    ? styles.scrollContent
    : styles.scrollContentWithoutPadding;
  const isKeyboardType = type === 'keyboard';

  useEffect(() => {
    if (!isKeyboardType || !isScroll) {
      return undefined;
    }

    const showListener = Keyboard.addListener('keyboardDidShow', event => {
      const nextKeyboardHeight = event.endCoordinates?.height ?? 0;
      const reportedKeyboardTop = event.endCoordinates?.screenY;

      setKeyboardHeight(nextKeyboardHeight);
      keyboardTopRef.current =
        reportedKeyboardTop ||
        Dimensions.get('screen').height - nextKeyboardHeight;

      setTimeout(() => {
        const input = focusedInputRef.current?.current;

        input?.measureInWindow((_x, y, _width, height) => {
          const keyboardTop = keyboardTopRef.current;

          if (!keyboardTop) {
            return;
          }

          const inputBottom = y + height;
          const requiredBottom = keyboardTop - responsiveHeight(2);

          if (inputBottom > requiredBottom) {
            scrollRef.current?.scrollTo({
              y:
                scrollYRef.current +
                inputBottom -
                requiredBottom +
                responsiveHeight(1),
              animated: true,
            });
          }
        });
      }, 100);
    });
    const hideListener = Keyboard.addListener('keyboardDidHide', () => {
      keyboardTopRef.current = 0;
      focusedInputRef.current = null;
      setKeyboardHeight(0);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, [isKeyboardType, isScroll]);

  const keyboardScrollValue = useMemo(
    () => ({
      scrollToInput: inputRef => {
        if (!isScroll || !inputRef?.current || !scrollContentRef.current) {
          return;
        }

        focusedInputRef.current = inputRef;

        setTimeout(() => {
          inputRef.current?.measureInWindow((_x, y, _width, height) => {
            const keyboardTop = keyboardTopRef.current;

            if (!keyboardTop) {
              return;
            }

            const inputBottom = y + height;
            const requiredBottom = keyboardTop - responsiveHeight(2);

            if (inputBottom > requiredBottom) {
              scrollRef.current?.scrollTo({
                y:
                  scrollYRef.current +
                  inputBottom -
                  requiredBottom +
                  responsiveHeight(1),
                animated: true,
              });
            }
          });
        }, 150);
      },
    }),
    [isScroll],
  );

  const androidKeyboardSpacerStyle =
    isKeyboardType &&
    isScroll &&
    Platform.OS === 'android' &&
    keyboardHeight > 0
      ? { paddingBottom: keyboardHeight + responsiveHeight(2) }
      : null;

  const content = isScroll ? (
    <ScrollView
      ref={scrollRef}
      style={styles.flex}
      onScroll={event => {
        scrollYRef.current = event.nativeEvent.contentOffset.y;
      }}
      scrollEventThrottle={16}
      automaticallyAdjustKeyboardInsets={
        isKeyboardType && Platform.OS === 'ios'
      }
      contentContainerStyle={[
        scrollContentStyle,
        contentContainerStyle,
        androidKeyboardSpacerStyle,
      ]}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={Boolean(onRefresh)}
      alwaysBounceVertical={Boolean(onRefresh)}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={refreshControlColor}
            colors={[refreshControlColor]}
            progressBackgroundColor={AppColors.white}
          />
        ) : undefined
      }>
      <View ref={scrollContentRef}>{children}</View>
    </ScrollView>
  ) : (
    <View style={[contentStyle, contentContainerStyle]}>
      {children}
    </View>
  );

  const screenContent = (
    <KeyboardScrollContext.Provider value={keyboardScrollValue}>
      {content}
    </KeyboardScrollContext.Provider>
  );

  const screen = isBgImage && bgImage ? (
    <ImageBackground
      source={bgImage}
      resizeMode={resizeMode}
      style={[styles.flex, style]}>
      {screenContent}
    </ImageBackground>
  ) : (
    <View style={[styles.flex, { backgroundColor }, style]}>
      {screenContent}
    </View>
  );

  const dismissibleScreen = dismissKeyboardOnTap && !isScroll ? (
    <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
      {screen}
    </TouchableWithoutFeedback>
  ) : (
    screen
  );

  if (type === 'keyboard' && !isScroll) {
    return (
      <KeyboardAvoidingView
        style={[styles.flex, { backgroundColor }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={keyboardVerticalOffset}>
        {dismissibleScreen}
      </KeyboardAvoidingView>
    );
  }

  return dismissibleScreen;
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: responsiveHeight(2),
  },
  contentWithoutPadding: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: responsiveHeight(2),
  },
  scrollContentWithoutPadding: {
    flexGrow: 1,
  },
});

export default Wrapper;
