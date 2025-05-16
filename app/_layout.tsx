import { Stack } from "expo-router";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import { View, Image, StyleSheet, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // You can add custom fonts here if needed
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return (
      <View style={styles.container}>
        <Image
          source={require("../assets/images/inv-splash.svg")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <>
      <Stack 
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' }
        }}>
      <Stack.Screen
        name="splash"
        options={{
          gestureEnabled: false,
          animation: 'none'
        }}
      />
      <Stack.Screen
        name="onboarding"
        options={{
          gestureEnabled: false,
          animation: 'fade'
        }}
      />
      <Stack.Screen
        name="auth"
        options={{
          gestureEnabled: false,
          animation: 'fade'
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          gestureEnabled: false,
          animation: 'fade'
        }}
      />
      <Stack.Screen
        name="stocks/[id]"
        options={{
          presentation: 'card',
          animation: 'slide_from_right'
        }}
      />
    </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
});
