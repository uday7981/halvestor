import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';

export default function PurificationWallet() {
  // Mock data for purification wallet
  const [purifiedAmount, setPurifiedAmount] = useState(125.75);
  
  const handleDonate = () => {
    // Navigate to charities list
    router.push('/charities');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Header />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.walletCard}>
            <View style={styles.walletHeader}>
              <Text style={styles.walletTitle}>Purification Wallet</Text>
              <Ionicons name="water-outline" size={24} color="#3B82F6" />
            </View>
            
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Available for donation</Text>
              <Text style={styles.amountValue}>${purifiedAmount.toFixed(2)}</Text>
            </View>
            
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                This is the amount set aside from your investments based on purification principles.
                You can donate this amount to eligible charities.
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.donateButton}
              onPress={handleDonate}
              activeOpacity={0.8}
            >
              <Text style={styles.donateButtonText}>Donate Now</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Purification History</Text>
            
            <View style={styles.historyItem}>
              <View style={styles.historyItemLeft}>
                <Text style={styles.historyItemTitle}>AAPL Dividend</Text>
                <Text style={styles.historyItemDate}>May 15, 2025</Text>
              </View>
              <Text style={styles.historyItemAmount}>+$45.25</Text>
            </View>
            
            <View style={styles.historyItem}>
              <View style={styles.historyItemLeft}>
                <Text style={styles.historyItemTitle}>MSFT Interest</Text>
                <Text style={styles.historyItemDate}>May 10, 2025</Text>
              </View>
              <Text style={styles.historyItemAmount}>+$32.50</Text>
            </View>
            
            <View style={styles.historyItem}>
              <View style={styles.historyItemLeft}>
                <Text style={styles.historyItemTitle}>GOOGL Dividend</Text>
                <Text style={styles.historyItemDate}>May 5, 2025</Text>
              </View>
              <Text style={styles.historyItemAmount}>+$48.00</Text>
            </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  walletCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  amountContainer: {
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3B82F6',
  },
  infoContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  donateButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  donateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  historySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  historyItemLeft: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 4,
  },
  historyItemDate: {
    fontSize: 14,
    color: '#64748B',
  },
  historyItemAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
});
