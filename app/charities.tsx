import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Header from './components/Header';

// Mock data for charities
const charities = [
  {
    id: '1',
    name: 'Global Water Foundation',
    description: 'Providing clean water to communities in need around the world.',
    category: 'Water & Sanitation',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  },
  {
    id: '2',
    name: 'Education For All',
    description: 'Supporting education initiatives for underprivileged children globally.',
    category: 'Education',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1122&q=80',
  },
  {
    id: '3',
    name: 'Food Relief Network',
    description: 'Providing meals and food security to vulnerable populations.',
    category: 'Food & Hunger',
    image: 'https://images.unsplash.com/photo-1488330890490-36e0ea80d6eb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  },
  {
    id: '4',
    name: 'Medical Aid International',
    description: 'Delivering essential medical services to underserved communities.',
    category: 'Healthcare',
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  },
];

export default function CharitiesScreen() {
  const handleBack = () => {
    router.back();
  };
  
  const handleDonateToCharity = (id: string) => {
    // Navigate to donation form for specific charity
    // Using a valid path format for expo-router with query parameters
    router.push(`/donate?id=${id}`);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Eligible Charities</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Select a charity to donate your purified funds
          </Text>
          
          {charities.map((charity) => (
            <View key={charity.id} style={styles.charityCard}>
              <Image 
                source={{ uri: charity.image }} 
                style={styles.charityImage}
                resizeMode="cover"
              />
              <View style={styles.charityInfo}>
                <Text style={styles.charityCategory}>{charity.category}</Text>
                <Text style={styles.charityName}>{charity.name}</Text>
                <Text style={styles.charityDescription}>{charity.description}</Text>
                
                <TouchableOpacity 
                  style={styles.donateButton}
                  onPress={() => handleDonateToCharity(charity.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.donateButtonText}>Donate</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 20,
    textAlign: 'center',
  },
  charityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  charityImage: {
    width: '100%',
    height: 160,
  },
  charityInfo: {
    padding: 16,
  },
  charityCategory: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
    marginBottom: 4,
  },
  charityName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  charityDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  donateButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  donateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
