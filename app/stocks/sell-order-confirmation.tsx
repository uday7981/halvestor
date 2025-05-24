import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { cleanupZeroHoldings } from '../services/holdingService';

// Reusable components for modularity
const SuccessBadge = ({ text }: { text: string }) => (
  <View style={styles.successBadge}>
    <Text style={styles.successBadgeText}>{text}</Text>
  </View>
);

const StockLogo = ({ symbol }: { symbol: string }) => (
  <View style={styles.stockLogoContainer}>
    <Image
      source={require('../../assets/apple-logo.png')}
      style={styles.stockLogo}
      resizeMode="contain"
    />
  </View>
);

const OrderSummary = ({
  shares,
  stockName,
  amount,
  pricePerShare,
  orderType,
  limitPrice,
  realizedPL
}: {
  shares: string;
  stockName: string;
  amount: string;
  pricePerShare: string;
  orderType?: string;
  limitPrice?: string;
  realizedPL?: string;
}) => (
  <View style={styles.orderSummaryContainer}>
    <Text style={styles.sharesText}>
      {shares} shares of {stockName} {orderType === 'Limit order' ? 'order placed' : 'sold'}
    </Text>
    <Text style={styles.amountText}>
      {amount} estimated amount • {orderType === 'Limit order' ? `${limitPrice}/share limit` : `${pricePerShare}/share`}
    </Text>
    {orderType === 'Limit order' && (
      <Text style={styles.limitOrderText}>
        Order will execute when price reaches ${limitPrice}
      </Text>
    )}
    {realizedPL && parseFloat(realizedPL) !== 0 && (
      <View style={[styles.plContainer, { backgroundColor: parseFloat(realizedPL) > 0 ? '#ECFDF5' : '#FEF2F2' }]}>
        <Text style={[styles.plText, { color: parseFloat(realizedPL) > 0 ? '#10B981' : '#EF4444' }]}>
          {parseFloat(realizedPL) > 0 ? 'Profit' : 'Loss'}: ${Math.abs(parseFloat(realizedPL)).toFixed(2)}
        </Text>
      </View>
    )}
  </View>
);

export default function SellOrderConfirmation() {
  const params = useLocalSearchParams();
  const stockName = params.name as string || 'Apple';
  const stockSymbol = params.symbol as string || 'AAPL';
  const stockPrice = params.price as string || '173.92';
  const amount = params.amount as string || '10.00';
  const shares = params.shares as string || '0';
  const orderType = params.orderType as string || 'Market order';
  const limitPrice = params.limitPrice as string || stockPrice;
  const realizedPL = params.realized_pl as string;

  // Calculate values if shares not provided
  const numShares = shares || (parseFloat(amount) / parseFloat(stockPrice)).toFixed(8);
  const formattedPrice = `$${parseFloat(stockPrice).toLocaleString()}`;

  const handleGoHome = async () => {
    try {
      // Clean up any zero quantity holdings before navigating
      console.log('Cleaning up zero quantity holdings after sell...');
      const { success, error } = await cleanupZeroHoldings();
      
      if (error) {
        console.warn('Error cleaning up zero holdings:', error);
      } else {
        console.log('Zero holdings cleanup completed successfully:', success);
      }
    } catch (err) {
      console.error('Error in cleanup:', err);
    } finally {
      // Navigate to the holdings screen to see updated holdings
      router.push('/holdings' as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        <SuccessBadge text="Order placed!" />

        <StockLogo symbol={stockSymbol} />

        <OrderSummary
          shares={numShares}
          stockName={stockName}
          amount={`$${parseFloat(amount).toFixed(2)}`}
          pricePerShare={formattedPrice}
          orderType={orderType}
          limitPrice={limitPrice}
          realizedPL={realizedPL}
        />
      </View>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={handleGoHome}
      >
        <Text style={styles.homeButtonText}>Go home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successBadge: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    marginBottom: 48,
  },
  successBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stockLogoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  stockLogo: {
    width: 40,
    height: 40,
  },
  orderSummaryContainer: {
    alignItems: 'center',
  },
  sharesText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  amountText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 4,
  },
  limitOrderText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    fontWeight: '500',
  },
  homeButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 100,
    paddingVertical: 16,
    marginHorizontal: 24,
    alignItems: 'center',
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  plContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    alignSelf: 'stretch',
  },
  plText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
