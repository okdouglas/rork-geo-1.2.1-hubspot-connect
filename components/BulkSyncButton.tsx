import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Upload, CheckCircle, AlertTriangle, Info } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useHubSpotStore } from '@/hooks/useHubSpotStore';
import { Lead } from '@/types/lead';

interface BulkSyncButtonProps {
  leads: Lead[];
  onSyncComplete?: (results: { successful: number; failed: number; warnings: number; total: number }) => void;
  disabled?: boolean;
}

interface SyncProgress {
  current: number;
  total: number;
  currentLead: string;
}

interface SyncResults {
  successful: number;
  failed: number;
  warnings: number;
  total: number;
  details: string[];
}

const BulkSyncButton: React.FC<BulkSyncButtonProps> = ({ 
  leads, 
  onSyncComplete, 
  disabled = false 
}) => {
  const { syncLeadToHubSpot, syncStatus } = useHubSpotStore();
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [results, setResults] = useState<SyncResults | null>(null);

  const handleBulkSync = async () => {
    if (leads.length === 0) {
      Alert.alert('No Leads', 'No leads available to sync');
      return;
    }

    Alert.alert(
      'Export to HubSpot',
      `This will export ${leads.length} leads to HubSpot as Companies and Contacts. Some data may be stored as notes if field restrictions apply. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Export All', 
          onPress: performBulkSync,
          style: 'default'
        }
      ]
    );
  };

  const performBulkSync = async () => {
    setSyncing(true);
    setResults(null);
    
    let successful = 0;
    let failed = 0;
    let warnings = 0;
    const details: string[] = [];

    try {
      for (let i = 0; i < leads.length; i++) {
        const lead = leads[i];
        
        setProgress({
          current: i + 1,
          total: leads.length,
          currentLead: lead.companyName
        });

        try {
          const result = await syncLeadToHubSpot(lead.id);
          
          if (result.success) {
            successful++;
            if (result.warnings.length > 0) {
              warnings++;
              details.push(`${lead.companyName}: Synced with warnings - ${result.warnings.join(', ')}`);
            } else {
              details.push(`${lead.companyName}: Successfully synced`);
            }
          } else {
            failed++;
            details.push(`${lead.companyName}: Failed - ${result.errors.join(', ')}`);
          }
        } catch (error) {
          console.error(`Failed to sync lead ${lead.id}:`, error);
          failed++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          details.push(`${lead.companyName}: Failed - ${errorMessage}`);
        }

        // Add a small delay to avoid rate limiting
        if (i < leads.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      const finalResults = { successful, failed, warnings, total: leads.length, details };
      setResults(finalResults);
      onSyncComplete?.(finalResults);

      // Show summary alert
      if (failed === 0 && warnings === 0) {
        Alert.alert('Export Complete', `Successfully exported all ${successful} leads to HubSpot!`);
      } else if (failed === 0) {
        Alert.alert(
          'Export Complete with Warnings', 
          `Exported ${successful} leads. ${warnings} had some data stored as notes due to field restrictions.`
        );
      } else {
        Alert.alert(
          'Export Complete', 
          `Exported ${successful} leads successfully. ${failed} failed. ${warnings} had warnings.`
        );
      }

    } catch (error) {
      console.error('Bulk sync error:', error);
      Alert.alert('Export Error', 'An error occurred during bulk export. Some leads may have been exported successfully.');
    } finally {
      setSyncing(false);
      setProgress(null);
    }
  };

  const showResults = () => {
    if (!results) return;

    Alert.alert(
      'Export Results',
      `Successful: ${results.successful}\nFailed: ${results.failed}\nWith Warnings: ${results.warnings}\n\nDetails:\n${results.details.slice(0, 10).join('\n')}${results.details.length > 10 ? '\n...' : ''}`,
      [{ text: 'OK' }]
    );
  };

  if (syncing) {
    return (
      <View style={styles.syncingContainer}>
        <View style={styles.syncingHeader}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.syncingTitle}>Exporting to HubSpot...</Text>
        </View>
        
        {progress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(progress.current / progress.total) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {progress.current} of {progress.total} leads
            </Text>
            <Text style={styles.currentLeadText}>
              Exporting: {progress.currentLead}
            </Text>
          </View>
        )}
      </View>
    );
  }

  if (results) {
    return (
      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <CheckCircle size={20} color={colors.success} />
          <Text style={styles.resultsTitle}>Export Complete</Text>
        </View>
        
        <View style={styles.resultsStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{results.successful}</Text>
            <Text style={styles.statLabel}>Successful</Text>
          </View>
          
          {results.warnings > 0 && (
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.warning }]}>{results.warnings}</Text>
              <Text style={styles.statLabel}>With Notes</Text>
            </View>
          )}
          
          {results.failed > 0 && (
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.error }]}>{results.failed}</Text>
              <Text style={styles.statLabel}>Failed</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.detailsButton} onPress={showResults}>
          <Info size={16} color={colors.primary} />
          <Text style={styles.detailsButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        disabled && styles.disabledButton,
        leads.length === 0 && styles.disabledButton
      ]} 
      onPress={handleBulkSync}
      disabled={disabled || syncing || leads.length === 0 || syncStatus.isSyncing}
    >
      <View style={styles.buttonContent}>
        <Upload size={20} color="white" />
        <View style={styles.buttonTextContainer}>
          <Text style={styles.buttonText}>
            Export to HubSpot
          </Text>
          <Text style={styles.buttonSubtext}>
            {leads.length} {leads.length === 1 ? 'lead' : 'leads'} ready
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.textSecondary,
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonTextContainer: {
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  syncingContainer: {
    backgroundColor: 'rgba(26, 115, 232, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  syncingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  syncingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(26, 115, 232, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  currentLeadText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  resultsContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.success,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
  },
  resultsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.success,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  detailsButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default BulkSyncButton;