import { View, Text, SafeAreaView, FlatList, StyleSheet, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import WatchlistSearchBar from '../components/WatchlistSearchBar';
import WatchlistStockItem, { WatchlistStockItemProps } from '../components/WatchlistStockItem';
import ComplianceFilter, { ComplianceFilterType } from '../components/ComplianceFilter';

const watchlistData: WatchlistStockItemProps[] = [
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: '2,650.78', change: '81.98', changePercent: '3.7', isPositive: false, isCompliant: true },
  { symbol: 'AAPL', name: 'Apple Inc.', price: '168.88', change: '3.67', changePercent: '2.13', isPositive: true, isCompliant: true },
  { symbol: 'AMZN', name: 'Amazon', price: '159.22', change: '14.72', changePercent: '2.8', isPositive: false, isCompliant: false },
  { symbol: 'NVDA', name: 'Nvidia', price: '290.73', change: '8.77', changePercent: '3.0', isPositive: false, isCompliant: true },
  { symbol: 'SPOT', name: 'Spotify Inc.', price: '189.47', change: '4.72', changePercent: '1.9', isPositive: true, isCompliant: true },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: '293.25', change: '2.37', changePercent: '2.0', isPositive: false, isCompliant: false },
  { symbol: 'TSLA', name: 'Tesla', price: '254.11', change: '249.19', changePercent: '1.94', isPositive: true, isCompliant: true },
  { symbol: 'FIGM', name: 'Figma', price: '95.29', change: '14.72', changePercent: '2.8', isPositive: false, isCompliant: false },
];



export default function Watchlist() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStocks, setFilteredStocks] = useState(watchlistData);
  const [complianceFilter, setComplianceFilter] = useState<ComplianceFilterType>('compliant');

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    applyFilters(text, complianceFilter);
  };

  const handleFilterChange = (filter: ComplianceFilterType) => {
    setComplianceFilter(filter);
    applyFilters(searchQuery, filter);
  };

  const applyFilters = (query: string, filter: ComplianceFilterType) => {
    let filtered = watchlistData;
    
    // Apply search filter
    if (query.trim() !== '') {
      filtered = filtered.filter(
        stock => 
          stock.name.toLowerCase().includes(query.toLowerCase()) ||
          stock.symbol.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply compliance filter
    if (filter === 'compliant') {
      filtered = filtered.filter(stock => stock.isCompliant);
    } else if (filter === 'non-compliant') {
      filtered = filtered.filter(stock => !stock.isCompliant);
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

  // Apply initial filters
  useEffect(() => {
    applyFilters(searchQuery, complianceFilter);
  }, []);

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
      
      {filteredStocks.length > 0 ? (
        <FlatList
          data={filteredStocks}
          renderItem={renderStockItem}
          keyExtractor={item => item.symbol}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No stocks match your filters</Text>
        </View>
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
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
  },
});
