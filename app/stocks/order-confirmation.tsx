import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getOrderById } from '../services/orderService';
import { Ionicons } from '@expo/vector-icons';

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
  cost,
  pricePerShare,
  orderType,
  limitPrice
}: {
  shares: string;
  stockName: string;
  cost: string;
  pricePerShare: string;
  orderType?: string;
  limitPrice?: string;
}) => (
  <View style={styles.orderSummaryContainer}>
    <Text style={styles.sharesText}>
      {shares} shares of {stockName} {orderType === 'Limit order' ? 'order placed' : 'bought'}
    </Text>
    <Text style={styles.costText}>
      {cost} estimated cost • {orderType === 'Limit order' ? `${limitPrice}/share limit` : `${pricePerShare}/share`}
    </Text>
    {orderType === 'Limit order' && (
      <Text style={styles.limitOrderText}>
        Order will execute when price reaches ${limitPrice}
      </Text>
    )}
  </View>
);

export default function OrderConfirmation() {
  const params = useLocalSearchParams();
  const stockName = params.name as string || 'Apple';
  const stockSymbol = params.symbol as string || 'AAPL';
  const stockPrice = params.price as string || '173.92';
  const amount = params.amount as string || '10.00';
  const shares = params.shares as string || '0';
  const orderType = params.orderType as string || 'Market order';
  const limitPrice = params.limitPrice as string || stockPrice;
  const orderId = params.orderId as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);
  
  // Fetch order details if orderId is provided
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        // If no orderId, just use the params data
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await getOrderById(orderId);
        
        if (error) {
          throw new Error(error);
        }
        
        if (data) {
          setOrder(data);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId]);

  // Calculate values if shares not provided
  const numShares = order?.quantity || shares || (parseFloat(amount) / parseFloat(stockPrice)).toFixed(8);
  const formattedPrice = order?.price_per_share ? 
    `$${order.price_per_share.toLocaleString()}` : 
    `$${parseFloat(stockPrice).toLocaleString()}`;

  const handleGoHome = () => {
    // Navigate back to the main screen
    router.push('/explore' as any);
  };
  
  const handleViewPortfolio = () => {
    // Navigate to the portfolio screen
    router.push('/portfolio' as any);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.tryAgainButton} onPress={handleGoHome}>
            <Text style={styles.tryAgainButtonText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        <SuccessBadge text="Order placed!" />

        <StockLogo symbol={stockSymbol} />

        <OrderSummary
          shares={numShares}
          stockName={order?.stock?.name || stockName}
          cost={order ? `$${(order.quantity * order.price_per_share).toFixed(2)}` : `$${parseFloat(amount).toFixed(2)}`}
          pricePerShare={formattedPrice}
          orderType={orderType}
          limitPrice={limitPrice}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleGoHome}
        >
          <Text style={styles.secondaryButtonText}>Done</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleViewPortfolio}
        >
          <Text style={styles.primaryButtonText}>View Portfolio</Text>
        </TouchableOpacity>
      </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  tryAgainButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  tryAgainButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '600',
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
  costText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 4,
  },
  limitOrderText: {
    fontSize: 14,
    color: '#3B82F6',
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
