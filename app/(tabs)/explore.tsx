import { View, Text, SafeAreaView, StyleSheet, FlatList, Platform, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import SearchBar from '../components/SearchBar';
import ExploreStockItem, { StockItemProps } from '../components/ExploreStockItem';
import ExploreStockGrid from '../components/ExploreStockGrid';
import FilterOverlay, { FilterOptions } from '../components/FilterOverlay';
import { getAllStocks, Stock } from '../services/stockService';
import { formatCurrency, formatLargeNumber } from '../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stocks, setStocks] = useState<StockItemProps[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<StockItemProps[]>([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    complianceFilter: 'all',
    viewStyle: 'list'
  });

  // Convert database stocks to UI format
  const mapStocksToUI = (data: Stock[]): StockItemProps[] => {
    return data.map(stock => ({
      symbol: stock.ticker,
      name: stock.name || stock.ticker,
      price: formatCurrency(stock.price || 0),
      change: formatCurrency(Math.abs((stock.price || 0) * (stock.change_percent || 0) / 100)),
      changePercent: stock.change_percent ? stock.change_percent.toFixed(2) : '0.00',
      isPositive: (stock.change_percent || 0) >= 0,
      isCompliant: stock.is_compliant,
      // Additional data from MarketStack
      volume: stock.volume,
      high: stock.high,
      low: stock.low,
      open: stock.open,
      date: stock.date,
      market: stock.market
    }));
  };

  // Fetch stocks from Supabase
  const fetchStocks = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const { data, error } = await getAllStocks();

      if (error) {
        throw new Error(error);
      }

      if (data) {
        const formattedStocks = mapStocksToUI(data);
        setStocks(formattedStocks);
      }
    } catch (err) {
      console.error('Error fetching stocks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load stocks');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    fetchStocks(true);
  }, [fetchStocks]);

  // Initial data fetch
  useEffect(() => {
    fetchStocks();

    // Set up a refresh interval (every 5 minutes)
    const refreshInterval = setInterval(() => {
      fetchStocks();
    }, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [fetchStocks]);

  // Apply filters when search query or filter options change
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...stocks];

      // Apply search query filter
      if (searchQuery.trim() !== '') {
        filtered = filtered.filter(
          stock =>
            stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Apply compliance filter
      if (filterOptions.complianceFilter === 'compliant') {
        filtered = filtered.filter(stock => stock.isCompliant);
      } else if (filterOptions.complianceFilter === 'non-compliant') {
        filtered = filtered.filter(stock => !stock.isCompliant);
      }

      setFilteredStocks(filtered);
    };

    applyFilters();
  }, [stocks, searchQuery, filterOptions]);

  // Handle search input
  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  // Toggle filter overlay
  const toggleFilterOverlay = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  // Close filter overlay
  const closeFilterOverlay = () => {
    setIsFilterVisible(false);
  };

  // Apply filter options
  const handleFilterApply = (options: FilterOptions) => {
    setFilterOptions(options);
    setIsFilterVisible(false);
  };

  // Navigate to stock detail screen
  const handleStockPress = (stock: StockItemProps) => {
    // Use the appropriate navigation method for your app
    router.push({
      pathname: '/stocks/[id]',
      params: { id: stock.symbol }
    });
  };

  // Render stock item based on view style
  const renderStockItem = ({ item }: { item: StockItemProps }) => {
    if (filterOptions.viewStyle === 'grid') {
      return (
        <ExploreStockGrid
          {...item}
          onPress={() => handleStockPress(item)}
        />
      );
    }

    return (
      <ExploreStockItem
        {...item}
        onPress={() => handleStockPress(item)}
      />
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.emptyText}>Loading stocks...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
          <Text style={styles.emptyText}>Error loading stocks</Text>
          <Text style={styles.errorDetails}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchStocks()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredStocks.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color="#8E8E93" />
          <Text style={styles.emptyText}>No stocks found</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? 'Try a different search term' : 'Try changing your filters'}
          </Text>
        </View>
      );
    }

    return null;
  };

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={Platform.OS === 'ios' ? 'dark' : 'light'} />

      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <TouchableOpacity style={styles.filterButton} onPress={toggleFilterOverlay}>
          <Ionicons name="options-outline" size={24} color="#0066CC" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Search stocks..."
          onSearch={handleSearch}
        />
      </View>

      {filteredStocks.length > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Showing {filteredStocks.length} {filteredStocks.length === 1 ? 'stock' : 'stocks'}
          </Text>
          <Text style={styles.updatedText}>
            Last updated: {new Date().toLocaleTimeString()}
          </Text>
        </View>
      )}

      <FlatList
        data={filteredStocks}
        renderItem={renderStockItem}
        keyExtractor={(item) => item.symbol}
        contentContainerStyle={[
          styles.listContent,
          filteredStocks.length === 0 && styles.emptyList
        ]}
        numColumns={filterOptions.viewStyle === 'grid' ? 2 : 1}
        key={filterOptions.viewStyle === 'grid' ? 'grid' : 'list'}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0066CC']}
            tintColor="#0066CC"
          />
        }
        ListEmptyComponent={renderEmptyState}
      />

      <FilterOverlay
        visible={isFilterVisible}
        onClose={closeFilterOverlay}
        options={filterOptions}
        onOptionsChange={handleFilterApply}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8F8F8',
  },
  statsText: {
    fontSize: 14,
    color: '#666666',
  },
  updatedText: {
    fontSize: 14,
    color: '#666666',
  },
  listContent: {
    padding: 8,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
  errorDetails: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#0066CC',
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
