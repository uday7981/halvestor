import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type HeaderProps = {
  username: string;
  avatarInitials: string;
};

const Header = ({ username, avatarInitials }: HeaderProps) => {
  return (
    <View style={styles.header}>
      <Text style={styles.greeting}>Hi {username}</Text>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{avatarInitials}</Text>
      </View>
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
