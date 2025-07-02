import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { useCompanyStore } from '@/hooks/useCompanyStore';
import { colors } from '@/constants/colors';
import CompanyCard from '@/components/CompanyCard';
import FilterBar from '@/components/FilterBar';
import { Search, Plus } from 'lucide-react-native';

export default function CompaniesScreen() {
  const { companies, filteredCompanies, filterCompanies } = useCompanyStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  const stateOptions = [
    { id: 'All', label: 'All States' },
    { id: 'Oklahoma', label: 'Oklahoma' },
    { id: 'Kansas', label: 'Kansas' },
    { id: 'Both', label: 'Both States' }
  ];
  
  const statusOptions = [
    { id: 'All', label: 'All Status' },
    { id: 'Active', label: 'Active' },
    { id: 'Dormant', label: 'Dormant' },
    { id: 'Reactivated', label: 'Reactivated' }
  ];
  
  const [selectedState, setSelectedState] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    filterCompanies({
      state: selectedState as 'Oklahoma' | 'Kansas' | 'Both' | 'All',
      status: selectedStatus as 'Active' | 'Dormant' | 'Reactivated' | 'All',
      formation: text
    });
  };
  
  const handleStateFilter = (stateId: string) => {
    setSelectedState(stateId);
    filterCompanies({
      state: stateId as 'Oklahoma' | 'Kansas' | 'Both' | 'All',
      status: selectedStatus as 'Active' | 'Dormant' | 'Reactivated' | 'All',
      formation: searchQuery
    });
  };
  
  const handleStatusFilter = (statusId: string) => {
    setSelectedStatus(statusId);
    filterCompanies({
      state: selectedState as 'Oklahoma' | 'Kansas' | 'Both' | 'All',
      status: statusId as 'Active' | 'Dormant' | 'Reactivated' | 'All',
      formation: searchQuery
    });
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search companies..."
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
        data={filteredCompanies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CompanyCard company={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No companies found</Text>
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