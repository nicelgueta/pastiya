export const UNITS = ['mg', 'g', 'mcg', 'ml', 'IU', 'tablet', 'capsule', 'drop', 'puff', 'unit'] as const;
export type Unit = (typeof UNITS)[number];

export interface Medication {
  id: string;
  name: string;
  amount: number;
  unit: Unit;
  /** Minimum time between doses, in ms. */
  minIntervalMs: number;
  /** Maximum number of doses in any rolling 24h window. */
  maxDosesPer24h: number;
  createdAt: number;
}

export interface DoseLog {
  id: string;
  medicationId: string;
  /** Snapshot of the medication name at the time of logging. */
  medicationName: string;
  /** Snapshot of the dosage at the time of logging. */
  amount: number;
  unit: Unit;
  takenAt: number;
}
