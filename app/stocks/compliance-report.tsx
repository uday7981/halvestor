import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Reusable components for modularity
const ComplianceHeader = () => (
  <View style={styles.complianceHeader}>
    <View style={styles.complianceStatus}>
      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
      <Text style={styles.complianceText}>APPL is Shariah Compliant!</Text>
    </View>
    <Text style={styles.updatedText}>Updated on February 18, 2025 • Based on AAOIFI standards</Text>
  </View>
);

const ScreenHeader = ({ title, status }: { title: string; status: string }) => (
  <View style={styles.screenHeader}>
    <Text style={styles.screenTitle}>{title}</Text>
    <View style={[
      styles.statusBadge, 
      { backgroundColor: status === 'Pass' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }
    ]}>
      <Text style={[
        styles.statusText, 
        { color: status === 'Pass' ? '#10B981' : '#EF4444' }
      ]}>
        {status}
      </Text>
    </View>
  </View>
);

const ComplianceBar = ({ percentage }: { percentage: number }) => (
  <View style={styles.complianceBarContainer}>
    <View style={[styles.complianceBar, { width: `${percentage}%` }]} />
  </View>
);

const ComplianceItem = ({ 
  type, 
  percentage, 
  color 
}: { 
  type: string; 
  percentage: string; 
  color: string 
}) => (
  <View style={styles.complianceItem}>
    <View style={styles.complianceItemLeft}>
      <View style={[styles.complianceIndicator, { backgroundColor: color }]} />
      <Text style={styles.complianceItemType}>{type}</Text>
    </View>
    <Text style={styles.complianceItemPercentage}>{percentage}</Text>
  </View>
);

const InfoSection = ({ description }: { description: string }) => (
  <View style={styles.infoSection}>
    <Text style={styles.infoText}>{description}</Text>
  </View>
);

const DetailSection = ({ 
  title, 
  percentage, 
  description,
  color = '#10B981'
}: { 
  title: string; 
  percentage: string; 
  description: string;
  color?: string;
}) => (
  <View style={styles.detailSection}>
    <View style={styles.detailIndicator}>
      <View style={[styles.indicatorDot, { backgroundColor: color }]} />
    </View>
    <View style={styles.detailContent}>
      <View style={styles.detailHeader}>
        <Text style={styles.detailTitle}>{title}</Text>
        <Text style={styles.detailPercentage}>{percentage}</Text>
      </View>
      <Text style={styles.detailDescription}>{description}</Text>
      <TouchableOpacity style={styles.showDetailsButton}>
        <Text style={styles.showDetailsText}>Show details</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function ComplianceReport() {
  const handleBack = () => {
    router.back();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compliance Report</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <ComplianceHeader />
          
          <View style={styles.section}>
            <ScreenHeader title="Business Activity Screen" status="Pass" />
            <ComplianceBar percentage={100} />
            
            <View style={styles.complianceBreakdown}>
              <ComplianceItem 
                type="Compliant" 
                percentage="100%" 
                color="#10B981" 
              />
              <ComplianceItem 
                type="Questionable" 
                percentage="0.00%" 
                color="#F59E0B" 
              />
              <ComplianceItem 
                type="Non-Compliant" 
                percentage="0.00%" 
                color="#EF4444" 
              />
            </View>
            
            <InfoSection 
              description="Revenue derived from gambling, adult entertainment, alcohol, pork and other non-Islamic business segments should not exceed 5% of total revenue." 
            />
            
            <Text style={styles.breakdownText}>Breakdown by category</Text>
          </View>
          
          <View style={styles.section}>
            <ScreenHeader title="Financial Screen" status="Pass" />
            
            <DetailSection 
              title="Interest-bearing Debt" 
              percentage="2.52%" 
              description="Measures a company's reliance on interest-based borrowing. A lower ratio indicates the company has less exposure to interest-bearing debt financing and relies more on other forms of funding or its own capital. Should not exceed 30%." 
              color="#10B981"
            />
            
            <DetailSection 
              title="Interest-bearing Deposits" 
              percentage="1.40%" 
              description="Measures how much of a company's assets are in the form of cash and short-term investments, as a large balance in these areas raises the potential for interest earnings. A lower ratio indicates the company's day-to-day finances are not dependent on interest income. Should not exceed 30%." 
              color="#10B981"
            />
          </View>
          
          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
  complianceHeader: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    marginBottom: 16,
  },
  complianceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  complianceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  updatedText: {
    fontSize: 12,
    color: '#64748B',
  },
  section: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  screenTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  complianceBarContainer: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
  },
  complianceBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  complianceBreakdown: {
    marginTop: 8,
    marginBottom: 16,
  },
  complianceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  complianceItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  complianceIndicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginRight: 8,
  },
  complianceItemType: {
    fontSize: 14,
    color: '#1E293B',
  },
  complianceItemPercentage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  infoSection: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  breakdownText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  detailSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    marginBottom: 16,
  },
  detailIndicator: {
    marginRight: 12,
    paddingTop: 2,
  },
  indicatorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  detailContent: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  detailPercentage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  detailDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 12,
  },
  showDetailsButton: {
    alignSelf: 'flex-start',
  },
  showDetailsText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  bottomPadding: {
    height: 40,
  },
});
