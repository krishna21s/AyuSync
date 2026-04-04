import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Brand, Radius, Shadows, Spacing, Glass } from '@/constants/theme';
import { useLanguage } from '@/constants/i18n';

type Period = 'morning' | 'afternoon' | 'evening';
type Status = 'pending' | 'taken' | 'missed';
type Filter = 'all' | Status;

interface Medicine { id: number; name: string; dosage: string; period: Period; frequency: string; status: Status; category: string; }

const periodMeta = {
  morning: { label: 'Morning', range: '6–12 PM', icon: 'sunny-outline' as const },
  afternoon: { label: 'Afternoon', range: '12–6 PM', icon: 'partly-sunny-outline' as const },
  evening: { label: 'Evening', range: '6–10 PM', icon: 'moon-outline' as const },
};

const initialMeds: Medicine[] = [
  { id: 1, name: 'Metformin', dosage: '500mg', period: 'morning', frequency: 'Daily', status: 'taken', category: 'Diabetes' },
  { id: 2, name: 'Amlodipine', dosage: '5mg', period: 'afternoon', frequency: 'Daily', status: 'pending', category: 'Blood Pressure' },
  { id: 3, name: 'Vitamin D3', dosage: '1000 IU', period: 'evening', frequency: 'Daily', status: 'pending', category: 'Supplement' },
  { id: 4, name: 'Calcium', dosage: '500mg', period: 'evening', frequency: 'Daily', status: 'missed', category: 'Supplement' },
  { id: 5, name: 'Aspirin', dosage: '75mg', period: 'morning', frequency: 'Daily', status: 'taken', category: 'Heart' },
  { id: 6, name: 'Omeprazole', dosage: '20mg', period: 'morning', frequency: 'Daily', status: 'taken', category: 'Gastric' },
];

export default function MedicinesScreen() {
  const { t } = useLanguage();
  const [meds, setMeds] = useState(initialMeds);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', period: 'morning' as Period, frequency: 'Daily', category: '' });

  const markTaken = (id: number) => setMeds((p) => p.map((m) => (m.id === id ? { ...m, status: 'taken' as const } : m)));

  const addMedicine = () => {
    if (!newMed.name || !newMed.dosage) return;
    setMeds((p) => [...p, { id: Date.now(), ...newMed, status: 'pending' as const, category: newMed.category || 'General' }]);
    setNewMed({ name: '', dosage: '', period: 'morning', frequency: 'Daily', category: '' });
    setShowAdd(false);
  };

  const filtered = meds.filter((m) => (filter === 'all' || m.status === filter) && m.name.toLowerCase().includes(search.toLowerCase()));
  const taken = meds.filter((m) => m.status === 'taken').length;
  const pending = meds.filter((m) => m.status === 'pending').length;
  const missed = meds.filter((m) => m.status === 'missed').length;

  const filters: { key: Filter; label: string }[] = [{ key: 'all', label: 'All' }, { key: 'pending', label: 'Pending' }, { key: 'taken', label: 'Taken' }, { key: 'missed', label: 'Missed' }];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.headRow}>
          <View>
            <View style={s.titleRow}>
              <Ionicons name="medkit" size={20} color={Brand.gray700} />
              <Text style={s.pageTitle}>{t('Medicines')}</Text>
            </View>
            <Text style={s.pageSub}>{t('Track & manage your daily medications')}</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={() => setShowAdd(true)}>
            <Ionicons name="add" size={18} color={Brand.primaryForeground} />
            <Text style={s.addBtnT}>{t('Add')}</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          {[{ v: taken, l: 'Taken', ico: 'checkmark-circle' as const, c: Brand.green500 }, { v: pending, l: 'Pending', ico: 'time' as const, c: Brand.orange500 }, { v: missed, l: 'Missed', ico: 'close-circle' as const, c: Brand.red500 }].map((st, i) => (
            <View key={i} style={s.statCard}>
              <Text style={s.statNum}>{st.v}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Ionicons name={st.ico} size={12} color={st.c} />
                <Text style={s.statLbl}>{t(st.l)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Search */}
        <View style={s.searchBar}>
          <Ionicons name="search" size={16} color={Brand.gray400} />
          <TextInput style={s.searchIn} placeholder={t('Search medicines...')} placeholderTextColor={Brand.gray400} value={search} onChangeText={setSearch} />
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
          {filters.map((f) => (
            <TouchableOpacity key={f.key} style={[s.chip, filter === f.key && s.chipAct]} onPress={() => setFilter(f.key)}>
              <Text style={[s.chipT, filter === f.key && s.chipTAct]}>{t(f.label)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* List */}
        {filtered.map((med) => (
          <View key={med.id} style={s.medRow}>
            <View style={s.medLeft}>
              <View style={[s.medIco, med.status === 'taken' && { backgroundColor: Brand.green50 }, med.status === 'missed' && { backgroundColor: Brand.red50 }]}>
                <Ionicons name="medkit-outline" size={16} color={med.status === 'taken' ? Brand.green600 : med.status === 'missed' ? Brand.red500 : Brand.gray500} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.medName, med.status === 'taken' && { textDecorationLine: 'line-through', color: Brand.gray400 }]}>
                  {med.name} <Text style={s.medDose}>{med.dosage}</Text>
                </Text>
                <View style={s.metaRow}>
                  <Ionicons name={periodMeta[med.period].icon} size={12} color={Brand.gray400} />
                  <Text style={s.metaT}>{t(periodMeta[med.period].label)}</Text>
                  <View style={s.catBadge}><Text style={s.catT}>{t(med.category)}</Text></View>
                </View>
              </View>
            </View>
            {med.status === 'pending' && (
              <TouchableOpacity style={s.takenBtn} onPress={() => markTaken(med.id)}>
                <Ionicons name="checkmark" size={14} color={Brand.primaryForeground} />
                <Text style={s.takenBtnT}>{t('Taken')}</Text>
              </TouchableOpacity>
            )}
            {med.status === 'taken' && <View style={s.dBadge}><Ionicons name="checkmark" size={12} color={Brand.green600} /><Text style={s.dBadgeT}>{t('Done')}</Text></View>}
            {med.status === 'missed' && <View style={s.mBadge}><Text style={s.mBadgeT}>{t('Missed')}</Text></View>}
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showAdd} transparent animationType="fade">
        <View style={s.overlay}>
          <View style={s.modal}>
            <View style={s.modHead}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="add-circle" size={22} color={Brand.gray700} />
                <Text style={s.modTitle}>{t('Add Medicine')}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAdd(false)}><Ionicons name="close" size={20} color={Brand.gray400} /></TouchableOpacity>
            </View>
            <Text style={s.lbl}>{t('MEDICINE NAME')}</Text>
            <TextInput style={s.input} placeholder={t('e.g. Paracetamol')} placeholderTextColor={Brand.gray400} value={newMed.name} onChangeText={(t) => setNewMed({ ...newMed, name: t })} />
            <Text style={s.lbl}>{t('DOSAGE')}</Text>
            <TextInput style={s.input} placeholder={t('e.g. 500mg')} placeholderTextColor={Brand.gray400} value={newMed.dosage} onChangeText={(t) => setNewMed({ ...newMed, dosage: t })} />
            <Text style={s.lbl}>{t('WHEN TO TAKE')}</Text>
            <View style={s.periodRow}>
              {(['morning', 'afternoon', 'evening'] as const).map((p) => (
                <TouchableOpacity key={p} style={[s.periodBtn, newMed.period === p && s.periodAct]} onPress={() => setNewMed({ ...newMed, period: p })}>
                  <Ionicons name={periodMeta[p].icon} size={20} color={newMed.period === p ? Brand.gray900 : Brand.gray400} />
                  <Text style={[s.periodLbl, newMed.period === p && { color: Brand.gray900 }]}>{t(periodMeta[p].label)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={s.lbl}>{t('CATEGORY')}</Text>
            <TextInput style={s.input} placeholder={t('e.g. Heart')} placeholderTextColor={Brand.gray400} value={newMed.category} onChangeText={(t) => setNewMed({ ...newMed, category: t })} />
            <TouchableOpacity style={[s.submitBtn, (!newMed.name || !newMed.dosage) && { opacity: 0.4 }]} onPress={addMedicine} disabled={!newMed.name || !newMed.dosage}>
              <Ionicons name="add" size={18} color={Brand.primaryForeground} />
              <Text style={s.submitBtnT}>{t('Add Medicine')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: Brand.gray900 },
  pageSub: { fontSize: 13, color: Brand.gray500 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Brand.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.md },
  addBtnT: { color: Brand.primaryForeground, fontWeight: '700', fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: { flex: 1, ...Glass.light, padding: Spacing.lg, alignItems: 'center', ...Shadows.sm },
  statNum: { fontSize: 22, fontWeight: '800', color: Brand.gray900 },
  statLbl: { fontSize: 10, color: Brand.gray500 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, ...Glass.light, paddingHorizontal: Spacing.md, marginBottom: Spacing.md, ...Shadows.sm },
  searchIn: { flex: 1, paddingVertical: 12, fontSize: 13, color: Brand.gray900 },
  filterScroll: { marginBottom: Spacing.lg, flexGrow: 0 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.md, ...Glass.light, marginRight: 6, ...Shadows.sm },
  chipAct: { backgroundColor: Brand.cardDark, borderColor: Brand.cardDark },
  chipT: { fontSize: 12, fontWeight: '600', color: Brand.gray500 },
  chipTAct: { color: '#fff' },
  medRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...Glass.light, padding: Spacing.md, marginBottom: 8, ...Shadows.sm },
  medLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  medIco: { width: 38, height: 38, borderRadius: Radius.md, backgroundColor: Brand.gray50, alignItems: 'center', justifyContent: 'center' },
  medName: { fontSize: 13, fontWeight: '600', color: Brand.gray900 },
  medDose: { color: Brand.gray400, fontWeight: '400' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  metaT: { fontSize: 11, color: Brand.gray400 },
  catBadge: { backgroundColor: Brand.gray50, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1, borderColor: Brand.gray100 },
  catT: { fontSize: 9, color: Brand.gray400 },
  takenBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Brand.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.sm },
  takenBtnT: { color: Brand.primaryForeground, fontSize: 12, fontWeight: '700' },
  dBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Brand.green50, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.sm },
  dBadgeT: { color: Brand.green600, fontSize: 11, fontWeight: '600' },
  mBadge: { backgroundColor: Brand.red50, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.sm },
  mBadgeT: { color: Brand.red500, fontSize: 11, fontWeight: '600' },
  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: Spacing.lg },
  modal: { backgroundColor: Brand.cardDark, borderWidth: 1, borderColor: Brand.cardDarkBorder, borderRadius: Radius.xl, padding: Spacing.xxl, ...Shadows.lg },
  modHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  modTitle: { fontSize: 17, fontWeight: '700', color: Brand.gray900 },
  lbl: { fontSize: 10, fontWeight: '700', color: Brand.gray500, letterSpacing: 1, marginBottom: 6, marginTop: Spacing.md },
  input: { backgroundColor: Brand.gray50, borderRadius: Radius.md, borderWidth: 1, borderColor: Brand.gray200, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, fontSize: 13, color: Brand.gray900 },
  periodRow: { flexDirection: 'row', gap: 8 },
  periodBtn: { flex: 1, alignItems: 'center', padding: Spacing.md, borderRadius: Radius.md, borderWidth: 2, borderColor: Brand.gray100, backgroundColor: Brand.gray50, gap: 4 },
  periodAct: { borderColor: Brand.primary, backgroundColor: Brand.primaryMuted },
  periodLbl: { fontSize: 10, fontWeight: '600', color: Brand.gray500 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Brand.primary, borderRadius: Radius.md, paddingVertical: 14, marginTop: Spacing.xl },
  submitBtnT: { color: Brand.primaryForeground, fontWeight: '700', fontSize: 14 },
});
