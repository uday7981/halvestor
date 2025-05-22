import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import StockItem from './StockItem';
import { getUserHoldings, Holding } from '../services/holdingService';

// Will be replaced with actual logos from Supabase later

type StocksListProps = {
  onSeeAll?: () => void;
  refreshTrigger?: number; // Optional prop to trigger refresh from parent
};

const StocksList = ({ onSeeAll, refreshTrigger = 0 }: StocksListProps) => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch user holdings
  const fetchHoldings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await getUserHoldings();
      
      if (error) {
        throw new Error(error);
      }
      
      setHoldings(data || []);
    } catch (err) {
      console.error('Error fetching holdings:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch holdings on initial load and when refreshTrigger changes
  useEffect(() => {
    fetchHoldings();
  }, [refreshTrigger]);
  
  // Handle stock item press
  const handleStockPress = (ticker: string) => {
    router.push(`/stocks/${ticker}` as any);
  };
  
  // Handle see all press
  const handleSeeAll = () => {
    if (onSeeAll) {
      onSeeAll();
    } else {
      router.push('/portfolio' as any);
    }
  };
  
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Stocks</Text>
          <Text style={styles.subtitle}>Loading...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3B82F6" />
        </View>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Stocks</Text>
          <Text style={styles.subtitle}>Error loading</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Could not load holdings</Text>
          <TouchableOpacity onPress={fetchHoldings}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  if (holdings.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Stocks</Text>
          <Text style={styles.subtitle}>No holdings</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You don't have any stocks yet</Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => router.push('/explore' as any)}
          >
            <Text style={styles.exploreButtonText}>Explore Stocks</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Stocks</Text>
        <Text style={styles.subtitle}>{holdings.length} holdings</Text>
      </View>

      {holdings.slice(0, 3).map((holding) => {
        // Calculate change percentage
        const currentPrice = holding.stock?.price || 0;
        const previousPrice = currentPrice - (holding.stock?.change_percent || 0) / 100 * currentPrice;
        const change = currentPrice - previousPrice;
        const changePercent = holding.stock?.change_percent || 0;
        const isPositive = changePercent >= 0;
        
        return (
          <StockItem
            key={holding.id}
            logo={null}
            name={holding.stock?.name || 'Unknown'}
            ticker={holding.stock?.ticker || 'Unknown'}
            price={currentPrice.toFixed(2)}
            change={change.toFixed(2)}
            changePercent={Math.abs(changePercent).toFixed(2)}
            isPositive={isPositive}
            isCompliant={holding.stock?.is_compliant || false}
            onPress={() => handleStockPress(holding.stock?.ticker || '')}
          />
        );
      })}

      <TouchableOpacity
        style={styles.seeAllButton}
        onPress={handleSeeAll}
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  errorText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  exploreButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  exploreButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
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
