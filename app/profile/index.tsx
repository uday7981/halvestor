import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';

// Profile menu item component
const ProfileMenuItem = ({ 
  icon, 
  title, 
  onPress, 
  isLogout = false,
  showChevron = true
}: { 
  icon: React.ReactNode, 
  title: string, 
  onPress: () => void,
  isLogout?: boolean,
  showChevron?: boolean
}) => (
  <TouchableOpacity 
    style={[styles.menuItem, isLogout && styles.logoutItem]} 
    onPress={onPress}
  >
    <View style={styles.menuItemLeft}>
      {icon}
      <Text style={[styles.menuItemText, isLogout && styles.logoutText]}>
        {title}
      </Text>
    </View>
    {showChevron && (
      <Ionicons name="chevron-forward" size={20} color="#1E293B" />
    )}
  </TouchableOpacity>
);

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null>(null);

  useEffect(() => {
    // Fetch user profile data
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData.user) {
          throw new Error(userError?.message || 'User not found');
        }
        
        // Get user metadata
        const firstName = userData.user.user_metadata?.first_name || '';
        const lastName = userData.user.user_metadata?.last_name || '';
        
        setUser({
          id: userData.user.id,
          email: userData.user.email || '',
          firstName,
          lastName
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (!user) return '';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        
        {/* User Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
          <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.userEmail}>User ID: {user?.email}</Text>
        </View>
        
        {/* Menu Sections */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>General</Text>
          
          <ProfileMenuItem
            icon={<Ionicons name="person-outline" size={22} color="#1E293B" />}
            title="Your profile"
            onPress={() => router.push('/auth/user-profile')}
          />
          
          <ProfileMenuItem
            icon={<Ionicons name="lock-closed-outline" size={22} color="#1E293B" />}
            title="Security"
            onPress={() => {}}
          />
        </View>
        
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Other</Text>
          
          <ProfileMenuItem
            icon={<Ionicons name="help-circle-outline" size={22} color="#1E293B" />}
            title="Help"
            onPress={() => {}}
          />
          
          <ProfileMenuItem
            icon={<Ionicons name="log-out-outline" size={22} color="#EF4444" />}
            title="Logout"
            onPress={handleLogout}
            isLogout={true}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '600',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 12,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#EF4444',
  },
});
