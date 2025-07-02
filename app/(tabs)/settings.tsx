import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  Switch,
  ActivityIndicator
} from 'react-native';
import { 
  Settings as SettingsIcon, 
  Zap, 
  Database, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Send,
  Users,
  Building,
  FileText
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useHubSpotStore } from '@/hooks/useHubSpotStore';

export default function SettingsScreen() {
  const { 
    config, 
    syncStatus, 
    setConfig, 
    clearConfig, 
    testConnection,
    syncAllCompanies,
    syncAllContacts,
    clearSyncErrors
  } = useHubSpotStore();
  
  const [accessToken, setAccessToken] = useState(config?.accessToken || '');
  const [portalId, setPortalId] = useState(config?.portalId || '');
  const [testing, setTesting] = useState(false);
  const [autoSync, setAutoSync] = useState(false);

  const handleSaveConfig = async () => {
    if (!accessToken.trim() || !portalId.trim()) {
      Alert.alert('Error', 'Please enter both Access Token and Portal ID');
      return;
    }

    const newConfig = {
      accessToken: accessToken.trim(),
      portalId: portalId.trim(),
    };

    setConfig(newConfig);
    Alert.alert('Success', 'HubSpot configuration saved successfully');
  };

  const handleTestConnection = async () => {
    if (!config) {
      Alert.alert('Error', 'Please save configuration first');
      return;
    }

    setTesting(true);
    const isConnected = await testConnection();
    setTesting(false);

    if (isConnected) {
      Alert.alert('Success', 'HubSpot connection successful!');
    } else {
      Alert.alert('Error', 'Failed to connect to HubSpot. Please check your credentials.');
    }
  };

  const handleSyncCompanies = async () => {
    Alert.alert(
      'Sync Companies',
      'This will sync all companies to HubSpot. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sync', 
          onPress: () => syncAllCompanies()
        }
      ]
    );
  };

  const handleSyncContacts = async () => {
    Alert.alert(
      'Sync Contacts',
      'This will sync all contacts to HubSpot. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sync', 
          onPress: () => syncAllContacts()
        }
      ]
    );
  };

  const handleClearConfig = () => {
    Alert.alert(
      'Clear Configuration',
      'This will remove all HubSpot settings. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            clearConfig();
            setAccessToken('');
            setPortalId('');
          }
        }
      ]
    );
  };

  const formatLastSync = (lastSync: string | null) => {
    if (!lastSync) return 'Never';
    return new Date(lastSync).toLocaleString();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Zap size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>HubSpot Integration</Text>
        </View>
        
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Connection Status:</Text>
            <View style={styles.statusContainer}>
              {syncStatus.isConfigured ? (
                <CheckCircle size={16} color={colors.success} />
              ) : (
                <AlertCircle size={16} color={colors.warning} />
              )}
              <Text style={[
                styles.statusText, 
                { color: syncStatus.isConfigured ? colors.success : colors.warning }
              ]}>
                {syncStatus.isConfigured ? 'Configured' : 'Not Configured'}
              </Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Access Token</Text>
            <TextInput
              style={styles.input}
              value={accessToken}
              onChangeText={setAccessToken}
              placeholder="pat-na2-..."
              secureTextEntry
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Portal ID</Text>
            <TextInput
              style={styles.input}
              value={portalId}
              onChangeText={setPortalId}
              placeholder="243045101"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={handleSaveConfig}
            >
              <Text style={styles.primaryButtonText}>Save Configuration</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={handleTestConnection}
              disabled={testing || !syncStatus.isConfigured}
            >
              {testing ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.secondaryButtonText}>Test Connection</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {syncStatus.isConfigured && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Database size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Data Synchronization</Text>
          </View>
          
          <View style={styles.card}>
            <View style={styles.syncInfoRow}>
              <Text style={styles.syncLabel}>Last Sync:</Text>
              <Text style={styles.syncValue}>{formatLastSync(syncStatus.lastSync)}</Text>
            </View>

            {syncStatus.isSyncing && (
              <View style={styles.syncingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.syncingText}>Syncing data...</Text>
              </View>
            )}

            <View style={styles.syncButtons}>
              <TouchableOpacity 
                style={[styles.syncButton, { backgroundColor: 'rgba(26, 115, 232, 0.1)' }]}
                onPress={handleSyncCompanies}
                disabled={syncStatus.isSyncing}
              >
                <Building size={18} color={colors.primary} />
                <Text style={styles.syncButtonText}>Sync Companies</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.syncButton, { backgroundColor: 'rgba(111, 207, 151, 0.1)' }]}
                onPress={handleSyncContacts}
                disabled={syncStatus.isSyncing}
              >
                <Users size={18} color={colors.secondary} />
                <Text style={styles.syncButtonText}>Sync Contacts</Text>
              </TouchableOpacity>
            </View>

            {syncStatus.syncErrors.length > 0 && (
              <View style={styles.errorsContainer}>
                <Text style={styles.errorsTitle}>Sync Errors:</Text>
                {syncStatus.syncErrors.map((error, index) => (
                  <Text key={index} style={styles.errorText}>{error}</Text>
                ))}
                <TouchableOpacity 
                  style={styles.clearErrorsButton}
                  onPress={clearSyncErrors}
                >
                  <Text style={styles.clearErrorsText}>Clear Errors</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SettingsIcon size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>Automation Settings</Text>
        </View>
        
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Auto-sync new permits</Text>
            <Switch
              value={autoSync}
              onValueChange={setAutoSync}
              trackColor={{ false: colors.border, true: 'rgba(26, 115, 232, 0.4)' }}
              thumbColor={autoSync ? colors.primary : '#f4f3f4'}
            />
          </View>
          
          <Text style={styles.settingDescription}>
            Automatically create HubSpot deals when new permits are detected
          </Text>
        </View>
      </View>

      {syncStatus.isConfigured && (
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.button, styles.dangerButton]} 
            onPress={handleClearConfig}
          >
            <Text style={styles.dangerButtonText}>Clear HubSpot Configuration</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  syncInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  syncLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  syncValue: {
    fontSize: 14,
    color: colors.text,
  },
  syncingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  syncingText: {
    color: colors.primary,
    fontSize: 14,
  },
  syncButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  syncButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  syncButtonText: {
    color: colors.text,
    fontWeight: '500',
  },
  errorsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(234, 67, 53, 0.1)',
    borderRadius: 8,
  },
  errorsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.danger,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginBottom: 4,
  },
  clearErrorsButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  clearErrorsText: {
    fontSize: 12,
    color: colors.danger,
    textDecorationLine: 'underline',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  dangerButton: {
    backgroundColor: colors.danger,
    marginHorizontal: 16,
  },
  dangerButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});