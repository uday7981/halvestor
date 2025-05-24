import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, TextInput, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { getUserHoldings, Holding } from '../services/holdingService';

type StockItemProps = {
  logo: any | null;
  name: string;
  ticker: string;
  shares: string;
  price: string;
  totalValue: string;
  changePercent: string;
  isPositive: boolean;
  isCompliant: boolean;
  onPress?: () => void;
};

const StockItem = ({
  logo,
  name,
  ticker,
  shares,
  price,
  totalValue,
  changePercent,
  isPositive,
  isCompliant,
  onPress,
}: StockItemProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.stockItem}>
      <View style={styles.leftSection}>
        {logo ? (
          <Image source={logo} style={styles.stockLogo} />
        ) : (
          <View style={[styles.stockLogo, styles.logoPlaceholder]}>
            <Text style={styles.logoInitial}>{name.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.stockInfo}>
          <Text style={styles.stockName}>{name}</Text>
          <View style={styles.complianceContainer}>
            <View style={[
              styles.complianceTag, 
              { backgroundColor: isCompliant ? '#E6F5EA' : '#FFE9E9' }
            ]}>
              <Text style={[
                styles.complianceText, 
                { color: isCompliant ? '#16A34A' : '#DC2626' }
              ]}>
                {isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
              </Text>
            </View>
          </View>
          <Text style={styles.sharesText}>{shares} shares</Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text style={styles.totalValue}>${totalValue}</Text>
        <Text style={styles.priceText}>${price} per share</Text>
        <Text style={[
          styles.changePercent,
          { color: isPositive ? '#16A34A' : '#DC2626' }
        ]}>
          {isPositive ? '↑' : '↓'} {changePercent}%
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function AllHoldingsScreen() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [filteredHoldings, setFilteredHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalValue, setTotalValue] = useState(0);

  // Fetch user holdings
  const fetchHoldings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await getUserHoldings();
      
      if (error) {
        throw new Error(error);
      }
      
      const holdingsData = data || [];
      setHoldings(holdingsData);
      setFilteredHoldings(holdingsData);
      
      // Calculate total portfolio value
      const total = holdingsData.reduce((sum, holding) => {
        const stockPrice = holding.stock?.price || 0;
        return sum + (holding.quantity * stockPrice);
      }, 0);
      
      setTotalValue(total);
    } catch (err) {
      console.error('Error fetching holdings:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch holdings on initial load
  useEffect(() => {
    fetchHoldings();
  }, []);

  // Filter holdings when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredHoldings(holdings);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = holdings.filter(holding => 
        (holding.stock?.name || '').toLowerCase().includes(query) ||
        (holding.stock?.ticker || '').toLowerCase().includes(query)
      );
      setFilteredHoldings(filtered);
    }
  }, [searchQuery, holdings]);

  const handleRefresh = () => {
    fetchHoldings();
  };

  const handleStockPress = (ticker: string) => {
    router.push(`/stocks/${ticker}` as any);
  };

  const renderItem = ({ item }: { item: Holding }) => {
    const stockName = item.stock?.name || 'Unknown Stock';
    const stockTicker = item.stock?.ticker || 'UNKNOWN';
    const shares = item.quantity.toString();
    const price = (item.stock?.price || 0).toFixed(2);
    const totalValue = (item.quantity * (item.stock?.price || 0)).toFixed(2);
    const changePercent = Math.abs(item.stock?.change_percent || 0).toFixed(2);
    const isPositive = (item.stock?.change_percent || 0) >= 0;
    const isCompliant = item.stock?.is_compliant || false;
    
    return (
      <StockItem
        logo={null}
        name={stockName}
        ticker={stockTicker}
        shares={shares}
        price={price}
        totalValue={totalValue}
        changePercent={changePercent}
        isPositive={isPositive}
        isCompliant={isCompliant}
        onPress={() => handleStockPress(stockTicker)}
      />
    );
  };

  if (loading && holdings.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ 
          title: "My Holdings",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#0F172A" />
            </TouchableOpacity>
          )
        }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading your holdings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ 
          title: "My Holdings",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#0F172A" />
            </TouchableOpacity>
          )
        }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity onPress={handleRefresh}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: "My Holdings",
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#0F172A" />
          </TouchableOpacity>
        )
      }} />
      
      {/* Total portfolio value removed as requested */}
      
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>

      {filteredHoldings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="trending-up-outline" size={40} color="#CBD5E1" />
          </View>
          <Text style={styles.emptyText}>No holdings found</Text>
          {searchQuery.length > 0 ? (
            <Text style={styles.emptySubtext}>Try adjusting your search criteria</Text>
          ) : (
            <Text style={styles.emptySubtext}>Start investing to see your holdings here</Text>
          )}
          {searchQuery.length === 0 && (
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => router.push('/explore' as any)}
            >
              <Text style={styles.exploreButtonText}>Explore Stocks</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredHoldings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          onRefresh={handleRefresh}
          refreshing={loading}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  backButton: {
    padding: 8,
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#0F172A',
  },
  clearButton: {
    padding: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stockLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  logoPlaceholder: {
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
  },
  stockInfo: {
    flex: 1,
  },
  stockName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  complianceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  complianceTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  complianceText: {
    fontSize: 10,
    fontWeight: '600',
  },
  sharesText: {
    fontSize: 13,
    color: '#64748B',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  priceText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  changePercent: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: '80%',
    marginBottom: 16,
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
});
