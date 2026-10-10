import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { formatAmount, parseDecimal } from '@/lib/format';
import { useColors } from '@/lib/theme';
import type { DoseLog } from '@/lib/types';

interface Props {
  log: DoseLog | null;
  onSave: (id: string, patch: { takenAt: number; amount: number }) => void;
  onCancel: () => void;
}

export function EditDoseModal({ log, onSave, onCancel }: Props) {
  return (
    <Modal visible={log !== null} transparent animationType="fade" onRequestClose={onCancel}>
      {log && <EditBody key={log.id} log={log} onSave={onSave} onCancel={onCancel} />}
    </Modal>
  );
}

function EditBody({ log, onSave, onCancel }: { log: DoseLog; onSave: Props['onSave']; onCancel: () => void }) {
  const c = useColors();
  const [date, setDate] = useState(new Date(log.takenAt));
  const [amountText, setAmountText] = useState(formatAmount(log.amount));
  const amount = parseDecimal(amountText);
  const valid = amount > 0;

  return (
    <View style={[styles.backdrop, { backgroundColor: c.overlay }]}>
      <View style={[styles.card, { backgroundColor: c.card }]} accessibilityViewIsModal>
        <Text style={[styles.title, { color: c.text }]}>Edit {log.medicationName}</Text>

        <Text style={[styles.label, { color: c.muted }]}>Time taken</Text>
        <View style={styles.pickerRow}>
          <DateTimePicker
            value={date}
            mode="datetime"
            display="compact"
            onValueChange={(_e, d) => setDate(d)}
          />
        </View>

        <Text style={[styles.label, { color: c.muted }]}>Amount ({log.unit})</Text>
        <TextInput
          value={amountText}
          onChangeText={setAmountText}
          keyboardType="decimal-pad"
          accessibilityLabel="Amount"
          style={[styles.input, { color: c.text, borderColor: valid ? c.border : c.danger }]}
        />

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={onCancel}
            style={[styles.btn, { borderColor: c.border, borderWidth: 1 }]}>
            <Text style={[styles.btnText, { color: c.text }]}>Cancel</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !valid }}
            disabled={!valid}
            onPress={() => onSave(log.id, { takenAt: date.getTime(), amount })}
            style={[styles.btn, { backgroundColor: valid ? c.primary : c.disabled }]}>
            <Text style={[styles.btnText, { color: valid ? c.onPrimary : c.onDisabled }]}>Save</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', padding: 24 },
  card: { borderRadius: 16, padding: 20, gap: 8 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  label: { fontSize: 13, marginTop: 8 },
  pickerRow: { flexDirection: 'row' },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: '600' },
});
