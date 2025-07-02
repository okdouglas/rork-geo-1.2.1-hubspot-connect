import React from "react";
import { Tabs } from "expo-router";
import { colors } from "@/constants/colors";
import { Home, Building, FileText, ListChecks, BarChart, Settings, Search } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: "#fff",
        },
        headerTitleStyle: {
          fontWeight: "600",
          color: colors.text,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <BarChart size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="companies"
        options={{
          title: "Companies",
          tabBarIcon: ({ color }) => <Building size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="permits"
        options={{
          title: "Permits",
          tabBarIcon: ({ color }) => <FileText size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="workflows"
        options={{
          title: "Workflows",
          tabBarIcon: ({ color }) => <ListChecks size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="lead-sourcing"
        options={{
          title: "Lead Sourcing",
          tabBarIcon: ({ color }) => <Search size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}