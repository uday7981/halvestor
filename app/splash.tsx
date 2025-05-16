import React, { useEffect } from 'react';
import { View, StyleSheet, Image, SafeAreaView } from 'react-native';
import { SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS
} from 'react-native-reanimated';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function SplashPage() {
  const router = useRouter();
  const opacity = useSharedValue(1);

  // Load any fonts if needed
  const [fontsLoaded] = useFonts({
    // Add your fonts here if needed
  });

  const animatedStyles = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const onAnimationComplete = () => {
    // Navigate to the onboarding screen after animation completes
    router.replace('/onboarding');
  };

  useEffect(() => {
    if (fontsLoaded) {
      // Hide the native splash screen
      SplashScreen.hideAsync();

      // Start fade-out animation after a delay
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: 1000 }, () => {
          runOnJS(onAnimationComplete)();
        });
      }, 2000); // Show splash for 2 seconds before fading out
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, animatedStyles]}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/splash-logo.svg')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      {/* Native iOS home indicator will appear here */}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  // Custom indicator removed to avoid duplication with native iOS home indicator
});
