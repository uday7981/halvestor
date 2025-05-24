import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
          <Text style={styles.transactionTitle}>{stockName}</Text>
          <Text style={styles.transactionSubtitle} numberOfLines={1} ellipsizeMode="tail">
            {shares} @ {price}
          </Text>
        </View>
      </View>
      <View style={styles.middleSection}>
        <View style={[styles.actionBadge, { backgroundColor: actionBgColor }]}>
          <Text style={[styles.actionText, { color: actionColor }]}>{action}</Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text style={[
          styles.transactionAmount,
          { color: actionColor }
        ]}>
          {isPositive ? '+' : '-'} {amount}
        </Text>
        <View style={styles.dateTimeContainer}>
          <Text style={styles.transactionDate}>{date}</Text>
        </View>
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
      router.push('/transactions' as any);
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
          <ActivityIndicator size="small" color="#10B981" />
          <Text style={styles.loadingText}>Loading your transactions...</Text>
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
          <View style={styles.emptyIconContainer}>
            <Ionicons name="receipt-outline" size={40} color="#CBD5E1" />
          </View>
          <Text style={styles.emptyText}>You don't have any transactions yet</Text>
          <Text style={styles.emptySubtext}>Your transaction history will appear here once you start trading</Text>
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
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 2,
    paddingRight: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  middleSection: {
    alignItems: 'center',
    marginHorizontal: 4,
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
    flexShrink: 1,
    marginRight: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  actionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  transactionSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  rightSection: {
    alignItems: 'flex-end',
    minWidth: 80,
    marginLeft: 4,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateTimeContainer: {
    alignItems: 'flex-end',
  },
  transactionDate: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  transactionTime: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 12,
    fontWeight: '500',
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 15,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    fontSize: 16,
    color: '#334155',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
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
    marginTop: 20,
    paddingVertical: 14,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
});

export default RecentTransactions;
