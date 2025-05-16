import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  TextInput,
  Pressable
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
// Import components from the index file
import { OrderTypeModal, LimitOrderSellView } from '../components';

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

export default function SellStock() {
  const params = useLocalSearchParams();
  const stockName = params.name as string || 'Apple';
  const stockPrice = params.price as string || '240.17';
  const stockSymbol = params.symbol as string || 'AAPL';
  const availableShares = params.shares as string || '10';
  
  const [amount, setAmount] = useState('');
  const [orderType, setOrderType] = useState('Market order');
  const [orderTypeModalVisible, setOrderTypeModalVisible] = useState(false);
  
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
  
  const handlePreviewOrder = () => {
    if (amount) {
      // Navigate to order preview screen
      router.push({
        pathname: 'stocks/sell-order-preview' as any,
        params: {
          name: stockName,
          price: stockPrice,
          symbol: stockSymbol,
          amount: amount,
          orderType: 'Market order'
        }
      });
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
        
        <Text style={styles.sharesText}>~0 shares • 1APPL = ${stockPrice}</Text>
        
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceText}>{availableShares} shares available</Text>
          <TouchableOpacity style={styles.sellMaxButton}>
            <Text style={styles.sellMaxText}>Sell max</Text>
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
  
  // No need for handleLimitOrderContinue as LimitOrderSellView handles its own navigation
  
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
      
      {orderType === 'Market order' ? (
        renderMarketOrderView()
      ) : (
        <LimitOrderSellView 
          stockName={stockName}
          currentPrice={stockPrice}
          availableShares={availableShares}
          symbol={stockSymbol}
          onContinue={() => {}}
          onOrderTypePress={toggleOrderTypeModal}
        />
      )}
      
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
  sellMaxButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 100,
  },
  sellMaxText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#EF4444',
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
    backgroundColor: '#EF4444',
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
