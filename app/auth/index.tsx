import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AuthButton from '../components/AuthButton';
import { signInWithGoogle } from '../services/authService';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../config/supabase';

export default function AuthWelcome() {
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleEmailSignIn = () => {
    // Navigate to email sign in screen
    router.push('/auth/login');
  };

  const handleAppleSignIn = () => {
    // Handle Apple sign in
    console.log('Apple sign in pressed');
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      
      // Call the signInWithGoogle function
      const { data, error } = await signInWithGoogle();
      
      if (error) {
        console.error('Google sign-in error:', error.message);
        return;
      }
      
      if (!data?.url) {
        console.error('No URL returned for Google sign-in');
        return;
      }
      
      // Configure the redirect URI
      const redirectUri = 'halvestor://auth/callback';
      
      // Open the URL in a web browser
      console.log('Opening auth URL:', data.url);
      
      try {
        // For production, use openAuthSessionAsync with the redirect URI
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUri
        );
        
        console.log('Auth result:', result);
        
        // If we have a success result with a URL, try to extract tokens
        if (result.type === 'success' && result.url) {
          console.log('Authentication successful');
          
          // Check if we have a session
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session) {
            console.log('Session established');
          }
        }
      } catch (error) {
        console.error('Error during WebBrowser session:', error);
      }
    } catch (error) {
      console.error('Exception during Google sign-in:', error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = () => {
    // Navigate to login screen
    router.push('/auth/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Halvestor</Text>
          <Text style={styles.subtitle}>
            Let your wealth grow with intention and impact
          </Text>
        </View>

        <View style={styles.authOptions}>
          <AuthButton
            title="Continue with email"
            onPress={handleEmailSignIn}
            style={styles.emailButton}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity 
              style={styles.socialButton} 
              onPress={handleAppleSignIn}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-apple" size={24} color="#000" />
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.socialButton} 
              onPress={handleGoogleSignIn}
              activeOpacity={0.8}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color="#4285F4" style={{marginRight: 8}} />
              ) : (
                <View style={styles.googleIconContainer}>
                  <Ionicons name="logo-google" size={22} color="#4285F4" />
                </View>
              )}
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Alright have an account? </Text>
          <Pressable onPress={handleLogin}>
            <Text style={styles.loginLink}>Log in</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.termsText}>
          By continuing, you accept our <Text style={styles.termsLink}>Terms of Use</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  authOptions: {
    width: '100%',
  },
  emailButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  emailButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#64748B',
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  googleIconContainer: {
    marginRight: 8,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginLeft: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: '#64748B',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  footer: {
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  termsText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  termsLink: {
    color: '#3B82F6',
    fontWeight: '500',
  },
});
