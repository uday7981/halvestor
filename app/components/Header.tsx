import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useUser } from '../context/UserContext';

type HeaderProps = {
  username?: string;
  avatarInitials?: string;
};

const Header = ({ username, avatarInitials }: HeaderProps) => {
  // Get user data from context
  const { userProfile } = useUser();
  
  // Use provided props or fall back to context data
  const displayName = username || userProfile?.first_name || 'User';
  
  // Generate initials from context if not provided
  const displayInitials = avatarInitials || 
    (userProfile ? 
      `${userProfile.first_name?.[0] || ''}${userProfile.last_name?.[0] || ''}` : 
      'U');
  
  const handleAvatarPress = () => {
    router.push('/user/profile');
  };

  return (
    <View style={styles.header}>
      <Text style={styles.greeting}>Hi {displayName}</Text>
      <TouchableOpacity 
        style={styles.avatar} 
        onPress={handleAvatarPress}
        activeOpacity={0.7}
      >
        <Text style={styles.avatarText}>{displayInitials}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1E293B',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Header;
