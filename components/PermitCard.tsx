import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, CalendarDays, Layers, Building } from 'lucide-react-native';
import { Permit } from '@/types';
import { colors } from '@/constants/colors';
import { useCompanyStore } from '@/hooks/useCompanyStore';

interface PermitCardProps {
  permit: Permit;
}

const PermitCard: React.FC<PermitCardProps> = ({ permit }) => {
  const router = useRouter();
  const { companies } = useCompanyStore();
  
  const company = companies.find(c => c.id === permit.companyId);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Filed':
        return colors.warning;
      case 'Approved':
        return colors.success;
      case 'Drilling':
        return colors.primary;
      case 'Completed':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const handlePress = () => {
    router.push(`/permit/${permit.id}`);
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
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <View>
          <Text style={styles.formationText}>{permit.formationTarget}</Text>
          <Text style={styles.companyName}>{company?.name || 'Unknown Company'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(permit.status) }]}>
          <Text style={styles.statusText}>{permit.status}</Text>
        </View>
      </View>
      
      <View style={styles.infoRow}>
        <MapPin size={16} color={colors.textSecondary} />
        <Text style={styles.infoText}>
          {permit.county} County, {permit.state}
        </Text>
      </View>
      
      <View style={styles.infoRow}>
        <Layers size={16} color={colors.textSecondary} />
        <Text style={styles.infoText}>
          Sec {permit.location.section}-{permit.location.township}-{permit.location.range}
        </Text>
      </View>
      
      <View style={styles.infoRow}>
        <CalendarDays size={16} color={colors.textSecondary} />
        <Text style={styles.infoText}>Filed on {formatDate(permit.filingDate)}</Text>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.typeContainer}>
          <Building size={14} color={colors.textSecondary} />
          <Text style={styles.typeText}>{permit.type} well</Text>
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
  formationText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  companyName: {
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
  },
  footer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default PermitCard;