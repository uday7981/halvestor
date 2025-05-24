import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StockItemProps } from './ExploreStockItem';

type ExploreStockGridProps = StockItemProps & {
  onPress?: () => void;
};

const ExploreStockGrid = ({
  symbol,
  name,
  price,
  change,
  changePercent,
  isPositive,
  isCompliant,
  onPress,
}: ExploreStockGridProps) => {
  // Get the appropriate logo component based on stock symbol
  const renderLogo = () => {
    switch (symbol) {
      case 'GOOGL':
        return (
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>G</Text>
          </View>
        );
      case 'AAPL':
        return (
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>🍎</Text>
          </View>
        );
      case 'AMZN':
        return (
          <View style={[styles.logoContainer, { backgroundColor: '#FF9900' }]}>
            <Text style={[styles.logoText, { color: '#000' }]}>a</Text>
          </View>
        );
      case 'NVDA':
        return (
          <View style={[styles.logoContainer, { backgroundColor: '#76B900' }]}>
            <Text style={[styles.logoText, { color: '#FFF' }]}>N</Text>
          </View>
        );
      default:
        return (
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>{symbol.charAt(0)}</Text>
          </View>
        );
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        {/* Logo section */}
        {renderLogo()}
        
        {/* Company info section */}
        <View style={styles.infoSection}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.symbol}>{symbol}</Text>
        </View>
        
        {/* Price section */}
        <Text style={styles.price}>{price}</Text>
        
        {/* Change section */}
        <View style={[styles.changeContainer, isPositive ? styles.positiveChange : styles.negativeChange]}>
          <Text style={[styles.changeText, { color: '#FFF' }]}>
            {isPositive ? '+' : ''}{change} ({changePercent}%)
          </Text>
        </View>
        
        {/* Compliance badge */}
        <View style={[styles.complianceBadge, isCompliant ? styles.compliantBadge : styles.nonCompliantBadge]}>
          <Text style={[
            styles.complianceText,
            isCompliant ? styles.compliantText : styles.nonCompliantText
          ]}>
            {isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    marginHorizontal: 5,
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    padding: 12,
    alignItems: 'flex-start',
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  infoSection: {
    width: '100%',
    marginBottom: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  symbol: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  changeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  positiveChange: {
    backgroundColor: '#10B981',
  },
  negativeChange: {
    backgroundColor: '#EF4444',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  complianceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  compliantBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  nonCompliantBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  complianceText: {
    fontSize: 10,
    fontWeight: '600',
  },
  compliantText: {
    color: '#10B981',
  },
  nonCompliantText: {
    color: '#EF4444',
  },
});

export default ExploreStockGrid;
