import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export type WatchlistStockItemProps = {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  isCompliant: boolean;
  onPress?: () => void;
};

const WatchlistStockItem = ({
  symbol,
  name,
  price,
  change,
  changePercent,
  isPositive,
  isCompliant,
  onPress,
}: WatchlistStockItemProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.leftContainer}>
        <View style={styles.logoPlaceholder}>
          {symbol === 'GOOGL' && (
            <View style={styles.googleLogo}>
              <Text style={[styles.googleText, { color: '#4285F4' }]}>G</Text>
            </View>
          )}
          {symbol === 'AAPL' && (
            <View style={styles.appleLogo}>
              <Text style={styles.appleText}>🍎</Text>
            </View>
          )}
          {symbol === 'AMZN' && (
            <View style={styles.amazonLogo}>
              <Text style={styles.amazonText}>a</Text>
            </View>
          )}
          {symbol === 'NVDA' && (
            <View style={styles.nvidiaLogo}>
              <Text style={styles.nvidiaText}>N</Text>
            </View>
          )}
          {symbol === 'SPOT' && (
            <View style={styles.spotifyLogo}>
              <Text style={styles.spotifyText}>♫</Text>
            </View>
          )}
          {symbol === 'MSFT' && (
            <View style={styles.microsoftLogo}>
              <Text style={styles.microsoftText}>□</Text>
            </View>
          )}
          {symbol === 'TSLA' && (
            <View style={styles.teslaLogo}>
              <Text style={styles.teslaText}>T</Text>
            </View>
          )}
          {symbol === 'FIGM' && (
            <View style={styles.figmaLogo}>
              <Text style={styles.figmaText}>F</Text>
            </View>
          )}
          {!['GOOGL', 'AAPL', 'AMZN', 'NVDA', 'SPOT', 'MSFT', 'TSLA', 'FIGM'].includes(symbol) && (
            <Text style={styles.logoText}>{symbol.charAt(0)}</Text>
          )}
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.symbolContainer}>
            <Text style={styles.symbol}>{symbol}</Text>
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
      </View>
      <View style={styles.rightContainer}>
        <Text style={styles.price}>${price}</Text>
        <Text style={[styles.change, isPositive ? styles.positive : styles.negative]}>
          {isPositive ? '▲' : '▼'} ${change} ({changePercent}%)
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  googleLogo: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  googleText: {
    fontSize: 18,
    fontWeight: '700',
  },
  appleLogo: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  appleText: {
    fontSize: 18,
  },
  amazonLogo: {
    backgroundColor: '#FF9900',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  amazonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  nvidiaLogo: {
    backgroundColor: '#76B900',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  nvidiaText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  spotifyLogo: {
    backgroundColor: '#1DB954',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  spotifyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  microsoftLogo: {
    backgroundColor: '#F3F3F3',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  microsoftText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00A4EF',
  },
  teslaLogo: {
    backgroundColor: '#E82127',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  teslaText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  figmaLogo: {
    backgroundColor: '#F24E1E',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  figmaText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoContainer: {
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 4,
  },
  symbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symbol: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 8,
  },
  complianceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
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
  rightContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  change: {
    fontSize: 14,
    fontWeight: '500',
  },
  positive: {
    color: '#10B981',
  },
  negative: {
    color: '#EF4444',
  },
});

export default WatchlistStockItem;
