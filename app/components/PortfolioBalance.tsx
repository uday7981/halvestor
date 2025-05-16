import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Svg, Path, Circle } from 'react-native-svg';

type PortfolioBalanceProps = {
  balance: string;
  change: string;
  changePercent: string;
  isNegative: boolean;
};

// Eye Icon for toggling balance visibility
const EyeIcon = ({ isVisible, onToggle }: { isVisible: boolean; onToggle: () => void }) => (
  <Pressable style={styles.eyeIconContainer} onPress={onToggle}>
    {isVisible ? (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <Path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="#94A3B8" />
      </Svg>
    ) : (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <Path d="M12 6.5c-3.79 0-7.17 2.13-8.82 5.5 1.65 3.37 5.03 5.5 8.82 5.5s7.17-2.13 8.82-5.5c-1.65-3.37-5.03-5.5-8.82-5.5zm0 10c-2.48 0-4.5-2.02-4.5-4.5s2.02-4.5 4.5-4.5 4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" fill="#94A3B8" />
        <Path d="M3.71 3.56c-.39.39-.39 1.02 0 1.41l16.32 16.32c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L5.12 3.56c-.39-.39-1.02-.39-1.41 0z" fill="#94A3B8" />
      </Svg>
    )}
  </Pressable>
);

const PortfolioBalance = ({ balance, change, changePercent, isNegative }: PortfolioBalanceProps) => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  
  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.balanceRow}>
        <Text style={styles.balanceText}>
          {isBalanceVisible ? `$${balance}` : '••••••••'}
        </Text>
        <EyeIcon isVisible={isBalanceVisible} onToggle={toggleBalanceVisibility} />
      </View>
      
      <View style={styles.changeContainer}>
        <View style={styles.changeIconContainer}>
          <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <Circle cx="8" cy="8" r="8" fill={isNegative ? '#EF4444' : '#16A34A'} />
            <Path d="M8 4L8 12M5 7L8 4L11 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform={isNegative ? 'rotate(180 8 8)' : ''} />
          </Svg>
        </View>
        {isBalanceVisible ? (
          <Text style={[styles.changeText, { color: isNegative ? '#EF4444' : '#16A34A' }]}>
            ${change} ({changePercent}%)
          </Text>
        ) : (
          <Text style={[styles.changeText, { color: isNegative ? '#EF4444' : '#16A34A' }]}>
            •••••
          </Text>
        )}
        <Text style={styles.todayText}>Today</Text>
        <TouchableOpacity style={styles.infoButton}>
          <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <Circle cx="10" cy="10" r="9.5" stroke="#94A3B8" />
            <Text style={styles.infoIcon}>i</Text>
          </Svg>
        </TouchableOpacity>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.investButton}>
          <Text style={styles.investButtonText}>Invest</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.withdrawButton}>
          <Text style={styles.withdrawButtonText}>Withdraw</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  balanceText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: 'System',
  },
  eyeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  changeIconContainer: {
    marginRight: 4,
  },
  changeText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  todayText: {
    fontSize: 16,
    color: '#94A3B8',
    marginRight: 8,
  },
  infoButton: {
    marginLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 16,
  },
  investButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  investButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  withdrawButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 100,
    paddingVertical: 12,
    alignItems: 'center',
  },
  withdrawButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PortfolioBalance;
