import { Tabs } from 'expo-router';
import React from 'react';

import { CurvedTabBar } from '@/components/CurvedTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CurvedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="medicines" />
      <Tabs.Screen name="routine" />
      <Tabs.Screen name="reports" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
