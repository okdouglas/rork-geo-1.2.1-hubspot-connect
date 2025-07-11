import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Globe, MapPin, Users, Phone, Star, Building } from 'lucide-react-native';
import { Lead } from '@/types/lead';
import { colors } from '@/constants/colors';

interface LeadCardProps {
  lead: Lead;
  onSync: () => void;
  syncIcon: React.ReactNode;
  canSync: boolean;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onSync, syncIcon, canSync }) => {
  const handleWebsitePress = () => {
    if (lead.website) {
      Linking.openURL(lead.website);
    }
  };

  const handlePhonePress = () => {
    if (lead.contact?.phone) {
      Linking.openURL(`tel:${lead.contact.phone}`);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{lead.companyName}</Text>
          <Text style={styles.industry}>{lead.industry}</Text>
        </View>
        
        {canSync && (
          <TouchableOpacity style={styles.syncButton} onPress={onSync}>
            {syncIcon}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoRow}>
        <MapPin size={16} color={colors.textSecondary} />
        <Text style={styles.infoText}>{lead.location}</Text>
      </View>

      {lead.size && (
        <View style={styles.infoRow}>
          <Users size={16} color={colors.textSecondary} />
          <Text style={styles.infoText}>{lead.size}</Text>
        </View>
      )}

      {/* SerpAPI specific data */}
      {lead.serpApiData?.rating && (
        <View style={styles.infoRow}>
          <Star size={16} color={colors.warning} />
          <Text style={styles.infoText}>
            {lead.serpApiData.rating} stars
            {lead.serpApiData.reviews && ` (${lead.serpApiData.reviews} reviews)`}
          </Text>
        </View>
      )}

      {lead.description && (
        <Text style={styles.description}>{lead.description}</Text>
      )}

      {lead.contact && (
        <View style={styles.contactContainer}>
          <Text style={styles.contactTitle}>Contact Information:</Text>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{lead.contact.name}</Text>
            <Text style={styles.contactRole}>{lead.contact.title}</Text>
            {lead.contact.phone && (
              <TouchableOpacity onPress={handlePhonePress} style={styles.contactAction}>
                <Phone size={14} color={colors.primary} />
                <Text style={styles.contactPhone}>{lead.contact.phone}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.linksContainer}>
          {lead.website && (
            <TouchableOpacity style={styles.linkButton} onPress={handleWebsitePress}>
              <Globe size={14} color={colors.primary} />
              <Text style={styles.linkText}>Website</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.badgeContainer}>
          {lead.syncedToHubSpot && (
            <View style={styles.syncedBadge}>
              <Text style={styles.syncedText}>Synced</Text>
            </View>
          )}
          
          {lead.serpApiData && (
            <View style={styles.sourceBadge}>
              <Text style={styles.sourceText}>Google</Text>
            </View>
          )}
        </View>
      </View>
    </View>
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
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  industry: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  syncButton: {
    padding: 8,
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
  description: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  contactContainer: {
    backgroundColor: 'rgba(26, 115, 232, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  contactInfo: {
    gap: 2,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  contactRole: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  contactAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linksContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkText: {
    fontSize: 14,
    color: colors.primary,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  syncedBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  syncedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  sourceBadge: {
    backgroundColor: 'rgba(26, 115, 232, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sourceText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default LeadCard;