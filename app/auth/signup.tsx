import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  TextInput, 
  Alert 
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AuthButton from '../components/AuthButton';
import { signUpWithEmail } from '../services/authService';

export default function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    country: ''
  });
  
  const validateInputs = () => {
    let isValid = true;
    const newErrors = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      country: ''
    };
    
    // Validate first name
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }
    
    // Validate last name
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }
    
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
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    // Validate country
    if (!country) {
      newErrors.country = 'Please select your country';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleContinue = async () => {
    if (!validateInputs()) return;
    
    setLoading(true);
    try {
      // Call Supabase signup function
      const { data, error } = await signUpWithEmail(email, password, firstName, lastName);
      
      if (error) {
        Alert.alert('Signup Error', error.message || 'An error occurred during signup');
        return;
      }
      
      // Navigate to email verification screen
      router.push({
        pathname: '/auth/verify-email',
        params: { email }
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred. Please try again.');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.replace('/auth');
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
            <Text style={styles.title}>Start growing your wealth</Text>
            <Text style={styles.subtitle}>
              Create your account in minutes and invest with confidence and purpose.
            </Text>
          </View>

          <View style={styles.form}>
            {/* First Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First name</Text>
              <TextInput
                style={[styles.input, errors.firstName ? styles.inputError : null]}
                placeholder="Enter your first name"
                placeholderTextColor="#94A3B8"
                autoCapitalize="words"
                value={firstName}
                onChangeText={setFirstName}
              />
              {errors.firstName ? (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              ) : null}
            </View>
            
            {/* Last Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last name</Text>
              <TextInput
                style={[styles.input, errors.lastName ? styles.inputError : null]}
                placeholder="Enter your last name"
                placeholderTextColor="#94A3B8"
                autoCapitalize="words"
                value={lastName}
                onChangeText={setLastName}
              />
              {errors.lastName ? (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              ) : null}
            </View>
            
            {/* Country Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Country</Text>
              <TouchableOpacity 
                style={[styles.dropdownContainer, errors.country ? styles.inputError : null]}
                onPress={() => setShowCountryDropdown(!showCountryDropdown)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dropdownText, !country && styles.placeholderText]}>
                  {country || "Select your country"}
                </Text>
                <Ionicons 
                  name={showCountryDropdown ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#94A3B8" 
                />
              </TouchableOpacity>
              {showCountryDropdown && (
                <View style={styles.dropdownList}>
                  {["United States", "India", "United Kingdom", "Canada", "Australia"].map((item) => (
                    <TouchableOpacity 
                      key={item} 
                      style={styles.dropdownItem}
                      onPress={() => {
                        setCountry(item);
                        setShowCountryDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {errors.country ? (
                <Text style={styles.errorText}>{errors.country}</Text>
              ) : null}
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email address</Text>
              <TextInput
                style={[styles.input, errors.email ? styles.inputError : null]}
                placeholder="Enter your email"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.passwordContainer, errors.password ? styles.inputError : null]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Create a password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={togglePasswordVisibility}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#94A3B8" 
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
            </View>

            {/* Password Hint */}
            <View style={styles.passwordHintContainer}>
              <Text style={styles.passwordHint}>
                Password must be at least 6 characters
              </Text>
            </View>

            <AuthButton
              title={loading ? "Creating account..." : "Continue"}
              onPress={handleContinue}
              disabled={loading || !firstName || !lastName || !email || !password || !country}
              loading={loading}
              style={styles.buttonContainer}
            />
          </View>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By continuing, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.signupLink}>Sign in</Text>
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
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    marginBottom: 30,
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
    lineHeight: 24,
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1E293B',
  },
  dropdownContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 16,
    color: '#1E293B',
  },
  placeholderText: {
    color: '#94A3B8',
  },
  dropdownList: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    maxHeight: 200,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#1E293B',
  },
  passwordContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  eyeIcon: {
    padding: 8,
  },
  passwordHintContainer: {
    marginTop: -10,
    marginBottom: 20,
  },
  passwordHint: {
    fontSize: 12,
    color: '#64748B',
  },
  buttonContainer: {
    marginTop: 10,
  },
  termsContainer: {
    marginBottom: 20,
  },
  termsText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: '#2E7D32',
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  signupText: {
    fontSize: 14,
    color: '#64748B',
  },
  signupLink: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
});
