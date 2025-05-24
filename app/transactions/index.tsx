import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, TextInput, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { getUserOrders, Order } from '../services/orderService';
import { formatDate } from '../utils/formatters';

type TransactionItemProps = {
  logo: any | null;
  action: 'Buy' | 'Sell';
  stockName: string;
  date: string;
  shares: string;
  price: string;
  amount: string;
  time: string;
};

const TransactionItem = ({
  logo,
  action,
  stockName,
  date,
  shares,
  price,
  amount,
  time,
}: TransactionItemProps) => {
  const isPositive = action === 'Sell';
  const actionColor = isPositive ? '#16A34A' : '#DC2626';
  const actionBgColor = isPositive ? '#DCFCE7' : '#FEE2E2';

  return (
    <View style={styles.transactionItem}>
      <View style={styles.leftSection}>
        {logo ? (
          <Image source={logo} style={styles.transactionLogo} />
        ) : (
          <View style={[styles.transactionLogo, styles.logoPlaceholder]}>
            <Text style={styles.logoInitial}>{stockName.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{action} {stockName}</Text>
          <Text style={styles.transactionSubtitle}>
            {shares} shares • ${price}
          </Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text style={[
          styles.transactionAmount,
          { color: actionColor }
        ]}>
          {isPositive ? '+' : '-'} {amount}
        </Text>
        <Text style={styles.transactionTime}>{time}</Text>
      </View>
    </View>
  );
};

export default function TransactionsScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch user orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await getUserOrders();
      
      if (error) {
        throw new Error(error);
      }
      
      setOrders(data || []);
      setFilteredOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch orders on initial load
  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOrders(orders);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = orders.filter(order => 
        (order.stock?.name || '').toLowerCase().includes(query) ||
        order.transaction_type.toLowerCase().includes(query)
      );
      setFilteredOrders(filtered);
    }
  }, [searchQuery, orders]);

  const handleRefresh = () => {
    fetchOrders();
  };

  const renderItem = ({ item }: { item: Order }) => {
    const action = item.transaction_type === 'buy' ? 'Buy' : 'Sell';
    const stockName = item.stock?.name || 'Unknown Stock';
    const date = item.created_at ? formatDate(item.created_at) : 'Unknown date';
    const shares = item.quantity.toString();
    const price = item.price_per_share.toFixed(2);
    const amount = (item.quantity * item.price_per_share).toFixed(2);
    const time = item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    
    return (
      <TransactionItem
        key={item.id}
        logo={null}
        action={action}
        stockName={stockName}
        date={date}
        shares={shares}
        price={price}
        amount={amount}
        time={time}
      />
    );
  };

  if (loading && orders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ 
          title: "Transactions",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#0F172A" />
            </TouchableOpacity>
          )
        }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading your transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ 
          title: "Transactions",
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
        title: "Transactions",
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#0F172A" />
          </TouchableOpacity>
        )
      }} />
      
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

      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="receipt-outline" size={40} color="#CBD5E1" />
          </View>
          <Text style={styles.emptyText}>No transactions found</Text>
          {searchQuery.length > 0 ? (
            <Text style={styles.emptySubtext}>Try adjusting your search criteria</Text>
          ) : (
            <Text style={styles.emptySubtext}>Your transaction history will appear here once you start trading</Text>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 12,
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
    paddingBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionLogo: {
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
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  transactionSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionTime: {
    fontSize: 14,
    color: '#64748B',
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
  },
});
