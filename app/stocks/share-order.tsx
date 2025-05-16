import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  TextInput,
  Keyboard
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
      <Ionicons name="chevron-back" size={24} color="#1E293B" />
    ) : (
      <Text style={styles.numPadButtonText}>{value}</Text>
    )}
  </TouchableOpacity>
);

const InfoRow = ({
  label,
  value,
  isHighlighted = false
}: {
  label: string;
  value: string;
  isHighlighted?: boolean;
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, isHighlighted && styles.highlightedValue]}>{value}</Text>
  </View>
);

export default function ShareOrder() {
  const params = useLocalSearchParams();
  const stockName = params.name as string || 'Apple';
  const stockPrice = params.price as string || '234.27';
  
  const [shares, setShares] = useState('');
  const totalCost = shares ? (parseFloat(shares) * parseFloat(stockPrice)).toFixed(2) : '0.00';
  
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
      setShares(prev => prev + value);
    }
  };
  
  const handlePreviewOrder = () => {
    if (shares) {
      // Navigate to order preview screen
      router.push({
        pathname: 'stocks/order-preview' as any,
        params: {
          name: stockName,
          price: stockPrice,
          symbol: 'AAPL',
          shares: shares,
          amount: totalCost,
          orderType: 'Limit order'
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
        <Text style={styles.headerTitle}>Buy {stockName}</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.sharesLabel}>Number of shares</Text>
        
        <View style={styles.sharesInputContainer}>
          <Text style={styles.sharesText}>{shares}</Text>
          <View style={styles.cursorLine} />
        </View>
        
        <View style={styles.infoContainer}>
          <InfoRow 
            label={`$${stockPrice} per share`}
            value={`$${totalCost} total`}
          />
          
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceText}>$0.85 available</Text>
            <TouchableOpacity 
              style={styles.infoButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="information-circle-outline" size={16} color="#64748B" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.buyMaxButton}>
              <Text style={styles.buyMaxText}>Buy max</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.orderTypeSelector}
            onPress={() => {}}
          >
            <Text style={styles.orderTypeSelectorText}>Limit order</Text>
            <Ionicons name="chevron-down" size={16} color="#64748B" />
          </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    justifyContent: 'space-between',
  },
  sharesLabel: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  sharesInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  sharesText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    minWidth: 40,
  },
  cursorLine: {
    width: 2,
    height: 32,
    backgroundColor: '#3B82F6',
    marginLeft: 2,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    color: '#64748B',
  },
  highlightedValue: {
    color: '#1E293B',
    fontWeight: '500',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceText: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 4,
  },
  infoButton: {
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
    width: '30%',
    aspectRatio: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
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
    marginBottom: 24,
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
