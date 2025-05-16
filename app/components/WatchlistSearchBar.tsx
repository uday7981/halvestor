import React, { useRef } from 'react';
import { View, TextInput, StyleSheet, Keyboard, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type WatchlistSearchBarProps = {
  onSearch?: (text: string) => void;
  placeholder?: string;
};

const WatchlistSearchBar = ({ 
  onSearch, 
  placeholder = 'Search' 
}: WatchlistSearchBarProps) => {
  const inputRef = useRef<TextInput>(null);
  
  // Create pan responder to detect horizontal swipes
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Only respond to horizontal movements
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 3);
    },
    onPanResponderRelease: (evt, gestureState) => {
      // If swiped from left to right (positive dx)
      if (gestureState.dx > 50) {
        // Dismiss keyboard
        Keyboard.dismiss();
      }
    },
  });

  return (
    <View style={styles.container}>
      <View 
        style={styles.searchContainer}
        {...panResponder.panHandlers}
      >
        <Ionicons name="search-outline" size={20} color="#94A3B8" style={styles.searchIcon} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          onChangeText={onSearch}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    padding: 0,
  },
});

export default WatchlistSearchBar;
