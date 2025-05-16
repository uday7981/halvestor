import { View, Text, SafeAreaView, StyleSheet, FlatList, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import SearchBar from '../components/SearchBar';
import ExploreStockItem, { StockItemProps } from '../components/ExploreStockItem';
import ExploreStockGrid from '../components/ExploreStockGrid';
import FilterOverlay, { FilterOptions } from '../components/FilterOverlay';

const stocksData: StockItemProps[] = [
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: '2,650.78', change: '81.98', changePercent: '3.7', isPositive: false, isCompliant: true },
  { symbol: 'AAPL', name: 'Apple Inc.', price: '168.88', change: '3.67', changePercent: '2.13', isPositive: true, isCompliant: true },
  { symbol: 'AMZN', name: 'Amazon', price: '159.22', change: '14.72', changePercent: '2.8', isPositive: false, isCompliant: false },
  { symbol: 'NVDA', name: 'Nvidia', price: '290.73', change: '8.77', changePercent: '3.0', isPositive: false, isCompliant: true },
  { symbol: 'SPOT', name: 'Spotify Inc.', price: '189.47', change: '4.72', changePercent: '1.9', isPositive: true, isCompliant: true },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: '293.25', change: '2.37', changePercent: '2.0', isPositive: false, isCompliant: false },
  { symbol: 'TSLA', name: 'Tesla', price: '254.11', change: '249.19', changePercent: '1.94', isPositive: true, isCompliant: true },
  { symbol: 'FIGM', name: 'Figma', price: '95.29', change: '14.72', changePercent: '2.8', isPositive: false, isCompliant: false },
  { symbol: 'FRMR', name: 'Framer', price: '80.45', change: '1.23', changePercent: '1.5', isPositive: true, isCompliant: true },
];

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStocks, setFilteredStocks] = useState(stocksData);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    complianceFilter: 'compliant',
    viewStyle: 'list'
  });

  const applyFilters = (stocks: StockItemProps[], query: string, options: FilterOptions) => {
    let filtered = stocks;
    
    // Apply search query filter
    if (query.trim() !== '') {
      filtered = filtered.filter(
        stock => 
          stock.name.toLowerCase().includes(query.toLowerCase()) ||
          stock.symbol.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply compliance filter
    if (options.complianceFilter === 'compliant') {
      filtered = filtered.filter(stock => stock.isCompliant);
    } else if (options.complianceFilter === 'non-compliant') {
      filtered = filtered.filter(stock => !stock.isCompliant);
    }
    
    return filtered;
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setFilteredStocks(applyFilters(stocksData, text, filterOptions));
  };
  
  const handleFilterPress = () => {
    setIsFilterVisible(true);
  };
  
  const handleFilterClose = () => {
    setIsFilterVisible(false);
  };
  
  const handleFilterChange = (newOptions: FilterOptions) => {
    setFilterOptions(newOptions);
    setFilteredStocks(applyFilters(stocksData, searchQuery, newOptions));
  };
  
  // Re-apply filters when options change
  useEffect(() => {
    setFilteredStocks(applyFilters(stocksData, searchQuery, filterOptions));
  }, [filterOptions]);

  const handleStockPress = (symbol: string) => {
    router.push(`/stocks/${symbol}`);
  };

  const renderStockItem = ({ item }: { item: StockItemProps }) => {
    if (filterOptions.viewStyle === 'list') {
      return (
        <ExploreStockItem 
          {...item} 
          onPress={() => handleStockPress(item.symbol)}
        />
      );
    } else {
      return (
        <ExploreStockGrid 
          {...item} 
          onPress={() => handleStockPress(item.symbol)}
        />
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>AC</Text>
        </View>
      </View>
      
      <SearchBar 
        onSearch={handleSearch} 
        onFilterPress={handleFilterPress} 
        placeholder="Search"
      />
      
      <FilterOverlay
        visible={isFilterVisible}
        onClose={handleFilterClose}
        options={filterOptions}
        onOptionsChange={handleFilterChange}
      />
      
      <FlatList
        data={filteredStocks}
        renderItem={renderStockItem}
        keyExtractor={item => item.symbol}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        numColumns={filterOptions.viewStyle === 'grid' ? 2 : 1}
        key={filterOptions.viewStyle} // Force re-render when view style changes
        columnWrapperStyle={filterOptions.viewStyle === 'grid' ? styles.gridColumnWrapper : undefined}
      />
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
    padding: 16,
  },
  gridColumnWrapper: {
    justifyContent: 'space-between',
  },
});
