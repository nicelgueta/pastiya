import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';

import { ConfirmModal } from '@/components/ConfirmModal';
import { EditDoseModal } from '@/components/EditDoseModal';
import { dayKey, formatDayTitle, formatDosage, formatTime } from '@/lib/format';
import { useColors } from '@/lib/theme';
import type { DoseLog } from '@/lib/types';
import { useMedStore } from '@/store/useMedStore';

interface Section {
  title: string;
  data: DoseLog[];
}

export default function HistoryScreen() {
  const c = useColors();
  const logs = useMedStore((s) => s.logs);
  const updateLog = useMedStore((s) => s.updateLog);
  const deleteLog = useMedStore((s) => s.deleteLog);
  const [editing, setEditing] = useState<DoseLog | null>(null);
  const [deleting, setDeleting] = useState<DoseLog | null>(null);

  const sections = useMemo<Section[]>(() => {
    const sorted = [...logs].sort((a, b) => b.takenAt - a.takenAt);
    const byDay = new Map<string, Section>();
    for (const l of sorted) {
      const key = dayKey(l.takenAt);
      let sec = byDay.get(key);
      if (!sec) {
        sec = { title: formatDayTitle(l.takenAt), data: [] };
        byDay.set(key, sec);
      }
      sec.data.push(l);
    }
    return [...byDay.values()];
  }, [logs]);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <SectionList
        sections={sections}
        keyExtractor={(l) => l.id}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: c.muted }]}>No doses logged yet</Text>
        }
        renderSectionHeader={({ section }) => (
          <Text style={[styles.header, { color: c.muted }]}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <View style={[styles.row, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.time, { color: c.text }]}>{formatTime(item.takenAt)}</Text>
            <View style={styles.info}>
              <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
                {item.medicationName}
              </Text>
              <Text style={{ color: c.muted }}>{formatDosage(item.amount, item.unit)}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Edit ${item.medicationName} dose`}
              hitSlop={8}
              onPress={() => setEditing(item)}>
              <Ionicons name="pencil" size={20} color={c.primary} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Delete ${item.medicationName} dose`}
              hitSlop={8}
              onPress={() => setDeleting(item)}>
              <Ionicons name="trash-outline" size={20} color={c.danger} />
            </Pressable>
          </View>
        )}
      />
      <EditDoseModal
        log={editing}
        onCancel={() => setEditing(null)}
        onSave={(id, patch) => {
          updateLog(id, patch);
          setEditing(null);
        }}
      />
      <ConfirmModal
        visible={deleting !== null}
        title="Delete this dose?"
        message={
          deleting
            ? `${deleting.medicationName} at ${formatTime(deleting.takenAt)} will be removed from your history.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteLog(deleting.id);
          setDeleting(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, flexGrow: 1 },
  empty: { textAlign: 'center', marginTop: 48, fontSize: 16 },
  header: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginTop: 16, marginBottom: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  time: { fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'], minWidth: 62 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600' },
});
