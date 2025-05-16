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
  Keyboard
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function VerifyEmail() {
  const params = useLocalSearchParams();
  const email = params.email as string || 'your email';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  
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
  
  const handleContinue = () => {
    // Check if OTP is complete
    if (otp.every(digit => digit !== '')) {
      // Navigate to user profile page on successful verification
      router.push('/auth/user-profile');
    }
  };
  
  const isOtpComplete = otp.every(digit => digit !== '');
  
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
          <Text style={styles.title}>Verify your email address</Text>
          <Text style={styles.subtitle}>
            We've sent a 6 digit-code to your email address that you provided in the previous step.
          </Text>
        </View>
        
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => inputRefs.current[index] = ref}
              style={styles.otpInput}
              value={digit}
              onChangeText={text => handleOtpChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              autoFocus={index === 0}
              selectionColor="#3B82F6"
            />
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.resendContainer} 
          onPress={handleResendCode}
          disabled={isTimerRunning || isResending}
        >
          <Text style={styles.resendText}>
            Didn't receive the code? {' '}
            {isResending ? (
              <Text style={styles.resendingText}>Resending...</Text>
            ) : isTimerRunning ? (
              <Text style={styles.timerText}>Resend in {timer}:00</Text>
            ) : (
              <Text style={styles.resendLink}>Resend</Text>
            )}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.continueButton, !isOtpComplete && styles.continueButtonDisabled]} 
            onPress={handleContinue}
            disabled={!isOtpComplete}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 24,
  },
  backButton: {
    marginTop: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  header: {
    marginTop: 16,
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 22,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resendText: {
    fontSize: 14,
    color: '#64748B',
  },
  resendLink: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  timerText: {
    color: '#94A3B8',
    fontWeight: '500',
  },
  resendingText: {
    color: '#94A3B8',
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
