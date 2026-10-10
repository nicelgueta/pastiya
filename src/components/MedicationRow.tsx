import * as Haptics from 'expo-haptics';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { computeDoseStatus } from '@/lib/doseStatus';
import {
  formatDosage,
  formatElapsed,
  formatRemaining,
  formatRemainingSpoken,
} from '@/lib/format';
import { useColors } from '@/lib/theme';
import type { Medication } from '@/lib/types';

interface Props {
  med: Medication;
  /** Taken timestamps of this medication's logs. */
  takenTimes: number[];
  now: number;
  onLog: (id: string) => void;
  onRemove: (med: Medication) => void;
}

function MedicationRowBase({ med, takenTimes, now, onLog, onRemove }: Props) {
  const c = useColors();
  const status = computeDoseStatus(takenTimes, med, now);
  const blocked = status.state === 'blocked';
  const timerColor =
    status.state === 'never' ? c.neutral : blocked ? c.danger : c.success;

  const remainingMs = blocked && status.availableAt !== null ? status.availableAt - now : 0;
  const timerText = formatElapsed(status.elapsedMs);
  const a11y =
    status.state === 'never'
      ? 'Never taken'
      : blocked
        ? `Available in ${formatRemainingSpoken(remainingMs)}`
        : 'Available now';

  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={styles.top}>
        <View style={styles.info}>
          <Text style={[styles.name, { color: c.text }]} numberOfLines={2}>
            {med.name}
          </Text>
          <Text style={[styles.dose, { color: c.muted }]}>{formatDosage(med.amount, med.unit)}</Text>
        </View>
        <View style={styles.timerWrap} accessible accessibilityLabel={a11y}>
          <Text style={[styles.timer, { color: timerColor }]}>{timerText}</Text>
          {blocked && (
            <Text style={[styles.avail, { color: c.danger }]}>
              available in {formatRemaining(remainingMs)}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Log dose of ${med.name}`}
          accessibilityState={{ disabled: blocked }}
          disabled={blocked}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onLog(med.id);
          }}
          style={[styles.btn, { backgroundColor: blocked ? c.disabled : c.primary }]}>
          <Text style={[styles.btnText, { color: blocked ? c.onDisabled : c.onPrimary }]}>Log</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${med.name}`}
          onPress={() => onRemove(med)}
          style={[styles.btn, { borderColor: c.danger, borderWidth: 1 }]}>
          <Text style={[styles.btnText, { color: c.danger }]}>Remove</Text>
        </Pressable>
      </View>
    </View>
  );
}

export const MedicationRow = memo(MedicationRowBase);

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  top: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 18, fontWeight: '700' },
  dose: { fontSize: 15 },
  timerWrap: { alignItems: 'flex-end', justifyContent: 'center' },
  timer: { fontSize: 20, fontWeight: '700', fontVariant: ['tabular-nums'] },
  avail: { fontSize: 12, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  btnText: { fontSize: 15, fontWeight: '600' },
});
