import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AuthButton from '../components/AuthButton';
import AuthInput from '../components/AuthInput';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { signInWithEmail, handleOAuthCallback } from '../services/authService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  
  // Handle OAuth callback
  useEffect(() => {
    // Set up a listener for URL changes
    const subscription = Linking.addEventListener('url', ({ url }) => {
      if (url && url.includes('auth/callback')) {
        console.log('Received OAuth callback URL:', url);
        handleOAuthCallback(url)
          .then(({ data, error }) => {
            if (error) {
              Alert.alert('Authentication Error', error.message || 'Failed to complete authentication');
              return;
            }
            
            if (data?.session) {
              // Successfully authenticated
              router.replace('/welcome');
            }
          })
          .catch(err => {
            console.error('Error handling OAuth callback:', err);
            Alert.alert('Authentication Error', 'Failed to complete authentication');
          });
      }
    });
    
    // Check if the app was opened with a URL
    Linking.getInitialURL().then(url => {
      if (url && url.includes('auth/callback')) {
        console.log('App opened with URL:', url);
        handleOAuthCallback(url);
      }
    });
    
    // Clean up the subscription
    return () => {
      subscription.remove();
    };
  }, []);
  
  const validateInputs = () => {
    let isValid = true;
    const newErrors = {
      email: '',
      password: ''
    };
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }
    
    // Validate password
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleLogin = async () => {
    if (!validateInputs()) return;
    
    setLoading(true);
    try {
      // Call Supabase login function
      const { data, error } = await signInWithEmail(email, password);
      
      if (error) {
        Alert.alert('Login Error', error.message || 'Invalid email or password');
        return;
      }
      
      // Navigate to welcome page on successful login
      router.replace('/welcome');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.replace('/auth');
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password screen
    console.log('Forgot password');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          
          <View style={styles.header}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Please enter your details to sign in
            </Text>
          </View>

          <View style={styles.form}>
            <AuthInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <AuthInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={true}
              error={errors.password}
            />

            <TouchableOpacity 
              style={styles.forgotPasswordContainer} 
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            <AuthButton
              title={loading ? "Signing in..." : "Sign in"}
              onPress={handleLogin}
              disabled={loading || !email || !password}
              loading={loading}
              style={styles.loginButton}
            />
            
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>
            
            <GoogleSignInButton 
              onSuccess={() => {
                // Will be handled by the useEffect that watches for URL changes
              }}
              onError={(error) => {
                Alert.alert('Google Sign-In Error', error);
              }}
            />
          </View>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/signup')}>
              <Text style={styles.signupLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  form: {
    marginBottom: 24,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    marginBottom: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#64748B',
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingVertical: 16,
  },
  signupText: {
    fontSize: 14,
    color: '#64748B',
  },
  signupLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
});
