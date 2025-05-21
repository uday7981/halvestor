import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  Keyboard,
  Alert
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { verifyOTP } from '../services/authService';
import AuthButton from '../components/AuthButton';

export default function VerifyEmail() {
  const params = useLocalSearchParams();
  const email = params.email as string || 'your email';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const inputRefs = useRef<Array<TextInput | null>>([]);
  
  // Start countdown timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerRunning(false);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, isTimerRunning]);
  
  const handleResendCode = () => {
    if (timer === 0) {
      // Simulate resending code
      setIsResending(true);
      setTimeout(() => {
        setTimer(30);
        setIsTimerRunning(true);
        setIsResending(false);
        // Clear OTP fields
        setOtp(['', '', '', '', '', '']);
        // Focus on first input
        inputRefs.current[0]?.focus();
      }, 1000);
    }
  };
  
  const handleOtpChange = (text: string, index: number) => {
    // Only allow numbers
    if (!/^\d*$/.test(text)) return;
    
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (text.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  const handleBack = () => {
    router.back();
  };
  
  const handleContinue = async () => {
    // Check if OTP is complete
    if (!otp.every(digit => digit !== '')) {
      Alert.alert('Error', 'Please enter the complete verification code');
      return;
    }
    
    setIsVerifying(true);
    try {
      const otpString = otp.join('');
      const { data, error } = await verifyOTP(email, otpString);
      
      if (error) {
        Alert.alert('Verification Error', error.message || 'Invalid verification code');
        return;
      }
      
      // Navigate to user profile page on successful verification
      router.push('/auth/user-profile');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred. Please try again.');
      console.error('OTP verification error:', error);
    } finally {
      setIsVerifying(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        
        <View style={styles.header}>
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>
            We've sent a verification code to {email}
          </Text>
        </View>
        
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => inputRefs.current[index] = ref}
              style={styles.otpInput}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              autoFocus={index === 0}
              selectTextOnFocus
            />
          ))}
        </View>
        
        <View style={styles.resendContainer}>
          {isTimerRunning ? (
            <Text style={styles.timerText}>Resend code in {timer}s</Text>
          ) : (
            <TouchableOpacity 
              onPress={handleResendCode}
              disabled={isResending}
            >
              <Text style={[styles.resendText, isResending && styles.resendTextDisabled]}>
                {isResending ? 'Sending...' : 'Resend code'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        <AuthButton
          title={isVerifying ? "Verifying..." : "Continue"}
          onPress={handleContinue}
          disabled={isVerifying || !otp.every(digit => digit !== '')}
          loading={isVerifying}
          style={styles.continueButton}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  keyboardAvoidView: {
    flex: 1,
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
    marginBottom: 40,
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timerText: {
    fontSize: 14,
    color: '#64748B',
  },
  resendText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  resendTextDisabled: {
    color: '#94A3B8',
  },
  continueButton: {
    marginTop: 'auto',
  },
});
