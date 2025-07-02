import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  TextInput
} from 'react-native';
import { 
  Search, 
  Building, 
  MapPin, 
  Users, 
  Globe, 
  Mail,
  Zap,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Upload,
  Database
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useLeadSourcingStore } from '@/hooks/useLeadSourcingStore';
import { useHubSpotStore } from '@/hooks/useHubSpotStore';
import LeadCard from '@/components/LeadCard';
import BulkSyncButton from '@/components/BulkSyncButton';

export default function LeadSourcingScreen() {
  const { 
    leads, 
    isLoading, 
    error, 
    selectedState,
    syncStatus,
    setSelectedState,
    searchLeadsByState,
    searchLeads, 
    clearLeads,
    clearError
  } = useLeadSourcingStore();
  
  const { syncStatus: hubspotStatus, syncLeadToHubSpot } = useHubSpotStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [syncingLeads, setSyncingLeads] = useState<Set<string>>(new Set());
  const [searchMode, setSearchMode] = useState<'state' | 'custom'>('state');

  const handleStateSearch = async (state: 'Oklahoma' | 'Kansas') => {
    await searchLeadsByState(state);
  };

  const handleCustomSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a search query');
      return;
    }
    
    await searchLeads(searchQuery);
  };

  const handleSyncLead = async (leadId: string) => {
    if (!hubspotStatus.isConfigured) {
      Alert.alert('Error', 'HubSpot is not configured. Please configure it in Settings.');
      return;
    }

    setSyncingLeads(prev => new Set(prev).add(leadId));
    
    try {
      const success = await syncLeadToHubSpot(leadId);
      if (success) {
        Alert.alert('Success', 'Lead synced to HubSpot successfully');
      } else {
        Alert.alert('Error', 'Failed to sync lead to HubSpot');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Sync failed: ${errorMessage}`);
    } finally {
      setSyncingLeads(prev => {
        const newSet = new Set(prev);
        newSet.delete(leadId);
        return newSet;
      });
    }
  };

  const getSyncStatusIcon = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (syncingLeads.has(leadId)) {
      return <ActivityIndicator size="small" color={colors.primary} />;
    }
    if (lead?.syncedToHubSpot) {
      return <CheckCircle size={16} color={colors.success} />;
    }
    return <Zap size={16} color={colors.primary} />;
  };

  const unsyncedLeads = leads.filter(lead => !lead.syncedToHubSpot);
  const syncedLeads = leads.filter(lead => lead.syncedToHubSpot);

  return (
    <View style={styles.container}>
      {/* Search Mode Toggle */}
      <View style={styles.modeToggle}>
        <TouchableOpacity 
          style={[styles.modeButton, searchMode === 'state' && styles.activeModeButton]}
          onPress={() => setSearchMode('state')}
        >
          <Text style={[styles.modeButtonText, searchMode === 'state' && styles.activeModeButtonText]}>
            By State
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.modeButton, searchMode === 'custom' && styles.activeModeButton]}
          onPress={() => setSearchMode('custom')}
        >
          <Text style={[styles.modeButtonText, searchMode === 'custom' && styles.activeModeButtonText]}>
            Custom Search
          </Text>
        </TouchableOpacity>
      </View>

      {/* State Selection */}
      {searchMode === 'state' && (
        <View style={styles.stateSelection}>
          <Text style={styles.sectionTitle}>Select State for Oil & Gas Companies</Text>
          <View style={styles.stateButtons}>
            <TouchableOpacity 
              style={[
                styles.stateButton, 
                selectedState === 'Oklahoma' && styles.selectedStateButton,
                isLoading && styles.disabledButton
              ]}
              onPress={() => handleStateSearch('Oklahoma')}
              disabled={isLoading}
            >
              {isLoading && selectedState === 'Oklahoma' ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <MapPin size={20} color={selectedState === 'Oklahoma' ? 'white' : colors.primary} />
                  <Text style={[
                    styles.stateButtonText,
                    selectedState === 'Oklahoma' && styles.selectedStateButtonText
                  ]}>
                    Oklahoma
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.stateButton, 
                selectedState === 'Kansas' && styles.selectedStateButton,
                isLoading && styles.disabledButton
              ]}
              onPress={() => handleStateSearch('Kansas')}
              disabled={isLoading}
            >
              {isLoading && selectedState === 'Kansas' ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <MapPin size={20} color={selectedState === 'Kansas' ? 'white' : colors.primary} />
                  <Text style={[
                    styles.stateButtonText,
                    selectedState === 'Kansas' && styles.selectedStateButtonText
                  ]}>
                    Kansas
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Custom Search */}
      {searchMode === 'custom' && (
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for companies..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.searchButton, isLoading && styles.disabledButton]} 
            onPress={handleCustomSearch}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Search size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Search Results Info */}
      {syncStatus.lastSearch && (
        <View style={styles.searchInfo}>
          <Text style={styles.searchInfoText}>
            Last search: {syncStatus.lastSearchState || 'Custom'} • {new Date(syncStatus.lastSearch).toLocaleDateString()}
          </Text>
        </View>
      )}

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Building size={16} color={colors.primary} />
          <Text style={styles.statText}>{leads.length} leads found</Text>
        </View>
        
        <View style={styles.statItem}>
          <CheckCircle size={16} color={colors.success} />
          <Text style={styles.statText}>{syncedLeads.length} synced</Text>
        </View>
        
        <View style={styles.statItem}>
          <Upload size={16} color={colors.warning} />
          <Text style={styles.statText}>{unsyncedLeads.length} pending</Text>
        </View>
      </View>

      {/* HubSpot Sync Section */}
      {leads.length > 0 && (
        <View style={styles.syncSection}>
          <View style={styles.syncHeader}>
            <View style={styles.syncTitleContainer}>
              <Database size={18} color={colors.primary} />
              <Text style={styles.syncTitle}>HubSpot Export</Text>
            </View>
            
            {!hubspotStatus.isConfigured && (
              <View style={styles.configWarning}>
                <AlertCircle size={14} color={colors.warning} />
                <Text style={styles.configWarningText}>Configure HubSpot in Settings</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.syncDescription}>
            Export {unsyncedLeads.length} new leads to HubSpot as Companies and Contacts
          </Text>
          
          <BulkSyncButton 
            leads={unsyncedLeads}
            onSyncComplete={(results) => {
              Alert.alert(
                'Sync Complete', 
                `Successfully synced ${results.successful} of ${results.total} leads to HubSpot.${results.failed > 0 ? ` ${results.failed} failed.` : ''}`
              );
            }}
            disabled={!hubspotStatus.isConfigured || unsyncedLeads.length === 0}
          />
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={16} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError}>
            <Text style={styles.clearErrorText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {leads.length > 0 && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearLeads}
            >
              <RefreshCw size={16} color={colors.textSecondary} />
              <Text style={styles.clearButtonText}>Clear Results</Text>
            </TouchableOpacity>
          </View>
        )}

        {leads.map(lead => (
          <LeadCard 
            key={lead.id} 
            lead={lead}
            onSync={() => handleSyncLead(lead.id)}
            syncIcon={getSyncStatusIcon(lead.id)}
            canSync={hubspotStatus.isConfigured && !syncingLeads.has(lead.id)}
          />
        ))}

        {leads.length === 0 && !isLoading && !error && (
          <View style={styles.emptyContainer}>
            <Search size={48} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>Find Your Next Prospects</Text>
            <Text style={styles.emptyText}>
              Select a state to search for Oil & Gas companies using real-time data from Google
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  activeModeButton: {
    backgroundColor: colors.primary,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  activeModeButtonText: {
    color: 'white',
  },
  stateSelection: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  stateButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  stateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'white',
    gap: 8,
  },
  selectedStateButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  selectedStateButtonText: {
    color: 'white',
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
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
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  searchInfo: {
    backgroundColor: 'rgba(26, 115, 232, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInfoText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  syncSection: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  syncHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  syncTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  configWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  configWarningText: {
    fontSize: 12,
    color: colors.warning,
  },
  syncDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 67, 53, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: colors.danger,
    fontSize: 14,
  },
  clearErrorText: {
    color: colors.danger,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  content: {
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clearButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});