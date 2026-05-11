import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface CategoryChipProps {
  category: string;
  selected: boolean;
  onPress: () => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({ category, selected, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.chip, selected ? styles.chipSelected : styles.chipDefault]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{category}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    margin: 6,
    borderWidth: 1,
  },
  chipDefault: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  chipSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  labelSelected: {
    color: '#FFFFFF',
  },
});
