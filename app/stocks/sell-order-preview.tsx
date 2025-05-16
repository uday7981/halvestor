import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  Image
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Reusable components for modularity
const OrderDetailRow = ({ 
  label, 
  value 
}: { 
  label: string; 
  value: string 
}) => (
  <View style={styles.orderDetailRow}>
    <Text style={styles.orderDetailLabel}>{label}</Text>
    <Text style={styles.orderDetailValue}>{value}</Text>
  </View>
);

const Divider = () => <View style={styles.divider} />;

export default function SellOrderPreview() {
  const params = useLocalSearchParams();
  const stockName = params.name as string || 'Apple';
  const stockSymbol = params.symbol as string || 'AAPL';
  const stockPrice = params.price as string || '173.92';
  const shares = params.shares as string || '0';
  const amount = params.amount as string || '0';
  const orderType = params.orderType as string || 'Market order';
  const limitPrice = params.limitPrice as string || stockPrice;
  
  // Calculate values based on shares and price
  const latestPrice = parseFloat(stockPrice);
  const orderValue = parseFloat(amount);
  const executionFee = 0.10;
  const purificationValue = 3.75; // percentage
  const totalProceeds = 10.00; // This would be calculated in a real app
  
  // Calculate estimated shares based on amount and price
  const estimatedShares = orderValue / latestPrice;
  const formattedShares = estimatedShares.toFixed(8);
  
  const handleCancel = () => {
    router.back();
  };
  
  const handleConfirm = () => {
    // Handle order confirmation
    // In a real app, this would submit the order to a backend
    router.replace({
      pathname: 'stocks/sell-order-confirmation' as any,
      params: {
        name: stockName,
        symbol: stockSymbol,
        price: stockPrice,
        amount: amount,
        shares: shares,
        orderType: orderType,
        limitPrice: limitPrice
      }
    });
  };
  
  const formatTime = () => {
    // Calculate market opening time (just for demo)
    const now = new Date();
    const hours = 2;
    const minutes = 13;
    return `${hours}h ${minutes}m`;
  };
  
  const getOrderDescription = () => {
    if (orderType === 'Limit order') {
      return `Order will be placed when ${stockName} reaches $${limitPrice}`;
    } else {
      return `Order will be placed when market opens in ${formatTime()}`;
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sell {stockName}</Text>
        <View style={styles.headerRight} />
      </View>
      
      {/* Amount display with logo */}
      <View style={styles.amountContainer}>
        <Text style={styles.amountText}>${amount}</Text>
        <View style={styles.logoContainer}>
          {stockSymbol === 'AAPL' ? (
            <Ionicons name="logo-apple" size={40} color="#000" style={styles.logo} />
          ) : (
            <View style={styles.logoFallback}>
              <Text style={styles.logoFallbackText}>{stockSymbol.charAt(0)}</Text>
            </View>
          )}
        </View>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Stock info header */}
          <View style={styles.stockInfo}>
            <Text style={styles.stockName}>Sell {stockName}</Text>
            <Text style={styles.stockSymbol}>{stockName}</Text>
            <Text style={styles.marketInfo}>
              {getOrderDescription()}
            </Text>
          </View>
          
          <Divider />
          
          {/* Order details */}
          <OrderDetailRow label="Order type" value={"Market sell"} />
          <OrderDetailRow label="No. of shares (est)" value={formattedShares} />
          <OrderDetailRow label="Latest price" value={`$${stockPrice}`} />
          <OrderDetailRow label="Order value" value={`$${parseFloat(amount).toFixed(2)}`} />
          <OrderDetailRow label="Execution fee" value={executionFee.toFixed(2)} />
          <OrderDetailRow label="Purification value (%)" value={`${purificationValue}%`} />
          
          <Divider />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total proceeds</Text>
            <Text style={styles.totalValue}>${totalProceeds.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerRight: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  amountContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#F8F9FA',
  },
  amountText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logo: {
    width: 40,
    height: 40,
  },
  logoFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoFallbackText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 10,
    paddingTop: 24,
    flex: 1,
  },
  stockInfo: {
    marginBottom: 20,
    alignItems: 'center',
  },
  stockName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  stockSymbol: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
  },
  marketInfo: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  orderDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  orderDetailLabel: {
    fontSize: 15,
    color: '#64748B',
  },
  orderDetailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1E293B',
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 25,
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  confirmButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 25,
    marginLeft: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
