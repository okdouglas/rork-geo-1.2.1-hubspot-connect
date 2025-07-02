import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Activity, Building, Map, Calendar, Phone, Mail, User, ChevronRight } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useCompanyStore } from '@/hooks/useCompanyStore';
import { useContactStore } from '@/hooks/useContactStore';
import { usePermitStore } from '@/hooks/usePermitStore';
import ContactCard from '@/components/ContactCard';
import PermitCard from '@/components/PermitCard';
import HubSpotSyncButton from '@/components/HubSpotSyncButton';

export default function CompanyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { companies } = useCompanyStore();
  const { getContactsByCompany } = useContactStore();
  const { getPermitsByCompany } = usePermitStore();
  
  const [activeTab, setActiveTab] = useState('contacts');
  
  const company = companies.find(c => c.id === id);
  const contacts = getContactsByCompany(id);
  const permits = getPermitsByCompany(id);
  
  if (!company) {
    return (
      <View style={styles.centeredContainer}>
        <Text>Company not found</Text>
      </View>
    );
  }
  
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
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
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
          <Map size={16} color={colors.textSecondary} />
          <Text style={styles.infoText}>{company.state}</Text>
        </View>
        <View style={styles.infoRow}>
          <Activity size={16} color={getActivityColor(company.drillingActivityLevel)} />
          <Text style={[styles.infoText, { color: getActivityColor(company.drillingActivityLevel) }]}>
            {company.drillingActivityLevel} drilling activity
          </Text>
        </View>
        
        <View style={styles.syncButtonContainer}>
          <HubSpotSyncButton type="company" id={company.id} />
        </View>
      </View>
      
      <View style={styles.detailsCard}>
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Primary Formation</Text>
          <Text style={styles.formationText}>{company.primaryFormation}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Current Software</Text>
          <View style={styles.softwareContainer}>
            {company.currentSoftwareStack.map((software, index) => (
              <View key={index} style={styles.softwareBadge}>
                <Text style={styles.softwareText}>{software}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityRow}>
            <Calendar size={16} color={colors.textSecondary} />
            <Text style={styles.activityText}>
              Last permit: {company.lastPermitDate}
            </Text>
          </View>
          <View style={styles.activityRow}>
            <Activity size={16} color={colors.textSecondary} />
            <Text style={styles.activityText}>
              {company.recentPermitsCount} permits in last 6 months
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'contacts' && styles.activeTabButton]} 
          onPress={() => setActiveTab('contacts')}
        >
          <User size={16} color={activeTab === 'contacts' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'contacts' && styles.activeTabText]}>
            Contacts ({contacts.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'permits' && styles.activeTabButton]} 
          onPress={() => setActiveTab('permits')}
        >
          <Map size={16} color={activeTab === 'permits' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'permits' && styles.activeTabText]}>
            Permits ({permits.length})
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {activeTab === 'contacts' && (
          <>
            {contacts.length > 0 ? (
              contacts.map(contact => (
                <ContactCard key={contact.id} contact={contact} />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No contacts found</Text>
              </View>
            )}
          </>
        )}
        
        {activeTab === 'permits' && (
          <>
            {permits.length > 0 ? (
              permits.map(permit => (
                <PermitCard key={permit.id} permit={permit} />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No permits found</Text>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyName: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
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
  syncButtonContainer: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  detailsCard: {
    backgroundColor: 'white',
    marginTop: 12,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  detailsSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  formationText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  softwareContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  softwareBadge: {
    backgroundColor: 'rgba(26, 115, 232, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  softwareText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  activityText: {
    color: colors.text,
    fontSize: 14,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
  },
  content: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});