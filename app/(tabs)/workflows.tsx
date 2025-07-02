import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { useWorkflowStore } from '@/hooks/useWorkflowStore';
import { colors } from '@/constants/colors';
import WorkflowCard from '@/components/WorkflowCard';
import FilterBar from '@/components/FilterBar';
import { Search, Plus } from 'lucide-react-native';

export default function WorkflowsScreen() {
  const { workflows, filteredWorkflows, filterWorkflows } = useWorkflowStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  const statusOptions = [
    { id: 'all', label: 'All Workflows' },
    { id: 'active', label: 'Active Only' },
    { id: 'inactive', label: 'Inactive Only' }
  ];
  
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    // Filter logic would be here - for demo we're just keeping it simple
  };
  
  const handleStatusFilter = (statusId: string) => {
    setSelectedStatus(statusId);
    if (statusId === 'active') {
      filterWorkflows({ isActive: true });
    } else if (statusId === 'inactive') {
      filterWorkflows({ isActive: false });
    } else {
      // Reset filter
      filterWorkflows({});
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search workflows..."
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
          title="Status"
          options={statusOptions}
          selectedId={selectedStatus}
          onSelect={handleStatusFilter}
        />
      </View>
      
      <FlatList
        data={filteredWorkflows}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <WorkflowCard workflow={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No workflows found</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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