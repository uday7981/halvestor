import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type FilterOptions = {
  complianceFilter: 'compliant' | 'non-compliant' | 'all';
  viewStyle: 'list' | 'grid';
};

type FilterOverlayProps = {
  visible: boolean;
  onClose: () => void;
  options: FilterOptions;
  onOptionsChange: (options: FilterOptions) => void;
};

const FilterOverlay = ({
  visible,
  onClose,
  options,
  onOptionsChange,
}: FilterOverlayProps) => {
  const handleComplianceChange = (value: 'compliant' | 'non-compliant' | 'all') => {
    onOptionsChange({
      ...options,
      complianceFilter: value,
    });
  };

  const handleViewStyleChange = (value: 'list' | 'grid') => {
    onOptionsChange({
      ...options,
      viewStyle: value,
    });
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter options</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compliance status</Text>
            
            <TouchableOpacity 
              style={styles.optionRow}
              onPress={() => handleComplianceChange('compliant')}
            >
              <View style={styles.optionIconContainer}>
                <Ionicons name="shield-checkmark" size={24} color="#64748B" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Shariah Compliant!</Text>
                <Text style={styles.optionDescription}>
                  Only includes investments that meet halal (Shariah) standards.
                </Text>
              </View>
              <View style={styles.radioContainer}>
                <View style={[
                  styles.radioOuter,
                  options.complianceFilter === 'compliant' && styles.radioOuterSelected
                ]}>
                  {options.complianceFilter === 'compliant' && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionRow}
              onPress={() => handleComplianceChange('non-compliant')}
            >
              <View style={styles.optionIconContainer}>
                <Ionicons name="warning" size={24} color="#64748B" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Shariah Non-Compliant!</Text>
                <Text style={styles.optionDescription}>
                  Shows all investments, including those that may not meet halal criteria.
                </Text>
              </View>
              <View style={styles.radioContainer}>
                <View style={[
                  styles.radioOuter,
                  options.complianceFilter === 'non-compliant' && styles.radioOuterSelected
                ]}>
                  {options.complianceFilter === 'non-compliant' && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>View style</Text>
            
            <TouchableOpacity 
              style={styles.optionRow}
              onPress={() => handleViewStyleChange('list')}
            >
              <View style={styles.optionIconContainer}>
                <Ionicons name="list" size={24} color="#64748B" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>List view</Text>
                <Text style={styles.optionDescription}>
                  View stocks in a scrollable list with key details upfront.
                </Text>
              </View>
              <View style={styles.radioContainer}>
                <View style={[
                  styles.radioOuter,
                  options.viewStyle === 'list' && styles.radioOuterSelected
                ]}>
                  {options.viewStyle === 'list' && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionRow}
              onPress={() => handleViewStyleChange('grid')}
            >
              <View style={styles.optionIconContainer}>
                <Ionicons name="grid" size={24} color="#64748B" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Grid view</Text>
                <Text style={styles.optionDescription}>
                  Browse stocks in a grid layout with a visual overview.
                </Text>
              </View>
              <View style={styles.radioContainer}>
                <View style={[
                  styles.radioOuter,
                  options.viewStyle === 'grid' && styles.radioOuterSelected
                ]}>
                  {options.viewStyle === 'grid' && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
  },
  closeButton: {
    padding: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94A3B8',
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  radioContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#3B82F6',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 24,
  },
});

export default FilterOverlay;
