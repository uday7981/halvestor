import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, Platform } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Header from './components/Header';
import { Svg, Path } from 'react-native-svg';
import AuthButton from './components/AuthButton';

export default function GetStarted() {
  const handleGetStarted = () => {
    // Navigate to the main app's portfolio/holdings page
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />

      {/* Header */}
      <Header username="Uday" avatarInitials="AC" />

      {/* Main Card */}
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.title}>Let your wealth grow with intention and impact</Text>
          <Text style={styles.subtitle}>
            Halvestor helps you invest ethically and give back purposefully.
          </Text>
          <View style={styles.chartContainer}>
            <Image
              source={require('../assets/images/logo-main.png')}
              style={{ width: 220, height: 160 }}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      {/* CTA Button */}
      <AuthButton 
        title="Get started" 
        onPress={handleGetStarted}
        style={styles.button}
      />

      {/* Using the same navbar style as other pages - no custom tab bar here */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 50 : 8,
  },
  // Header styles moved to the Header component
  card: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 0,
  },
  button: {
    marginHorizontal: 16,
    marginTop: 24,
  },
});
