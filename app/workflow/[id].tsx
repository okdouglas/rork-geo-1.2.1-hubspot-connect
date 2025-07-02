import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Zap, ListChecks, Target, FileText, RefreshCw } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useWorkflowStore } from '@/hooks/useWorkflowStore';
import { useTemplateStore } from '@/hooks/useTemplateStore';
import { fetchPermitData } from '@/lib/permits';
import { PermitData } from '@/types/lead';
import WorkflowStep from '@/components/WorkflowStep';
import TemplatePreview from '@/components/TemplatePreview';
import PermitDataCard from '@/components/PermitDataCard';

export default function WorkflowDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { workflows, selectedWorkflow, setSelectedWorkflow, updateWorkflowStep, toggleWorkflowActive } = useWorkflowStore();
  const { templates } = useTemplateStore();
  
  const [permits, setPermits] = useState<PermitData[]>([]);
  const [loadingPermits, setLoadingPermits] = useState(false);
  const [permitError, setPermitError] = useState<string | null>(null);

  // Find the workflow and set it as selected
  useEffect(() => {
    const workflow = workflows.find(w => w.id === id);
    if (workflow) {
      setSelectedWorkflow(workflow);
      // Automatically fetch permit data when workflow is loaded
      fetchWorkflowPermits(workflow.id);
    }
    
    return () => {
      setSelectedWorkflow(null);
    };
  }, [id, workflows, setSelectedWorkflow]);

  const fetchWorkflowPermits = async (workflowId: string) => {
    setLoadingPermits(true);
    setPermitError(null);
    
    try {
      // Fetch permits based on workflow targeting criteria
      const permitData = await fetchPermitData({
        workflowId,
        // Add date range for recent permits (last 30 days)
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        }
      });
      
      setPermits(permitData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch permit data';
      setPermitError(errorMessage);
      console.error('Error fetching permits:', error);
    } finally {
      setLoadingPermits(false);
    }
  };

  const handleRefreshPermits = () => {
    if (selectedWorkflow) {
      fetchWorkflowPermits(selectedWorkflow.id);
    }
  };
  
  if (!selectedWorkflow) {
    return (
      <View style={styles.centeredContainer}>
        <Text>Workflow not found</Text>
      </View>
    );
  }
  
  const handleToggleStep = (step: any) => {
    updateWorkflowStep(selectedWorkflow.id, step);
  };
  
  const handleToggleActive = () => {
    toggleWorkflowActive(selectedWorkflow.id);
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.workflowName}>{selectedWorkflow.name}</Text>
          <Switch
            value={selectedWorkflow.isActive}
            onValueChange={handleToggleActive}
            trackColor={{ false: colors.border, true: 'rgba(26, 115, 232, 0.4)' }}
            thumbColor={selectedWorkflow.isActive ? colors.primary : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.triggerContainer}>
          <Zap size={16} color={colors.textSecondary} />
          <Text style={styles.triggerText}>{selectedWorkflow.trigger}</Text>
        </View>
      </View>

      {/* Permit Data Section */}
      <View style={styles.permitsCard}>
        <View style={styles.sectionHeader}>
          <FileText size={18} color={colors.text} />
          <Text style={styles.sectionTitle}>Related Permit Data</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleRefreshPermits} disabled={loadingPermits}>
              {loadingPermits ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <RefreshCw size={16} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {permitError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{permitError}</Text>
          </View>
        )}

        {permits.length > 0 ? (
          <View style={styles.permitsContainer}>
            <Text style={styles.permitsCount}>
              {permits.length} recent permits found matching workflow criteria
            </Text>
            {permits.slice(0, 3).map(permit => (
              <PermitDataCard key={permit.id} permit={permit} />
            ))}
            {permits.length > 3 && (
              <Text style={styles.morePermitsText}>
                +{permits.length - 3} more permits available
              </Text>
            )}
          </View>
        ) : !loadingPermits && !permitError ? (
          <View style={styles.emptyPermitsContainer}>
            <Text style={styles.emptyPermitsText}>
              No recent permits found for this workflow
            </Text>
          </View>
        ) : null}
      </View>
      
      <View style={styles.targetingCard}>
        <Text style={styles.sectionTitle}>Targeting Criteria</Text>
        
        <View style={styles.targetSection}>
          <Text style={styles.targetLabel}>Company Types:</Text>
          <View style={styles.tagsContainer}>
            {selectedWorkflow.targetCompanyTypes.map((type, index) => (
              <View key={`type-${index}`} style={styles.tag}>
                <Text style={styles.tagText}>{type}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.targetSection}>
          <Text style={styles.targetLabel}>Target Formations:</Text>
          <View style={styles.tagsContainer}>
            {selectedWorkflow.targetFormations.map((formation, index) => (
              <View key={`formation-${index}`} style={[styles.tag, styles.formationTag]}>
                <Text style={styles.tagText}>{formation}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      
      <View style={styles.stepsCard}>
        <View style={styles.sectionHeader}>
          <ListChecks size={18} color={colors.text} />
          <Text style={styles.sectionTitle}>Workflow Steps</Text>
        </View>
        
        <View style={styles.stepsContainer}>
          {selectedWorkflow.steps.map((step, index) => (
            <WorkflowStep 
              key={step.id} 
              step={step} 
              isFirst={index === 0}
              isLast={index === selectedWorkflow.steps.length - 1}
              onToggleComplete={handleToggleStep}
            />
          ))}
        </View>
      </View>
      
      <View style={styles.templatesCard}>
        <View style={styles.sectionHeader}>
          <Target size={18} color={colors.text} />
          <Text style={styles.sectionTitle}>Email Templates</Text>
        </View>
        
        {selectedWorkflow.steps
          .filter(step => step.type === 'Email' && step.templateId)
          .map(step => {
            const template = templates.find(t => t.id === step.templateId);
            if (!template) return null;
            
            return (
              <TemplatePreview key={template.id} template={template} />
            );
          })}
        
        {selectedWorkflow.steps.filter(step => step.type === 'Email' && step.templateId).length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No email templates in this workflow</Text>
          </View>
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
  workflowName: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  triggerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  triggerText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  permitsCard: {
    backgroundColor: 'white',
    marginTop: 12,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  targetingCard: {
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  headerActions: {
    marginLeft: 'auto',
  },
  errorContainer: {
    backgroundColor: 'rgba(234, 67, 53, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
  },
  permitsContainer: {
    gap: 8,
  },
  permitsCount: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  morePermitsText: {
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  emptyPermitsContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyPermitsText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  targetSection: {
    marginBottom: 16,
  },
  targetLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(111, 207, 151, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  formationTag: {
    backgroundColor: 'rgba(26, 115, 232, 0.1)',
  },
  tagText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  stepsCard: {
    backgroundColor: 'white',
    marginTop: 12,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  stepsContainer: {
    marginLeft: 16,
  },
  templatesCard: {
    backgroundColor: 'white',
    marginTop: 12,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});