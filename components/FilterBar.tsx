import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Filter, X } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface FilterOption {
  id: string;
  label: string;
}

interface FilterBarProps {
  title: string;
  options: FilterOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ title, options, selectedId, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSelect = (id: string) => {
    onSelect(id);
    setIsExpanded(false);
  };

  const selectedOption = options.find(option => option.id === selectedId);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.filterButton} onPress={toggleExpand}>
        <Filter size={16} color={colors.primary} />
        <Text style={styles.filterText}>{title}: </Text>
        <Text style={styles.selectedText}>{selectedOption?.label || 'All'}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.optionsContainer}>
          <View style={styles.optionsHeader}>
            <Text style={styles.optionsTitle}>{title}</Text>
            <TouchableOpacity onPress={toggleExpand}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionItem,
                  selectedId === option.id && styles.selectedOption
                ]}
                onPress={() => handleSelect(option.id)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedId === option.id && styles.selectedOptionText
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 115, 232, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    color: colors.primary,
    marginLeft: 4,
    fontSize: 14,
  },
  selectedText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  optionsContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  optionsList: {
    maxHeight: 200,
  },
  optionItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedOption: {
    backgroundColor: 'rgba(26, 115, 232, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
  },
  optionText: {
    color: colors.text,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: '500',
  },
});

export default FilterBar;