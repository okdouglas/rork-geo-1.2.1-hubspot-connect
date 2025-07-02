import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Building, MapPin, Activity, Calendar } from 'lucide-react-native';
import { Company } from '@/types';
import { colors } from '@/constants/colors';

interface CompanyCardProps {
  company: Company;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return colors.success;
      case 'Dormant':
        return colors.textSecondary;
      case 'Reactivated':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getActivityColor = (level: string) => {
    switch (level) {
      case 'High':
        return colors.success;
      case 'Medium':
        return colors.warning;
      case 'Low':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const handlePress = () => {
    router.push(`/company/${company.id}`);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <Text style={styles.companyName}>{company.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(company.status) }]}>
          <Text style={styles.statusText}>{company.status}</Text>
        </View>
      </View>
      
      <View style={styles.infoRow}>
        <Building size={16} color={colors.textSecondary} />
        <Text style={styles.infoText}>{company.size} • {company.geologicalStaffSize} geological staff</Text>
      </View>
      
      <View style={styles.infoRow}>
        <MapPin size={16} color={colors.textSecondary} />
        <Text style={styles.infoText}>{company.state}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Calendar size={16} color={colors.textSecondary} />
        <Text style={styles.infoText}>
          Last permit: {company.lastPermitDate.split('-').slice(1).join('/')}
          {company.recentPermitsCount > 0 && ` • ${company.recentPermitsCount} recent`}
        </Text>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.formationText}>{company.primaryFormation}</Text>
        <View style={styles.activityContainer}>
          <Activity size={14} color={getActivityColor(company.drillingActivityLevel)} />
          <Text style={[styles.activityText, { color: getActivityColor(company.drillingActivityLevel) }]}>
            {company.drillingActivityLevel} activity
          </Text>
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
    alignItems: 'center',
    marginBottom: 12,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formationText: {
    color: colors.primary,
    fontWeight: '500',
  },
  activityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default CompanyCard;