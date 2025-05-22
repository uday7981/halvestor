import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { getUserOrders, Order } from '../services/orderService';
import { formatDate } from '../utils/formatters';

// Will be replaced with actual logos from Supabase later

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
        <View>
          <Text style={styles.transactionTitle}>
            {action} {stockName}
          </Text>
          <Text style={styles.transactionSubtitle}>
            {date} • {shares} shares • ${price}
          </Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text style={[
          styles.transactionAmount,
          { color: isPositive ? '#16A34A' : '#DC2626' }
        ]}>
          {isPositive ? '+' : '-'} ${amount}
        </Text>
        <Text style={styles.transactionTime}>{time}</Text>
      </View>
    </View>
  );
};

type RecentTransactionsProps = {
  onSeeAll?: () => void;
  refreshTrigger?: number; // Optional prop to trigger refresh from parent
};

const RecentTransactions = ({ onSeeAll, refreshTrigger = 0 }: RecentTransactionsProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch orders on initial load and when refreshTrigger changes
  useEffect(() => {
    fetchOrders();
  }, [refreshTrigger]);
  
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
          <Text style={styles.title}>Recent Transactions</Text>
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
          <Text style={styles.title}>Recent Transactions</Text>
          <Text style={styles.subtitle}>Error loading</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Could not load transactions</Text>
          <TouchableOpacity onPress={fetchOrders}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Recent Transactions</Text>
          <Text style={styles.subtitle}>No transactions</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You don't have any transactions yet</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Transactions</Text>
        <TouchableOpacity onPress={handleSeeAll}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>

      {orders.slice(0, 3).map((order) => {
        const action = order.transaction_type === 'buy' ? 'Buy' : 'Sell';
        const stockName = order.stock?.name || 'Unknown Stock';
        const date = order.created_at ? formatDate(order.created_at) : 'Unknown date';
        const shares = order.quantity.toString();
        const price = order.price_per_share.toFixed(2);
        const amount = `$${(order.quantity * order.price_per_share).toFixed(2)}`;
        const time = order.created_at ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        
        return (
          <TransactionItem
            key={order.id}
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
      })}

      <TouchableOpacity style={styles.viewAllButton} onPress={handleSeeAll}>
        <Text style={styles.viewAllText}>View all transactions</Text>
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
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  logoPlaceholder: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  transactionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
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
    color: '#6B7280',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    marginBottom: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  seeAllButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignSelf: 'center',
  },
  viewAllButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignSelf: 'center',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
});

export default RecentTransactions;
