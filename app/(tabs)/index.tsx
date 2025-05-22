import { View, Text, SafeAreaView, ScrollView, StyleSheet, RefreshControl } from "react-native";
import React, { useState, useEffect } from 'react';
import { router, useNavigation } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

// Import modular components
import Header from '../components/Header';
import PortfolioBalance from '../components/PortfolioBalance';
import PortfolioChart from '../components/PortfolioChart';
import PurifyGainsCard from '../components/PurifyGainsCard';
import StocksList from '../components/StocksList';
import RecentTransactions from '../components/RecentTransactions';

// Import services
import { getUserProfile } from '../services/profileService';
import { calculatePortfolioValue } from '../services/holdingService';

export default function Portfolio() {
  const [cashBalance, setCashBalance] = useState<number>(500); // Default to 500
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [portfolioChange, setPortfolioChange] = useState<number>(0);
  const [portfolioChangePercent, setPortfolioChangePercent] = useState<number>(0);
  const [isNegativeChange, setIsNegativeChange] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Function to fetch user profile data and portfolio value
  const fetchUserProfile = async () => {
    try {
      // Fetch user profile
      const { profile, error } = await getUserProfile();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      if (profile) {
        console.log('Profile fetched successfully:', profile);
        setUserProfile(profile);
        // Ensure we have a valid cash balance, default to 500 if not present
        setCashBalance(profile.cash_balance || 500);
      }
      
      // Fetch portfolio value
      const { totalValue, totalCost, error: portfolioError } = await calculatePortfolioValue();
      
      if (portfolioError) {
        console.error('Error calculating portfolio value:', portfolioError);
      } else {
        setPortfolioValue(totalValue);
        
        // Calculate change (mock data for now - in a real app this would come from historical data)
        // For now, we'll assume a 5% change from the total cost as an example
        const change = totalValue - totalCost;
        const changePercent = totalCost > 0 ? (change / totalCost) * 100 : 0;
        
        setPortfolioChange(change);
        setPortfolioChangePercent(changePercent);
        setIsNegativeChange(change < 0);
      }
      
      // Trigger a refresh of the StocksList component
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserProfile();
  };

  // Fetch profile on initial load
  useEffect(() => {
    setLoading(true);
    fetchUserProfile();
  }, []);
  
  // Refresh data when the screen comes into focus (after placing an order)
  useFocusEffect(
    React.useCallback(() => {
      console.log('Portfolio screen focused - refreshing data');
      // Force a complete refresh of user profile and portfolio data
      setLoading(true);
      fetchUserProfile();
      return () => {};
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="dark" translucent backgroundColor="transparent" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            title="Pull to refresh"
            titleColor="#64748B"
          />
        }
      >
        {/* Header with greeting and avatar - now using UserContext */}
        <Header />

        {/* Portfolio balance section */}
        <PortfolioBalance
          balance={portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          change={Math.abs(portfolioChange).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          changePercent={Math.abs(portfolioChangePercent).toFixed(2)}
          isNegative={isNegativeChange}
          cashBalance={cashBalance}
        />

        {/* Portfolio chart */}
        <PortfolioChart isNegative={isNegativeChange} />

        {/* Purify Your Gains card */}
        <PurifyGainsCard />

        {/* Stocks list */}
        <StocksList 
          onSeeAll={() => router.push('/portfolio' as any)}
          refreshTrigger={refreshTrigger}
        />

        {/* Recent transactions */}
        <RecentTransactions 
          onSeeAll={() => router.push('/transactions' as any)}
          refreshTrigger={refreshTrigger}
        />

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  bottomPadding: {
    height: 100,
  }
});
