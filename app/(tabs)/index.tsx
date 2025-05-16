import { View, Text, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import React from 'react';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

// Import modular components
import Header from '../components/Header';
import PortfolioBalance from '../components/PortfolioBalance';
import PortfolioChart from '../components/PortfolioChart';
import PurifyGainsCard from '../components/PurifyGainsCard';
import StocksList from '../components/StocksList';
import RecentTransactions from '../components/RecentTransactions';

export default function Portfolio() {
  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="dark" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with greeting and avatar */}
        <Header username="Uday" avatarInitials="AC" />

        {/* Portfolio balance section */}
        <PortfolioBalance
          balance="113,466.08"
          change="1,150.34"
          changePercent="7"
          isNegative={true}
        />

        {/* Portfolio chart */}
        <PortfolioChart isNegative={true} />

        {/* Purify Your Gains card */}
        <PurifyGainsCard />

        {/* Stocks list */}
        <StocksList onSeeAll={() => console.log('See all stocks')} />

        {/* Recent transactions */}
        <RecentTransactions onSeeAll={() => console.log('See all transactions')} />

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
