import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Header from './components/Header';
import { Svg, Path } from 'react-native-svg';
import { supabase } from './config/supabase';
import { signOut } from './services/authService';

export default function Welcome() {
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [avatarInitials, setAvatarInitials] = useState('');  

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // If no user, redirect to auth
        router.replace('/auth');
        return;
      }
      
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setFirstName(profile.first_name || '');
        
        // Generate avatar initials
        let initials = '';
        if (profile.first_name) initials += profile.first_name[0];
        if (profile.last_name) initials += profile.last_name[0];
        setAvatarInitials(initials.toUpperCase());
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGetStarted = async () => {
    // Update first_login to false
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ first_login: false })
          .eq('id', user.id);
      }
      
      // Navigate to the main app's portfolio/holdings page
      router.navigate('/(tabs)');
    } catch (error) {
      console.error('Error updating first login status:', error);
      router.navigate('/(tabs)');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />

      {/* Header */}
      <Header username={firstName} avatarInitials={avatarInitials} />

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
      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Get started</Text>
      </TouchableOpacity>

      {/* Using the same navbar style as other pages - no custom tab bar here */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    backgroundColor: '#3B82F6',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
