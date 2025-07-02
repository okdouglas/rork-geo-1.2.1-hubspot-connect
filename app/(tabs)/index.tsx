import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  BarChart, 
  Building2, 
  FileText, 
  ListChecks, 
  PercentSquare,
  Calendar,
  GanttChartSquare
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useDashboardStore } from '@/hooks/useDashboardStore';
import { usePermitStore } from '@/hooks/usePermitStore';
import StatCard from '@/components/StatCard';
import { permits } from '@/mocks/permits';

export default function DashboardScreen() {
  const { stats, refreshStats } = useDashboardStore();
  const { getPermitStats } = usePermitStore();
  
  const permitStats = getPermitStats();
  
  // Get permits filed in the last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const recentPermits = permits.filter(permit => {
    const permitDate = new Date(permit.filingDate);
    return permitDate >= thirtyDaysAgo && permitDate <= today;
  });
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>GeoProspect Dashboard</Text>
        <Text style={styles.subheader}>Geological Prospecting Overview</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <StatCard
              title="New Permits"
              value={stats.newPermits}
              icon={<FileText size={20} color={colors.primary} />}
              suffix="last 30 days"
            />
          </View>
          
          <View style={styles.statItem}>
            <StatCard
              title="Active Workflows"
              value={stats.activeWorkflows}
              icon={<ListChecks size={20} color={colors.secondary} />}
              color={colors.secondary}
            />
          </View>
          
          <View style={styles.statItem}>
            <StatCard
              title="Total Prospects"
              value={stats.totalProspects}
              icon={<Building2 size={20} color="#FBBC05" />}
              color="#FBBC05"
            />
          </View>
          
          <View style={styles.statItem}>
            <StatCard
              title="Response Rate"
              value={stats.responseRate}
              suffix="%"
              icon={<PercentSquare size={20} color="#34A853" />}
              color="#34A853"
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <GanttChartSquare size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Activity by State</Text>
          </View>
          
          <View style={styles.permitStatCard}>
            <View style={styles.permitRow}>
              <Text style={styles.permitLabel}>Oklahoma</Text>
              <View style={styles.permitBarContainer}>
                <View 
                  style={[
                    styles.permitBar, 
                    { width: `${(permitStats.oklahoma / permitStats.total) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.permitCount}>{permitStats.oklahoma}</Text>
            </View>
            
            <View style={styles.permitRow}>
              <Text style={styles.permitLabel}>Kansas</Text>
              <View style={styles.permitBarContainer}>
                <View 
                  style={[
                    styles.permitBar, 
                    { 
                      width: `${(permitStats.kansas / permitStats.total) * 100}%`,
                      backgroundColor: colors.secondary
                    }
                  ]} 
                />
              </View>
              <Text style={styles.permitCount}>{permitStats.kansas}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Recent Activity</Text>
          </View>
          
          <View style={styles.timelineContainer}>
            {recentPermits.slice(0, 5).map((permit, index) => (
              <View key={permit.id} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineDate}>{permit.filingDate}</Text>
                  <Text style={styles.timelineTitle}>
                    New permit filed by {
                      permits.find(p => p.companyId === permit.companyId)?.formationTarget || 'Unknown'
                    }
                  </Text>
                  <Text style={styles.timelineSubtitle}>
                    {permit.county} County, {permit.state} • {permit.formationTarget}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subheader: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statItem: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  section: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  permitStatCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  permitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  permitLabel: {
    width: 80,
    fontSize: 14,
    color: colors.text,
  },
  permitBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 6,
    marginHorizontal: 12,
  },
  permitBar: {
    height: 12,
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  permitCount: {
    width: 30,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
  },
  timelineContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginTop: 6,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  timelineSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});