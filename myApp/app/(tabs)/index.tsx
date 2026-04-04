import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Animated, Dimensions, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Brand, Radius, Shadows, Spacing } from '@/constants/theme';
import { useLanguage } from '@/constants/i18n';

const { width: SW } = Dimensions.get('window');

/* ──── Mock ──── */
const upcomingMeds = [
  { id: 1, name: 'Metformin', dosage: '500mg', time: '8:00 AM', status: 'taken' as const },
  { id: 2, name: 'Amlodipine', dosage: '5mg', time: '2:30 PM', status: 'pending' as const },
  { id: 3, name: 'Vitamin D3', dosage: '1000 IU', time: '9:00 PM', status: 'pending' as const },
  { id: 4, name: 'Calcium', dosage: '500mg', time: '9:00 PM', status: 'missed' as const },
];

const aiTips = [
  'Take Metformin after breakfast for better absorption.',
  'Your blood pressure readings look great this week!',
  'Consider a 15-min evening walk to improve sleep quality.',
];

const timelineItems = [
  { time: '6:00', label: 'Wake Up', icon: 'sunny-outline' as const, done: true, current: false },
  { time: '6:30', label: 'Walk', icon: 'walk-outline' as const, done: true, current: false },
  { time: '8:00', label: 'Meds', icon: 'medkit-outline' as const, done: true, current: false },
  { time: '12:30', label: 'Lunch', icon: 'restaurant-outline' as const, done: false, current: false },
  { time: '2:30', label: 'Meds', icon: 'medkit-outline' as const, done: false, current: true },
  { time: '5:00', label: 'Exercise', icon: 'fitness-outline' as const, done: false, current: false },
  { time: '9:00', label: 'Meds', icon: 'medkit-outline' as const, done: false, current: false },
  { time: '10:00', label: 'Sleep', icon: 'bed-outline' as const, done: false, current: false },
];

export default function HomeScreen() {
  const { t } = useLanguage();
  const [meds, setMeds] = useState(upcomingMeds);
  const [waterGlasses, setWaterGlasses] = useState(4);
  const waterTotal = 8;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const markTaken = (id: number) => {
    setMeds((p) => p.map((m) => (m.id === id ? { ...m, status: 'taken' as const } : m)));
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  const takenCount = meds.filter((m) => m.status === 'taken').length;
  const streakDays = 12;
  const streakGoal = 30;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <Animated.View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xl }, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View>
            <Text style={s.greeting}>{t(greeting as any)}, Yunus</Text>
            <Text style={[s.subGreeting, { marginBottom: 0 }]}>{t("Here's your health summary for today")}</Text>
          </View>
          <TouchableOpacity onPress={() => {}}>
            <Image 
              source={{ uri: 'https://i.pravatar.cc/150?u=yunus' }} 
              style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: Brand.primary }} 
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Hero */}
        <LinearGradient
          colors={['rgba(200,255,0,0.18)', Brand.cardDark, Brand.cardDark]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <View style={s.heroBadge}>
            <Ionicons name="sparkles" size={14} color={Brand.primary} />
            <Text style={s.heroBadgeText}>{t("Today's Plan")}</Text>
          </View>
          <Text style={s.heroTitle}>{t("Stay on track with")}{'\n'}{t("your health goals")}</Text>

          <View style={s.heroRow}>
            <View style={[s.heroStat, { backgroundColor: Brand.primary }]}>
              <Ionicons name="time-outline" size={20} color={Brand.primaryForeground} />
              <Text style={[s.heroStatLabel, { color: Brand.primaryForeground + 'AA' }]}>{t("Next Med")}</Text>
              <Text style={[s.heroStatVal, { color: Brand.primaryForeground }]}>2:30 PM</Text>
            </View>
            <View style={s.heroStatGlass}>
              <Ionicons name="water-outline" size={20} color="rgba(255,255,255,0.7)" />
              <Text style={[s.heroStatLabel, { color: 'rgba(255,255,255,0.45)' }]}>{t("Water")}</Text>
              <Text style={s.heroStatValW}>{waterGlasses}/{waterTotal}</Text>
            </View>
            <View style={s.heroStatGlass}>
              <Ionicons name="walk-outline" size={20} color="rgba(255,255,255,0.7)" />
              <Text style={[s.heroStatLabel, { color: 'rgba(255,255,255,0.45)' }]}>{t("Activity")}</Text>
              <Text style={s.heroStatValW}>Walk</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Medicine Schedule */}
        <LinearGradient colors={['rgba(35,35,55,1)', Brand.cardDark]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={s.glassCard}>
          <View style={s.cardHead}>
            <View style={s.iconBox}><Ionicons name="medkit" size={18} color={Brand.gray600} /></View>
            <Text style={s.cardTitle}>{t("Medicine Schedule")}</Text>
            <View style={s.pill}><Text style={s.pillText}>{takenCount}/{meds.length} {t("taken")}</Text></View>
          </View>
          {meds.map((med) => (
            <View key={med.id} style={[s.medRow, med.status === 'taken' && s.medDone, med.status === 'missed' && s.medMissed]}>
              <View style={s.medLeft}>
                <View style={[s.medIco, med.status === 'taken' && { backgroundColor: Brand.green50 }, med.status === 'missed' && { backgroundColor: Brand.red50 }]}>
                  <Ionicons name="medkit-outline" size={16} color={med.status === 'taken' ? Brand.green600 : med.status === 'missed' ? Brand.red500 : Brand.gray500} />
                </View>
                <View>
                  <Text style={[s.medName, med.status === 'taken' && { textDecorationLine: 'line-through', color: Brand.gray400 }]}>
                    {med.name} <Text style={s.medDose}>{med.dosage}</Text>
                  </Text>
                  <Text style={s.medTime}>{med.time}</Text>
                </View>
              </View>
              {med.status === 'pending' && (
                <TouchableOpacity style={s.takenBtn} onPress={() => markTaken(med.id)}>
                  <Ionicons name="checkmark" size={14} color={Brand.primaryForeground} />
                  <Text style={s.takenBtnT}>{t("Taken")}</Text>
                </TouchableOpacity>
              )}
              {med.status === 'taken' && (
                <View style={s.dBadge}><Ionicons name="checkmark" size={12} color={Brand.green600} /><Text style={s.dBadgeT}>Done</Text></View>
              )}
              {med.status === 'missed' && (
                <View style={s.mBadge}><Text style={s.mBadgeT}>Missed</Text></View>
              )}
            </View>
          ))}
        </LinearGradient>

        {/* Streak + Water */}
        <View style={s.twoCol}>
          <LinearGradient colors={['rgba(35,35,55,1)', Brand.cardDark]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={[s.glassCard, { flex: 1 }]}>
            <View style={s.centerHead}>
              <Ionicons name="flame" size={18} color={Brand.gray600} />
              <Text style={s.cardTitleSm}>{t('Streak')}</Text>
            </View>
            <View style={s.ringWrap}>
              <View style={s.ring}>
                <Text style={s.ringNum}>{streakDays}</Text>
                <Text style={s.ringLbl}>{t('DAYS')}</Text>
              </View>
            </View>
            <View style={s.goalRow}>
              <Ionicons name="flag" size={12} color={Brand.gray400} />
              <Text style={s.goalText}>{streakGoal - streakDays} {t('to goal')}</Text>
            </View>
          </LinearGradient>

          <LinearGradient colors={['rgba(35,35,55,1)', Brand.cardDark]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={[s.glassCard, { flex: 1 }]}>
            <View style={s.centerHead}>
              <Ionicons name="water" size={18} color={Brand.gray600} />
              <Text style={s.cardTitleSm}>{t('Water')}</Text>
              <View style={s.pillSm}><Text style={s.pillSmT}>{waterGlasses}/{waterTotal}</Text></View>
            </View>
            <View style={s.waterGrid}>
              {Array.from({ length: waterTotal }).map((_, i) => (
                <View key={i} style={[s.wGlass, i < waterGlasses ? s.wFilled : s.wEmpty]}>
                  <Ionicons name="water" size={14} color={i < waterGlasses ? Brand.primary : Brand.gray300} />
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={[s.addWBtn, waterGlasses >= waterTotal && { opacity: 0.4 }]}
              onPress={() => setWaterGlasses((g) => Math.min(g + 1, waterTotal))}
              disabled={waterGlasses >= waterTotal}
            >
              <Ionicons name="add" size={18} color={Brand.primaryForeground} />
              <Text style={s.addWBtnT}>{t('Add Glass')}</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* AI Suggestions */}
        <LinearGradient colors={['rgba(35,35,55,1)', Brand.cardDark]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={s.glassCard}>
          <View style={s.cardHead}>
            <View style={s.iconBox}><Ionicons name="sparkles" size={18} color={Brand.gray600} /></View>
            <Text style={s.cardTitle}>{t("AI Suggestions")}</Text>
          </View>
          {aiTips.map((tip, i) => (
            <View key={i} style={s.tipBubble}>
              <Ionicons name="bulb-outline" size={16} color={Brand.gray400} style={{ marginTop: 1 }} />
              <Text style={s.tipText}>{tip}</Text>
            </View>
          ))}
        </LinearGradient>

        {/* Timeline */}
        <LinearGradient colors={['rgba(35,35,55,1)', Brand.cardDark]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={s.glassCard}>
          <View style={s.cardHead}>
            <View style={s.iconBox}><Ionicons name="calendar" size={18} color={Brand.gray600} /></View>
            <Text style={s.cardTitle}>{t("Today's Timeline")}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {timelineItems.map((t, i) => (
              <View key={i} style={[s.tlItem, t.current && s.tlCurrent, t.done && s.tlDone]}>
                <View style={[s.tlIco, t.current && { backgroundColor: Brand.primaryMuted }, t.done && { backgroundColor: Brand.gray100 }]}>
                  <Ionicons name={t.icon} size={16} color={t.current ? Brand.primaryForeground : t.done ? Brand.gray700 : Brand.gray400} />
                </View>
                <Text style={[s.tlTime, t.current && { color: Brand.primaryForeground }]}>{t.time}</Text>
                <Text style={[s.tlLabel, t.current && { color: Brand.primaryForeground }]}>{t.label}</Text>
              </View>
            ))}
          </ScrollView>
        </LinearGradient>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg },
  greeting: { fontSize: 26, fontWeight: '800', color: Brand.gray900, letterSpacing: -0.5 },
  subGreeting: { fontSize: 13, color: Brand.gray500, marginTop: 4, marginBottom: Spacing.xl },
  // Hero
  hero: {
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Brand.primary + '50',
    ...Shadows.glow
  },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', marginBottom: Spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  heroBadgeText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '500' },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: Spacing.xl, lineHeight: 28 },
  heroRow: { flexDirection: 'row', gap: Spacing.sm },
  heroStat: { flex: 1, borderRadius: Radius.lg, padding: Spacing.md, gap: 4, ...Shadows.md },
  heroStatGlass: { flex: 1, borderRadius: Radius.lg, padding: Spacing.md, gap: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  heroStatLabel: { fontSize: 10, fontWeight: '500' },
  heroStatVal: { fontSize: 16, fontWeight: '800' },
  heroStatValW: { fontSize: 16, fontWeight: '800', color: '#fff' },
  // Glass Card
  glassCard: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Brand.primary + '30',
    ...Shadows.glow
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg, gap: 8 },
  centerHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm, gap: 6 },
  iconBox: { width: 34, height: 34, borderRadius: Radius.sm, backgroundColor: Brand.gray100, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Brand.gray900, flex: 1 },
  cardTitleSm: { fontSize: 13, fontWeight: '700', color: Brand.gray900 },
  pill: { backgroundColor: Brand.gray100, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  pillText: { fontSize: 11, color: Brand.gray500, fontWeight: '500' },
  pillSm: { backgroundColor: Brand.gray100, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  pillSmT: { fontSize: 10, color: Brand.gray500, fontWeight: '500' },
  // Med row
  medRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, borderRadius: Radius.md, marginBottom: 6, borderWidth: 1, borderColor: Brand.gray100, backgroundColor: Brand.gray50 },
  medDone: { backgroundColor: Brand.gray50, borderColor: Brand.gray100 },
  medMissed: { backgroundColor: Brand.red50 + '60', borderColor: Brand.red100 + '60' },
  medLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  medIco: { width: 34, height: 34, borderRadius: Radius.sm, backgroundColor: Brand.gray50, alignItems: 'center', justifyContent: 'center' },
  medName: { fontSize: 13, fontWeight: '600', color: Brand.gray900 },
  medDose: { color: Brand.gray400, fontWeight: '400' },
  medTime: { fontSize: 11, color: Brand.gray400, marginTop: 1 },
  takenBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Brand.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.sm },
  takenBtnT: { color: Brand.primaryForeground, fontSize: 12, fontWeight: '700' },
  dBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Brand.green50, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.sm },
  dBadgeT: { color: Brand.green600, fontSize: 11, fontWeight: '600' },
  mBadge: { backgroundColor: Brand.red50, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.sm },
  mBadgeT: { color: Brand.red500, fontSize: 11, fontWeight: '600' },
  // Two col
  twoCol: { flexDirection: 'row', gap: Spacing.md },
  // Streak
  ringWrap: { alignItems: 'center', marginVertical: Spacing.md },
  ring: { width: 88, height: 88, borderRadius: 44, borderWidth: 5, borderColor: Brand.primary, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(200,255,0,0.05)' },
  ringNum: { fontSize: 24, fontWeight: '800', color: Brand.gray900 },
  ringLbl: { fontSize: 9, color: Brand.gray400, fontWeight: '700', letterSpacing: 1 },
  goalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 4 },
  goalText: { fontSize: 11, color: Brand.gray500 },
  // Water
  waterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: Spacing.sm },
  wGlass: { width: 30, height: 36, borderRadius: 6, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  wFilled: { backgroundColor: Brand.primaryMuted, borderColor: Brand.primary + '40' },
  wEmpty: { backgroundColor: Brand.gray50, borderColor: Brand.gray100 },
  addWBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: Brand.primary, borderRadius: Radius.md, paddingVertical: 9, marginTop: Spacing.xs },
  addWBtnT: { color: Brand.primaryForeground, fontWeight: '700', fontSize: 12 },
  // Tips
  tipBubble: { flexDirection: 'row', gap: 10, backgroundColor: Brand.gray50, borderRadius: Radius.md, borderBottomLeftRadius: 4, padding: Spacing.md, marginBottom: 6, borderWidth: 1, borderColor: Brand.gray100 },
  tipText: { fontSize: 13, color: Brand.gray700, lineHeight: 20, flex: 1 },
  // Timeline
  tlItem: { alignItems: 'center', padding: 12, borderRadius: Radius.lg, minWidth: 88, marginRight: 8, borderWidth: 1, borderColor: Brand.gray100, backgroundColor: Brand.gray50 },
  tlCurrent: { backgroundColor: Brand.primary, borderColor: Brand.primary + '40', ...Shadows.md },
  tlDone: { backgroundColor: Brand.gray50, borderColor: Brand.gray100 },
  tlIco: { width: 34, height: 34, borderRadius: 8, backgroundColor: Brand.gray50, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  tlTime: { fontSize: 10, fontWeight: '600', color: Brand.gray400 },
  tlLabel: { fontSize: 11, fontWeight: '500', color: Brand.gray700, marginTop: 2 },
});
