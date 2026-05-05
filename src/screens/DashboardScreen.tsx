import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import { Header } from '../components/Header';
import { MetricCard } from '../components/MetricCard';
import { listWork } from '../api/payplus';
import { WorkEntry } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/layout';
import { money, prettyDate } from '../utils/format';

type DonutSegment = {
  label: string;
  value: number;
  color: string;
};

function DonutChart({
  segments,
  centerLabel,
  centerValue
}: {
  segments: DonutSegment[];
  centerLabel: string;
  centerValue: string;
}) {
  const size = 168;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, segment) => sum + Math.max(0, segment.value), 0);
  let offset = 0;

  return (
    <View style={styles.donutWrap}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.faint}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {segments.map((segment) => {
            const arc = total > 0 ? (Math.max(0, segment.value) / total) * circumference : 0;
            const dashOffset = -offset;
            offset += arc;

            return (
              <Circle
                key={segment.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${arc} ${circumference - arc}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                fill="transparent"
              />
            );
          })}
        </G>
        <SvgText x="50%" y="47%" textAnchor="middle" fill={colors.muted} fontSize="11" fontWeight="800">
          {centerLabel}
        </SvgText>
        <SvgText x="50%" y="59%" textAnchor="middle" fill={colors.ink} fontSize="15" fontWeight="900">
          {centerValue}
        </SvgText>
      </Svg>
    </View>
  );
}

export function DashboardScreen() {
  const { token, user } = useAuth();
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      const response = await listWork(token, { page: 1, limit: 10 });
      setEntries(response.data);
    } catch (error: any) {
      ToastAndroid.show(error.message, ToastAndroid.LONG);
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const totalCommission = entries.reduce((sum, item) => sum + Number(item.total_commission || 0), 0);
  const onlineNetAmount = entries.reduce((sum, item) => sum + Number(item.online_net_amount || 0), 0);
  const cashAmount = entries.reduce((sum, item) => sum + Number(item.cash_amount || 0), 0);
  const salaryAmount = entries.reduce((sum, item) => sum + Number(item.salary_amount || 0), 0);
  const tdsAmount = entries.reduce(
    (sum, item) => sum + (Number(item.online_amount || 0) - Number(item.online_net_amount || 0)),
    0
  );
  const remainingAmount = entries.reduce((sum, item) => sum + Number(item.remaining_amount || 0), 0);
  const receivedAmount = onlineNetAmount + cashAmount;
  const deductionAmount = totalCommission + tdsAmount + salaryAmount;
  const share = (value: number, total: number) => (total > 0 ? Math.max(4, Math.min(100, (value / total) * 100)) : 0);
  const percent = (value: number, total: number) => `${total > 0 ? ((value / total) * 100).toFixed(1).replace('.0', '') : '0'}%`;
  const onlineShare = share(onlineNetAmount, receivedAmount);
  const cashShare = share(cashAmount, receivedAmount);
  const commissionShare = share(totalCommission, deductionAmount);
  const tdsShare = share(tdsAmount, deductionAmount);
  const salaryShare = share(salaryAmount, deductionAmount);

  return (
    <View style={commonStyles.screen}>
      <Header title={`Hi, ${user?.name?.split(' ')[0] || 'there'}`} subtitle="Your latest work performance at a glance." />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.metricsRow}>
          <MetricCard label="Total amount" value={money(receivedAmount)} tone="blue" icon="wallet-outline" />
          <MetricCard label="TDS" value={money(tdsAmount)} tone="indigo" icon="remove-circle-outline" />
        </View>
        <View style={styles.metricsRow}>
          <MetricCard label="Remaining" value={money(remainingAmount)} tone="green" icon="checkmark-done-outline" />
          <MetricCard label="Commission" value={money(totalCommission)} tone="amber" icon="analytics-outline" />
        </View>
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Money mix</Text>
              <Text style={styles.chartSub}>Online after TDS vs cash</Text>
            </View>
            <Text style={styles.chartTotal} numberOfLines={1} adjustsFontSizeToFit>
              {money(receivedAmount)}
            </Text>
          </View>
          <View style={styles.chartBody}>
            <DonutChart
              centerLabel="Total"
              centerValue={money(receivedAmount)}
              segments={[
                { label: 'Online', value: onlineNetAmount, color: colors.blue },
                { label: 'Cash', value: cashAmount, color: colors.teal }
              ]}
            />
            <View style={styles.legendStack}>
              <View style={styles.legendCard}>
                <View style={[styles.legendIcon, { backgroundColor: '#DBEAFE' }]}>
                  <View style={[styles.legendDot, { backgroundColor: colors.blue }]} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.legendLabel}>Online after TDS</Text>
                  <Text style={styles.legendPercent}>{percent(onlineNetAmount, receivedAmount)}</Text>
                </View>
              </View>
              <View style={styles.legendCard}>
                <View style={[styles.legendIcon, { backgroundColor: '#CCFBF1' }]}>
                  <View style={[styles.legendDot, { backgroundColor: colors.teal }]} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.legendLabel}>Cash</Text>
                  <Text style={styles.legendPercent}>{percent(cashAmount, receivedAmount)}</Text>
                </View>
              </View>
            </View>
          </View>
          {[
            ['Online after TDS', onlineNetAmount, onlineShare, colors.blue],
            ['Cash', cashAmount, cashShare, colors.teal]
          ].map(([label, value, width, color]) => (
            <View key={label as string} style={styles.deductionRow}>
              <View style={styles.deductionTop}>
                <Text style={styles.deductionName}>{label as string}</Text>
                <Text style={styles.deductionValue}>{money(value as number)}</Text>
              </View>
              <View style={styles.deductionTrack}>
                <View style={[styles.deductionFill, { width: `${width as number}%`, backgroundColor: color as string }]} />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Deductions</Text>
              <Text style={styles.chartSub}>Commission, TDS, and salaries</Text>
            </View>
            <Text style={styles.chartTotal} numberOfLines={1} adjustsFontSizeToFit>
              {money(deductionAmount)}
            </Text>
          </View>
          <View style={styles.chartBody}>
            <DonutChart
              centerLabel="Deduct"
              centerValue={money(deductionAmount)}
              segments={[
                { label: 'Commission', value: totalCommission, color: colors.amber },
                { label: 'TDS', value: tdsAmount, color: colors.indigo },
                { label: 'Salaries', value: salaryAmount, color: colors.rose }
              ]}
            />
            <View style={styles.legendStack}>
              {[
                ['Commission', totalCommission, colors.amber, '#FEF3C7'],
                ['TDS', tdsAmount, colors.indigo, '#E0E7FF'],
                ['Salaries', salaryAmount, colors.rose, '#FFE4E6']
              ].map(([label, value, color, bg]) => (
                <View key={label as string} style={styles.legendCard}>
                  <View style={[styles.legendIcon, { backgroundColor: bg as string }]}>
                    <View style={[styles.legendDot, { backgroundColor: color as string }]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.legendLabel}>{label as string}</Text>
                    <Text style={styles.legendPercent}>{percent(value as number, deductionAmount)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
          {[
            ['Commission', totalCommission, commissionShare, colors.amber],
            ['TDS', tdsAmount, tdsShare, colors.indigo],
            ['Salaries', salaryAmount, salaryShare, colors.rose]
          ].map(([label, value, width, color]) => (
            <View key={label as string} style={styles.deductionRow}>
              <View style={styles.deductionTop}>
                <Text style={styles.deductionName}>{label as string}</Text>
                <Text style={styles.deductionValue}>{money(value as number)}</Text>
              </View>
              <View style={styles.deductionTrack}>
                <View style={[styles.deductionFill, { width: `${width as number}%`, backgroundColor: color as string }]} />
              </View>
            </View>
          ))}
        </View>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest entries</Text>
        </View>
        {entries.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No work yet</Text>
            <Text style={styles.emptyCopy}>Add your first work entry and PayPlus will calculate totals from the current rates.</Text>
          </View>
        ) : (
          entries.slice(0, 5).map((item) => {
            const tds = Number(item.online_amount || 0) - Number(item.online_net_amount || 0);
            const total = Number(item.online_net_amount || 0) + Number(item.cash_amount || 0);

            return (
              <View key={item.id} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle} numberOfLines={1}>
                    {prettyDate(item.start_date)} - {prettyDate(item.end_date)}
                  </Text>
                  <Text style={styles.entryAmount} numberOfLines={1} adjustsFontSizeToFit>
                    {money(total)}
                  </Text>
                </View>
                <View style={styles.entryMetaRow}>
                  <View style={styles.metaPill}>
                    <Text style={styles.metaLabel}>Commission</Text>
                    <Text style={styles.metaValue} numberOfLines={1} adjustsFontSizeToFit>
                      {money(item.total_commission)}
                    </Text>
                  </View>
                  <View style={styles.metaPill}>
                    <Text style={styles.metaLabel}>TDS</Text>
                    <Text style={styles.metaValue} numberOfLines={1} adjustsFontSizeToFit>
                      {money(tds)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 14
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDE7F0',
    padding: 14,
    gap: 12
  },
  chartBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  donutWrap: {
    width: 168,
    height: 168,
    alignItems: 'center',
    justifyContent: 'center'
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  chartTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900'
  },
  chartSub: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3
  },
  chartTotal: {
    color: colors.blue,
    fontSize: 16,
    fontWeight: '900',
    maxWidth: '42%',
    textAlign: 'right'
  },
  legendStack: {
    flex: 1,
    gap: 9
  },
  legendCard: {
    minHeight: 48,
    borderRadius: 13,
    backgroundColor: colors.surfaceSoft,
    padding: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9
  },
  legendIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 99
  },
  legendLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800'
  },
  legendAmount: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2
  },
  legendPercent: {
    color: colors.blue,
    fontSize: 10,
    fontWeight: '900',
    marginTop: 2
  },
  deductionRow: {
    gap: 7
  },
  deductionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  deductionName: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900'
  },
  deductionValue: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '900'
  },
  deductionTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.faint,
    overflow: 'hidden'
  },
  deductionFill: {
    height: '100%',
    borderRadius: 999
  },
  sectionHeader: {
    marginTop: 6
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900'
  },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line
  },
  emptyTitle: {
    color: colors.ink,
    fontWeight: '900',
    fontSize: 16
  },
  emptyCopy: {
    color: colors.muted,
    marginTop: 6,
    lineHeight: 20
  },
  entry: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDE7F0',
    gap: 10
  },
  entryHeader: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'space-between'
  },
  entryTitle: {
    flex: 1,
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
    minWidth: 0
  },
  entryAmount: {
    color: colors.blue,
    fontSize: 17,
    fontWeight: '900',
    maxWidth: '42%',
    minWidth: 104,
    textAlign: 'right'
  },
  entryMetaRow: {
    flexDirection: 'row',
    gap: 8
  },
  metaPill: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center'
  },
  metaLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0
  },
  metaValue: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 3
  },
  entryCommission: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4
  }
});
