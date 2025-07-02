import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ListChecks, Activity } from 'lucide-react-native';
import { Workflow } from '@/types';
import { colors } from '@/constants/colors';
import { useWorkflowStore } from '@/hooks/useWorkflowStore';

interface WorkflowCardProps {
  workflow: Workflow;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({ workflow }) => {
  const router = useRouter();
  const { toggleWorkflowActive } = useWorkflowStore();

  const handlePress = () => {
    router.push(`/workflow/${workflow.id}`);
  };

  const handleToggle = () => {
    toggleWorkflowActive(workflow.id);
  };

  const completedSteps = workflow.steps.filter(step => step.isCompleted).length;
  const progressPercentage = (completedSteps / workflow.steps.length) * 100;

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <Text style={styles.name}>{workflow.name}</Text>
        <Switch
          value={workflow.isActive}
          onValueChange={handleToggle}
          trackColor={{ false: colors.border, true: 'rgba(26, 115, 232, 0.4)' }}
          thumbColor={workflow.isActive ? colors.primary : '#f4f3f4'}
        />
      </View>
      
      <View style={styles.infoRow}>
        <Activity size={16} color={colors.textSecondary} />
        <Text style={styles.infoText}>Trigger: {workflow.trigger}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <ListChecks size={16} color={colors.textSecondary} />
        <Text style={styles.infoText}>{workflow.steps.length} steps</Text>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${progressPercentage}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {completedSteps} of {workflow.steps.length} completed
        </Text>
      </View>
      
      <View style={styles.tagsContainer}>
        {workflow.targetFormations.map((formation, index) => (
          formation !== 'All' && (
            <View key={`formation-${index}`} style={styles.tag}>
              <Text style={styles.tagText}>{formation}</Text>
            </View>
          )
        ))}
        {workflow.targetCompanyTypes.map((type, index) => (
          type !== 'All' && (
            <View key={`type-${index}`} style={[styles.tag, styles.typeTag]}>
              <Text style={styles.tagText}>{type}</Text>
            </View>
          )
        ))}
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
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
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
  progressContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginBottom: 4,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(26, 115, 232, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeTag: {
    backgroundColor: 'rgba(111, 207, 151, 0.15)',
  },
  tagText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default WorkflowCard;