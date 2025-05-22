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
import * as Linking from 'expo-linking';
import { StatusBar } from "expo-status-bar";

// Import UserProvider
import { UserProvider } from "./context/UserContext";

// Import Supabase client
import { supabase } from "./config/supabase";
import { Session, User } from "@supabase/supabase-js";

// Configure EventEmitter to avoid warnings
import { EventEmitter } from 'events';
EventEmitter.defaultMaxListeners = 30;

SplashScreen.preventAutoHideAsync();

// Function to create or update user profile
const createOrUpdateUserProfile = async (userId: string, user: User) => {
  try {
    console.log('Checking if user profile exists...');
    
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking for existing profile:', fetchError.message);
      return;
    }
    
    if (!existingProfile) {
      // Double-check if profile exists to avoid race conditions
      const { data: doubleCheckProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (doubleCheckProfile) {
        console.log('Profile found in double-check, using existing profile');
        return;
      }
      
      console.log('Creating new profile for user:', userId);
      
      // Get user metadata
      const metadata = user.user_metadata;
      const firstName = metadata?.full_name ? metadata.full_name.split(' ')[0] : '';
      const lastName = metadata?.full_name ? metadata.full_name.split(' ').slice(1).join(' ') : '';
      
      try {
        // Create new profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: userId,
              first_name: firstName,
              last_name: lastName,
              cash_balance: 500, // Default cash balance
              first_login: true,
              created_at: new Date().toISOString(),
            },
          ]);
        
        if (insertError) {
          // If it's a duplicate key error, it means the profile was created by another process
          if (insertError.code === '23505') { // PostgreSQL duplicate key error code
            console.log('Profile already exists (duplicate key), no need to create');
          } else {
            console.error('Error creating profile:', insertError.message);
          }
        } else {
          console.log('Successfully created profile for user:', userId);
        }
      } catch (error: any) {
        // Ignore duplicate key errors as they just mean the profile already exists
        if (error.message?.includes('duplicate key')) {
          console.log('Profile creation error during verification: duplicate key value violates unique constraint "profiles_pkey"');
        } else {
          console.error('Exception during profile creation:', error);
        }
      }
    } else {
      console.log('User profile already exists');
    }
  } catch (error) {
    console.error('Exception during profile creation:', error);
  }
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // You can add custom fonts here if needed
  });
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Handle deep links - enhanced for production
  useEffect(() => {
    // Handle initial URL
    const handleInitialURL = async () => {
      const initialURL = await Linking.getInitialURL();
      if (initialURL) {
        console.log('Initial URL:', initialURL);
        handleURL(initialURL);
      }
    };
    
    handleInitialURL();
    
    // Listen for URL events
    const subscription = Linking.addEventListener('url', (event) => {
      console.log('Received URL event:', event.url);
      handleURL(event.url);
    });
    
    // Also check for session changes directly
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in via OAuth');
          setSession(session);
          
          // Check if user has a profile, create one if not
          createOrUpdateUserProfile(session.user.id, session.user);
        }
      }
    );
    
    return () => {
      subscription.remove();
      authSubscription.unsubscribe();
    };
  }, []);
  
  // Function to handle URLs
  const handleURL = async (url: string) => {
    console.log('Handling URL:', url);
    
    if (url.includes('auth/callback')) {
      // This is a callback from OAuth
      console.log('Processing OAuth callback URL');
      
      try {
        // Extract hash fragment from URL if present
        const hashMatch = url.match(/#(.+)/);
        if (hashMatch && hashMatch[1]) {
          console.log('Found hash fragment in URL');
          
          // Parse the hash fragment
          const params = new URLSearchParams(hashMatch[1]);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const expiresIn = params.get('expires_in');
          
          if (accessToken) {
            console.log('Found access token in URL, setting session');
            
            // Set the session manually with the tokens
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            
            if (data?.session) {
              console.log('Successfully set session with tokens from URL');
              setSession(data.session);
              
              // Create profile for new user
              createOrUpdateUserProfile(data.session.user.id, data.session.user);
              return;
            } else if (error) {
              console.error('Error setting session:', error.message);
            }
          }
        }
        
        // If we couldn't extract tokens or setting session failed, try getSession
        console.log('Trying to get session from Supabase');
        const { data, error } = await supabase.auth.getSession();
        
        if (data?.session) {
          console.log('Successfully authenticated via URL callback');
          setSession(data.session);
        } else if (error) {
          console.error('Auth error during URL callback:', error.message);
        } else {
          console.log('No session found yet, will rely on auth state change');
        }
      } catch (error) {
        console.error('Error processing callback URL:', error);
      }
    }
  };
  
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
        console.log('Auth state changed, user is logged in');
        // Check if it's first login
        supabase
          .from('profiles')
          .select('first_login')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error('Error fetching profile:', error.message);
              // If there's an error, it might be a new Google user without a profile
              router.replace('/welcome');
              return;
            }
            
            if (data?.first_login) {
              console.log('First login, redirecting to welcome');
              router.replace('/welcome');
            } else {
              console.log('Returning user, redirecting to tabs');
              router.replace('/(tabs)');
            }
          });
      } else {
        console.log('User is logged out');
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
    <UserProvider>
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
    </UserProvider>
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
