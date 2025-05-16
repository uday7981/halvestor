import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView
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

export default function OrderPreview() {
  const params = useLocalSearchParams();
  const stockName = params.name as string || 'Apple';
  const stockSymbol = params.symbol as string || 'AAPL';
  const stockPrice = params.price as string || '173.92';
  const shares = params.shares as string || '0';
  const amount = params.amount as string || '0';
  const orderType = params.orderType as string || 'Market order';
  const limitPrice = params.limitPrice as string || stockPrice;
  
  // Calculate values based on shares and price
  const formattedShares = shares;
  const executionFee = 0.10;
  const totalCost = parseFloat(amount) + executionFee;
  
  const handleCancel = () => {
    router.back();
  };
  
  const handleConfirm = () => {
    // Handle order confirmation
    // In a real app, this would submit the order to a backend
    router.replace({
      pathname: 'stocks/order-confirmation' as any,
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
        <Text style={styles.headerTitle}>Buy {stockName}</Text>
        <Ionicons name="close" size={24} color="#1E293B" style={styles.closeButton} onPress={handleCancel} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.stockInfo}>
            <Text style={styles.stockName}>{stockName}</Text>
            <Text style={styles.marketInfo}>
              {getOrderDescription()}
            </Text>
          </View>
          
          <Divider />
          
          <OrderDetailRow label="Order type" value={orderType} />
          <OrderDetailRow label="No. of shares" value={formattedShares} />
          {orderType === 'Limit order' && (
            <OrderDetailRow label="Limit price" value={`$${limitPrice}`} />
          )}
          <OrderDetailRow label="Latest price" value={`$${stockPrice}`} />
          <OrderDetailRow label="Order value" value={`$${parseFloat(amount).toFixed(2)}`} />
          <OrderDetailRow label="Execution fee" value={`${executionFee.toFixed(2)}`} />
          
          <Divider />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total cost</Text>
            <Text style={styles.totalValue}>${totalCost.toFixed(2)}</Text>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 16,
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
  },
  stockInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  stockName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  marketInfo: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  orderDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  orderDetailLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  orderDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
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
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
