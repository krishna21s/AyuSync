import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Brand, Radius, Shadows, Spacing, Glass } from '@/constants/theme';
import { useLanguage } from '@/constants/i18n';

const { width: SW } = Dimensions.get('window');

const weeklyAdherence = [
  { day: 'Mon', taken: 4, missed: 0 }, { day: 'Tue', taken: 3, missed: 1 },
  { day: 'Wed', taken: 4, missed: 0 }, { day: 'Thu', taken: 2, missed: 2 },
  { day: 'Fri', taken: 4, missed: 0 }, { day: 'Sat', taken: 3, missed: 1 },
  { day: 'Sun', taken: 4, missed: 0 },
];
const maxV = 4;

const waterData = [
  { day: 'Mon', g: 7 }, { day: 'Tue', g: 5 }, { day: 'Wed', g: 8 }, { day: 'Thu', g: 6 },
  { day: 'Fri', g: 8 }, { day: 'Sat', g: 4 }, { day: 'Sun', g: 7 },
];
const maxW = 8;

const categories = [
  { name: 'Diabetes', pct: 30, color: Brand.primary },
  { name: 'BP', pct: 25, color: Brand.gray700 },
  { name: 'Supplements', pct: 30, color: Brand.gray400 },
  { name: 'Heart', pct: 15, color: Brand.gray300 },
];

const monthly = [
  { label: 'Medicines Taken', value: '168/180', pct: 93 },
  { label: 'Water Goal Met', value: '22/30 days', pct: 73 },
  { label: 'Routine Followed', value: '25/30 days', pct: 83 },
  { label: 'Doctor Visits', value: '2 completed', pct: 100 },
];

const stats = [
  { label: 'Adherence Rate', value: '92%', icon: 'trending-up' as const },
  { label: 'Current Streak', value: '12 days', icon: 'calendar' as const },
  { label: 'Today Taken', value: '4/6', icon: 'medkit' as const },
  { label: 'Avg Water/Day', value: '6.4', icon: 'water' as const },
];

export default function ReportsScreen() {
  const { t } = useLanguage();
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.titleRow}>
          <Ionicons name="stats-chart" size={20} color={Brand.gray700} />
          <Text style={s.pageTitle}>{t('Health Reports')}</Text>
        </View>
        <Text style={s.pageSub}>{t('Your health analytics & insights')}</Text>

        {/* Stats */}
        <View style={s.statsGrid}>
          {stats.map((st, i) => (
            <View key={i} style={s.statCard}>
              <View style={s.statIco}><Ionicons name={st.icon} size={16} color={Brand.gray500} /></View>
              <Text style={s.statVal}>{st.value}</Text>
              <Text style={s.statLbl}>{t(st.label)}</Text>
            </View>
          ))}
        </View>

        {/* Weekly Adherence */}
        <View style={s.glass}>
          <View style={s.cardHead}><Ionicons name="bar-chart-outline" size={16} color={Brand.gray500} /><Text style={s.cardT}>{t('Weekly Adherence')}</Text></View>
          <View style={s.barWrap}>
            {weeklyAdherence.map((d, i) => (
              <View key={i} style={s.barCol}>
                <View style={s.barStack}>
                  <View style={[s.barM, { height: (d.missed / maxV) * 100 }]} />
                  <View style={[s.barT, { height: (d.taken / maxV) * 100 }]} />
                </View>
                <Text style={s.barLbl}>{t(d.day)}</Text>
              </View>
            ))}
          </View>
          <View style={s.legRow}>
            <View style={s.legItem}><View style={[s.legDot, { backgroundColor: Brand.primary }]} /><Text style={s.legT}>{t('Taken')}</Text></View>
            <View style={s.legItem}><View style={[s.legDot, { backgroundColor: Brand.gray300 }]} /><Text style={s.legT}>{t('Missed')}</Text></View>
          </View>
        </View>

        {/* Water */}
        <View style={s.glass}>
          <View style={s.cardHead}><Ionicons name="water-outline" size={16} color={Brand.gray500} /><Text style={s.cardT}>{t('Water Intake Trend')}</Text></View>
          <View style={s.barWrap}>
            {waterData.map((d, i) => (
              <View key={i} style={s.barCol}>
                <View style={s.barStack}><View style={[s.barT, { height: (d.g / maxW) * 100 }]} /></View>
                <Text style={s.barLbl}>{t(d.day)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Categories */}
        <View style={s.glass}>
          <View style={s.cardHead}><Ionicons name="pie-chart-outline" size={16} color={Brand.gray500} /><Text style={s.cardT}>{t('Medicine Categories')}</Text></View>
          {categories.map((c, i) => (
            <View key={i} style={s.catRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[s.catDot, { backgroundColor: c.color }]} />
                <Text style={s.catName}>{c.name}</Text>
              </View>
              <Text style={s.catPct}>{c.pct}%</Text>
            </View>
          ))}
          <View style={s.catBar}>
            {categories.map((c, i) => <View key={i} style={[s.catSeg, { flex: c.pct, backgroundColor: c.color }]} />)}
          </View>
        </View>

        {/* Monthly */}
        <View style={s.glass}>
          <View style={s.cardHead}><Ionicons name="calendar-outline" size={16} color={Brand.gray500} /><Text style={s.cardT}>{t('Monthly Summary')}</Text></View>
          {monthly.map((m, i) => (
            <View key={i} style={s.sumRow}>
              <View style={s.sumTop}><Text style={s.sumLbl}>{t(m.label)}</Text><Text style={s.sumVal}>{m.value}</Text></View>
              <View style={s.sumBg}><View style={[s.sumFill, { width: `${m.pct}%` }]} /></View>
            </View>
          ))}
        </View>

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
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: { width: (SW - Spacing.lg * 2 - Spacing.sm) / 2 - 1, ...Glass.light, padding: Spacing.lg, ...Shadows.sm },
  statIco: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  statVal: { fontSize: 20, fontWeight: '800', color: Brand.gray900 },
  statLbl: { fontSize: 10, color: Brand.gray500, marginTop: 2 },
  glass: { ...Glass.light, padding: Spacing.xl, marginBottom: Spacing.lg, ...Shadows.sm },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.lg },
  cardT: { fontSize: 14, fontWeight: '700', color: Brand.gray900 },
  barWrap: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 110, marginBottom: Spacing.md },
  barCol: { alignItems: 'center', flex: 1 },
  barStack: { width: 22, justifyContent: 'flex-end', overflow: 'hidden', borderRadius: 6, height: 100 },
  barT: { backgroundColor: Brand.primary, borderRadius: 6 },
  barM: { backgroundColor: Brand.gray300, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  barLbl: { fontSize: 9, color: Brand.gray400, marginTop: 6, fontWeight: '500' },
  legRow: { flexDirection: 'row', gap: Spacing.lg, justifyContent: 'center' },
  legItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legDot: { width: 8, height: 8, borderRadius: 4 },
  legT: { fontSize: 11, color: Brand.gray500 },
  catRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  catDot: { width: 10, height: 10, borderRadius: 3 },
  catName: { fontSize: 13, color: Brand.gray700, fontWeight: '500' },
  catPct: { fontSize: 12, color: Brand.gray400, fontWeight: '600' },
  catBar: { flexDirection: 'row', height: 8, borderRadius: Radius.full, overflow: 'hidden', marginTop: 8, gap: 2 },
  catSeg: { borderRadius: Radius.full },
  sumRow: { marginBottom: Spacing.lg },
  sumTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  sumLbl: { fontSize: 12, fontWeight: '500', color: Brand.gray700 },
  sumVal: { fontSize: 12, color: Brand.gray400 },
  sumBg: { height: 6, backgroundColor: Brand.gray100, borderRadius: Radius.full, overflow: 'hidden' },
  sumFill: { height: '100%', backgroundColor: Brand.primary, borderRadius: Radius.full },
});
