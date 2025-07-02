import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { 
  Briefcase, 
  GraduationCap, 
  Mail, 
  Phone, 
  Calendar, 
  Award, 
  Users, 
  Linkedin,
  ArrowUpRight 
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useContactStore } from '@/hooks/useContactStore';
import { useCompanyStore } from '@/hooks/useCompanyStore';
import HubSpotSyncButton from '@/components/HubSpotSyncButton';

export default function ContactDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { contacts } = useContactStore();
  const { companies } = useCompanyStore();
  
  const contact = contacts.find(c => c.id === id);
  
  if (!contact) {
    return (
      <View style={styles.centeredContainer}>
        <Text>Contact not found</Text>
      </View>
    );
  }
  
  const company = companies.find(c => c.id === contact.companyId);
  
  const handleEmail = () => {
    if (contact.email) {
      Linking.openURL(`mailto:${contact.email}`);
    }
  };
  
  const handlePhone = () => {
    if (contact.phone) {
      Linking.openURL(`tel:${contact.phone}`);
    }
  };
  
  const handleLinkedIn = () => {
    if (contact.linkedInUrl) {
      Linking.openURL(`https://${contact.linkedInUrl}`);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{contact.name}</Text>
        <Text style={styles.title}>{contact.title}</Text>
        
        {company && (
          <View style={styles.companyContainer}>
            <Briefcase size={16} color={colors.textSecondary} />
            <Text style={styles.companyName}>{company.name}</Text>
          </View>
        )}
        
        <View style={styles.syncButtonContainer}>
          <HubSpotSyncButton type="contact" id={contact.id} />
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
        {contact.email && (
          <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(26, 115, 232, 0.1)' }]}>
              <Mail size={20} color={colors.primary} />
            </View>
            <Text style={styles.actionText}>Email</Text>
          </TouchableOpacity>
        )}
        
        {contact.phone && (
          <TouchableOpacity style={styles.actionButton} onPress={handlePhone}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(111, 207, 151, 0.1)' }]}>
              <Phone size={20} color={colors.secondary} />
            </View>
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>
        )}
        
        {contact.linkedInUrl && (
          <TouchableOpacity style={styles.actionButton} onPress={handleLinkedIn}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(26, 115, 232, 0.1)' }]}>
              <Linkedin size={20} color={colors.primary} />
            </View>
            <Text style={styles.actionText}>LinkedIn</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        
        {contact.email && (
          <View style={styles.detailRow}>
            <Mail size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>{contact.email}</Text>
          </View>
        )}
        
        {contact.phone && (
          <View style={styles.detailRow}>
            <Phone size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>{contact.phone}</Text>
          </View>
        )}
        
        {contact.education && (
          <View style={styles.detailRow}>
            <GraduationCap size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>{contact.education}</Text>
          </View>
        )}
        
        {contact.yearsExperience && (
          <View style={styles.detailRow}>
            <Briefcase size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>{contact.yearsExperience} years experience</Text>
          </View>
        )}
        
        {contact.lastContactDate && (
          <View style={styles.detailRow}>
            <Calendar size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>Last contacted: {contact.lastContactDate}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Expertise & Knowledge</Text>
        
        <View style={styles.expertiseContainer}>
          {contact.expertise.map((expertise, index) => (
            <View key={index} style={styles.expertiseBadge}>
              <Text style={styles.expertiseText}>{expertise}</Text>
            </View>
          ))}
        </View>
        
        {contact.recentPublications && contact.recentPublications.length > 0 && (
          <View style={styles.publicationsContainer}>
            <View style={styles.detailRow}>
              <Award size={16} color={colors.textSecondary} />
              <Text style={styles.publicationTitle}>Recent Publications</Text>
            </View>
            
            {contact.recentPublications.map((publication, index) => (
              <View key={index} style={styles.publicationItem}>
                <Text style={styles.publicationText}>{publication}</Text>
                <ArrowUpRight size={14} color={colors.primary} />
              </View>
            ))}
          </View>
        )}
      </View>
      
      {contact.mutualConnections && contact.mutualConnections.length > 0 && (
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Mutual Connections</Text>
          
          <View style={styles.detailRow}>
            <Users size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              Connected through {contact.mutualConnections.join(", ")}
            </Text>
          </View>
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
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  companyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  companyName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  syncButtonContainer: {
    alignSelf: 'flex-start',
  },
  actionsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 24,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: colors.text,
  },
  detailsCard: {
    backgroundColor: 'white',
    marginTop: 12,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
  },
  expertiseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  expertiseBadge: {
    backgroundColor: 'rgba(26, 115, 232, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  expertiseText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  publicationsContainer: {
    marginTop: 16,
  },
  publicationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  publicationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    marginLeft: 28,
    marginBottom: 8,
  },
  publicationText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
});