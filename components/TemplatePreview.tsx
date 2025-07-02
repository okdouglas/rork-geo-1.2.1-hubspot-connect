import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { EmailTemplate } from '@/types';
import { colors } from '@/constants/colors';
import { Edit, Copy, Check } from 'lucide-react-native';

interface TemplatePreviewProps {
  template: EmailTemplate;
  onEdit?: () => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, onEdit }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatBody = (body: string) => {
    return body.split('\n').map((line, index) => (
      <Text key={index} style={styles.bodyText}>
        {line || ' '}
      </Text>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.type}>{template.type}</Text>
        <View style={styles.actionsContainer}>
          {onEdit && (
            <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
              <Edit size={18} color={colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
            {copied ? (
              <Check size={18} color={colors.success} />
            ) : (
              <Copy size={18} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.previewContainer}>
        <View style={styles.subjectContainer}>
          <Text style={styles.subjectLabel}>Subject:</Text>
          <Text style={styles.subjectText}>{template.subject}</Text>
        </View>

        <ScrollView style={styles.bodyContainer}>
          {formatBody(template.body)}
        </ScrollView>
      </View>

      {template.variables.length > 0 && (
        <View style={styles.variablesContainer}>
          <Text style={styles.variablesLabel}>Variables:</Text>
          <View style={styles.variablesList}>
            {template.variables.map((variable, index) => (
              <View key={index} style={styles.variableBadge}>
                <Text style={styles.variableText}>{`{{${variable}}}`}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  type: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 6,
  },
  previewContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  subjectContainer: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  subjectLabel: {
    color: colors.textSecondary,
    fontWeight: '500',
    marginRight: 8,
  },
  subjectText: {
    color: colors.text,
    flex: 1,
  },
  bodyContainer: {
    padding: 12,
    maxHeight: 200,
  },
  bodyText: {
    color: colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  variablesContainer: {
    marginTop: 16,
  },
  variablesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  variablesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  variableBadge: {
    backgroundColor: 'rgba(26, 115, 232, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  variableText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default TemplatePreview;