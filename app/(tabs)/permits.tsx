import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { usePermitStore } from '@/hooks/usePermitStore';
import { colors } from '@/constants/colors';
import PermitCard from '@/components/PermitCard';
import FilterBar from '@/components/FilterBar';
import { Search, Plus } from 'lucide-react-native';

export default function PermitsScreen() {
  const { permits, filteredPermits, filterPermits } = usePermitStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  const stateOptions = [
    { id: 'All', label: 'All States' },
    { id: 'Oklahoma', label: 'Oklahoma' },
    { id: 'Kansas', label: 'Kansas' }
  ];
  
  const statusOptions = [
    { id: 'All', label: 'All Status' },
    { id: 'Filed', label: 'Filed' },
    { id: 'Approved', label: 'Approved' },
    { id: 'Drilling', label: 'Drilling' },
    { id: 'Completed', label: 'Completed' }
  ];
  
  const [selectedState, setSelectedState] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    filterPermits({
      state: selectedState as 'Oklahoma' | 'Kansas' | 'All',
      status: selectedStatus as 'Filed' | 'Approved' | 'Drilling' | 'Completed' | 'All',
      formationTarget: text
    });
  };
  
  const handleStateFilter = (stateId: string) => {
    setSelectedState(stateId);
    filterPermits({
      state: stateId as 'Oklahoma' | 'Kansas' | 'All',
      status: selectedStatus as 'Filed' | 'Approved' | 'Drilling' | 'Completed' | 'All',
      formationTarget: searchQuery
    });
  };
  
  const handleStatusFilter = (statusId: string) => {
    setSelectedStatus(statusId);
    filterPermits({
      state: selectedState as 'Oklahoma' | 'Kansas' | 'All',
      status: statusId as 'Filed' | 'Approved' | 'Drilling' | 'Completed' | 'All',
      formationTarget: searchQuery
    });
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search formations, counties..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.filtersContainer}>
        <FilterBar
          title="State"
          options={stateOptions}
          selectedId={selectedState}
          onSelect={handleStateFilter}
        />
        
        <View style={styles.filterSpacer} />
        
        <FilterBar
          title="Status"
          options={statusOptions}
          selectedId={selectedStatus}
          onSelect={handleStatusFilter}
        />
      </View>
      
      <FlatList
        data={filteredPermits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PermitCard permit={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No permits found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterSpacer: {
    width: 12,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});