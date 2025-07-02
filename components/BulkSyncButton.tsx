import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Upload, CheckCircle, AlertTriangle, Zap } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useHubSpotStore } from '@/hooks/useHubSpotStore';
import { Lead } from '@/types/lead';

interface BulkSyncButtonProps {
  leads: Lead[];
  onSyncComplete?: (results: { successful: number; failed: number; total: number }) => void;
  disabled?: boolean;
}

interface SyncProgress {
  current: number;
  total: number;
  currentLead: string;
}

const BulkSyncButton: React.FC<BulkSyncButtonProps> = ({ 
  leads, 
  onSyncComplete, 
  disabled = false 
}) => {
  const { syncLeadToHubSpot, syncStatus } = useHubSpotStore();
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState<SyncProgress | null>(null);

  const handleBulkSync = async () => {
    if (leads.length === 0) {
      Alert.alert('No Leads', 'No leads available to sync');
      return;
    }

    Alert.alert(
      'Sync to HubSpot',
      `This will export ${leads.length} leads to HubSpot as Companies and Contacts. This may take a few minutes. Continue?`,
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
    let successful = 0;
    let failed = 0;

    try {
      for (let i = 0; i < leads.length; i++) {
        const lead = leads[i];
        
        setProgress({
          current: i + 1,
          total: leads.length,
          currentLead: lead.companyName
        });

        try {
          const success = await syncLeadToHubSpot(lead.id);
          if (success) {
            successful++;
          } else {
            failed++;
          }
        } catch (error) {
          console.error(`Failed to sync lead ${lead.id}:`, error);
          failed++;
        }

        // Add a small delay to avoid rate limiting
        if (i < leads.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      onSyncComplete?.({ successful, failed, total: leads.length });
    } catch (error) {
      console.error('Bulk sync error:', error);
      Alert.alert('Sync Error', 'An error occurred during bulk sync. Some leads may have been synced successfully.');
    } finally {
      setSyncing(false);
      setProgress(null);
    }
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
              Syncing: {progress.currentLead}
            </Text>
          </View>
        )}
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
});

export default BulkSyncButton;