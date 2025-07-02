import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { usePermitStore } from '@/hooks/usePermitStore';
import { useCompanyStore } from '@/hooks/useCompanyStore';
import { colors } from '@/constants/colors';
import PermitCard from '@/components/PermitCard';
import FilterBar from '@/components/FilterBar';
import { Search, RefreshCw, Calendar, MapPin, ArrowUpDown } from 'lucide-react-native';

export default function PermitsScreen() {
  const { 
    filteredPermits, 
    filters, 
    isLoading, 
    error, 
    lastFetch,
    monthRanges,
    setFilters, 
    fetchPermits, 
    refreshPermits,
    getPermitStats,
    clearError,
    initializeRanges
  } = usePermitStore();
  
  const { addCompaniesFromPermits } = useCompanyStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const stats = getPermitStats();
  
  useEffect(() => {
    // Initialize ranges when component mounts
    initializeRanges();
    
    // Initial fetch when component mounts
    if (filteredPermits.length === 0 && !isLoading) {
      fetchPermits();
    }
  }, []);
  
  useEffect(() => {
    // Add companies from permits when permits are loaded
    if (filteredPermits.length > 0) {
      addCompaniesFromPermits(filteredPermits);
    }
  }, [filteredPermits]);
  
  const stateOptions = [
    { id: 'All', label: 'All States' },
    { id: 'Oklahoma', label: 'Oklahoma' },
    { id: 'Kansas', label: 'Kansas' }
  ];
  
  const monthOptions = [
    { id: '', label: 'All Time (Past 6 Months)' },
    ...monthRanges.map(month => ({ id: month.value, label: month.label }))
  ];
  
  const sortOptions = [
    { id: 'newest', label: 'Newest First' },
    { id: 'oldest', label: 'Oldest First' }
  ];
  
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setFilters({ operator: text });
  };
  
  const handleStateFilter = (stateId: string) => {
    setFilters({ state: stateId as 'Oklahoma' | 'Kansas' | 'All' });
  };
  
  const handleMonthFilter = (monthId: string) => {
    setFilters({ monthOf: monthId || undefined });
  };
  
  const handleSortChange = (sortId: string) => {
    setFilters({ sortOrder: sortId as 'newest' | 'oldest' });
  };
  
  const handleRefresh = async () => {
    try {
      await refreshPermits();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh permit data');
    }
  };
  
  const formatLastFetch = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.searchContainer}>
        <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search operators, counties..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor={colors.textSecondary}
        />
        
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={handleRefresh}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <RefreshCw size={20} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Permits</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.thisWeek}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.thisMonth}</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.oklahoma}</Text>
          <Text style={styles.statLabel}>Oklahoma</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.kansas}</Text>
          <Text style={styles.statLabel}>Kansas</Text>
        </View>
      </View>
      
      <View style={styles.filtersContainer}>
        <FilterBar
          title="State"
          options={stateOptions}
          selectedId={filters.state || 'All'}
          onSelect={handleStateFilter}
        />
        
        <View style={styles.filterSpacer} />
        
        <FilterBar
          title="Month"
          options={monthOptions}
          selectedId={filters.monthOf || ''}
          onSelect={handleMonthFilter}
        />
        
        <View style={styles.filterSpacer} />
        
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => handleSortChange(filters.sortOrder === 'newest' ? 'oldest' : 'newest')}
        >
          <ArrowUpDown size={16} color={colors.primary} />
          <Text style={styles.sortText}>
            {filters.sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {lastFetch && (
        <View style={styles.lastFetchContainer}>
          <Calendar size={14} color={colors.textSecondary} />
          <Text style={styles.lastFetchText}>
            Last updated: {formatLastFetch(lastFetch)}
          </Text>
        </View>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError} style={styles.dismissButton}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
  
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptyText}>Fetching real permit data...</Text>
          <Text style={styles.emptySubtext}>
            Loading permits from Oklahoma and Kansas (Past 6 Months)
          </Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <MapPin size={48} color={colors.textSecondary} />
          <Text style={styles.emptyText}>Unable to load permits</Text>
          <Text style={styles.emptySubtext}>
            Check your connection and try refreshing
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (filters.monthOf) {
      return (
        <View style={styles.emptyContainer}>
          <Calendar size={48} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No permits filed this month</Text>
          <Text style={styles.emptySubtext}>
            Try selecting a different month or view all time
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <MapPin size={48} color={colors.textSecondary} />
        <Text style={styles.emptyText}>No permits found</Text>
        <Text style={styles.emptySubtext}>
          Try adjusting your search criteria
        </Text>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <FlatList
        data={filteredPermits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PermitCard permit={item} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading}
        onRefresh={handleRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    backgroundColor: 'white',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: colors.text,
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterSpacer: {
    width: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 115, 232, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  sortText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  lastFetchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 6,
  },
  lastFetchText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    flex: 1,
  },
  dismissButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dismissText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    minHeight: 300,
  },
  emptyText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});