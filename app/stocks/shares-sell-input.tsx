import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

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

// Removed OrderTypeSelector component

export default function SharesSellInput() {
  const params = useLocalSearchParams();
  const stockName = params.name as string || 'Apple';
  const stockPrice = params.price as string || '234.27';
  const limitPrice = params.limitPrice as string || stockPrice;
  const orderType = params.orderType as string || 'Limit order';
  const symbol = params.symbol as string || 'AAPL';
  const availableShares = params.availableShares as string || '10';
  
  const [shares, setShares] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const totalAmount = shares ? (parseFloat(shares) * parseFloat(limitPrice)).toFixed(2) : '0.00';
  
  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500); // Blink every 500ms
    
    return () => clearInterval(cursorInterval);
  }, []);
  
  const handleBack = () => {
    router.back();
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
  
  const handleSellMax = () => {
    setShares(availableShares);
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
          
          <Text style={styles.priceInfoText}>
            ${limitPrice} per share • ${totalAmount} total
          </Text>
          
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceText}>{availableShares} shares available</Text>
            <TouchableOpacity style={styles.sellMaxButton} onPress={handleSellMax}>
              <Text style={styles.sellMaxText}>Sell max</Text>
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
          style={[styles.previewButton, !shares ? styles.previewButtonDisabled : {}]}
          onPress={handlePreviewOrder}
          disabled={!shares}
        >
          <Text style={[styles.previewButtonText, !shares ? styles.previewButtonTextDisabled : {}]}>Preview Order</Text>
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
  sharesLabel: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 16,
  },
  amountInputContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sharesText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  sharesInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cursor: {
    width: 2,
    height: 32,
    backgroundColor: '#EF4444',
    marginLeft: 2,
  },
  priceInfoText: {
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
