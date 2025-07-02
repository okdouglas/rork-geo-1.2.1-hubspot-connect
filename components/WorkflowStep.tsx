import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WorkflowStep as WorkflowStepType } from '@/types';
import { colors } from '@/constants/colors';
import { MaterialIcons } from '@expo/vector-icons';

interface WorkflowStepProps {
  step: WorkflowStepType;
  isFirst?: boolean;
  isLast?: boolean;
  onToggleComplete: (step: WorkflowStepType) => void;
}

const WorkflowStep: React.FC<WorkflowStepProps> = ({ 
  step, 
  isFirst = false, 
  isLast = false,
  onToggleComplete
}) => {
  const handleToggle = () => {
    onToggleComplete({
      ...step,
      isCompleted: !step.isCompleted
    });
  };

  const getStepIcon = () => {
    switch (step.type) {
      case 'Email':
        return <MaterialIcons name="email" size={16} color="white" />;
      case 'Task':
        return <MaterialIcons name="assignment" size={16} color="white" />;
      case 'Call':
        return <MaterialIcons name="phone" size={16} color="white" />;
      case 'Research':
        return <MaterialIcons name="search" size={16} color="white" />;
      default:
        return <MaterialIcons name="event" size={16} color="white" />;
    }
  };

  return (
    <View style={styles.container}>
      {!isFirst && <View style={[styles.timeline, step.isCompleted ? styles.timelineCompleted : {}]} />}
      
      <View style={styles.content}>
        <TouchableOpacity
          style={[
            styles.iconContainer,
            step.isCompleted ? styles.iconContainerCompleted : {}
          ]}
          onPress={handleToggle}
        >
          {step.isCompleted ? <MaterialIcons name="check" size={16} color="white" /> : getStepIcon()}
        </TouchableOpacity>
        
        <View style={styles.stepDetails}>
          <Text style={styles.stepType}>{step.type}</Text>
          <Text style={styles.description}>{step.description}</Text>
          <Text style={styles.timing}>
            {step.daysFromTrigger === 0
              ? "Immediately"
              : step.daysFromTrigger === 1
              ? "1 day after trigger"
              : `${step.daysFromTrigger} days after trigger`}
          </Text>
        </View>
      </View>
      
      {!isLast && <View style={[styles.timelineBottom, step.isCompleted ? styles.timelineCompleted : {}]} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  timeline: {
    position: 'absolute',
    top: 0,
    left: 16,
    width: 2,
    height: 24,
    backgroundColor: colors.border,
  },
  timelineBottom: {
    position: 'absolute',
    top: 40,
    left: 16,
    width: 2,
    height: 24,
    backgroundColor: colors.border,
  },
  timelineCompleted: {
    backgroundColor: colors.primary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerCompleted: {
    backgroundColor: colors.primary,
  },
  stepDetails: {
    flex: 1,
    paddingVertical: 4,
  },
  stepType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  description: {
    color: colors.text,
    marginTop: 4,
  },
  timing: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});

export default WorkflowStep;