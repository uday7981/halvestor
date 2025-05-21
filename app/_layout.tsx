// CRITICAL: Import blob fix first before any other imports
import "../app/config/blobFix";

// Then import URL polyfill needed for Supabase
import "react-native-url-polyfill/auto";

// Import other necessary polyfills
import "../app/config/polyfills";

// Import React Native components
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { SplashScreen, router } from "expo-router";
import { View, Image, StyleSheet, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";

// Import Supabase client
import { supabase } from "./config/supabase";
import { Session } from "@supabase/supabase-js";

// Configure EventEmitter to avoid warnings
import { EventEmitter } from 'events';
EventEmitter.defaultMaxListeners = 30;

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // You can add custom fonts here if needed
  });
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitializing(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      
      // Redirect based on auth state
      if (session) {
        // Check if it's first login
        supabase
          .from('profiles')
          .select('first_login')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data?.first_login) {
              router.replace('/welcome');
            } else {
              router.replace('/(tabs)');
            }
          });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
