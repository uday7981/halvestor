import { View, Text, SafeAreaView, FlatList, StyleSheet, Platform, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import WatchlistSearchBar from '../components/WatchlistSearchBar';
import WatchlistStockItem, { WatchlistStockItemProps } from '../components/WatchlistStockItem';
import ComplianceFilter, { ComplianceFilterType } from '../components/ComplianceFilter';
import { getWatchlistItems, Stock, removeFromWatchlist } from '../services/stockService';
import { formatCurrency } from '../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export default function Watchlist() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stocks, setStocks] = useState<WatchlistStockItemProps[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<WatchlistStockItemProps[]>([]);
  const [complianceFilter, setComplianceFilter] = useState<ComplianceFilterType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Function to map database stocks to UI format
  const mapStocksToUI = (stocks: Stock[]): WatchlistStockItemProps[] => {
    return stocks.map(stock => {
      const isPositive = stock.change_percent ? stock.change_percent >= 0 : false;
      const changeValue = stock.price && stock.change_percent ? 
        (stock.price * stock.change_percent / 100).toFixed(2) : '0.00';
      
      return {
        id: stock.id,
        symbol: stock.ticker,
        name: stock.name,
        price: formatCurrency(stock.price || 0),
        change: changeValue,
        changePercent: stock.change_percent ? stock.change_percent.toFixed(2) : '0.00',
        isPositive,
        isCompliant: stock.is_compliant
      };
    });
  };
  
  // Fetch watchlist data
  const fetchWatchlistStocks = useCallback(async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const { data, error } = await getWatchlistItems();
      
      if (error) {
        throw new Error(error);
      }
      
      if (data) {
        const formattedStocks = mapStocksToUI(data);
        setStocks(formattedStocks);
        // Initial filtering will be applied in the useEffect
      } else {
        setStocks([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching watchlist stocks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load watchlist data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);
  
  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    fetchWatchlistStocks(true);
  }, [fetchWatchlistStocks]);
  
  // Initial data fetch
  useEffect(() => {
    fetchWatchlistStocks();
    
    // Set up a refresh interval (every 5 minutes)
    const refreshInterval = setInterval(() => {
      fetchWatchlistStocks(true);
    }, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [fetchWatchlistStocks]);
  
  // Refresh data when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('Watchlist screen focused - refreshing data');
      fetchWatchlistStocks(true);
      return () => {};
    }, [fetchWatchlistStocks])
  );

  // Apply filters when stocks or filter criteria change
  useEffect(() => {
    applyFilters(searchQuery, complianceFilter);
  }, [stocks, searchQuery, complianceFilter]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleFilterChange = (filter: ComplianceFilterType) => {
    setComplianceFilter(filter);
  };

  const applyFilters = (query: string, filter: ComplianceFilterType) => {
    let filtered = [...stocks];
    
    // Apply search filter
    if (query.trim() !== '') {
      filtered = filtered.filter(
        (stock) => 
          stock.name.toLowerCase().includes(query.toLowerCase()) ||
          stock.symbol.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply compliance filter
    if (filter === 'compliant') {
      filtered = filtered.filter((stock) => stock.isCompliant);
    } else if (filter === 'non-compliant') {
      filtered = filtered.filter((stock) => !stock.isCompliant);
    }
    
    setFilteredStocks(filtered);
  };

  const handleStockPress = (symbol: string) => {
    router.push(`/stocks/${symbol}`);
  };

  const renderStockItem = ({ item }: { item: WatchlistStockItemProps }) => (
    <WatchlistStockItem 
      {...item} 
      onPress={() => handleStockPress(item.symbol)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Watchlist</Text>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>AC</Text>
        </View>
      </View>
      
      <WatchlistSearchBar 
        onSearch={handleSearch} 
        placeholder="Search"
      />
      
      <ComplianceFilter 
        selectedFilter={complianceFilter}
        onFilterChange={handleFilterChange}
      />
      
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading your watchlist...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => fetchWatchlistStocks()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : stocks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyTitle}>Your watchlist is empty</Text>
          <Text style={styles.emptyText}>Add stocks to your watchlist by tapping the heart icon on any stock details page</Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => router.push('/explore')}
          >
            <Text style={styles.exploreButtonText}>Explore Stocks</Text>
          </TouchableOpacity>
        </View>
      ) : filteredStocks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyText}>No stocks match your filters</Text>
        </View>
      ) : (
        <FlatList
          data={filteredStocks}
          renderItem={renderStockItem}
          keyExtractor={item => item.id || item.symbol}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#10B981', '#3B82F6']} 
              tintColor="#10B981" 
              title="Pull to refresh..."
              titleColor="#64748B" 
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 50 : 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1E293B',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#60A5FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
