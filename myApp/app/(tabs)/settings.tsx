import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Brand, Radius, Shadows, Spacing, Glass } from '@/constants/theme';
import { useLanguage } from '@/constants/i18n';

interface Toggle { id: string; label: string; desc: string; icon: keyof typeof Ionicons.glyphMap; enabled: boolean; }

export default function SettingsScreen() {
  const { t, setLanguage, lang } = useLanguage();

  const [toggles, setToggles] = useState<Toggle[]>([
    { id: 'notifications', label: 'Push Notifications', desc: 'Get reminders for medicines', icon: 'notifications-outline', enabled: true },
    { id: 'sound', label: 'Sound Alerts', desc: 'Play sound with reminders', icon: 'volume-high-outline', enabled: true },
    { id: 'darkmode', label: 'Dark Mode', desc: 'Switch to dark theme', icon: 'moon-outline', enabled: false },
    { id: 'vibration', label: 'Vibration', desc: 'Vibrate on reminder', icon: 'phone-portrait-outline', enabled: true },
    { id: 'telugu', label: 'Telugu (తెలుగు)', desc: 'Enable Telugu language', icon: 'language-outline', enabled: lang === 'te' },
  ]);

  const toggle = (id: string) => setToggles((p) => p.map((tx) => {
    if (tx.id === id) {
      const next = !tx.enabled;
      if (id === 'telugu') {
        setLanguage(next ? 'te' : 'en');
      }
      return { ...tx, enabled: next };
    }
    return tx;
  }));

  const menu: { label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: 'Edit Profile', icon: 'person-outline' },
    { label: 'Language Preferences', icon: 'globe-outline' },
    { label: 'Medication Schedule', icon: 'time-outline' },
    { label: 'Privacy & Security', icon: 'shield-outline' },
    { label: 'Emergency Contacts', icon: 'heart-outline' },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.titleRow}>
          <Ionicons name="settings" size={20} color={Brand.gray700} />
          <Text style={s.pageTitle}>{t('Settings')}</Text>
        </View>
        <Text style={s.pageSub}>{t('Manage your preferences')}</Text>

        {/* Profile */}
        <View style={s.profile}>
          <View style={s.avatar}>
            <Text style={s.avatarInit}>Y</Text>
          </View>
          <View>
            <Text style={s.profName}>Yunus</Text>
            <Text style={s.profEmail}>yunus@example.com</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <Ionicons name="heart" size={12} color={Brand.primary} />
              <Text style={s.profPlan}>{t('Premium Health Plan')}</Text>
            </View>
          </View>
        </View>

        {/* Quick Settings */}
        <View style={s.glass}>
          <Text style={s.secLbl}>{t('QUICK SETTINGS')}</Text>
          {toggles.map((tx) => (
            <TouchableOpacity key={tx.id} style={s.togRow} onPress={() => toggle(tx.id)} activeOpacity={0.7}>
              <View style={s.togLeft}>
                <View style={s.togIco}><Ionicons name={tx.icon} size={18} color={Brand.gray500} /></View>
                <View>
                  <Text style={s.togLbl}>{t(tx.label as any)}</Text>
                  <Text style={s.togDesc}>{t(tx.desc as any)}</Text>
                </View>
              </View>
              <View style={[s.swTrack, tx.enabled && s.swTrackOn]}>
                <View style={[s.swThumb, tx.enabled && s.swThumbOn]} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Account */}
        <View style={s.glass}>
          <Text style={s.secLbl}>{t('ACCOUNT')}</Text>
          {menu.map((m, i) => (
            <TouchableOpacity key={i} style={s.menuRow} activeOpacity={0.7}>
              <View style={s.menuLeft}>
                <View style={s.togIco}><Ionicons name={m.icon} size={18} color={Brand.gray500} /></View>
                <Text style={s.menuLbl}>{t(m.label as any)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Brand.gray300} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={() => Alert.alert('Sign Out', 'Are you sure?')}>
          <Ionicons name="log-out-outline" size={18} color={Brand.red500} />
          <Text style={s.logoutT}>{t('Sign Out')}</Text>
        </TouchableOpacity>

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
  // Profile
  profile: { ...Glass.dark, padding: Spacing.xxl, flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginBottom: Spacing.lg },
  avatar: { width: 52, height: 52, borderRadius: Radius.lg, backgroundColor: Brand.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Brand.primary + '60' },
  avatarInit: { fontSize: 20, fontWeight: '800', color: Brand.primaryForeground },
  profName: { fontSize: 17, fontWeight: '700', color: '#fff' },
  profEmail: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  profPlan: { fontSize: 11, color: Brand.primary, fontWeight: '600' },
  // Cards
  glass: { ...Glass.light, padding: 6, marginBottom: Spacing.lg, ...Shadows.sm },
  secLbl: { fontSize: 10, fontWeight: '700', color: Brand.gray400, letterSpacing: 1.2, paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: 8 },
  // Toggle
  togRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.md, paddingHorizontal: Spacing.md, borderRadius: Radius.md },
  togLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  togIco: { width: 34, height: 34, borderRadius: 8, backgroundColor: Brand.gray100, alignItems: 'center', justifyContent: 'center' },
  togLbl: { fontSize: 13, fontWeight: '600', color: Brand.gray900 },
  togDesc: { fontSize: 11, color: Brand.gray400, marginTop: 1 },
  swTrack: { width: 44, height: 24, borderRadius: 12, backgroundColor: Brand.gray200, padding: 2, justifyContent: 'center' },
  swTrackOn: { backgroundColor: Brand.primary },
  swThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', ...Shadows.sm },
  swThumbOn: { transform: [{ translateX: 20 }] },
  // Menu
  menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.md, paddingHorizontal: Spacing.md, borderRadius: Radius.md },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  menuLbl: { fontSize: 13, fontWeight: '600', color: Brand.gray900 },
  // Logout
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, ...Glass.light, paddingVertical: Spacing.lg, ...Shadows.sm },
  logoutT: { fontSize: 14, fontWeight: '600', color: Brand.red500 },
});
