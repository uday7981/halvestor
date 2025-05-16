import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  TextInput,
  Keyboard
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SimpleStockChart from './SimpleStockChart';

// Reusable components for modularity
const PriceAdjuster = ({ 
  price, 
  onIncrease, 
  onDecrease,
  onChangePrice
}: { 
  price: string; 
  onIncrease: () => void; 
  onDecrease: () => void;
  onChangePrice: (value: string) => void;
}) => (
  <View style={styles.priceAdjusterContainer}>
    <TouchableOpacity 
      style={styles.priceButton}
      onPress={onDecrease}
    >
      <Ionicons name="arrow-down" size={24} color="#1E293B" />
    </TouchableOpacity>
    
    <View style={styles.priceDisplay}>
      <Text style={styles.dollarSign}>$</Text>
      <TextInput
        style={styles.priceInput}
        value={price}
        onChangeText={onChangePrice}
        keyboardType="decimal-pad"
        returnKeyType="done"
        onSubmitEditing={Keyboard.dismiss}
      />
    </View>
    
    <TouchableOpacity 
      style={styles.priceButton}
      onPress={onIncrease}
    >
      <Ionicons name="arrow-up" size={24} color="#1E293B" />
    </TouchableOpacity>
  </View>
);

const PriceComparison = ({ 
  currentPrice, 
  limitPrice 
}: { 
  currentPrice: string; 
  limitPrice: string;
}) => {
  const currentPriceNum = parseFloat(currentPrice);
  const limitPriceNum = parseFloat(limitPrice);
  const percentDiff = ((limitPriceNum - currentPriceNum) / currentPriceNum * 100).toFixed(0);
  
  return (
    <Text style={styles.priceComparisonText}>
      {percentDiff}% from the current price (${currentPrice})
    </Text>
  );
};

const ChartTimeSelector = ({ 
  selectedTime, 
  onSelectTime 
}: { 
  selectedTime: string; 
  onSelectTime: (time: string) => void;
}) => {
  const timeOptions = ['1d', '1w', '1m', '3m', '6m', '1y', 'All'];
  
  return (
    <View style={styles.chartTimeSelector}>
      {timeOptions.map((time) => (
        <TouchableOpacity 
          key={time}
          style={[
            styles.timeOption,
            selectedTime === time ? styles.timeOptionSelected : {}
          ]}
          onPress={() => onSelectTime(time)}
        >
          <Text 
            style={[
              styles.timeOptionText,
              selectedTime === time ? styles.timeOptionTextSelected : {}
            ]}
          >
            {time}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const StockChart = ({ selectedTime }: { selectedTime: string }) => (
  <View style={styles.chartContainer}>
    <SimpleStockChart timeRange={selectedTime} color="#EF4444" />
  </View>
);

type LimitOrderSellViewProps = {
  stockName: string;
  currentPrice: string;
  availableShares: string;
  onContinue: () => void;
  onOrderTypePress: () => void;
  symbol?: string;
};

export default function LimitOrderSellView({
  stockName,
  currentPrice,
  availableShares,
  onContinue,
  onOrderTypePress,
  symbol = 'AAPL'
}: LimitOrderSellViewProps) {
  const [limitPrice, setLimitPrice] = useState(
    (parseFloat(currentPrice) * 1.03).toFixed(2)
  );
  const [selectedTimeRange, setSelectedTimeRange] = useState('1d');
  
  const handleContinue = () => {
    // Navigate to the shares input page
    router.push({
      pathname: 'stocks/shares-sell-input' as any,
      params: {
        name: stockName,
        price: currentPrice,
        symbol: symbol,
        limitPrice: limitPrice,
        orderType: 'Limit order',
        availableShares: availableShares
      }
    });
    
    // Also call the provided onContinue if it exists
    if (onContinue) {
      onContinue();
    }
  };
  
  const handleIncrease = () => {
    setLimitPrice((parseFloat(limitPrice) + 0.01).toFixed(2));
  };
  
  const handleDecrease = () => {
    setLimitPrice((parseFloat(limitPrice) - 0.01).toFixed(2));
  };
  
  const handleChangePrice = (value: string) => {
    // Only allow valid decimal numbers
    if (/^\\d*\\.?\\d*$/.test(value)) {
      setLimitPrice(value);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.setLimitText}>Set limit price</Text>
      
      <PriceAdjuster 
        price={limitPrice}
        onIncrease={handleIncrease}
        onDecrease={handleDecrease}
        onChangePrice={handleChangePrice}
      />
      
      <PriceComparison 
        currentPrice={currentPrice}
        limitPrice={limitPrice}
      />
      
      <TouchableOpacity 
        style={styles.orderTypeSelector}
        onPress={onOrderTypePress}
      >
        <Text style={styles.orderTypeSelectorText}>Limit order</Text>
        <Ionicons name="chevron-down" size={16} color="#64748B" />
      </TouchableOpacity>
      
      <StockChart selectedTime={selectedTimeRange} />
      
      <ChartTimeSelector 
        selectedTime={selectedTimeRange}
        onSelectTime={setSelectedTimeRange}
      />
      
      <TouchableOpacity 
        style={styles.continueButton}
        onPress={handleContinue}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
  },
  setLimitText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  priceAdjusterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  dollarSign: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1E293B',
    marginRight: 2,
  },
  priceInput: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1E293B',
    minWidth: 100,
    padding: 0,
  },
  priceComparisonText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
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
    marginBottom: 24,
  },
  orderTypeSelectorText: {
    fontSize: 14,
    color: '#1E293B',
    marginRight: 4,
  },
  chartContainer: {
    flex: 1,
    marginBottom: 16,
  },
  chartTimeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  timeOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  timeOptionSelected: {
    backgroundColor: '#F1F5F9',
  },
  timeOptionText: {
    fontSize: 14,
    color: '#64748B',
  },
  timeOptionTextSelected: {
    color: '#1E293B',
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: '#EF4444',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
