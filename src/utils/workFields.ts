export const WORK_FIELDS = [
  'awak',
  'jawak',
  'dock_awak',
  'dock_jawak',
  'jawak_varning',
  'dock_jawak_varning',
  'c_box',
  'panni',
  'potti_3',
  'potty_5',
  'potti_10',
  'solapur',
  'kishan_DA',
  'other'
] as const;

export type WorkField = (typeof WORK_FIELDS)[number];

const LABELS: Record<WorkField, string> = {
  awak: 'Awak',
  jawak: 'Jawak',
  dock_awak: 'Dock Awak',
  dock_jawak: 'Dock Jawak',
  jawak_varning: 'Jawak Varning',
  dock_jawak_varning: 'Dock Jawak Varning',
  c_box: 'Check Box',
  panni: 'Panni',
  potti_3: 'Potti 3',
  potty_5: 'Potti 5',
  potti_10: 'Potti 10',
  solapur: 'Solapur',
  kishan_DA: 'Kishan DA',
  other: 'Other'
};

export const fieldLabel = (field: WorkField) => LABELS[field];

export const emptyQuantities = (defaultValue = '0') =>
  WORK_FIELDS.reduce(
    (acc, field) => ({
      ...acc,
      [field]: defaultValue
    }),
    {} as Record<WorkField, string>
  );
