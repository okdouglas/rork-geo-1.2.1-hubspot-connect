import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ExternalLink, MapPin, Calendar, Building, Layers } from 'lucide-react-native';
import { PermitData } from '@/types/lead';
import { colors } from '@/constants/colors';
import { getPermitUrl } from '@/lib/permits';
import HubSpotSyncButton from '@/components/HubSpotSyncButton';

interface PermitCardProps {
  permit: PermitData;
}

const PermitCard: React.FC<PermitCardProps> = ({ permit }) => {
  const router = useRouter();
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'filed':
        return colors.warning;
      case 'approved':
        return colors.success;
      case 'drilling':
        return colors.primary;
      case 'completed':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const handlePress = () => {
    router.push(`/permit/${permit.id}`);
  };

  const handleViewPermit = async () => {
    const permitUrl = getPermitUrl(permit);
    
    if (!permitUrl) {
      Alert.alert('Error', 'Permit link not available');
      return;
    }
    
    try {
      const supported = await Linking.canOpenURL(permitUrl);
      if (supported) {
        await Linking.openURL(permitUrl);
      } else {
        Alert.alert('Error', 'Cannot open permit link');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open permit link');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatLocation = () => {
    const { section, township, range } = permit.location;
    if (section && township && range) {
      return `Sec ${section}-${township}-${range}`;
    }
    return 'Location TBD';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.operatorName}>{permit.operatorName}</Text>
          <Text style={styles.permitNumber}>#{permit.permitNumber}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(permit.status) }]}>
          <Text style={styles.statusText}>{permit.status}</Text>
        </View>
      </View>
      
      {permit.formation && (
        <View style={styles.infoRow}>
          <Layers size={16} color={colors.textSecondary} />
          <Text style={styles.infoText}>{permit.formation}</Text>
        </View>
      )}
      
      <View style={styles.infoRow}>
        <MapPin size={16} color={colors.textSecondary} />
        <Text style={styles.infoText}>
          {permit.location.county} County, {permit.location.state}
        </Text>
      </View>
      
      <View style={styles.infoRow}>
        <Building size={16} color={colors.textSecondary} />
        <Text style={styles.infoText}>{formatLocation()}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Calendar size={16} color={colors.textSecondary} />
        <Text style={styles.infoText}>Filed on {formatDate(permit.filingDate)}</Text>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.typeContainer}>
          <Text style={styles.typeText}>{permit.wellType} well</Text>
          {permit.depth && (
            <Text style={styles.depthText}> • {permit.depth.toLocaleString()} ft</Text>
          )}
        </View>
        
        <View style={styles.actionButtons}>
          <HubSpotSyncButton 
            type="permit" 
            id={permit.id} 
            style={styles.syncButton}
          />
          
          <TouchableOpacity 
            style={styles.viewPermitButton} 
            onPress={handleViewPermit}
          >
            <ExternalLink size={14} color={colors.primary} />
            <Text style={styles.viewPermitText}>View Permit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  operatorName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  permitNumber: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 14,
    flex: 1,
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  depthText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syncButton: {
    flex: 1,
    marginRight: 12,
  },
  viewPermitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 6,
  },
  viewPermitText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default PermitCard;