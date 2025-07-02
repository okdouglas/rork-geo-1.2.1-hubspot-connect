import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { BadgeCheck, Briefcase, GraduationCap, Calendar } from 'lucide-react-native';
import { Contact } from '@/types';
import { colors } from '@/constants/colors';

interface ContactCardProps {
  contact: Contact;
  companyName?: string;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, companyName }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/contact/${contact.id}`);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{contact.name}</Text>
          {contact.recentPublications && contact.recentPublications.length > 0 && (
            <BadgeCheck size={16} color={colors.primary} />
          )}
        </View>
        <Text style={styles.title}>{contact.title}</Text>
      </View>

      {companyName && (
        <View style={styles.infoRow}>
          <Briefcase size={16} color={colors.textSecondary} />
          <Text style={styles.infoText}>{companyName}</Text>
        </View>
      )}

      {contact.education && (
        <View style={styles.infoRow}>
          <GraduationCap size={16} color={colors.textSecondary} />
          <Text style={styles.infoText}>{contact.education}</Text>
        </View>
      )}

      {contact.lastContactDate && (
        <View style={styles.infoRow}>
          <Calendar size={16} color={colors.textSecondary} />
          <Text style={styles.infoText}>
            Last contact: {contact.lastContactDate.split('-').slice(1).join('/')}
          </Text>
        </View>
      )}

      <View style={styles.expertiseContainer}>
        {contact.expertise.slice(0, 3).map((expertise, index) => (
          <View key={index} style={styles.expertiseBadge}>
            <Text style={styles.expertiseText}>{expertise}</Text>
          </View>
        ))}
        {contact.expertise.length > 3 && (
          <View style={styles.expertiseBadge}>
            <Text style={styles.expertiseText}>+{contact.expertise.length - 3}</Text>
          </View>
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
    marginBottom: 12,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  title: {
    fontSize: 14,
    color: colors.textSecondary,
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
  expertiseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  expertiseBadge: {
    backgroundColor: 'rgba(26, 115, 232, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expertiseText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ContactCard;