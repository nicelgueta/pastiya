import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/lib/theme';
import { UNITS, type Unit } from '@/lib/types';

interface Props {
  value: Unit;
  onChange: (u: Unit) => void;
}

export function UnitPicker({ value, onChange }: Props) {
  const c = useColors();
  return (
    <View style={styles.wrap} accessibilityRole="radiogroup">
      {UNITS.map((u) => {
        const selected = u === value;
        return (
          <Pressable
            key={u}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`Unit ${u}`}
            onPress={() => onChange(u)}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? c.primary : c.card,
                borderColor: selected ? c.primary : c.border,
              },
            ]}>
            <Text style={{ color: selected ? c.onPrimary : c.text, fontWeight: '600' }}>{u}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1 },
});
