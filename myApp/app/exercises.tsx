import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Brand, Radius, Shadows, Spacing, Glass } from '@/constants/theme';
import { useLanguage } from '@/constants/i18n';

type ExCategory = 'all' | 'yoga' | 'walking' | 'stretching';
type ExPhase = 'warmup' | 'main' | 'cooldown';

interface Exercise {
  id: number; name: string; desc: string; duration: string; durationVal: number;
  reps?: string; difficulty: 'easy' | 'medium'; muscle: string;
  phase: ExPhase; category: ExCategory[]; steps: string[];
  icon: keyof typeof Ionicons.glyphMap; image: string;
}

const exercises: Exercise[] = [
  { id: 1, name: 'Neck Rotation', desc: 'Gentle neck mobility exercise', duration: '30s', durationVal: 30, reps: '10', difficulty: 'easy', muscle: 'Neck', phase: 'warmup', category: ['all', 'stretching'], icon: 'body-outline', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80', steps: ['Stand or sit straight', 'Slowly tilt head to the right', 'Rotate clockwise for 5 reps', 'Repeat anti-clockwise'] },
  { id: 2, name: 'Shoulder Stretch', desc: 'Upper body mobility warm-up', duration: '45s', durationVal: 45, reps: '8', difficulty: 'easy', muscle: 'Shoulders', phase: 'warmup', category: ['all', 'stretching', 'yoga'], icon: 'accessibility-outline', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80', steps: ['Stand with feet shoulder-width apart', 'Raise both arms above head', 'Interlock fingers and stretch upward', 'Hold for 5 seconds, release'] },
  { id: 3, name: 'Seated Forward Bend', desc: 'Flexibility and back stretch', duration: '60s', durationVal: 60, difficulty: 'medium', muscle: 'Back', phase: 'main', category: ['all', 'yoga'], icon: 'fitness-outline', image: 'https://images.unsplash.com/photo-1552196563-5564cd24840e?w=400&q=80', steps: ['Sit on a mat with legs straight', 'Inhale and raise your arms', 'Exhale and bend forward slowly', 'Try to touch your toes, hold 10 sec'] },
  { id: 4, name: 'Side Stretch', desc: 'Oblique and rib cage stretch', duration: '45s', durationVal: 45, reps: '6', difficulty: 'easy', muscle: 'Obliques', phase: 'main', category: ['all', 'stretching'], icon: 'body-outline', image: 'https://images.unsplash.com/photo-1562771379-eafdca7a02f8?w=400&q=80', steps: ['Stand straight, feet hip-width apart', 'Raise right arm above head', 'Bend gently to the left side', 'Hold 5 sec, switch sides'] },
  { id: 5, name: 'Ankle Rotation', desc: 'Joint mobility cooldown', duration: '30s', durationVal: 30, reps: '10', difficulty: 'easy', muscle: 'Ankles', phase: 'cooldown', category: ['all', 'stretching', 'walking'], icon: 'footsteps-outline', image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&q=80', steps: ['Sit in a chair comfortably', 'Lift right foot off the ground', 'Rotate ankle clockwise 10 times', 'Switch direction, then switch feet'] },
  { id: 6, name: 'Deep Breathing', desc: 'Relaxation and lung capacity', duration: '2 min', durationVal: 120, difficulty: 'easy', muscle: 'Lungs', phase: 'cooldown', category: ['all', 'yoga'], icon: 'leaf-outline', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80', steps: ['Sit cross-legged or in a chair', 'Close your eyes gently', 'Inhale deeply through nose (4 sec)', 'Hold breath (4 sec)', 'Exhale slowly through mouth (6 sec)', 'Repeat 8–10 times'] },
];

const tabs: { key: ExCategory; label: string }[] = [{ key: 'all', label: 'All' }, { key: 'yoga', label: 'Yoga' }, { key: 'walking', label: 'Walking' }, { key: 'stretching', label: 'Stretch' }];
const phases: { key: ExPhase; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'warmup', label: 'Warm Up', icon: 'flame-outline' },
  { key: 'main', label: 'Main Exercise', icon: 'flash-outline' },
  { key: 'cooldown', label: 'Cool Down', icon: 'refresh-outline' },
];

function WorkoutTimer({ totalSeconds, onComplete }: { totalSeconds: number; onComplete: () => void }) {
  const { t } = useLanguage();
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  useEffect(() => { if (!running || remaining <= 0) return; const id = setInterval(() => setRemaining((r) => r - 1), 1000); return () => clearInterval(id); }, [running, remaining]);
  useEffect(() => { if (remaining <= 0 && running) { setRunning(false); onComplete(); } }, [remaining, running]);
  const pct = ((totalSeconds - remaining) / totalSeconds) * 100;
  const mins = Math.floor(remaining / 60); const secs = remaining % 60;
  return (
    <View style={ts.wrap}>
      <View style={ts.ring}><Text style={ts.time}>{mins}:{secs.toString().padStart(2, '0')}</Text><Text style={ts.pctT}>{Math.round(pct)}%</Text></View>
      <TouchableOpacity style={[ts.btn, running && ts.btnR]} onPress={() => setRunning((r) => !r)}>
        <Ionicons name={running ? 'pause' : 'play'} size={16} color={running ? '#fff' : Brand.primaryForeground} />
        <Text style={[ts.btnT, running && { color: '#fff' }]}>{running ? t('Pause') : remaining < totalSeconds ? t('Resume') : t('Start')}</Text>
      </TouchableOpacity>
    </View>
  );
}
const ts = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 12 },
  ring: { width: 88, height: 88, borderRadius: 44, borderWidth: 5, borderColor: Brand.primary, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(200,255,0,0.05)' },
  time: { fontSize: 18, fontWeight: '800', color: Brand.gray900 },
  pctT: { fontSize: 9, fontWeight: '600', color: Brand.gray400 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 22, paddingVertical: 10, borderRadius: Radius.md, backgroundColor: Brand.primary },
  btnR: { backgroundColor: Brand.cardDark },
  btnT: { fontSize: 13, fontWeight: '700', color: Brand.primaryForeground },
});

export default function ExercisesScreen() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<ExCategory>('all');
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null);
  const filtered = exercises.filter((e) => e.category.includes(tab));
  const markDone = useCallback((id: number) => setCompleted((p) => new Set([...p, id])), []);
  const totalDur = exercises.reduce((s, e) => s + e.durationVal, 0);
  const doneDur = exercises.filter((e) => completed.has(e.id)).reduce((s, e) => s + e.durationVal, 0);
  const pct = Math.round((doneDur / totalDur) * 100);

  return (
    <View style={st.container}>
      <ScrollView style={st.scroll} contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>
        {/* Progress */}
        <View style={st.progCard}>
          <View style={st.progH}><Text style={st.progL}>{t('Workout Progress')}</Text><Text style={st.progP}>{pct}%</Text></View>
          <View style={st.progBg}><View style={[st.progF, { width: `${pct}%` }]} /></View>
          <View style={st.progFt}><Text style={st.progFtT}>{completed.size}/{exercises.length} {t('completed')}</Text><Text style={st.progFtT}>{Math.round(totalDur / 60)} {t('min total')}</Text></View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.tabRow}>
          {tabs.map((tItem) => (
            <TouchableOpacity key={tItem.key} style={[st.chip, tab === tItem.key && st.chipA]} onPress={() => setTab(tItem.key)}>
              <Text style={[st.chipT, tab === tItem.key && st.chipTA]}>{t(tItem.label)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {phases.map((phase) => {
          const items = filtered.filter((e) => e.phase === phase.key);
          if (!items.length) return null;
          return (
            <View key={phase.key} style={st.sec}>
              <View style={st.secH}><View style={st.icoBox}><Ionicons name={phase.icon} size={16} color={Brand.gray500} /></View><Text style={st.secT}>{t(phase.label)}</Text></View>
              {items.map((ex) => {
                const done = completed.has(ex.id);
                return (
                  <TouchableOpacity key={ex.id} style={[st.exCard, done && st.exDone]} onPress={() => setSelectedEx(ex)} activeOpacity={0.7}>
                    <ImageBackground source={{ uri: ex.image }} style={st.exTop} imageStyle={{ borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl }}>
                      <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl }} />
                      <Ionicons name={ex.icon} size={28} color="rgba(255,255,255,0.8)" style={{ zIndex: 2 }} />
                      {done && <View style={st.exOverlay}><Ionicons name="checkmark-circle" size={36} color={Brand.primary} /></View>}
                      <View style={[st.diffB, ex.difficulty === 'easy' ? st.diffE : st.diffM]}>
                        <Text style={[st.diffT, { color: ex.difficulty === 'easy' ? Brand.green600 : Brand.orange700 }]}>{ex.difficulty === 'easy' ? t('EASY') : t('MEDIUM')}</Text>
                      </View>
                    </ImageBackground>
                    <View style={st.exBody}>
                      <Text style={st.exN}>{ex.name}</Text>
                      <Text style={st.exD}>{ex.desc}</Text>
                      <View style={st.exMeta}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}><Ionicons name="time-outline" size={11} color={Brand.gray500} /><Text style={st.exMetaT}>{ex.duration}</Text></View>
                        {ex.reps && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}><Ionicons name="refresh-outline" size={11} color={Brand.gray500} /><Text style={st.exMetaT}>{ex.reps} {t('reps')}</Text></View>}
                        <View style={st.muscleB}><Text style={st.muscleT}>{ex.muscle}</Text></View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
        <View style={{ height: 30 }} />
      </ScrollView>

      <Modal visible={!!selectedEx} transparent animationType="fade">
        {selectedEx && (
          <View style={st.mOverlay}>
            <View style={st.mCard}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={st.mHead}>
                  <Ionicons name={selectedEx.icon} size={44} color={Brand.gray400} />
                  <TouchableOpacity style={st.mClose} onPress={() => setSelectedEx(null)}><Ionicons name="close" size={18} color={Brand.gray600} /></TouchableOpacity>
                  <View style={[st.diffB, { position: 'absolute', top: 12, left: 12 }, selectedEx.difficulty === 'easy' ? st.diffE : st.diffM]}>
                    <Text style={[st.diffT, { color: selectedEx.difficulty === 'easy' ? Brand.green600 : Brand.orange700 }]}>{selectedEx.difficulty === 'easy' ? t('EASY') : t('MEDIUM')}</Text>
                  </View>
                </View>
                <View style={st.mBody}>
                  <Text style={st.mTitle}>{selectedEx.name}</Text>
                  <Text style={st.mDesc}>{selectedEx.desc}</Text>
                  <View style={st.mMetaRow}>
                    <View style={st.mMetaB}><Ionicons name="time-outline" size={12} color={Brand.gray500} /><Text style={st.mMetaT}>{selectedEx.duration}</Text></View>
                    {selectedEx.reps && <View style={st.mMetaB}><Ionicons name="refresh-outline" size={12} color={Brand.gray500} /><Text style={st.mMetaT}>{selectedEx.reps} {t('reps')}</Text></View>}
                    <View style={st.mMetaB}><Ionicons name="locate-outline" size={12} color={Brand.gray500} /><Text style={st.mMetaT}>{selectedEx.muscle}</Text></View>
                  </View>
                  <Text style={st.stepsLbl}>{t('STEPS')}</Text>
                  {selectedEx.steps.map((step, i) => (
                    <View key={i} style={st.stepRow}>
                      <View style={st.stepNum}><Text style={st.stepNumT}>{i + 1}</Text></View>
                      <Text style={st.stepT}>{step}</Text>
                    </View>
                  ))}
                  <View style={st.timerSec}>
                    <Text style={st.stepsLbl}>{t('TIMER')}</Text>
                    <WorkoutTimer totalSeconds={selectedEx.durationVal} onComplete={() => markDone(selectedEx.id)} />
                    {completed.has(selectedEx.id) && <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 12 }}><Ionicons name="checkmark-circle" size={18} color={Brand.green600} /><Text style={st.compT}>{t('Completed!')}</Text></View>}
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: Brand.background },
  scroll: { flex: 1 }, content: { padding: Spacing.lg },
  progCard: { ...Glass.dark, padding: Spacing.xl, marginBottom: Spacing.lg },
  progH: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  progL: { fontSize: 13, fontWeight: '500', color: '#fff' }, progP: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  progBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: Radius.full, overflow: 'hidden' },
  progF: { height: '100%', backgroundColor: Brand.primary, borderRadius: Radius.full },
  progFt: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }, progFtT: { fontSize: 10, color: 'rgba(255,255,255,0.4)' },
  tabRow: { marginBottom: Spacing.lg, flexGrow: 0 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.md, ...Glass.light, marginRight: 6, ...Shadows.sm },
  chipA: { backgroundColor: Brand.cardDark, borderColor: Brand.cardDark }, chipT: { fontSize: 12, fontWeight: '600', color: Brand.gray500 }, chipTA: { color: '#fff' },
  sec: { marginBottom: Spacing.xxl }, secH: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md },
  icoBox: { width: 30, height: 30, borderRadius: 8, backgroundColor: Brand.gray100, alignItems: 'center', justifyContent: 'center' },
  secT: { fontSize: 15, fontWeight: '700', color: Brand.gray900 },
  exCard: { ...Glass.light, marginBottom: Spacing.sm, overflow: 'hidden', ...Shadows.sm },
  exDone: { opacity: 0.55 },
  exTop: { height: 110, backgroundColor: Brand.gray50, alignItems: 'center', justifyContent: 'center', position: 'relative', borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl },
  exOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: Brand.primary + '35', alignItems: 'center', justifyContent: 'center', borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, zIndex: 5 },
  diffB: { position: 'absolute', top: 10, right: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  diffE: { backgroundColor: Brand.green100 }, diffM: { backgroundColor: Brand.orange100 },
  diffT: { fontSize: 8, fontWeight: '700', letterSpacing: 0.5 },
  exBody: { padding: Spacing.md },
  exN: { fontSize: 14, fontWeight: '700', color: Brand.gray900, marginBottom: 2 }, exD: { fontSize: 11, color: Brand.gray400, marginBottom: 8 },
  exMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 }, exMetaT: { fontSize: 10, color: Brand.gray500 },
  muscleB: { backgroundColor: Brand.gray50, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: Brand.gray100 }, muscleT: { fontSize: 9, color: Brand.gray400 },
  mOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: Spacing.lg },
  mCard: { backgroundColor: Brand.cardDark, borderWidth: 1, borderColor: Brand.cardDarkBorder, borderRadius: Radius.xl, maxHeight: '90%', ...Shadows.lg, padding: 0 },
  mHead: { height: 140, backgroundColor: Brand.gray50, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  mClose: { position: 'absolute', top: 12, right: 12, width: 30, height: 30, borderRadius: 10, backgroundColor: Brand.cardDark, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  mBody: { padding: Spacing.xxl },
  mTitle: { fontSize: 19, fontWeight: '800', color: Brand.gray900, marginBottom: 4 }, mDesc: { fontSize: 13, color: Brand.gray500, marginBottom: Spacing.lg },
  mMetaRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.xl },
  mMetaB: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Brand.gray50, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: Brand.gray100 },
  mMetaT: { fontSize: 11, color: Brand.gray500 },
  stepsLbl: { fontSize: 10, fontWeight: '700', color: Brand.gray400, letterSpacing: 1.5, marginBottom: Spacing.md, marginTop: 4 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: Brand.gray50, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 6, borderWidth: 1, borderColor: Brand.gray100 },
  stepNum: { width: 24, height: 24, borderRadius: 8, backgroundColor: Brand.primaryMuted, alignItems: 'center', justifyContent: 'center' },
  stepNumT: { fontSize: 11, fontWeight: '700', color: Brand.primary }, stepT: { fontSize: 13, color: Brand.gray700, flex: 1, lineHeight: 20 },
  timerSec: { marginTop: Spacing.xl, borderTopWidth: 1, borderTopColor: Brand.gray100, paddingTop: Spacing.xl },
  compT: { fontSize: 14, fontWeight: '600', color: Brand.green600 },
});
