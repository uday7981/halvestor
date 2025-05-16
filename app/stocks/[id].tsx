import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import SimpleStockChart from '../components/SimpleStockChart';

// Define timeframe type
type TimeframeOption = '1d' | '1w' | '1m' | '3m' | '6m' | '1y' | 'All';

// Reusable components
const KeyValuePair = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.keyValuePair}>
    <Text style={styles.keyLabel}>{label}</Text>
    <Text style={styles.keyValue}>{value}</Text>
  </View>
);

const AnalystRatingBar = ({ percentage, color }: { percentage: number; color: string }) => (
  <View style={styles.ratingBarContainer}>
    <View style={[styles.ratingBar, { width: `${percentage}%`, backgroundColor: color }]} />
  </View>
);

const StockDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // Get stock data based on id
  const getStockData = () => {
    // This would be replaced with an API call in a real app
    const stockData = {
      AAPL: { name: 'Apple Inc.', price: '168.88', symbol: 'AAPL', shares: '10', isCompliant: true },
      GOOGL: { name: 'Alphabet Inc.', price: '2,650.78', symbol: 'GOOGL', shares: '5', isCompliant: true },
      AMZN: { name: 'Amazon', price: '159.22', symbol: 'AMZN', shares: '15', isCompliant: false },
      NVDA: { name: 'Nvidia', price: '290.73', symbol: 'NVDA', shares: '8', isCompliant: true },
      MSFT: { name: 'Microsoft Corp.', price: '293.25', symbol: 'MSFT', shares: '12', isCompliant: false },
      TSLA: { name: 'Tesla', price: '254.11', symbol: 'TSLA', shares: '20', isCompliant: true },
    };
    
    return stockData[id as keyof typeof stockData] || { name: 'Apple Inc.', price: '168.88', symbol: 'AAPL', shares: '10', isCompliant: true };
  };
  
  const stockData = getStockData();
  const [activeTimeframe, setActiveTimeframe] = useState<TimeframeOption>('1m');
  
  const handleBack = () => {
    router.back();
  };
  
  const handleShare = () => {
    console.log('Share stock');
  };
  
  const handleFavorite = () => {
    console.log('Add to favorites');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <View style={styles.backButtonCircle}>
            <Ionicons name="chevron-back" size={20} color="#1E293B" />
          </View>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{stockData.name}</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={22} color="#1E293B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleFavorite}>
            <Ionicons name="heart-outline" size={22} color="#1E293B" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.companyHeader}>
          <View style={styles.companyLogo}>
            <Ionicons name={id === 'AAPL' ? "logo-apple" : "business-outline"} size={24} color="#000" />
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{stockData.name}</Text>
            <Text style={styles.companySymbol}>{stockData.symbol}</Text>
          </View>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${stockData.price}</Text>
          <View style={styles.priceChangeContainer}>
            <View style={styles.priceChangeIndicator}>
              <Ionicons name="arrow-up" size={14} color="white" />
            </View>
            <Text style={styles.priceChange}>$1,150.34 (7%)</Text>
            <Text style={styles.priceTime}>Today</Text>
          </View>
        </View>
        
        <Text style={styles.companyDescription}>
          Apple is among the largest companies in the world, with a broad
          portfolio of hardware and software products targeted at
          consumers and businesses.
        </Text>
        
        <View style={styles.chartContainer}>
          <SimpleStockChart 
            timeRange={activeTimeframe}
            color="#10B981"
          />
          
          <View style={styles.timeframeContainer}>
            <TouchableOpacity 
              style={[styles.timeframeButton, activeTimeframe === '1d' && styles.timeframeButtonActive]}
              onPress={() => setActiveTimeframe('1d')}
            >
              <Text style={activeTimeframe === '1d' ? styles.timeframeButtonTextActive : styles.timeframeButtonText}>1d</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.timeframeButton, activeTimeframe === '1w' && styles.timeframeButtonActive]}
              onPress={() => setActiveTimeframe('1w')}
            >
              <Text style={activeTimeframe === '1w' ? styles.timeframeButtonTextActive : styles.timeframeButtonText}>1w</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.timeframeButton, activeTimeframe === '1m' && styles.timeframeButtonActive]}
              onPress={() => setActiveTimeframe('1m')}
            >
              <Text style={activeTimeframe === '1m' ? styles.timeframeButtonTextActive : styles.timeframeButtonText}>1m</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.timeframeButton, activeTimeframe === '3m' && styles.timeframeButtonActive]}
              onPress={() => setActiveTimeframe('3m')}
            >
              <Text style={activeTimeframe === '3m' ? styles.timeframeButtonTextActive : styles.timeframeButtonText}>3m</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.timeframeButton, activeTimeframe === '6m' && styles.timeframeButtonActive]}
              onPress={() => setActiveTimeframe('6m')}
            >
              <Text style={activeTimeframe === '6m' ? styles.timeframeButtonTextActive : styles.timeframeButtonText}>6m</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.timeframeButton, activeTimeframe === '1y' && styles.timeframeButtonActive]}
              onPress={() => setActiveTimeframe('1y')}
            >
              <Text style={activeTimeframe === '1y' ? styles.timeframeButtonTextActive : styles.timeframeButtonText}>1y</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.timeframeButton, activeTimeframe === 'All' && styles.timeframeButtonActive]}
              onPress={() => setActiveTimeframe('All')}
            >
              <Text style={styles.timeframeButtonText}>All</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.complianceContainer}>
          <View style={styles.complianceHeader}>
            <Text style={styles.sectionTitle}>Compliance Status</Text>
            <TouchableOpacity>
              <Ionicons name="information-circle-outline" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.complianceStatus}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.complianceText}>APPL is Shariah Compliant!</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.reportButton}
            onPress={() => router.push('stocks/compliance-report' as any)}
          >
            <Text style={styles.reportButtonText}>See Full Report</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.analystContainer}>
          <Text style={styles.sectionTitle}>Analyst Rating</Text>
          <Text style={styles.analystSubtitle}>Based on information from 42 analysts.</Text>
          
          <View style={styles.ratingCircleContainer}>
            <View style={styles.ratingCircleTrack}>
              <View style={styles.ratingCircleFill} />
              <View style={styles.ratingCircleContent}>
                <Text style={styles.ratingText}>Buy</Text>
                <Text style={styles.ratingPercentage}>40%</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.ratingsBreakdown}>
            <View style={styles.ratingRow}>
              <View style={styles.ratingLabelContainer}>
                <View style={[styles.ratingDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.ratingLabel}>Buy</Text>
              </View>
              <Text style={styles.ratingPercentageText}>40%</Text>
            </View>
            
            <View style={styles.ratingRow}>
              <View style={styles.ratingLabelContainer}>
                <View style={[styles.ratingDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.ratingLabel}>Hold</Text>
              </View>
              <Text style={styles.ratingPercentageText}>29%</Text>
            </View>
            
            <View style={styles.ratingRow}>
              <View style={styles.ratingLabelContainer}>
                <View style={[styles.ratingDot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.ratingLabel}>Sell</Text>
              </View>
              <Text style={styles.ratingPercentageText}>31%</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.keyStatsContainer}>
          <View style={styles.keyStatsHeader}>
            <Text style={styles.sectionTitle}>Key Stats</Text>
            <Text style={styles.keyStatsNote}>* Data may be slightly delayed</Text>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Open</Text>
              <Text style={styles.statValue}>169.82</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Mkt Cap</Text>
              <Text style={styles.statValue}>3.11T</Text>
            </View>
          </View>
          
          <View style={styles.statRowDivider} />
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>High</Text>
              <Text style={styles.statValue}>170.54</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>P/E ratio</Text>
              <Text style={styles.statValue}>27.60</Text>
            </View>
          </View>
          
          <View style={styles.statRowDivider} />
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Low</Text>
              <Text style={styles.statValue}>166.23</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Div yield</Text>
              <Text style={styles.statValue}>0.53</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.aboutContainer}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            Apple is among the largest companies in the world, with a broad portfolio of hardware and software products targeted at consumers and businesses. Apple's iPhone makes up a majority of the firm sales, and Apple's other products like Mac, iPad and Watch are designed around the iPhone as the focal point of an ecosystem. Apple has progressively worked to add new applications, like streaming video, subscription bundles, and augmented reality. The firm designs its own software and semiconductors while working with subcontractors like Foxconn and TSMC to build its products and chips. Slightly less than half of Apple's sales come directly through its flagship stores, with a majority of sales coming directly through its distribution.
          </Text>
        </View>
        
        {/* Bottom padding to ensure content isn't hidden behind fixed buttons */}
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Fixed Buy/Sell CTAs at bottom */}
      <View style={styles.fixedActionButtonsContainer}>
        <TouchableOpacity 
          style={styles.sellButton}
          onPress={() => {
            // Navigate to sell screen with stock details
            router.push({
              pathname: 'stocks/sell' as any,
              params: {
                name: stockData.name,
                price: stockData.price.replace(',', ''),
                symbol: stockData.symbol,
                shares: stockData.shares
              }
            });
          }}
        >
          <Text style={styles.sellButtonText}>Sell</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.buyButton}
          onPress={() => {
            // Navigate to buy screen with stock details
            router.push({
              pathname: 'stocks/buy' as any,
              params: {
                name: stockData.name,
                price: stockData.price.replace(',', ''),
                symbol: stockData.symbol
              }
            });
          }}
        >
          <Text style={styles.buyButtonText}>Buy</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  scrollContent: {
    paddingBottom: 100, // Extra padding to account for fixed buttons
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  companySymbol: {
    fontSize: 14,
    color: '#64748B',
  },
  priceContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  priceChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceChangeIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  priceChange: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
    marginRight: 8,
  },
  priceTime: {
    fontSize: 14,
    color: '#94A3B8',
  },
  companyDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  chartContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  timeframeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  timeframeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  timeframeButtonActive: {
    backgroundColor: '#EFF6FF',
  },
  timeframeButtonText: {
    fontSize: 14,
    color: '#64748B',
  },
  timeframeButtonTextActive: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  complianceContainer: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  complianceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  complianceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  complianceText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1E293B',
    marginLeft: 8,
  },
  reportButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  reportButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  analystContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  analystSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 20,
  },
  ratingCircleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingCircleTrack: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ratingCircleFill: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: 'transparent',
    borderTopColor: '#10B981',
    borderRightColor: '#10B981',
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
  },
  ratingCircleContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  ratingPercentage: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  ratingsBreakdown: {
    marginTop: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingDot: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginRight: 8,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#1E293B',
  },
  ratingBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginHorizontal: 12,
  },
  ratingBar: {
    height: '100%',
    borderRadius: 3,
  },
  ratingPercentageContainer: {
    minWidth: 40,
  },
  ratingPercentageText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
    textAlign: 'right',
  },
  keyStatsContainer: {
    paddingHorizontal: 0,
    marginBottom: 24,
    backgroundColor: '#F8FAFC',
  },
  keyStatsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  keyStatsNote: {
    fontSize: 12,
    color: '#94A3B8',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  statRowDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  keyValuePair: {
    width: '33.33%',
    marginBottom: 16,
  },
  keyLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  keyValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  aboutContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  aboutText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginTop: 8,
  },
  fixedActionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24, // Increased bottom padding to avoid home indicator
    gap: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  sellButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sellButtonText: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '600',
  },
  buyButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 80,
  },
})

export default StockDetails
