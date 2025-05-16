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
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.logoPlaceholder}>
          {symbol === 'GOOGL' && (
            <View style={styles.googleLogo}>
              <Text style={[styles.googleText, { color: '#4285F4' }]}>G</Text>
              <Text style={[styles.googleText, { color: '#EA4335' }]}>o</Text>
              <Text style={[styles.googleText, { color: '#FBBC05' }]}>o</Text>
              <Text style={[styles.googleText, { color: '#4285F4' }]}>g</Text>
              <Text style={[styles.googleText, { color: '#34A853' }]}>l</Text>
              <Text style={[styles.googleText, { color: '#EA4335' }]}>e</Text>
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
          {symbol === 'FRMR' && (
            <View style={styles.framerLogo}>
              <Text style={styles.framerText}>Fr</Text>
            </View>
          )}
          {!['GOOGL', 'AAPL', 'AMZN', 'NVDA', 'SPOT', 'MSFT', 'TSLA', 'FIGM', 'FRMR'].includes(symbol) && (
            <Text style={styles.logoText}>{symbol.charAt(0)}</Text>
          )}
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.symbol}>{symbol}</Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${price}</Text>
          <View style={styles.changeContainer}>
            <View style={[styles.changeIndicator, isPositive ? styles.positiveIndicator : styles.negativeIndicator]} />
            <Text style={[styles.change, isPositive ? styles.positive : styles.negative]}>
              ${change} ({changePercent}%)
            </Text>
          </View>
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    height: 220,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
  },
  googleLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleText: {
    fontSize: 10,
    fontWeight: '700',
  },
  appleLogo: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  appleText: {
    fontSize: 20,
  },
  amazonLogo: {
    backgroundColor: '#FF9900',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  amazonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  nvidiaLogo: {
    backgroundColor: '#76B900',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  nvidiaText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  spotifyLogo: {
    backgroundColor: '#1DB954',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  spotifyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  microsoftLogo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  microsoftText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00A4EF',
  },
  teslaLogo: {
    backgroundColor: '#E82127',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  teslaText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  figmaLogo: {
    backgroundColor: '#F24E1E',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  figmaText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  framerLogo: {
    backgroundColor: '#0055FF',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  framerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoContainer: {
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  symbol: {
    fontSize: 14,
    color: '#94A3B8',
  },
  priceContainer: {
    marginBottom: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  positiveIndicator: {
    backgroundColor: '#10B981',
  },
  negativeIndicator: {
    backgroundColor: '#EF4444',
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
  complianceContainer: {
    alignItems: 'flex-start',
  },
  complianceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
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
});

export default ExploreStockGrid;
