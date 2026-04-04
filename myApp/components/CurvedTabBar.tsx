import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Brand, Shadows } from '@/constants/theme';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useLanguage } from '@/constants/i18n';

/* ── Tab icon mapping ── */
const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  index: { active: 'home', inactive: 'home-outline' },
  medicines: { active: 'medkit', inactive: 'medkit-outline' },
  routine: { active: 'calendar', inactive: 'calendar-outline' },
  reports: { active: 'stats-chart', inactive: 'stats-chart-outline' },
  settings: { active: 'settings', inactive: 'settings-outline' },
};

const TAB_LABELS: Record<string, string> = {
  index: 'Home',
  medicines: 'Meds',
  routine: 'Routine',
  reports: 'Reports',
  settings: 'Settings',
};

export function CurvedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { t } = useLanguage();

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const icons = TAB_ICONS[route.name] || TAB_ICONS.index;
          const label = TAB_LABELS[route.name] || route.name;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <Ionicons
                name={focused ? icons.active : icons.inactive}
                size={22}
                color={focused ? Brand.tabActive : Brand.tabInactive}
              />
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                {t(label as any)}
              </Text>
              {focused && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.tabBarBg,
    borderRadius: 32,
    height: 64,
    paddingHorizontal: 8,
    width: '100%',
    ...Shadows.lg,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: Brand.tabInactive,
    marginTop: 2,
  },
  tabLabelActive: {
    color: Brand.tabActive,
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: Brand.tabActive,
  },
});
