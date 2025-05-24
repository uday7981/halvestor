import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import SimpleStockChart from '../components/SimpleStockChart';
import { getStockByTicker, Stock, addToWatchlist, removeFromWatchlist, isInWatchlist } from '../services/stockService';
import { getHoldingByTicker } from '../services/holdingService';
import { formatCurrency, formatLargeNumber, formatDate } from '../utils/formatters';

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
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTimeframe, setActiveTimeframe] = useState<TimeframeOption>('1m');
  const [userHolding, setUserHolding] = useState<number>(0);
  
  // Fetch stock data from the database
  useEffect(() => {
    const fetchStockData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error } = await getStockByTicker(id as string);
        
        if (error) {
          throw new Error(error);
        }
        
        if (data) {
          setStock(data);
        } else {
          setError('Stock not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stock data');
        console.error('Error fetching stock:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStockData();
  }, [id]);
  
  const handleBack = () => {
    router.back();
  };
  
  const handleShare = () => {
    console.log('Share stock');
  };
  
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  
  // Check if stock is in watchlist
  useEffect(() => {
    const checkWatchlist = async () => {
      if (stock) {
        try {
          const { isWatchlisted: result } = await isInWatchlist(stock.id);
          setIsWatchlisted(result);
        } catch (err) {
          console.error('Error checking watchlist status:', err);
        }
      }
    };
    
    checkWatchlist();
  }, [stock]);
  
  // Fetch user's current holdings for this stock
  useEffect(() => {
    const fetchUserHolding = async () => {
      if (stock && stock.ticker) {
        try {
          console.log('Fetching user holdings for ticker:', stock.ticker);
          const { data: holding, error } = await getHoldingByTicker(stock.ticker);
          
          if (error) {
            console.error('Error fetching holding:', error);
            setUserHolding(0);
            return;
          }
          
          if (holding && holding.quantity > 0) {
            console.log('Found holding with quantity:', holding.quantity);
            setUserHolding(holding.quantity);
          } else {
            console.log('No holding found or quantity is 0');
            setUserHolding(0);
          }
        } catch (error) {
          console.error('Exception in fetchUserHolding:', error);
          setUserHolding(0);
        }
      }
    };
    
    fetchUserHolding();
  }, [stock]);
  
  const handleFavorite = async () => {
    if (!stock) return;
    
    try {
      if (isWatchlisted) {
        // Remove from watchlist
        const { success, error } = await removeFromWatchlist(stock.id);
        if (error) {
          console.error('Error removing from watchlist:', error);
          return;
        }
        
        if (success) {
          setIsWatchlisted(false);
        }
      } else {
        // Add to watchlist
        const { success, error } = await addToWatchlist(stock.id);
        if (error) {
          console.error('Error adding to watchlist:', error);
          return;
        }
        
        if (success) {
          setIsWatchlisted(true);
        }
      }
    } catch (err) {
      console.error('Error updating watchlist:', err);
    }
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <View style={styles.backButtonCircle}>
              <Ionicons name="chevron-back" size={20} color="#1E293B" />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
          <View style={styles.headerActions}></View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading stock data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !stock) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <View style={styles.backButtonCircle}>
              <Ionicons name="chevron-back" size={20} color="#1E293B" />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
          <View style={styles.headerActions}></View>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error || 'Failed to load stock data'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate if price change is positive
  const isPositive = stock.change_percent ? stock.change_percent >= 0 : true;
  const changeIcon = isPositive ? "arrow-up" : "arrow-down";
  const changeColor = isPositive ? "#10B981" : "#EF4444";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <View style={styles.backButtonCircle}>
            <Ionicons name="chevron-back" size={20} color="#1E293B" />
          </View>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{stock.name}</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={22} color="#1E293B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleFavorite}>
            <Ionicons 
              name={isWatchlisted ? "heart" : "heart-outline"} 
              size={22} 
              color={isWatchlisted ? "#EF4444" : "#1E293B"} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.companyHeader}>
          <View style={styles.companyLogo}>
            <Ionicons name="business-outline" size={24} color="#000" />
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{stock.name}</Text>
            <Text style={styles.companySymbol}>{stock.ticker}</Text>
          </View>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formatCurrency(stock.price || 0)}</Text>
          <View style={styles.priceChangeContainer}>
            <View style={[styles.priceChangeIndicator, { backgroundColor: changeColor }]}>
              <Ionicons name={changeIcon} size={14} color="white" />
            </View>
            <Text style={[styles.priceChange, { color: changeColor }]}>
              {stock.change_percent ? `${stock.change_percent > 0 ? '+' : ''}${stock.change_percent.toFixed(2)}%` : 'N/A'}
            </Text>
            <Text style={styles.priceTime}>
              {stock.last_updated ? formatDate(stock.last_updated) : 'No data'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.companyDescription}>
          {typeof stock.about_stock === 'string' 
            ? stock.about_stock 
            : typeof stock.about_stock === 'object' && stock.about_stock?.description 
              ? stock.about_stock.description 
              : `${stock.name} (${stock.ticker}) is a publicly traded company in the ${stock.market} market.`
          }
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
            {stock.is_compliant ? (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.complianceText}>{stock.ticker} is Shariah Compliant!</Text>
              </>
            ) : (
              <>
                <Ionicons name="close-circle" size={20} color="#EF4444" />
                <Text style={styles.complianceText}>{stock.ticker} is not Shariah Compliant</Text>
              </>
            )}
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
              <Text style={styles.statValue}>{stock.open ? formatCurrency(stock.open) : 'N/A'}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Volume</Text>
              <Text style={styles.statValue}>{stock.volume ? formatLargeNumber(stock.volume) : 'N/A'}</Text>
            </View>
          </View>
          
          <View style={styles.statRowDivider} />
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>High</Text>
              <Text style={styles.statValue}>{stock.high ? formatCurrency(stock.high) : 'N/A'}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Market</Text>
              <Text style={styles.statValue}>{stock.market || 'N/A'}</Text>
            </View>
          </View>
          
          <View style={styles.statRowDivider} />
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Low</Text>
              <Text style={styles.statValue}>{stock.low ? formatCurrency(stock.low) : 'N/A'}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Last Updated</Text>
              <Text style={styles.statValue}>{stock.last_updated ? formatDate(stock.last_updated).split(' ')[0] : 'N/A'}</Text>
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
            // Navigate to sell screen with stock details and current holdings
            router.push({
              pathname: 'stocks/shares-sell-input' as any,
              params: {
                name: stock.name,
                price: stock.price?.toString() || '0',
                symbol: stock.ticker,
                availableShares: userHolding.toString(), // Pass the user's current holdings
                stock_id: stock.id
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
                name: stock.name,
                price: stock.price?.toString() || '0',
                symbol: stock.ticker,
                stock_id: stock.id
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
  // Loading and error states
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
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
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
