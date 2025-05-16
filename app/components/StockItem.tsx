import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type StockItemProps = {
  logo: any | null;
  name: string;
  ticker: string;
  price: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  isCompliant: boolean;
};

const StockItem = ({
  logo,
  name,
  ticker,
  price,
  change,
  changePercent,
  isPositive,
  isCompliant,
}: StockItemProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {logo ? (
        <Image source={logo} style={styles.logo} />
      ) : (
        <View style={[styles.logo, styles.logoPlaceholder]}>
          <Text style={styles.logoInitial}>{name.charAt(0)}</Text>
        </View>
      )}
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.tickerContainer}>
            <Text style={styles.ticker}>{ticker}</Text>
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
        </View>
      </View>
      <View style={styles.priceSection}>
        <Text style={styles.price}>${price}</Text>
        <Text style={[
          styles.change,
          { color: isPositive ? '#16A34A' : '#DC2626' }
        ]}>
          {isPositive ? '+' : ''}{change} ({changePercent}%)
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  logo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
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
  nameContainer: {
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 4,
  },
  tickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticker: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 8,
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
  priceSection: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 4,
  },
  change: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default StockItem;
