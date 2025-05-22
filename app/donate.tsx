import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Mock data for charities
const charities = [
  {
    id: '1',
    name: 'Global Water Foundation',
    description: 'Providing clean water to communities in need around the world.',
    category: 'Water & Sanitation',
  },
  {
    id: '2',
    name: 'Education For All',
    description: 'Supporting education initiatives for underprivileged children globally.',
    category: 'Education',
  },
  {
    id: '3',
    name: 'Food Relief Network',
    description: 'Providing meals and food security to vulnerable populations.',
    category: 'Food & Hunger',
  },
  {
    id: '4',
    name: 'Medical Aid International',
    description: 'Delivering essential medical services to underserved communities.',
    category: 'Healthcare',
  },
];

export default function DonateScreen() {
  const params = useLocalSearchParams();
  const { id } = params;
  
  const [amount, setAmount] = useState('');
  const [charity, setCharity] = useState<any>(null);
  
  useEffect(() => {
    if (id) {
      const foundCharity = charities.find(c => c.id === id);
      if (foundCharity) {
        setCharity(foundCharity);
      }
    }
  }, [id]);
  
  const handleBack = () => {
    router.back();
  };
  
  const handleDonate = () => {
    // Process donation
    // In a real app, this would connect to a payment processor
    
    // Navigate back to purification wallet with success message
    router.push('/(tabs)/purification');
  };
  
  if (!charity) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Donate</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContent}>
          <Text>Loading charity information...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Donate</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.charityInfo}>
            <Text style={styles.charityCategory}>{charity.category}</Text>
            <Text style={styles.charityName}>{charity.name}</Text>
            <Text style={styles.charityDescription}>{charity.description}</Text>
          </View>
          
          <View style={styles.donationForm}>
            <Text style={styles.formLabel}>Donation Amount</Text>
            
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor="#94A3B8"
              />
            </View>
            
            <View style={styles.quickAmounts}>
              <TouchableOpacity 
                style={styles.quickAmountButton}
                onPress={() => setAmount('10')}
              >
                <Text style={styles.quickAmountText}>$10</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAmountButton}
                onPress={() => setAmount('25')}
              >
                <Text style={styles.quickAmountText}>$25</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAmountButton}
                onPress={() => setAmount('50')}
              >
                <Text style={styles.quickAmountText}>$50</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAmountButton}
                onPress={() => setAmount('100')}
              >
                <Text style={styles.quickAmountText}>$100</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.donateButton,
                (!amount || parseFloat(amount) <= 0) && styles.donateButtonDisabled
              ]}
              onPress={handleDonate}
              disabled={!amount || parseFloat(amount) <= 0}
              activeOpacity={0.8}
            >
              <Text style={styles.donateButtonText}>Complete Donation</Text>
            </TouchableOpacity>
            
            <Text style={styles.disclaimer}>
              Your donation to {charity.name} will be processed securely. 
              You will receive a confirmation receipt via email.
            </Text>
          </View>
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  charityInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
  },
  donationForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 24,
    color: '#64748B',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#1E293B',
    paddingVertical: 12,
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickAmountButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  donateButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  donateButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  donateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
});
