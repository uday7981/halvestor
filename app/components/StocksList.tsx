import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import StockItem from './StockItem';

// Will be replaced with actual logos from Supabase later

type StocksListProps = {
  onSeeAll?: () => void;
};

const StocksList = ({ onSeeAll }: StocksListProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Stocks</Text>
        <Text style={styles.subtitle}>3 holdings</Text>
      </View>

      <StockItem
        logo={null}
        name="Alphabet Inc."
        ticker="GOOGL"
        price="2,650.78"
        change="61.96"
        changePercent="2.75"
        isPositive={false}
        isCompliant={true}
      />

      <StockItem
        logo={null}
        name="Apple Inc."
        ticker="AAPL"
        price="168.88"
        change="3.57"
        changePercent="2.23"
        isPositive={true}
        isCompliant={true}
      />

      <StockItem
        logo={null}
        name="Amazon"
        ticker="AMZN"
        price="159.22"
        change="34.72"
        changePercent="2.83"
        isPositive={true}
        isCompliant={false}
      />

      <TouchableOpacity
        style={styles.seeAllButton}
        onPress={onSeeAll}
      >
        <Text style={styles.seeAllText}>See all</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  seeAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
});

export default StocksList;
