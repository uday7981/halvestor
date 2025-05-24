import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { getHoldingByTicker } from '../services/holdingService';
import { OrderTypeModal } from '../components';

// Reusable component for number pad buttons
const NumPadButton = ({ 
  value, 
  onPress 
}: { 
  value: string; 
  onPress: (val: string) => void 
}) => (
  <TouchableOpacity 
    style={styles.numPadButton} 
    onPress={() => onPress(value)}
  >
    {value === 'backspace' ? (
      <Ionicons name="backspace-outline" size={24} color="#1E293B" />
    ) : (
      <Text style={styles.numPadButtonText}>{value}</Text>
    )}
  </TouchableOpacity>
);

// Removed OrderTypeSelector component

export default function SharesSellInput() {
  const params = useLocalSearchParams();
  const stockName = params.name as string || 'Apple';
  const stockPrice = params.price as string || '234.27';
  const symbol = (params.symbol as string || 'AAPL').toUpperCase(); // Ensure ticker is uppercase
  
  const [shares, setShares] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [availableShares, setAvailableShares] = useState('0');
  const [currentHolding, setCurrentHolding] = useState<number | null>(null);
  const [orderType, setOrderType] = useState('Market order');
  const [orderTypeModalVisible, setOrderTypeModalVisible] = useState(false);
  const [limitPrice, setLimitPrice] = useState(stockPrice);
  const totalAmount = shares ? (parseFloat(shares) * parseFloat(limitPrice)).toFixed(2) : '0.00';
  
  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500); // Blink every 500ms
    
    return () => clearInterval(cursorInterval);
  }, []);
  
  // Fetch available shares when component loads
  useEffect(() => {
    const fetchAvailableShares = async () => {
      try {
        console.log('Automatically fetching available shares for ticker:', symbol);
        setLoading(true);
        
        // Use our new direct function to get holdings by ticker
        const { data: holding, error } = await getHoldingByTicker(symbol);
        
        if (error) {
          console.error('Error fetching holding by ticker:', error);
          setAvailableShares('0');
          return;
        }
        
        if (holding && holding.quantity > 0) {
          console.log('Found holding with quantity:', holding.quantity);
          setCurrentHolding(holding.quantity);
          setAvailableShares(holding.quantity.toString());
        } else {
          console.log('No holding found or quantity is 0 for ticker:', symbol);
          setAvailableShares('0');
        }
      } catch (error) {
        console.error('Exception in fetchAvailableShares:', error);
        setAvailableShares('0');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAvailableShares();
  }, [symbol]);
  
  const handleBack = () => {
    router.back();
  };
  
  const toggleOrderTypeModal = () => {
    setOrderTypeModalVisible(!orderTypeModalVisible);
  };
  
  const handleNumPadPress = (value: string) => {
    if (value === 'backspace') {
      setShares(prev => prev.slice(0, -1));
    } else if (value === '.') {
      if (!shares.includes('.')) {
        setShares(prev => prev + value);
      }
    } else {
      // Check if the new value would exceed available shares
      const newValue = shares + value;
      if (!isNaN(parseFloat(newValue)) && parseFloat(newValue) <= parseFloat(availableShares)) {
        setShares(newValue);
      }
    }
  };
  
  const handleSellMax = async () => {
    try {
      console.log('Starting Sell Max operation for ticker:', symbol);
      setLoading(true);
      
      // Use our direct function to get holdings by ticker
      console.log('Fetching holding directly by ticker:', symbol);
      const { data: holding, error } = await getHoldingByTicker(symbol);
      
      if (error) {
        console.error('Error fetching holding by ticker:', error);
        Alert.alert('Error', 'Could not fetch your holdings. Please try again.');
        setAvailableShares('0');
        return;
      }
      
      if (holding && holding.quantity > 0) {
        console.log('Found holding with quantity:', holding.quantity);
        // Set the current holding for reference
        setCurrentHolding(holding.quantity);
        // Update the available shares display
        setAvailableShares(holding.quantity.toString());
        // Set the shares to the current holding quantity
        setShares(holding.quantity.toString());
        console.log('Shares set to:', holding.quantity.toString());
      } else {
        console.log('No holding found or quantity is 0 for ticker:', symbol);
        setAvailableShares('0');
        setShares('');
        Alert.alert('No Shares', 'You do not own any shares of this stock.');
      }
    } catch (error) {
      console.error('Exception in handleSellMax:', error);
      Alert.alert('Error', 'An error occurred while fetching your holdings.');
      setAvailableShares('0');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePreviewOrder = () => {
    if (shares) {
      // Navigate to order preview screen
      router.push({
        pathname: 'stocks/sell-order-preview' as any,
        params: {
          name: stockName,
          price: stockPrice,
          symbol: symbol,
          shares: shares,
          amount: totalAmount,
          orderType: orderType,
          limitPrice: limitPrice
        }
      });
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sell {stockName}</Text>
        <View style={styles.headerRight} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.sharesLabel}>Number of shares</Text>
        
        <View style={styles.amountInputContainer}>
          <View style={styles.sharesInputWrapper}>
            <Text style={styles.sharesText}>{shares}</Text>
            {cursorVisible && shares.length === 0 && <View style={styles.cursor} />}
          </View>
          
          <TouchableOpacity 
            style={styles.orderTypeSelector}
            onPress={toggleOrderTypeModal}
          >
            <Text style={styles.orderTypeSelectorText}>{orderType}</Text>
            <Ionicons name="chevron-down" size={16} color="#64748B" />
          </TouchableOpacity>
          
          <Text style={styles.priceInfoText}>
            ${limitPrice} per share • ${totalAmount} total
          </Text>
          
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceText}>{availableShares} shares available</Text>
            <TouchableOpacity 
              style={[styles.sellMaxButton, loading && styles.sellMaxButtonDisabled]} 
              onPress={handleSellMax}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Text style={styles.sellMaxText}>Sell max</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.numPadContainer}>
          <View style={styles.numPadRow}>
            <NumPadButton value="1" onPress={handleNumPadPress} />
            <NumPadButton value="2" onPress={handleNumPadPress} />
            <NumPadButton value="3" onPress={handleNumPadPress} />
          </View>
          <View style={styles.numPadRow}>
            <NumPadButton value="4" onPress={handleNumPadPress} />
            <NumPadButton value="5" onPress={handleNumPadPress} />
            <NumPadButton value="6" onPress={handleNumPadPress} />
          </View>
          <View style={styles.numPadRow}>
            <NumPadButton value="7" onPress={handleNumPadPress} />
            <NumPadButton value="8" onPress={handleNumPadPress} />
            <NumPadButton value="9" onPress={handleNumPadPress} />
          </View>
          <View style={styles.numPadRow}>
            <NumPadButton value="." onPress={handleNumPadPress} />
            <NumPadButton value="0" onPress={handleNumPadPress} />
            <NumPadButton value="backspace" onPress={handleNumPadPress} />
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.previewButton, (!shares || loading) ? styles.previewButtonDisabled : null]}
          onPress={handlePreviewOrder}
          disabled={!shares || loading}
        >
          <Text style={styles.previewButtonText}>Preview Order</Text>
        </TouchableOpacity>
      </View>
      
      {/* Order Type Modal */}
      <OrderTypeModal
        visible={orderTypeModalVisible}
        onClose={toggleOrderTypeModal}
        selectedType={orderType}
        onSelectType={setOrderType}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'relative',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sharesLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 16,
  },
  amountInputContainer: {
    marginBottom: 24,
  },
  sharesInputWrapper: {
    alignItems: 'center',
    marginBottom: 16,
    height: 48,
  },
  sharesText: {
    fontSize: 36,
    fontWeight: '600',
    color: '#1E293B',
  },
  cursor: {
    width: 2,
    height: 32,
    backgroundColor: '#EF4444',
    marginLeft: 2,
  },
  orderTypeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    marginBottom: 12,
    alignSelf: 'center',
  },
  orderTypeSelectorText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginRight: 4,
  },
  priceInfoText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 12,
    textAlign: 'center',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  balanceText: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 8,
  },
  sellMaxButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  sellMaxButtonDisabled: {
    backgroundColor: '#F1F5F9',
    opacity: 0.7,
  },
  sellMaxText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  numPadContainer: {
    marginBottom: 24,
  },
  numPadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  numPadButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  numPadButtonText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#1E293B',
  },
  previewButton: {
    backgroundColor: '#EF4444',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  previewButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  previewButtonTextDisabled: {
    color: '#94A3B8',
  }
});
