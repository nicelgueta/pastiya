import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { ConfirmModal } from '@/components/ConfirmModal';
import { Fab } from '@/components/Fab';
import { MedicationRow } from '@/components/MedicationRow';
import { useNow } from '@/hooks/useNow';
import { useColors } from '@/lib/theme';
import type { Medication } from '@/lib/types';
import { useMedStore } from '@/store/useMedStore';

export default function MedicationsScreen() {
  const c = useColors();
  const router = useRouter();
  const now = useNow(1000);
  const medications = useMedStore((s) => s.medications);
  const logs = useMedStore((s) => s.logs);
  const logDose = useMedStore((s) => s.logDose);
  const removeMedication = useMedStore((s) => s.removeMedication);
  const [toRemove, setToRemove] = useState<Medication | null>(null);

  const timesByMed = useMemo(() => {
    const map = new Map<string, number[]>();
    for (const l of logs) {
      const arr = map.get(l.medicationId);
      if (arr) arr.push(l.takenAt);
      else map.set(l.medicationId, [l.takenAt]);
    }
    return map;
  }, [logs]);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <FlatList
        data={medications}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={Separator}
        renderItem={({ item }) => (
          <MedicationRow
            med={item}
            takenTimes={timesByMed.get(item.id) ?? EMPTY}
            now={now}
            onLog={logDose}
            onRemove={setToRemove}
          />
        )}
      />
      <Fab label="Add medication" onPress={() => router.push('/add-medication')} />
      <ConfirmModal
        visible={toRemove !== null}
        title={`Remove ${toRemove?.name ?? ''}?`}
        message="Your dose history will be kept."
        confirmLabel="Remove"
        destructive
        onCancel={() => setToRemove(null)}
        onConfirm={() => {
          if (toRemove) removeMedication(toRemove.id);
          setToRemove(null);
        }}
      />
    </View>
  );
}

const EMPTY: number[] = [];
const Separator = () => <View style={{ height: 12 }} />;

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingBottom: 110 },
});
