import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PermitData } from '@/types/lead';
import { colors } from '@/constants/colors';

interface PermitDataCardProps {
  permit: PermitData;
  onPress?: () => void;
}

const PermitDataCard: React.FC<PermitDataCardProps> = ({ permit, onPress }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return colors.success;
      case 'filed':
        return colors.warning;
      case 'drilling':
        return colors.primary;
      case 'completed':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
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

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} disabled={!onPress}>
      <View style={styles.header}>
        <View style={styles.permitInfo}>
          <Text style={styles.permitNumber}>{permit.permitNumber}</Text>
          <Text style={styles.operatorName}>{permit.operatorName}</Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(permit.status) }]}>
          <Text style={styles.statusText}>{permit.status}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <MaterialIcons name="location-on" size={16} color={colors.textSecondary} />
        <Text style={styles.infoText}>
          {permit.location.county} County, {permit.location.state}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <MaterialIcons name="layers" size={16} color={colors.textSecondary} />
        <Text style={styles.infoText}>
          Sec {permit.location.section}-{permit.location.township}-{permit.location.range}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <MaterialIcons name="event" size={16} color={colors.textSecondary} />
        <Text style={styles.infoText}>Filed: {formatDate(permit.filingDate)}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <MaterialIcons name="business" size={14} color={colors.textSecondary} />
            <Text style={styles.detailText}>{permit.wellType}</Text>
          </View>
          
          {permit.formation && (
            <View style={styles.detailItem}>
              <MaterialIcons name="description" size={14} color={colors.textSecondary} />
              <Text style={styles.detailText}>{permit.formation}</Text>
            </View>
          )}
          
          {permit.depth && (
            <View style={styles.detailItem}>
              <Text style={styles.depthText}>{permit.depth.toLocaleString()}ft TD</Text>
            </View>
          )}
        </View>

        {permit.apiNumber && (
          <Text style={styles.apiNumber}>API: {permit.apiNumber}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
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
  permitInfo: {
    flex: 1,
  },
  permitNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  operatorName: {
    fontSize: 14,
    color: colors.textSecondary,
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
  },
  footer: {
    marginTop: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  depthText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  apiNumber: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default PermitDataCard;