import React from 'react';
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
  limitPrice
}: {
  shares: string;
  stockName: string;
  amount: string;
  pricePerShare: string;
  orderType?: string;
  limitPrice?: string;
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

  // Calculate values if shares not provided
  const numShares = shares || (parseFloat(amount) / parseFloat(stockPrice)).toFixed(8);
  const formattedPrice = `$${parseFloat(stockPrice).toLocaleString()}`;

  const handleGoHome = () => {
    // Navigate back to the main screen
    router.push('/explore' as any);
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
    paddingBottom: 24,
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
});
