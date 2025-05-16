import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export type ComplianceFilterType = 'all' | 'compliant' | 'non-compliant';

type ComplianceFilterProps = {
  selectedFilter: ComplianceFilterType;
  onFilterChange: (filter: ComplianceFilterType) => void;
};

const ComplianceFilter = ({ selectedFilter, onFilterChange }: ComplianceFilterProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Stock Filter:</Text>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === 'compliant' && styles.selectedFilter
          ]}
          onPress={() => onFilterChange('compliant')}
        >
          <Text style={[
            styles.filterText,
            selectedFilter === 'compliant' && styles.selectedFilterText
          ]}>
            Compliant
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === 'non-compliant' && styles.selectedFilter
          ]}
          onPress={() => onFilterChange('non-compliant')}
        >
          <Text style={[
            styles.filterText,
            selectedFilter === 'non-compliant' && styles.selectedFilterText
          ]}>
            Non-Compliant
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginRight: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  selectedFilter: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  selectedFilterText: {
    color: '#FFFFFF',
  },
});

export default ComplianceFilter;
