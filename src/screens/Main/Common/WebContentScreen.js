import React, { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { AppButton, AppHeader, AppText, Wrapper } from '../../../component/Index';
import { AppColors } from '../../../utils/AppColors';
import { AppLinks } from '../../../utils/AppLinks';
import { FontFamily } from '../../../utils/Fonts';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils/Responsive_Dimensions';
import { useSafeAreaColor } from '../../../utils/useSafeAreaColor';

const WEB_PAGES = {
  termsAndConditions: AppLinks.termsAndConditions,
  aboutApp: AppLinks.aboutApp,
  helpCenter: AppLinks.helpCenter,
};

const WEB_PAGE_TITLES = {
  termsAndConditions: 'Terms & Conditions',
  aboutApp: 'About App',
  helpCenter: 'Help Center',
};

const WEB_CONTENT_ALIGNMENT_SCRIPT = `
  (function () {
    var style = document.createElement('style');
    style.textContent = 'body > .MuiBox-root { padding-left: 7vw !important; }';
    (document.head || document.documentElement).appendChild(style);

    function notifyWhenContentIsReady() {
      var content = document.querySelector('body > .MuiBox-root');

      if (content && content.textContent.trim().length > 0) {
        window.ReactNativeWebView.postMessage('web-content-ready');
        return;
      }

      window.setTimeout(notifyWhenContentIsReady, 100);
    }

    notifyWhenContentIsReady();
  })();
  true;
`;

const WebContentScreen = ({ navigation, route, setSafeAreaColor }) => {
  const webViewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const page = route?.params?.page;
  const pageUri = WEB_PAGES[page] ?? WEB_PAGES.termsAndConditions;
  const pageTitle = WEB_PAGE_TITLES[page] ?? WEB_PAGE_TITLES.termsAndConditions;

  useSafeAreaColor(setSafeAreaColor, AppColors.white);

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  return (
    <Wrapper
      showPadding={false}
      backgroundColor={AppColors.white}
      dismissKeyboardOnTap={false}>
      <View style={styles.headerWrap}>
        <AppHeader
          variant="left"
          showBack
          title={pageTitle}
          onLeftPress={() => navigation.goBack()}
          containerStyle={styles.header}
          leftButtonStyle={styles.headerBackButton}
          titleWrapStyle={styles.headerTitleWrap}
          titleStyle={styles.headerTitle}
          backIconSize={responsiveFontSize(2.5)}
        />
      </View>

      <View style={styles.webViewWrap}>
        <WebView
          ref={webViewRef}
          source={{ uri: pageUri }}
          originWhitelist={['https://*']}
          injectedJavaScriptBeforeContentLoaded={WEB_CONTENT_ALIGNMENT_SCRIPT}
          injectedJavaScript={WEB_CONTENT_ALIGNMENT_SCRIPT}
          allowsBackForwardNavigationGestures
          setSupportMultipleWindows={false}
          onLoadStart={() => {
            setHasError(false);
            setIsLoading(true);
          }}
          onMessage={event => {
            if (event.nativeEvent.data === 'web-content-ready') {
              setIsLoading(false);
            }
          }}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          onHttpError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          style={styles.webView}
        />
      </View>

      {isLoading && !hasError && (
        <View style={[styles.overlay, styles.loadingOverlay]}>
          <ActivityIndicator
            size="large"
            color={AppColors.appThemeBlue}
          />
        </View>
      )}

      {hasError && (
        <View style={styles.overlay}>
          <AppText style={styles.errorTitle}>Unable to load page</AppText>
          <AppText style={styles.errorText}>
            Please check your internet connection and try again.
          </AppText>
          <AppButton
            title="Try Again"
            onPress={handleRetry}
            style={styles.retryButton}
          />
        </View>
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  headerWrap: {
    paddingTop: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(5.6),
  },
  header: {
    minHeight: responsiveHeight(4.4),
    paddingHorizontal: 0,
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
    fontSize: responsiveFontSize(2),
  },
  webViewWrap: {
    flex: 1,
    marginTop: responsiveHeight(1.2),
    backgroundColor: AppColors.white,
  },
  webView: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  overlay: {
    position: 'absolute',
    top: responsiveHeight(7.6),
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.white,
    paddingHorizontal: responsiveWidth(8),
    zIndex: 2,
  },
  loadingOverlay: {
    justifyContent: 'flex-start',
    paddingTop: responsiveHeight(10),
  },
  errorTitle: {
    color: AppColors.themeTxt,
    fontFamily: FontFamily.bold,
    fontSize: responsiveFontSize(2),
    textAlign: 'center',
  },
  errorText: {
    marginTop: responsiveHeight(0.8),
    color: AppColors.bodyText,
    fontFamily: FontFamily.regular,
    fontSize: responsiveFontSize(1.5),
    lineHeight: responsiveFontSize(2),
    textAlign: 'center',
  },
  retryButton: {
    width: '60%',
    marginTop: responsiveHeight(2.2),
  },
});

export default WebContentScreen;
