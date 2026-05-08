import React from 'react';
import { View, Text } from 'react-native';

interface CategoryBadgeProps {
  category: string;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  const getCategoryStyles = (cat: string) => {
    switch (cat.toUpperCase()) {
      case 'WET':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Wet Waste' };
      case 'DRY':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Dry Waste' };
      case 'RECYCLABLE':
        return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Recyclable' };
      case 'HAZARDOUS':
        return { bg: 'bg-red-100', text: 'text-red-800', label: 'Hazardous' };
      case 'SANITARY':
        return { bg: 'bg-pink-100', text: 'text-pink-800', label: 'Sanitary' };
      case 'EWASTE':
        return { bg: 'bg-orange-100', text: 'text-orange-800', label: 'E-Waste' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: cat };
    }
  };

  const styles = getCategoryStyles(category);

  return (
    <View className={`${styles.bg} px-2.5 py-0.5 rounded-full`}>
      <Text className={`${styles.text} text-xs font-medium`}>{styles.label}</Text>
    </View>
  );
};

export default CategoryBadge;
