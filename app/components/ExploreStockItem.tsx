import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export type StockItemProps = {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  isCompliant: boolean;
  onPress?: () => void;
};

const ExploreStockItem = ({
  symbol,
  name,
  price,
  change,
  changePercent,
  isPositive,
  isCompliant,
  onPress
}: StockItemProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.logoPlaceholder}>
        <Text style={styles.logoText}>{symbol.charAt(0)}</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.symbol}>{symbol}</Text>
        </View>
        
        <View style={styles.complianceContainer}>
          <View style={[
            styles.complianceBadge, 
            isCompliant ? styles.compliantBadge : styles.nonCompliantBadge
          ]}>
            <Text style={[
              styles.complianceText,
              isCompliant ? styles.compliantText : styles.nonCompliantText
            ]}>
              {isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.priceContainer}>
        <Text style={styles.price}>${price}</Text>
        <Text style={[
          styles.change,
          isPositive ? styles.positiveChange : styles.negativeChange
        ]}>
          {isPositive ? '+' : ''}{change} ({changePercent}%)
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748B',
  },
  infoContainer: {
    flex: 1,
  },
  nameContainer: {
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 2,
  },
  symbol: {
    fontSize: 14,
    color: '#64748B',
  },
  complianceContainer: {
    flexDirection: 'row',
  },
  complianceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  compliantBadge: {
    backgroundColor: '#E6F5EA',
  },
  nonCompliantBadge: {
    backgroundColor: '#FFE9E9',
  },
  complianceText: {
    fontSize: 10,
    fontWeight: '600',
  },
  compliantText: {
    color: '#16A34A',
  },
  nonCompliantText: {
    color: '#DC2626',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 2,
  },
  change: {
    fontSize: 14,
    fontWeight: '500',
  },
  positiveChange: {
    color: '#16A34A',
  },
  negativeChange: {
    color: '#DC2626',
  },
});

export default ExploreStockItem;
