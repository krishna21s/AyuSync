import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Brand, Radius, Shadows, Spacing, Glass } from '@/constants/theme';
import { useLanguage } from '@/constants/i18n';

type MealPeriod = 'breakfast' | 'lunch' | 'snacks' | 'dinner';

interface MealItem { id: number; name: string; qty: string; kcal: number; tags: string[]; period: MealPeriod; icon: keyof typeof Ionicons.glyphMap; image: string; }

const meals: MealItem[] = [
  { id: 1, name: 'Idli & Chutney', qty: '3 idli + chutney', kcal: 250, tags: ['Diabetes-safe', 'Easy Digest'], period: 'breakfast', icon: 'restaurant-outline', image: 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b0?w=300&q=80' },
  { id: 2, name: 'Oats Porridge', qty: '1 bowl + fruits', kcal: 180, tags: ['Heart-healthy', 'Energy'], period: 'breakfast', icon: 'nutrition-outline', image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=300&q=80' },
  { id: 3, name: 'Rice & Dal', qty: '1 cup rice + dal', kcal: 420, tags: ['Diabetes-safe', 'Energy'], period: 'lunch', icon: 'restaurant-outline', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&q=80' },
  { id: 4, name: 'Chapati & Sabzi', qty: '2 chapati + veggies', kcal: 350, tags: ['Heart-healthy', 'BP-safe'], period: 'lunch', icon: 'leaf-outline', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&q=80' },
  { id: 5, name: 'Fruit Bowl', qty: 'Mixed seasonal fruits', kcal: 120, tags: ['Immunity', 'Easy Digest'], period: 'snacks', icon: 'nutrition-outline', image: 'https://images.unsplash.com/photo-1490474504059-bf2db5ab2348?w=300&q=80' },
  { id: 6, name: 'Dry Fruits Mix', qty: 'Handful assorted', kcal: 160, tags: ['Bone Health', 'Energy'], period: 'snacks', icon: 'heart-outline', image: 'https://images.unsplash.com/photo-1599598425947-3300262b7ae1?w=300&q=80' },
  { id: 7, name: 'Khichdi', qty: '1 bowl + curd', kcal: 320, tags: ['Easy Digest', 'BP-safe'], period: 'dinner', icon: 'restaurant-outline', image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=300&q=80' },
  { id: 8, name: 'Warm Milk + Turmeric', qty: '1 glass', kcal: 100, tags: ['Sleep Aid', 'Bone Health'], period: 'dinner', icon: 'cafe-outline', image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=300&q=80' },
];

const periodCfg: { key: MealPeriod; label: string; time: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'breakfast', label: 'Breakfast', time: '7:00 – 8:30 AM', icon: 'sunny-outline' },
  { key: 'lunch', label: 'Lunch', time: '12:30 – 1:30 PM', icon: 'restaurant-outline' },
  { key: 'snacks', label: 'Snacks', time: '4:00 – 5:00 PM', icon: 'nutrition-outline' },
  { key: 'dinner', label: 'Dinner', time: '7:30 – 8:30 PM', icon: 'moon-outline' },
];

const nutriSummary = [
  { label: 'Calories', value: '1,900', pct: 85, color: Brand.primary },
  { label: 'Protein', value: '62g', pct: 78, color: Brand.gray700 },
  { label: 'Carbs', value: '260g', pct: 72, color: Brand.gray400 },
  { label: 'Fiber', value: '28g', pct: 93, color: Brand.green500 },
];

export default function MealsScreen() {
  const { t } = useLanguage();
  const totalKcal = meals.reduce((s, m) => s + m.kcal, 0);

  return (
    <View style={s.container}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* AI Banner */}
        <View style={s.aiBanner}>
          <View style={s.aiRow}>
            <View style={s.aiIcoBox}><Ionicons name="sparkles" size={20} color={Brand.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.aiText}>{t('Your meals are personalized based on your health conditions — Diabetes, BP, and supplements.')}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
                <Ionicons name="sparkles-outline" size={12} color="rgba(255,255,255,0.4)" />
                <Text style={s.aiMeta}>{totalKcal} {t('kcal · AI-personalized')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Nutrition Summary */}
        <View style={s.glass}>
          <View style={s.cardHead}><Ionicons name="flame-outline" size={16} color={Brand.gray500} /><Text style={s.cardT}>{t('Nutrition Summary')}</Text></View>
          <View style={s.nutriGrid}>
            {nutriSummary.map((n, i) => (
              <View key={i} style={s.nutriItem}>
                <Text style={s.nutriVal}>{n.value}</Text>
                <Text style={s.nutriLbl}>{t(n.label)}</Text>
                <View style={s.nutriBg}><View style={[s.nutriFill, { width: `${n.pct}%`, backgroundColor: n.color }]} /></View>
              </View>
            ))}
          </View>
        </View>

        {/* Meal Periods */}
        {periodCfg.map((period) => {
          const pm = meals.filter((m) => m.period === period.key);
          return (
            <View key={period.key} style={s.sec}>
              <View style={s.secH}>
                <View style={s.icoBox}><Ionicons name={period.icon} size={16} color={Brand.gray500} /></View>
                <View>
                  <Text style={s.secT}>{t(period.label)}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 }}>
                    <Ionicons name="time-outline" size={10} color={Brand.gray400} />
                    <Text style={s.secTime}>{period.time}</Text>
                  </View>
                </View>
              </View>
              {pm.map((meal) => (
                <View key={meal.id} style={s.mealCard}>
                  <Image source={{ uri: meal.image }} style={s.mealIco} resizeMode="cover" />
                  <View style={s.mealContent}>
                    <View style={s.mealNameRow}>
                      <Text style={s.mealName}>{meal.name}</Text>
                      <View style={s.kcalB}><Text style={s.kcalT}>{meal.kcal} kcal</Text></View>
                    </View>
                    <Text style={s.mealQty}>{meal.qty}</Text>
                    <View style={s.tagsRow}>
                      {meal.tags.map((tag, i) => (
                        <View key={i} style={s.tagB}><Text style={s.tagT}>{tag}</Text></View>
                      ))}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          );
        })}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Brand.background },
  scroll: { flex: 1 }, content: { padding: Spacing.lg },
  aiBanner: { ...Glass.dark, padding: Spacing.xl, marginBottom: Spacing.lg },
  aiRow: { flexDirection: 'row', gap: Spacing.md },
  aiIcoBox: { width: 40, height: 40, borderRadius: Radius.md, backgroundColor: Brand.primary + '30', alignItems: 'center', justifyContent: 'center' },
  aiText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 20 },
  aiMeta: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  glass: { ...Glass.light, padding: Spacing.xl, marginBottom: Spacing.lg, ...Shadows.sm },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.lg },
  cardT: { fontSize: 14, fontWeight: '700', color: Brand.gray900 },
  icoBox: { width: 30, height: 30, borderRadius: 8, backgroundColor: Brand.gray100, alignItems: 'center', justifyContent: 'center' },
  nutriGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  nutriItem: { flex: 1, alignItems: 'center' },
  nutriVal: { fontSize: 16, fontWeight: '800', color: Brand.gray900 }, nutriLbl: { fontSize: 9, color: Brand.gray400, marginBottom: 6 },
  nutriBg: { width: '75%', height: 3, backgroundColor: Brand.gray100, borderRadius: Radius.full, overflow: 'hidden' },
  nutriFill: { height: '100%', borderRadius: Radius.full },
  sec: { marginBottom: Spacing.xxl },
  secH: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: Spacing.md },
  secT: { fontSize: 15, fontWeight: '700', color: Brand.gray900 }, secTime: { fontSize: 10, color: Brand.gray400 },
  mealCard: { flexDirection: 'row', ...Glass.light, marginBottom: Spacing.md, borderRadius: Radius.xl, overflow: 'hidden', ...Shadows.sm },
  mealIco: { width: 90, height: '100%', backgroundColor: Brand.gray50 },
  mealContent: { flex: 1, padding: Spacing.md },
  mealNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
  mealName: { fontSize: 14, fontWeight: '700', color: Brand.gray900, flex: 1 },
  kcalB: { backgroundColor: Brand.gray50, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: Brand.gray100, marginLeft: 8 },
  kcalT: { fontSize: 10, fontWeight: '600', color: Brand.gray400 },
  mealQty: { fontSize: 11, color: Brand.gray400, marginBottom: 8 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tagB: { backgroundColor: Brand.gray50, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: Brand.gray100 },
  tagT: { fontSize: 9, fontWeight: '500', color: Brand.gray500 },
});
