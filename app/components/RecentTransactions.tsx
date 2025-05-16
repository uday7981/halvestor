import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

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
};

const RecentTransactions = ({ onSeeAll }: RecentTransactionsProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent transactions</Text>
      </View>
      
      <TransactionItem 
        logo={null}
        action="Buy"
        stockName="NVIDIA"
        date="02/16/2024"
        shares="4"
        price="119.03"
        amount="107.57"
        time="12:45pm"
      />
      
      <TransactionItem 
        logo={null}
        action="Sell"
        stockName="Tesla"
        date="02/16/2024"
        shares="2"
        price="178.93"
        amount="4.90"
        time="12:40pm"
      />
      
      <TransactionItem 
        logo={null}
        action="Buy"
        stockName="Amazon"
        date="02/16/2024"
        shares="3"
        price="178.93"
        amount="17.28"
        time="12:40pm"
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
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoPlaceholder: {
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748B',
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
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor: '#F1F5F9',
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
  },
  transactionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionTime: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
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

export default RecentTransactions;
