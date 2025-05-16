import React, { useRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Keyboard, GestureResponderEvent, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type SearchBarProps = {
  onSearch?: (text: string) => void;
  onFilterPress?: () => void;
  placeholder?: string;
};

const SearchBar = ({ 
  onSearch, 
  onFilterPress, 
  placeholder = 'Search' 
}: SearchBarProps) => {
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
      <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
        <Ionicons name="options-outline" size={20} color="#64748B" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 8,
  },
  searchContainer: {
    flex: 1,
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
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchBar;
