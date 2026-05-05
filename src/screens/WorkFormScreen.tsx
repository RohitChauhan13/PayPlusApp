import React, { useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { DateField } from '../components/DateField';
import { Header } from '../components/Header';
import { TextField } from '../components/TextField';
import { createWork, updateWork } from '../api/payplus';
import { PaymentType, WorkInput } from '../api/types';
import { AppStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/layout';
import { emptyQuantities, fieldLabel, WORK_FIELDS, WorkField } from '../utils/workFields';
import { todayIso } from '../utils/format';

type Props = NativeStackScreenProps<AppStackParamList, 'WorkForm'>;

const toNumber = (value: string) => {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const PAYMENT_TYPE_STORAGE_KEY = 'payplus.defaultPaymentTypes.v3';

const cashPaymentTypes = () =>
  WORK_FIELDS.reduce(
    (acc, field) => ({ ...acc, [field]: 'cash' as PaymentType }),
    {} as Record<WorkField, PaymentType>
  );

const parseSavedPaymentTypes = (raw: string | null) => {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<Record<WorkField, PaymentType>>;
    return WORK_FIELDS.reduce((acc, field) => {
      const savedType = parsed[field];
      return {
        ...acc,
        [field]: savedType === 'online' || savedType === 'cash' ? savedType : 'cash'
      };
    }, {} as Record<WorkField, PaymentType>);
  } catch {
    return null;
  }
};

export function WorkFormScreen({ navigation, route }: Props) {
  const { token } = useAuth();
  const entry = route.params?.entry;
  const isEditing = Boolean(entry);
  const initialQuantities = useMemo(() => {
    const base = emptyQuantities(entry ? '0' : '');
    if (!entry) return base;
    WORK_FIELDS.forEach((field) => {
      base[field] = String(entry[field] ?? '0');
    });
    return base;
  }, [entry]);
  const initialPaymentTypes = useMemo(() => {
    if (!entry) return cashPaymentTypes();

    const base = WORK_FIELDS.reduce(
      (acc, field) => ({ ...acc, [field]: (entry?.[`${field}_payment_type`] || 'cash') as PaymentType }),
      {} as Record<WorkField, PaymentType>
    );
    return base;
  }, [entry]);

  const [startDate, setStartDate] = useState(entry?.start_date || todayIso());
  const [endDate, setEndDate] = useState(entry?.end_date || todayIso());
  const [quantities, setQuantities] = useState<Record<WorkField, string>>(initialQuantities);
  const [paymentTypes, setPaymentTypes] = useState<Record<WorkField, PaymentType>>(initialPaymentTypes);
  const [salaryAmount, setSalaryAmount] = useState(entry ? String(entry.salary_amount ?? '0') : '');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (entry) return;

    let cancelled = false;

    const restorePaymentTypes = async () => {
      const saved = await AsyncStorage.getItem(PAYMENT_TYPE_STORAGE_KEY);
      const nextTypes = parseSavedPaymentTypes(saved) ?? cashPaymentTypes();
      if (!saved) {
        await AsyncStorage.setItem(PAYMENT_TYPE_STORAGE_KEY, JSON.stringify(nextTypes));
      }
      if (!cancelled) {
        setPaymentTypes(nextTypes);
      }
    };

    restorePaymentTypes();

    return () => {
      cancelled = true;
    };
  }, [entry]);

  const setField = (field: WorkField, value: string) => {
    setQuantities((current) => ({ ...current, [field]: value.replace(/[^0-9.]/g, '') }));
  };

  const setPaymentType = (field: WorkField, paymentType: PaymentType) => {
    setPaymentTypes((current) => {
      const next = { ...current, [field]: paymentType };
      AsyncStorage.setItem(PAYMENT_TYPE_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const payload = (): WorkInput => ({
    start_date: startDate,
    end_date: endDate,
    salary_amount: toNumber(salaryAmount),
    ...WORK_FIELDS.reduce(
      (acc, field) => ({
        ...acc,
        [field]: toNumber(quantities[field]),
        [`${field}_payment_type`]: paymentTypes[field]
      }),
      {} as Omit<WorkInput, 'start_date' | 'end_date' | 'salary_amount'>
    )
  });

  const submit = async () => {
    if (!token) return;
    if (!startDate || !endDate) {
      Alert.alert('Dates required', 'Start date and end date are required.');
      return;
    }
    setLoading(true);
    try {
      if (entry) {
        await updateWork(token, entry.id, payload());
      } else {
        await createWork(token, payload());
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Could not save entry', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={commonStyles.screen}>
      <Header title={isEditing ? 'Edit work' : 'New work'} subtitle="Enter quantities. Totals are calculated by the server rates." />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.dateRow}>
            <View style={{ flex: 1 }}>
              <DateField label="Start date" value={startDate} onChangeDate={setStartDate} />
            </View>
            <View style={{ flex: 1 }}>
              <DateField label="End date" value={endDate} onChangeDate={setEndDate} />
            </View>
          </View>
          <View style={styles.summaryBand}>
            <View style={styles.summaryIcon}>
              <Ionicons name="card-outline" size={22} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryTitle}>Payment split</Text>
              <Text style={styles.summaryCopy}>Online work gets 1% TDS deducted. Cash work stays full.</Text>
            </View>
          </View>
          <TextField
            label="Salaries"
            value={salaryAmount}
            onChangeText={(value) => setSalaryAmount(value.replace(/[^0-9.]/g, ''))}
            keyboardType="decimal-pad"
            placeholder="0"
          />
          <View style={styles.grid}>
            {WORK_FIELDS.map((field) => (
              <View key={field} style={styles.fieldCell}>
                <View style={styles.fieldHeader}>
                  <Text style={styles.fieldLabel} numberOfLines={1}>
                    {fieldLabel(field)}
                  </Text>
                  <View style={styles.modeDotWrap}>
                    <View style={[styles.modeDot, paymentTypes[field] === 'online' ? styles.onlineDot : styles.cashDot]} />
                    <Text style={styles.modeText}>{paymentTypes[field] === 'online' ? 'Online' : 'Cash'}</Text>
                  </View>
                </View>
                <TextInput
                  value={quantities[field]}
                  onChangeText={(value) => setField(field, value)}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor="#94A3B8"
                  style={styles.quantityInput}
                />
                <View style={styles.paymentToggle}>
                  {(['online', 'cash'] as const).map((paymentType) => {
                    const active = paymentTypes[field] === paymentType;
                    return (
                      <Pressable
                        key={paymentType}
                        onPress={() => setPaymentType(field, paymentType)}
                        style={[styles.paymentOption, active && styles.paymentOptionActive]}
                      >
                        <Ionicons
                          name={paymentType === 'online' ? 'card-outline' : 'cash-outline'}
                          size={14}
                          color={active ? colors.blue : colors.muted}
                        />
                        <Text style={[styles.paymentText, active && styles.paymentTextActive]}>
                          {paymentType === 'online' ? 'Online' : 'Cash'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
          <View style={styles.actions}>
            <Button title="Cancel" variant="secondary" onPress={() => navigation.goBack()} style={{ flex: 1 }} />
            <Button title={isEditing ? 'Save' : 'Create'} onPress={submit} loading={loading} icon="checkmark-circle-outline" style={{ flex: 1 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 16
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  fieldCell: {
    width: '48%',
    minWidth: 156,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDE7F0',
    padding: 12,
    gap: 10
  },
  fieldHeader: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  fieldLabel: {
    flex: 1,
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900'
  },
  modeDotWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  modeDot: {
    width: 7,
    height: 7,
    borderRadius: 99
  },
  onlineDot: {
    backgroundColor: colors.blue
  },
  cashDot: {
    backgroundColor: '#64748B'
  },
  modeText: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '900'
  },
  quantityInput: {
    minHeight: 48,
    borderRadius: 13,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    color: colors.ink,
    fontSize: 17,
    fontWeight: '800'
  },
  summaryBand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.blue,
    borderRadius: 16,
    padding: 16
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)'
  },
  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900'
  },
  summaryCopy: {
    color: '#DBEAFE',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4
  },
  paymentToggle: {
    flexDirection: 'row',
    gap: 6
  },
  paymentOption: {
    flex: 1,
    minHeight: 34,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surfaceSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5
  },
  paymentOptionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD'
  },
  paymentText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '900'
  },
  paymentTextActive: {
    color: colors.blue
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 20
  }
});
