import React, { useCallback, useState, useMemo } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View, LayoutAnimation, Platform, UIManager } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { deleteWork, listWork } from '../api/payplus';
import { WorkEntry } from '../api/types';
import { AppStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/layout';
import { money, prettyDate } from '../utils/format';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function WorkListScreen() {
  const { token, user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const isSuperAdmin = user?.role === 'super_admin';

  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const load = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      const response = await listWork(token, { page: 1, limit: 50 });
      setEntries(response.data);
    } catch (error) {
      Alert.alert('Could not load work', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const confirmDelete = (entry: WorkEntry) => {
    Alert.alert('Delete entry', 'This work entry will be removed permanently.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!token) return;
          await deleteWork(token, entry.id);
          load();
        }
      }
    ]);
  };

  return (
    <View style={commonStyles.screen}>
      <Header title="Work ledger" subtitle="Search-ready history with quick edit and delete actions." />
      <View style={styles.action}>
        <Button title="New entry" icon="add-outline" onPress={() => navigation.navigate('WorkForm')} />
      </View>
      <FlatList
        data={entries}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No entries found</Text>
            <Text style={styles.emptyCopy}>Tap New entry to add work quantities and calculate totals.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const onlineNet = Number(item.online_net_amount || 0);
          const cash = Number(item.cash_amount || 0);
          const tds = Number(item.online_amount || 0) - onlineNet;
          const receivedTotal = onlineNet + cash;
          const isExpanded = expandedId === item.id;

          return (
            <Pressable
              onPress={() => toggleExpand(item.id)}
              style={styles.card}
            >
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.date}>{prettyDate(item.start_date)} - {prettyDate(item.end_date)}</Text>
                  <Text style={styles.creator}>{item.creator?.name || 'PayPlus user'}</Text>
                </View>
                { isSuperAdmin &&
                <Pressable onPress={() => confirmDelete(item)} style={styles.delete}>
                  <Ionicons name="trash-outline" size={16} color={colors.rose} />
                </Pressable>
                }
                <View style={styles.expandIcon}>
                  <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={colors.muted} />
                </View>
              </View>

              {isExpanded && (
                <View style={styles.expandedContent}>
                  <View style={styles.totalHero}>
                    <View style={styles.totalIcon}>
                      <Ionicons name="wallet-outline" size={19} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.heroLabel}>Total amount</Text>
                      <Text style={styles.heroFormula}>Online after TDS + Cash</Text>
                    </View>
                    <Text style={styles.heroAmount} numberOfLines={1} adjustsFontSizeToFit>
                      {money(receivedTotal)}
                    </Text>
                  </View>

                  <View style={styles.splitGrid}>
                    <View style={styles.splitItem}>
                      <Text style={styles.totalLabel}>Online after TDS</Text>
                      <Text style={styles.amount}>{money(onlineNet)}</Text>
                    </View>
                    <View style={styles.splitItem}>
                      <Text style={styles.totalLabel}>Cash</Text>
                      <Text style={styles.cash}>{money(cash)}</Text>
                    </View>
                  </View>

                  <View style={styles.deductions}>
                    <View style={styles.deductionItem}>
                      <Text style={styles.deductionLabel}>TDS</Text>
                      <Text style={styles.tds}>{money(tds)}</Text>
                    </View>
                    <View style={styles.deductionItem}>
                      <Text style={styles.deductionLabel}>Remaining</Text>
                      <Text style={styles.remainingInline}>{money(item.remaining_amount)}</Text>
                    </View>
                    <View style={styles.deductionItem}>
                      <Text style={styles.deductionLabel}>Salaries</Text>
                      <Text style={styles.salary}>{money(item.salary_amount)}</Text>
                    </View>
                  </View>

                  <View style={styles.commissionStrip}>
                    <View>
                      <Text style={styles.commissionStripLabel}>Commission</Text>
                    </View>
                    <Text style={styles.commissionStripAmount}>{money(item.total_commission)}</Text>
                  </View>
                  { isSuperAdmin &&
                  <Button 
                    title="Edit Entry" 
                    variant="secondary" 
                    icon="create-outline" 
                    onPress={() => navigation.navigate('WorkForm', { entry: item })} 
                    style={styles.editButton}
                  />
                  }
                </View>
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    padding: 20,
    paddingBottom: 0
  },
  list: {
    padding: 20,
    gap: 12
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DDE7F0',
    padding: 16,
    shadowColor: colors.navy,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  date: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900'
  },
  creator: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4
  },
  delete: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center'
  },
  expandIcon: {
    marginLeft: 4
  },
  expandedContent: {
    marginTop: 14,
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: colors.faint,
    paddingTop: 14
  },
  totalHero: {
    minHeight: 74,
    borderRadius: 16,
    backgroundColor: colors.blue,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  totalIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900'
  },
  heroFormula: {
    color: '#DBEAFE',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3
  },
  heroAmount: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
    maxWidth: '45%',
    textAlign: 'right'
  },
  splitGrid: {
    flexDirection: 'row',
    gap: 10
  },
  splitItem: {
    flex: 1,
    minHeight: 70,
    borderRadius: 14,
    backgroundColor: colors.surfaceSoft,
    padding: 12,
    justifyContent: 'center'
  },
  deductions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 12,
    gap: 10
  },
  deductionItem: {
    flex: 1
  },
  totalLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800'
  },
  amount: {
    color: colors.blue,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4
  },
  commission: {
    color: colors.blue,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 4
  },
  remainingInline: {
    color: colors.blue,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 4
  },
  cash: {
    color: colors.blue,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
    textAlign: 'right'
  },
  salary: {
    color: colors.blue,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 4
  },
  deductionLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0
  },
  tds: {
    color: colors.blue,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 4
  },
  commissionStrip: {
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  commissionStripLabel: {
    color: colors.blue,
    fontSize: 13,
    fontWeight: '900'
  },
  commissionStripAmount: {
    color: colors.blue,
    fontSize: 18,
    fontWeight: '900'
  },
  remainingSub: {
    color: '#5B8C80',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3
  },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18
  },
  emptyTitle: {
    color: colors.ink,
    fontWeight: '900'
  },
  emptyCopy: {
    color: colors.muted,
    marginTop: 6,
    lineHeight: 20
  },
  editButton: {
    marginTop: 4
  }
});
