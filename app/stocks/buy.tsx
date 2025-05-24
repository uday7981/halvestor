import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import OrderTypeModal from '../components/OrderTypeModal';
import LimitOrderView from '../components/LimitOrderView';
import { getStockByTicker } from '../services/stockService';
import { placeMarketOrder } from '../services/orderService';
import { getUserProfile } from '../services/profileService';

// Reusable components for modularity
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

const OrderTypeSelector = ({ 
  selectedType, 
  onPress 
}: { 
  selectedType: string; 
  onPress: () => void 
}) => (
  <TouchableOpacity 
    style={styles.orderTypeSelector}
    onPress={onPress}
  >
    <Text style={styles.orderTypeSelectorText}>{selectedType}</Text>
    <Ionicons name="chevron-down" size={16} color="#64748B" />
  </TouchableOpacity>
);

export default function BuyStock() {
  const params = useLocalSearchParams();
  const stockSymbol = params.symbol as string || '';
  const stock_id = params.stock_id as string || '';
  
  const [stock, setStock] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [orderType, setOrderType] = useState('Market order');
  const [orderTypeModalVisible, setOrderTypeModalVisible] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [calculatedShares, setCalculatedShares] = useState(0);
  
  // Fetch user profile and cash balance
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoadingProfile(true);
        const { profile, error } = await getUserProfile();
        
        if (error) {
          console.log('Error fetching user profile:', error);
          // Default to 0 if there's an error
          setAvailableBalance(0);
        } else if (profile) {
          // Set the available balance from the user's profile
          const cashBalance = profile.cash_balance || 0;
          setAvailableBalance(cashBalance);
          console.log('User cash balance:', cashBalance);
        } else {
          // Default to 0 if no profile is found
          setAvailableBalance(0);
        }
      } catch (err) {
        console.log('Exception fetching user profile:', err);
        setAvailableBalance(0);
      } finally {
        setLoadingProfile(false);
      }
    };
    
    fetchUserProfile();
  }, []);

  // Fetch stock data
  useEffect(() => {
    const fetchStockData = async () => {
      if (!stockSymbol) {
        setError('No stock symbol provided');
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await getStockByTicker(stockSymbol);
        
        if (error) {
          throw new Error(error);
        }
        
        if (data) {
          setStock(data);
        } else {
          setError('Stock not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStockData();
  }, [stockSymbol]);
  
  // Calculate shares based on amount
  useEffect(() => {
    if (amount && stock?.price) {
      const parsedAmount = parseFloat(amount);
      const shares = parsedAmount / stock.price;
      setCalculatedShares(shares);
    } else {
      setCalculatedShares(0);
    }
  }, [amount, stock]);
  
  const handleBack = () => {
    router.back();
  };
  
  const toggleOrderTypeModal = () => {
    setOrderTypeModalVisible(!orderTypeModalVisible);
  };
  
  const handleNumPadPress = (value: string) => {
    if (value === 'backspace') {
      setAmount(prev => prev.slice(0, -1));
    } else if (value === '.') {
      if (!amount.includes('.')) {
        setAmount(prev => prev + value);
      }
    } else {
      setAmount(prev => prev + value);
    }
  };
  
  const handleBuyMax = () => {
    if (stock?.price && availableBalance > 0) {
      // Set amount to max available balance (minus a small buffer for fees)
      // Ensure we don't go negative with the buffer
      const buffer = 0.50; // Small buffer for fees
      const maxAmount = Math.max(0, availableBalance - buffer).toFixed(2);
      setAmount(maxAmount);
      console.log('Setting max buy amount:', maxAmount, 'from available balance:', availableBalance);
    } else {
      // If no balance or stock price, show a message
      if (!loadingProfile) {
        Alert.alert('Insufficient Balance', 'You do not have enough cash balance to buy this stock.');
      }
    }
  };
  
  const handlePreviewOrder = () => {
    if (amount && stock) {
      // Validate the amount against available balance
      const parsedAmount = parseFloat(amount);
      
      if (parsedAmount <= 0) {
        Alert.alert('Invalid Amount', 'Please enter an amount greater than zero.');
        return;
      }
      
      if (parsedAmount > availableBalance) {
        Alert.alert('Insufficient Balance', `You only have $${availableBalance.toFixed(2)} available. Please enter a smaller amount.`);
        return;
      }
      
      // Navigate to order preview screen
      router.push({
        pathname: 'stocks/order-preview' as any,
        params: {
          name: stock.name,
          price: stock.price.toString(),
          symbol: stock.ticker,
          amount: amount,
          shares: calculatedShares.toFixed(8),
          orderType: orderType,
          stock_id: stock_id || stock.id
        }
      });
    } else {
      Alert.alert('Missing Information', 'Please enter an amount to proceed.');
    }
  };
  
  const renderMarketOrderView = () => (
    <View style={styles.content}>
      <View style={styles.amountInputContainer}>
        <View style={styles.amountWrapper}>
          <View style={styles.dollarSignContainer}>
            <Text style={styles.dollarSign}>$</Text>
          </View>
          <Text style={styles.amountText}>{amount}</Text>
        </View>
        
        <Text style={styles.sharesText}>
          ~{calculatedShares.toFixed(8)} shares • 1{stock?.ticker || ''} = ${stock?.price?.toFixed(2) || '0.00'}
        </Text>
        
        <View style={styles.balanceContainer}>
          {loadingProfile ? (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <ActivityIndicator size="small" color="#0284c7" />
              <Text style={[styles.balanceText, {marginLeft: 8}]}>Loading balance...</Text>
            </View>
          ) : (
            <Text style={styles.balanceText}>${availableBalance.toFixed(2)} available</Text>
          )}
          <TouchableOpacity 
            style={[styles.buyMaxButton, {opacity: availableBalance > 0 ? 1 : 0.5}]} 
            onPress={handleBuyMax}
            disabled={availableBalance <= 0 || loadingProfile}
          >
            <Text style={styles.buyMaxText}>Buy max</Text>
          </TouchableOpacity>
        </View>
        
        <OrderTypeSelector 
          selectedType={orderType} 
          onPress={toggleOrderTypeModal} 
        />
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
        style={[styles.previewButton, !amount ? styles.previewButtonDisabled : {}]}
        onPress={handlePreviewOrder}
        disabled={!amount}
      >
        <Text style={[styles.previewButtonText, !amount ? styles.previewButtonTextDisabled : {}]}>Preview Order</Text>
      </TouchableOpacity>
    </View>
  );
  
  // No need for handleLimitOrderContinue as LimitOrderView handles its own navigation
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buy {stock?.name || 'Stock'}</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading stock data...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.tryAgainButton} onPress={handleBack}>
            <Text style={styles.tryAgainButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {orderType === 'Market order' ? (
            renderMarketOrderView()
          ) : (
            <LimitOrderView 
              stockName={stock?.name || ''}
              currentPrice={stock?.price?.toString() || '0'}
              onContinue={handlePreviewOrder}
              onOrderTypePress={toggleOrderTypeModal}
            />
          )}
        </>
      )}
      
      <OrderTypeModal 
        visible={orderTypeModalVisible}
        onClose={toggleOrderTypeModal}
        selectedType={orderType}
        onSelectType={(type) => {
          setOrderType(type);
          toggleOrderTypeModal();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    alignItems: 'flex-start',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    zIndex: 1,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  amountInputContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  amountWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dollarSignContainer: {
    marginRight: 2,
  },
  dollarSign: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1E293B',
  },
  amountText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1E293B',
  },
  sharesText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceText: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 8,
  },
  buyMaxButton: {
    backgroundColor: '#E0F2FE',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 100,
  },
  buyMaxText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0EA5E9',
  },
  orderTypeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 100,
    alignSelf: 'center',
  },
  orderTypeSelectorText: {
    fontSize: 14,
    color: '#1E293B',
    marginRight: 4,
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
    backgroundColor: '#3B82F6',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
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
  },
});
