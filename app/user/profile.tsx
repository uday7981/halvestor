import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator,
  ScrollView,
  Alert,
  RefreshControl
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { getUserProfile } from '../services/profileService';
import { useUser } from '../context/UserContext';
import { signOut } from '../services/authService';

export default function ProfileScreen() {
  // Use the UserContext to get profile data
  const { userProfile, isLoading, error, refreshUserProfile, forceRefreshUserProfile, lastRefreshed } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    // Use cached data if available, otherwise refresh
    refreshUserProfile();
  }, []);
  
  // Format the last refreshed time
  const getLastRefreshedText = () => {
    if (!lastRefreshed) return 'Never refreshed';
    
    const now = new Date();
    const refreshedTime = new Date(lastRefreshed);
    const diffMs = now.getTime() - refreshedTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return refreshedTime.toLocaleString();
  };
  
  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await forceRefreshUserProfile();
    setRefreshing(false);
  };
  
  const handleBack = () => {
    router.back();
  };
  
  const handleContactToEdit = () => {
    // This would navigate to an edit profile screen
    Alert.alert('Edit Profile', 'This feature is coming soon!');
  };
  
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await signOut();
              if (error) {
                console.error('Error signing out:', error);
                Alert.alert('Error', 'Failed to log out. Please try again.');
              } else {
                // Navigate to login screen
                router.replace('/');
              }
            } catch (err) {
              console.error('Exception during logout:', err);
              Alert.alert('Error', 'An unexpected error occurred. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshUserProfile}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#10B981']}
            tintColor="#10B981"
          />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.title}>Your profile</Text>
        
        <Text style={styles.lastRefreshedText}>Last updated: {getLastRefreshedText()}</Text>
        
        <View style={styles.profileSection}>
          <Text style={styles.fieldLabel}>First name</Text>
          <View style={styles.fieldValueContainer}>
            <Text style={styles.fieldValue}>{userProfile?.first_name || ''}</Text>
          </View>
        </View>
        
        <View style={styles.profileSection}>
          <Text style={styles.fieldLabel}>Last name</Text>
          <View style={styles.fieldValueContainer}>
            <Text style={styles.fieldValue}>{userProfile?.last_name || ''}</Text>
          </View>
        </View>
        
        <View style={styles.profileSection}>
          <Text style={styles.fieldLabel}>Email address</Text>
          <View style={styles.fieldValueContainer}>
            <Text style={styles.fieldValue}>{userProfile?.email || ''}</Text>
          </View>
        </View>
        
        <View style={styles.profileSection}>
          <Text style={styles.fieldLabel}>Country</Text>
          <View style={styles.fieldValueContainer}>
            <Text style={styles.fieldValue}>{userProfile?.country || 'United Kingdom'}</Text>
            <Ionicons name="chevron-down" size={16} color="#94A3B8" />
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.contactToEditButton}
          onPress={handleContactToEdit}
        >
          <Text style={styles.contactToEditText}>Contact to edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  lastRefreshedText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 16,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 32,
    marginTop: 16,
  },
  profileSection: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 8,
  },
  fieldValueContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldValue: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '400',
  },
  contactToEditButton: {
    marginTop: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  contactToEditText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  logoutButton: {
    marginTop: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
