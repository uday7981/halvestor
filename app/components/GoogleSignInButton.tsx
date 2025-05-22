import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { signInWithGoogle } from '../services/authService';
import { supabase } from '../config/supabase';

// Google logo SVG
const GoogleLogo = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </Svg>
);

type GoogleSignInButtonProps = {
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

const GoogleSignInButton = ({ onSuccess, onError }: GoogleSignInButtonProps) => {
  const [loading, setLoading] = React.useState(false);

  // Configure the redirect URI for production
  const redirectUri = 'halvestor://auth/callback';

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      
      // Call the signInWithGoogle function
      const { data, error } = await signInWithGoogle();
      
      if (error) {
        console.error('Google sign-in error:', error.message);
        onError?.(error.message);
        return;
      }
      
      if (!data?.url) {
        console.error('No URL returned for Google sign-in');
        onError?.('Failed to generate Google sign-in URL');
        return;
      }
      
      // Open the URL in a web browser
      console.log('Opening auth URL:', data.url);
      
      try {
        console.log('Opening auth URL with WebBrowser...');
        
        // For production TestFlight, use openAuthSessionAsync with the redirect URI
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUri
        );
        
        console.log('Auth result:', result);
        
        // If we have a success result with a URL, try to extract tokens
        if (result.type === 'success' && result.url) {
          console.log('Extracting tokens from URL:', result.url);
          
          try {
            // Extract hash fragment from URL
            const hashMatch = result.url.match(/#(.+)/);
            if (hashMatch && hashMatch[1]) {
              console.log('Found hash fragment in URL');
              
              // Parse the hash fragment
              const params = new URLSearchParams(hashMatch[1]);
              const accessToken = params.get('access_token');
              const refreshToken = params.get('refresh_token');
              
              if (accessToken) {
                console.log('Found access token, setting session manually');
                
                // Set the session manually with the tokens
                const { data: sessionData, error } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken || '',
                });
                
                if (sessionData?.session) {
                  console.log('Successfully set session with tokens');
                  onSuccess?.();
                  return;
                } else if (error) {
                  console.error('Error setting session:', error.message);
                }
              }
            }
          } catch (error) {
            console.error('Error extracting tokens:', error);
          }
        }
        
        // If token extraction failed, check for session as fallback
        console.log('Checking for session...');
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData?.session) {
          console.log('Found valid session! Authentication successful');
          onSuccess?.();
          return;
        }
        
        // Last resort: try one more time after a delay
        console.log('No session found, trying one more time after delay...');
        setTimeout(async () => {
          try {
            const { data: delayedSessionData } = await supabase.auth.getSession();
            if (delayedSessionData?.session) {
              console.log('Found session after delay');
              onSuccess?.();
            } else {
              console.log('No session found even after delay');
              onError?.('Authentication succeeded but session not established');
            }
          } catch (error) {
            console.error('Error checking session after delay:', error);
            onError?.('Error checking authentication status');
          }
        }, 3000);
        
        if (result.type !== 'success') {
          console.log('Authentication failed or was cancelled');
          onError?.('Authentication failed or was cancelled');
        }
      } catch (error) {
        console.error('Error during WebBrowser session:', error);
        onError?.(error instanceof Error ? error.message : 'An unknown error occurred');
      }
    } catch (error) {
      console.error('Exception during Google sign-in:', error);
      onError?.(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleGoogleSignIn}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#4285F4" />
      ) : (
        <View style={styles.buttonContent}>
          <GoogleLogo />
          <Text style={styles.buttonText}>Sign in with Google</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'white',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
});

export default GoogleSignInButton;
