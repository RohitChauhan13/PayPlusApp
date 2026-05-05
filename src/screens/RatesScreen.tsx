import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { getRates, updateRates } from '../api/payplus';
import { Rates } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/layout';
import { fieldLabel, WORK_FIELDS, WorkField } from '../utils/workFields';

type RateDraft = Record<`${WorkField}_rate` | `${WorkField}_commission`, string>;

const toDraft = (rates?: Rates | null): RateDraft =>
  WORK_FIELDS.reduce((acc, field) => {
    acc[`${field}_rate`] = String(rates?.[`${field}_rate`] ?? '0');
    acc[`${field}_commission`] = String(rates?.[`${field}_commission`] ?? '0');
    return acc;
  }, {} as RateDraft);

export function RatesScreen() {
  const { token, user } = useAuth();
  const [rates, setRates] = useState<Rates | null>(null);
  const [draft, setDraft] = useState<RateDraft>(toDraft());
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const canEdit = user?.role === 'super_admin';

  const load = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      const response = await getRates(token);
      setRates(response.data);
      setDraft(toDraft(response.data));
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Could not load rates.');
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const changedPayload = useMemo(() => {
    const payload: Partial<Rates> = {};
    if (!rates) return payload;
    WORK_FIELDS.forEach((field) => {
      const rateKey = `${field}_rate` as const;
      const commissionKey = `${field}_commission` as const;
      if (draft[rateKey] !== String(rates[rateKey])) payload[rateKey] = draft[rateKey];
      if (draft[commissionKey] !== String(rates[commissionKey])) payload[commissionKey] = draft[commissionKey];
    });
    return payload;
  }, [draft, rates]);

  const hasChanges = Object.keys(changedPayload).length > 0;

  const save = async () => {
    if (!token || !canEdit || !hasChanges) return;
    setSaving(true);
    try {
      const response = await updateRates(token, changedPayload);
      setRates(response.data);
      setDraft(toDraft(response.data));
      Alert.alert('Success', 'Rates have been updated.');
    } catch (error) {
      Alert.alert('Failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const setValue = (key: keyof RateDraft, value: string) => {
    // Regex allows digits and one decimal point for financial inputs
    const cleanValue = value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
    setDraft((current) => ({ ...current, [key]: cleanValue }));
  };

  return (
    <KeyboardAvoidingView 
      style={commonStyles.screen} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header 
        title="Work Rates" 
        subtitle={canEdit ? "Adjust global pricing and fees" : "Viewing current service rates"} 
      />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.blue} />}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!canEdit && (
          <View style={styles.viewOnlyBanner}>
            <Text style={styles.viewOnlyText}>
              Read-only mode. Administrator privileges required to edit.
            </Text>
          </View>
        )}

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>SERVICE TYPES</Text>
          {hasChanges && <Text style={styles.unsavedText}>Unsaved Changes</Text>}
        </View>

        {WORK_FIELDS.map((field) => {
          const rateKey = `${field}_rate` as const;
          const commKey = `${field}_commission` as const;
          
          const isDirty = rates && (draft[rateKey] !== String(rates[rateKey]) || draft[commKey] !== String(rates[commKey]));

          return (
            <View key={field} style={[styles.card, isDirty && styles.cardDirty]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{fieldLabel(field)}</Text>
                {isDirty && <View style={styles.dirtyDot} />}
              </View>

              <View style={styles.row}>
                <View style={styles.inputFlex}>
                  <TextField
                    label="Rate"
                    value={draft[rateKey]}
                    onChangeText={(v) => setValue(rateKey, v)}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    isEditable={canEdit}
                  />
                </View>
                <View style={styles.inputFlex}>
                  <TextField
                    label="Commission (%)"
                    value={draft[commKey]}
                    onChangeText={(v) => setValue(commKey, v)}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    isEditable={canEdit}
                  />
                </View>
              </View>
            </View>
          );
        })}

        {canEdit && (
          <View style={styles.footer}>
            <Button
              title="Save All Changes"
              onPress={ () => {
                if(hasChanges) {
                save()
                } else {
                  Alert.alert('No Changes', "You haven't made any changes yet. Adjust the values below to update the system rates.")
                }
              }}
              loading={saving}
              icon="cloud-upload-outline"
              style={!hasChanges ? styles.buttonDisabled : {}}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    paddingBottom: 20,
  },
  viewOnlyBanner: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  viewOnlyText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  listTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.muted,
    letterSpacing: 1.5,
  },
  unsavedText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.blue,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    marginBottom: 16,
    // Native Shadow for CLI
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  cardDirty: {
    borderColor: colors.blue,
    backgroundColor: '#F9FBFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  dirtyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.blue,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputFlex: {
    flex: 1,
  },
  footer: {
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});