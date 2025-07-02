import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Zap, AlertTriangle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useHubSpotStore } from '@/hooks/useHubSpotStore';
import { PermitData } from '@/types/lead';

interface HubSpotSyncButtonProps {
  type: 'company' | 'contact' | 'permit';
  id: string;
  permitData?: PermitData; // For permit syncing
  style?: any;
}

const HubSpotSyncButton: React.FC<HubSpotSyncButtonProps> = ({ type, id, permitData, style }) => {
  const { syncStatus, syncCompany, syncContact, syncPermitToHubSpot } = useHubSpotStore();
  const [syncing, setSyncing] = useState(false);

  if (!syncStatus.isConfigured) {
    return null;
  }

  const handleSync = async () => {
    setSyncing(true);
    let result;

    try {
      switch (type) {
        case 'company':
          result = await syncCompany(id);
          break;
        case 'contact':
          result = await syncContact(id);
          break;
        case 'permit':
          if (!permitData) {
            Alert.alert('Error', 'Permit data is required for syncing');
            setSyncing(false);
            return;
          }
          result = await syncPermitToHubSpot(permitData);
          break;
      }

      if (result.success) {
        if (result.warnings.length > 0) {
          Alert.alert(
            'Sync Complete with Notes', 
            `Successfully synced ${type} to HubSpot. Some information was stored as notes:

${result.warnings.join('\n')}`,
            [{ text: 'OK' }]
          );
        } else {
          const successMessage = type === 'permit' 
            ? 'Successfully created deal and company in HubSpot'
            : `Successfully synced ${type} to HubSpot`;
          Alert.alert('Success', successMessage);
        }
      } else {
        Alert.alert(
          'Sync Failed', 
          `Failed to sync ${type} to HubSpot:

${result.errors.join('\n')}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Sync failed: ${errorMessage}`);
    } finally {
      setSyncing(false);
    }
  };

  const getButtonText = () => {
    switch (type) {
      case 'company':
        return 'Sync to HubSpot';
      case 'contact':
        return 'Sync Contact';
      case 'permit':
        return 'Create Deal';
      default:
        return 'Sync';
    }
  };

  const isValidForSync = () => {
    if (type === 'permit' && permitData) {
      // Check if we have enough data to create a meaningful deal
      return permitData.operatorName && permitData.location.county;
    }
    return true;
  };

  if (!isValidForSync()) {
    return (
      <TouchableOpacity style={[styles.button, styles.disabledButton, style]} disabled>
        <AlertTriangle size={16} color={colors.textSecondary} />
        <Text style={[styles.buttonText, styles.disabledText]}>Insufficient Data</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.button, style]} 
      onPress={handleSync}
      disabled={syncing || syncStatus.isSyncing}
    >
      {syncing ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <Zap size={16} color="white" />
      )}
      <Text style={styles.buttonText}>{getButtonText()}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  disabledButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  disabledText: {
    color: colors.textSecondary,
  },
});

export default HubSpotSyncButton;