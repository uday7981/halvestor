import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Reusable components for modularity
const OrderTypeOption = ({ 
  title, 
  description, 
  isSelected, 
  onSelect,
  icon
}: { 
  title: string; 
  description: string;
  isSelected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
}) => (
  <TouchableOpacity 
    style={styles.optionContainer} 
    onPress={onSelect}
    activeOpacity={0.7}
  >
    <View style={styles.optionContent}>
      <View style={styles.optionIcon}>
        {icon}
      </View>
      <View style={styles.optionTextContainer}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
    </View>
    <View style={[
      styles.radioButton, 
      isSelected ? styles.radioButtonSelected : {}
    ]}>
      {isSelected && <View style={styles.radioButtonInner} />}
    </View>
  </TouchableOpacity>
);

type OrderTypeModalProps = {
  visible: boolean;
  onClose: () => void;
  selectedType: string;
  onSelectType: (type: string) => void;
};

export default function OrderTypeModal({
  visible,
  onClose,
  selectedType,
  onSelectType
}: OrderTypeModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Buy order type</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#1E293B" />
            </TouchableOpacity>
          </View>
          
          <OrderTypeOption 
            title="Market Order"
            description="Buy instantly at the best available price when the market is open."
            isSelected={selectedType === 'Market order'}
            onSelect={() => onSelectType('Market order')}
            icon={<Ionicons name="trending-up" size={24} color="#1E293B" />}
          />
          
          <OrderTypeOption 
            title="Limit Order"
            description="Set your price — the stock is only bought when it hits your target or better."
            isSelected={selectedType === 'Limit order'}
            onSelect={() => onSelectType('Limit order')}
            icon={<Ionicons name="options" size={24} color="#1E293B" />}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  radioButtonSelected: {
    borderColor: '#3B82F6',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
  },
});
