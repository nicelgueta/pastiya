import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { computeDoseStatus } from '@/lib/doseStatus';
import { cancelNotification, scheduleAvailableNotification } from '@/lib/notifications';
import type { DoseLog, Medication, Unit } from '@/lib/types';

export interface NewMedication {
  name: string;
  amount: number;
  unit: Unit;
  minIntervalMs: number;
  maxDosesPer24h: number;
}

interface MedState {
  medications: Medication[];
  logs: DoseLog[];
  /** Pending "available again" notification id per medication id. */
  notificationIds: Record<string, string>;

  addMedication: (m: NewMedication) => void;
  removeMedication: (id: string) => void;
  logDose: (medicationId: string, takenAt?: number) => void;
  updateLog: (id: string, patch: { takenAt?: number; amount?: number }) => void;
  deleteLog: (id: string) => void;
}

export const STORE_VERSION = 1;

export const useMedStore = create<MedState>()(
  persist(
    (set, get) => {
      /**
       * Cancels the med's pending notification and, if it is currently blocked
       * (and has been taken), schedules a fresh one for availableAt.
       */
      const resync = async (medicationId: string) => {
        const { medications, logs, notificationIds } = get();
        await cancelNotification(notificationIds[medicationId]);

        const med = medications.find((m) => m.id === medicationId);
        let newId: string | null = null;
        if (med) {
          const times = logs.filter((l) => l.medicationId === medicationId).map((l) => l.takenAt);
          const status = computeDoseStatus(times, med, Date.now());
          if (status.availableAt !== null && status.availableAt > Date.now()) {
            newId = await scheduleAvailableNotification(
              med.name,
              med.amount,
              med.unit,
              status.availableAt,
            );
          }
        }
        set((s) => {
          const next = { ...s.notificationIds };
          if (newId) next[medicationId] = newId;
          else delete next[medicationId];
          return { notificationIds: next };
        });
      };

      return {
        medications: [],
        logs: [],
        notificationIds: {},

        addMedication: (m) =>
          set((s) => ({
            medications: [
              ...s.medications,
              { ...m, name: m.name.trim(), id: Crypto.randomUUID(), createdAt: Date.now() },
            ],
          })),

        removeMedication: (id) => {
          const pending = get().notificationIds[id];
          set((s) => {
            const ids = { ...s.notificationIds };
            delete ids[id];
            return { medications: s.medications.filter((m) => m.id !== id), notificationIds: ids };
          });
          void cancelNotification(pending);
        },

        logDose: (medicationId, takenAt = Date.now()) => {
          const med = get().medications.find((m) => m.id === medicationId);
          if (!med) return;
          const log: DoseLog = {
            id: Crypto.randomUUID(),
            medicationId,
            medicationName: med.name,
            amount: med.amount,
            unit: med.unit,
            takenAt,
          };
          set((s) => ({ logs: [...s.logs, log] }));
          void resync(medicationId);
        },

        updateLog: (id, patch) => {
          const existing = get().logs.find((l) => l.id === id);
          if (!existing) return;
          set((s) => ({ logs: s.logs.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
          void resync(existing.medicationId);
        },

        deleteLog: (id) => {
          const existing = get().logs.find((l) => l.id === id);
          if (!existing) return;
          set((s) => ({ logs: s.logs.filter((l) => l.id !== id) }));
          void resync(existing.medicationId);
        },
      };
    },
    {
      name: 'pastiya-store',
      version: STORE_VERSION,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        medications: s.medications,
        logs: s.logs,
        notificationIds: s.notificationIds,
      }),
      migrate: (persisted) => persisted as MedState,
    },
  ),
);
