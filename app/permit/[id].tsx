import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  MapPin, 
  Building2, 
  CalendarDays, 
  Layers, 
  ClipboardList, 
  ChevronRight,
  ArrowRight
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { usePermitStore } from '@/hooks/usePermitStore';
import { useCompanyStore } from '@/hooks/useCompanyStore';
import { useWorkflowStore } from '@/hooks/useWorkflowStore';
import { formations } from '@/constants/formations';
import HubSpotSyncButton from '@/components/HubSpotSyncButton';

export default function PermitDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { permits } = usePermitStore();
  const { companies } = useCompanyStore();
  const { workflows } = useWorkflowStore();
  
  const permit = permits.find(p => p.id === id);
  
  if (!permit) {
    return (
      <View style={styles.centeredContainer}>
        <Text>Permit not found</Text>
      </View>
    );
  }
  
  const company = companies.find(c => c.id === permit.companyId);
  
  // Find workflows that might be applicable to this permit
  const applicableWorkflows = workflows.filter(workflow => 
    workflow.targetFormations.includes(permit.formationTarget) || 
    workflow.targetFormations.includes('All')
  );
  
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
  
  // Find formation emphasis
  const allFormations = [...formations.oklahoma, ...formations.kansas];
  const formationInfo = allFormations.find(f => f.name === permit.formationTarget);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  const handleCompanyPress = () => {
    if (company) {
      router.push(`/company/${company.id}`);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.formationText}>{permit.formationTarget}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(permit.status) }]}>
            <Text style={styles.statusText}>{permit.status}</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.companyContainer} onPress={handleCompanyPress}>
          <Building2 size={16} color={colors.textSecondary} />
          <Text style={styles.companyName}>
            {company?.name || 'Unknown Company'}
          </Text>
          <ChevronRight size={16} color={colors.textSecondary} />
        </TouchableOpacity>
        
        <View style={styles.syncButtonContainer}>
          <HubSpotSyncButton type="permit" id={permit.id} />
        </View>
      </View>
      
      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Permit Information</Text>
        
        <View style={styles.detailRow}>
          <MapPin size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>
            {permit.county} County, {permit.state}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Layers size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>
            Section {permit.location.section}, Township {permit.location.township}, Range {permit.location.range}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <CalendarDays size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>
            Filed on {formatDate(permit.filingDate)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <ClipboardList size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>
            {permit.type} well
          </Text>
        </View>
      </View>
      
      {formationInfo && (
        <View style={styles.formationCard}>
          <Text style={styles.sectionTitle}>Formation Emphasis</Text>
          <Text style={styles.emphasisText}>{formationInfo.emphasis}</Text>
          
          <View style={styles.emphasisTags}>
            {formationInfo.emphasis.split(', ').map((tag, index) => (
              <View key={index} style={styles.emphasisTag}>
                <Text style={styles.emphasisTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {applicableWorkflows.length > 0 && (
        <View style={styles.workflowsCard}>
          <Text style={styles.sectionTitle}>Recommended Workflows</Text>
          
          {applicableWorkflows.map(workflow => (
            <TouchableOpacity 
              key={workflow.id} 
              style={styles.workflowItem}
              onPress={() => router.push(`/workflow/${workflow.id}`)}
            >
              <View style={styles.workflowInfo}>
                <Text style={styles.workflowName}>{workflow.name}</Text>
                <Text style={styles.workflowTrigger}>{workflow.trigger}</Text>
              </View>
              <ArrowRight size={16} color={colors.primary} />
            </TouchableOpacity>
          ))}
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  formationText: {
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
  companyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  companyName: {
    fontSize: 16,
    color: colors.textSecondary,
    flex: 1,
  },
  syncButtonContainer: {
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
  formationCard: {
    backgroundColor: 'white',
    marginTop: 12,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  emphasisText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 16,
    lineHeight: 20,
  },
  emphasisTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emphasisTag: {
    backgroundColor: 'rgba(26, 115, 232, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  emphasisTagText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  workflowsCard: {
    backgroundColor: 'white',
    marginTop: 12,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  workflowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 8,
  },
  workflowInfo: {
    flex: 1,
  },
  workflowName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  workflowTrigger: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});