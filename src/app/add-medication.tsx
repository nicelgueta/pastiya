import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UnitPicker } from '@/components/UnitPicker';
import { parseDecimal, parseWhole } from '@/lib/format';
import { useColors } from '@/lib/theme';
import type { Unit } from '@/lib/types';
import { useMedStore } from '@/store/useMedStore';

export default function AddMedicationScreen() {
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addMedication = useMedStore((s) => s.addMedication);

  const [name, setName] = useState('');
  const [amountText, setAmountText] = useState('');
  const [unit, setUnit] = useState<Unit>('mg');
  const [hoursText, setHoursText] = useState('');
  const [minutesText, setMinutesText] = useState('');
  const [maxText, setMaxText] = useState('');

  const amount = parseDecimal(amountText);
  const hours = hoursText.trim() === '' ? 0 : parseWhole(hoursText);
  const minutes = minutesText.trim() === '' ? 0 : parseWhole(minutesText);
  const intervalMin = hours * 60 + minutes;
  const maxDoses = parseWhole(maxText);

  const errors = {
    name: name.trim() === '' ? 'Name is required' : null,
    amount: !(amount > 0) ? 'Enter an amount greater than 0' : null,
    interval: !(intervalMin > 0) ? 'Enter a time greater than 0' : null,
    max: !(Number.isInteger(maxDoses) && maxDoses >= 1) ? 'Enter a whole number, 1 or more' : null,
  };
  const valid = Object.values(errors).every((e) => e === null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (k: string) => setTouched((t) => ({ ...t, [k]: true }));

  const save = () => {
    if (!valid) return;
    addMedication({
      name: name.trim(),
      amount,
      unit,
      minIntervalMs: intervalMin * 60_000,
      maxDosesPer24h: maxDoses,
    });
    router.back();
  };

  const inputStyle = (err: string | null, key: string) => [
    styles.input,
    { color: c.text, backgroundColor: c.card, borderColor: err && touched[key] ? c.danger : c.border },
  ];
  const err = (e: string | null, key: string) =>
    e && touched[key] ? <Text style={[styles.error, { color: c.danger }]}>{e}</Text> : null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 24 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic">
        <Text style={[styles.label, { color: c.text }]}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          onBlur={() => touch('name')}
          placeholder="e.g. Ibuprofen"
          placeholderTextColor={c.muted}
          accessibilityLabel="Medication name"
          style={inputStyle(errors.name, 'name')}
        />
        {err(errors.name, 'name')}

        <Text style={[styles.label, { color: c.text }]}>Dosage amount</Text>
        <TextInput
          value={amountText}
          onChangeText={setAmountText}
          onBlur={() => touch('amount')}
          placeholder="e.g. 500"
          placeholderTextColor={c.muted}
          keyboardType="decimal-pad"
          accessibilityLabel="Dosage amount"
          style={inputStyle(errors.amount, 'amount')}
        />
        {err(errors.amount, 'amount')}

        <Text style={[styles.label, { color: c.text }]}>Unit</Text>
        <UnitPicker value={unit} onChange={setUnit} />

        <Text style={[styles.label, { color: c.text }]}>Minimum time between doses</Text>
        <View style={styles.row}>
          <TextInput
            value={hoursText}
            onChangeText={setHoursText}
            onBlur={() => touch('interval')}
            placeholder="0"
            placeholderTextColor={c.muted}
            keyboardType="number-pad"
            accessibilityLabel="Hours between doses"
            style={[inputStyle(errors.interval, 'interval'), styles.small]}
          />
          <Text style={{ color: c.text }}>h</Text>
          <TextInput
            value={minutesText}
            onChangeText={setMinutesText}
            onBlur={() => touch('interval')}
            placeholder="0"
            placeholderTextColor={c.muted}
            keyboardType="number-pad"
            accessibilityLabel="Minutes between doses"
            style={[inputStyle(errors.interval, 'interval'), styles.small]}
          />
          <Text style={{ color: c.text }}>min</Text>
        </View>
        {err(errors.interval, 'interval')}

        <Text style={[styles.label, { color: c.text }]}>Max doses per 24 hours</Text>
        <TextInput
          value={maxText}
          onChangeText={setMaxText}
          onBlur={() => touch('max')}
          placeholder="e.g. 4"
          placeholderTextColor={c.muted}
          keyboardType="number-pad"
          accessibilityLabel="Maximum doses per 24 hours"
          style={inputStyle(errors.max, 'max')}
        />
        {err(errors.max, 'max')}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !valid }}
          disabled={!valid}
          onPress={save}
          style={[styles.save, { backgroundColor: valid ? c.primary : c.disabled }]}>
          <Text style={[styles.saveText, { color: valid ? c.onPrimary : c.onDisabled }]}>Save</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 8 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  small: { width: 80, textAlign: 'center' },
  error: { fontSize: 12 },
  save: { marginTop: 24, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveText: { fontSize: 17, fontWeight: '700' },
});
