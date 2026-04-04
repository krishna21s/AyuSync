import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Brand, Radius, Shadows, Spacing, Glass } from '@/constants/theme';
import { useLanguage } from '@/constants/i18n';

interface RoutineItem {
  id: number; time: string; label: string; icon: keyof typeof Ionicons.glyphMap;
  period: 'morning' | 'afternoon' | 'night'; completed: boolean; navigateTo?: string;
}

const initialRoutine: RoutineItem[] = [
  { id: 1, time: '6:00 AM', label: 'Wake Up & Hydrate', icon: 'sunny-outline', period: 'morning', completed: true },
  { id: 2, time: '6:30 AM', label: 'Morning Walk (20 min)', icon: 'walk-outline', period: 'morning', completed: true },
  { id: 3, time: '7:00 AM', label: 'Breakfast', icon: 'restaurant-outline', period: 'morning', completed: true },
  { id: 4, time: '8:00 AM', label: 'Morning Medicines', icon: 'medkit-outline', period: 'morning', completed: true },
  { id: 5, time: '10:00 AM', label: 'Light Exercise / Yoga', icon: 'fitness-outline', period: 'morning', completed: false, navigateTo: '/exercises' },
  { id: 6, time: '12:30 PM', label: 'Lunch (AI Meal Plan)', icon: 'restaurant-outline', period: 'afternoon', completed: false, navigateTo: '/meals' },
  { id: 7, time: '2:30 PM', label: 'Afternoon Medicine', icon: 'medkit-outline', period: 'afternoon', completed: false },
  { id: 8, time: '3:00 PM', label: 'Breathing Exercise', icon: 'leaf-outline', period: 'afternoon', completed: false },
  { id: 9, time: '5:00 PM', label: 'Tea / Light Snack', icon: 'cafe-outline', period: 'afternoon', completed: false },
  { id: 10, time: '6:00 PM', label: 'Evening Walk', icon: 'walk-outline', period: 'night', completed: false, navigateTo: '/exercises' },
  { id: 11, time: '7:30 PM', label: 'Dinner (AI Meal Plan)', icon: 'restaurant-outline', period: 'night', completed: false, navigateTo: '/meals' },
  { id: 12, time: '9:00 PM', label: 'Night Medicine', icon: 'medkit-outline', period: 'night', completed: false },
  { id: 13, time: '9:30 PM', label: 'Light Reading', icon: 'book-outline', period: 'night', completed: false },
  { id: 14, time: '10:00 PM', label: 'Sleep', icon: 'bed-outline', period: 'night', completed: false },
];

const periodCfg = {
  morning: { label: 'Morning', range: '6 AM – 12 PM', icon: 'sunny-outline' as const },
  afternoon: { label: 'Afternoon', range: '12 PM – 6 PM', icon: 'partly-sunny-outline' as const },
  night: { label: 'Night', range: '6 PM – 10 PM', icon: 'moon-outline' as const },
};

export default function RoutineScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const [routine, setRoutine] = useState(initialRoutine);
  const toggleComplete = (id: number) => setRoutine((p) => p.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r)));
  const completed = routine.filter((r) => r.completed).length;
  const pct = Math.round((completed / routine.length) * 100);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.titleRow}>
          <Ionicons name="calendar" size={20} color={Brand.gray700} />
          <Text style={s.pageTitle}>{t('Daily Routine')}</Text>
        </View>
        <Text style={s.pageSub}>{completed}/{routine.length} {t('tasks completed today')}</Text>

        {/* Progress */}
        <View style={s.progCard}>
          <View style={s.progHead}><Text style={s.progLbl}>{t("Today's Progress")}</Text><Text style={s.progPct}>{pct}%</Text></View>
          <View style={s.progBg}><View style={[s.progFill, { width: `${pct}%` }]} /></View>
          <View style={s.progFoot}><Text style={s.progFootT}>{completed} {t('completed')}</Text><Text style={s.progFootT}>{routine.length - completed} {t('remaining')}</Text></View>
        </View>

        {(['morning', 'afternoon', 'night'] as const).map((period) => {
          const items = routine.filter((r) => r.period === period);
          const cfg = periodCfg[period];
          return (
            <View key={period} style={s.section}>
              <View style={s.secHead}>
                <View style={s.icoBox}><Ionicons name={cfg.icon} size={16} color={Brand.gray500} /></View>
                <Text style={s.secTitle}>{t(cfg.label)}</Text>
                <Text style={s.secRange}>{cfg.range}</Text>
              </View>
              {items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[s.rItem, item.completed && s.rDone, item.navigateTo && s.rNav]}
                  onPress={() => item.navigateTo ? router.push(item.navigateTo as any) : toggleComplete(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={s.rLeft}>
                    <View style={[s.rIco, item.completed && s.rIcoDone]}>
                      {item.completed ? <Ionicons name="checkmark" size={16} color={Brand.primary} /> : <Ionicons name={item.icon} size={16} color={Brand.gray400} />}
                    </View>
                    <View>
                      <Text style={[s.rLabel, item.completed && s.rLabelDone]}>{t(item.label)}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Ionicons name="time-outline" size={11} color={Brand.gray300} />
                        <Text style={s.rTime}>{item.time}</Text>
                      </View>
                    </View>
                  </View>
                  {item.navigateTo ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                      <Text style={s.navT}>{t('Open')}</Text>
                      <Ionicons name="chevron-forward" size={14} color={Brand.primary} />
                    </View>
                  ) : (
                    <View style={[s.chk, item.completed && s.chkDone]}>
                      {item.completed && <Ionicons name="checkmark" size={10} color="#fff" />}
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: Brand.gray900 },
  pageSub: { fontSize: 13, color: Brand.gray500, marginBottom: Spacing.lg },
  progCard: { ...Glass.dark, padding: Spacing.xl, marginBottom: Spacing.xl },
  progHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  progLbl: { fontSize: 13, fontWeight: '500', color: '#fff' },
  progPct: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  progBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: Radius.full, overflow: 'hidden' },
  progFill: { height: '100%', backgroundColor: Brand.primary, borderRadius: Radius.full },
  progFoot: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  progFootT: { fontSize: 10, color: 'rgba(255,255,255,0.4)' },
  section: { marginBottom: Spacing.xxl },
  secHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md },
  icoBox: { width: 30, height: 30, borderRadius: 8, backgroundColor: Brand.gray100, alignItems: 'center', justifyContent: 'center' },
  secTitle: { fontSize: 15, fontWeight: '700', color: Brand.gray900 },
  secRange: { fontSize: 11, color: Brand.gray400, marginLeft: 4 },
  rItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...Glass.light, padding: Spacing.md, marginBottom: 6, ...Shadows.sm },
  rDone: { opacity: 0.6 },
  rNav: { borderColor: Brand.primary + '25' },
  rLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  rIco: { width: 34, height: 34, borderRadius: 8, backgroundColor: Brand.gray50, alignItems: 'center', justifyContent: 'center' },
  rIcoDone: { backgroundColor: Brand.primaryMuted },
  rLabel: { fontSize: 13, fontWeight: '600', color: Brand.gray900 },
  rLabelDone: { textDecorationLine: 'line-through', color: Brand.gray400 },
  rTime: { fontSize: 11, color: Brand.gray400 },
  navT: { fontSize: 10, fontWeight: '700', color: Brand.primary },
  chk: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: Brand.gray200, alignItems: 'center', justifyContent: 'center' },
  chkDone: { backgroundColor: Brand.primary, borderColor: Brand.primary },
});
