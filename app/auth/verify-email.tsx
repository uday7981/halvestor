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
  Alert,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { verifyOTP } from '../services/authService';
import AuthButton from '../components/AuthButton';

const { width, height } = Dimensions.get('window');

export default function VerifyEmail() {
  const params = useLocalSearchParams();
  const email = params.email as string || 'your email';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  const inputRefs = useRef<Array<TextInput | null>>([]);
  
  // Detect keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
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
  
  // Format timer as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
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
    
    // If all fields are filled, hide keyboard
    if (text.length === 1 && index === 5) {
      Keyboard.dismiss();
    }
  };
  
  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  const isOtpComplete = otp.every(digit => digit !== '');
  
  const handleBack = () => {
    router.back();
  };
  
  const handleContinue = async () => {
    // Check if OTP is complete
    if (!isOtpComplete) {
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
      
      // Navigate directly to get-started screen on successful verification
      // Skip the user profile screen as requested
      router.push('/get-started');
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleBack} accessible={true} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        
        <View style={styles.header}>
          <Text style={styles.title}>Verify your email address</Text>
          <Text style={styles.subtitle}>
            We've sent a 6 digit-code to your email address
            that you provided in the previous step.
          </Text>
        </View>
        
        <View style={styles.otpWrapper}>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => inputRefs.current[index] = ref}
                style={[styles.otpInput, digit ? styles.otpInputFilled : {}]}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                autoFocus={index === 0}
                selectTextOnFocus
                accessible={true}
                accessibilityLabel={`Digit ${index + 1} of verification code`}
              />
            ))}
          </View>
        </View>
        
        <View style={styles.resendContainer}>
          {isResending ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <Text style={styles.resendText}>
              Didn't receive the code?{' '}
              <Text 
                style={[styles.resendLink, timer === 0 ? styles.resendActive : styles.resendInactive]} 
                onPress={handleResendCode}
                accessible={true}
                accessibilityLabel={timer === 0 ? "Resend verification code" : `Wait ${formatTime(timer)} before resending`}
              >
                Resend {timer > 0 ? `in ${formatTime(timer)}` : 'now'}
              </Text>
            </Text>
          )}
        </View>
        
        <View style={styles.buttonContainer}>
          <AuthButton
            title="Continue"
            onPress={handleContinue}
            disabled={isVerifying || !isOtpComplete}
            loading={isVerifying}
            style={[styles.continueButton, isOtpComplete ? styles.continueButtonActive : {}]}
            textStyle={styles.continueButtonText}
            variant="primary"
          />
        </View>
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
    marginBottom: 30,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  otpWrapper: {
    alignItems: 'center',
    marginBottom: 30,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    width: '100%',
    maxWidth: 400,
  },
  otpInput: {
    width: Math.min((width - 100) / 6, 50),
    height: Math.min((width - 100) / 6, 50),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
    marginHorizontal: 5,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  otpInputFilled: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingVertical: 10,
  },
  resendText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  resendLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  resendActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  resendInactive: {
    color: '#94A3B8',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 'auto',
    marginBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  continueButton: {
    backgroundColor: '#BFDBFE',
    borderRadius: 100,
    paddingVertical: 16,
  },
  continueButtonActive: {
    backgroundColor: '#3B82F6',
  },
  continueButtonText: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '600',
  },
});
