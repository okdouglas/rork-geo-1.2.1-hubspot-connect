import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Zap } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useHubSpotStore } from '@/hooks/useHubSpotStore';

interface HubSpotSyncButtonProps {
  type: 'company' | 'contact' | 'permit';
  id: string;
  style?: any;
}

const HubSpotSyncButton: React.FC<HubSpotSyncButtonProps> = ({ type, id, style }) => {
  const { syncStatus, syncCompany, syncContact, createDealFromPermit } = useHubSpotStore();
  const [syncing, setSyncing] = useState(false);

  if (!syncStatus.isConfigured) {
    return null;
  }

  const handleSync = async () => {
    setSyncing(true);
    let success = false;

    try {
      switch (type) {
        case 'company':
          success = await syncCompany(id);
          break;
        case 'contact':
          success = await syncContact(id);
          break;
        case 'permit':
          success = await createDealFromPermit(id);
          break;
      }

      if (success) {
        Alert.alert('Success', `Successfully synced ${type} to HubSpot`);
      } else {
        Alert.alert('Error', `Failed to sync ${type} to HubSpot`);
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
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default HubSpotSyncButton;