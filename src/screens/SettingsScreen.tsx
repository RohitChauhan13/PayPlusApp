import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { API_URL } from '../api/client';
import { listUsers, updateUserBlock } from '../api/payplus';
import { User } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/layout';

export function SettingsScreen() {
  const { token, user, signOut } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const canManageUsers = user?.role === 'super_admin';

  const roleLabel = (role?: User['role']) => {
    if (role === 'super_admin') return 'Super Admin';
    return 'Admin';
  };

  const accessLabel = (target: User) => {
    if (target.role === 'super_admin' && target.is_blocked) return 'Pending';
    return target.is_blocked ? 'Blocked' : 'Active';
  };

  const loadUsers = useCallback(async () => {
    if (!token || !canManageUsers) return;
    setLoadingUsers(true);
    try {
      const response = await listUsers(token);
      setUsers(response.data);
    } catch (error) {
      Alert.alert(
        'Could not load users',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setLoadingUsers(false);
    }
  }, [canManageUsers, token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const logout = () => {
    Alert.alert('Sign out', 'You will need to sign in again to use PayPlus.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  };

  const toggleBlocked = async (target: User, nextValue: boolean) => {
    if (!token) return;
    try {
      const response = await updateUserBlock(token, target.id, nextValue);
      setUsers(current =>
        current.map(item => (item.id === target.id ? response.data : item)),
      );
    } catch (error) {
      Alert.alert(
        'Could not update user',
        error instanceof Error ? error.message : 'Please try again.',
      );
    }
  };

  return (
    <View style={commonStyles.screen}>
      <Header title="Profile" subtitle="Account details and app connection." />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" color="#FFFFFF" size={30} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{roleLabel(user?.role)}</Text>
            </View>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>API endpoint</Text>
          <Text style={styles.cardValue}>{API_URL}</Text>
        </View>
        {canManageUsers && (
          <View style={styles.adminPanel}>
            <View style={styles.adminHeader}>
              <View>
                <Text style={styles.adminTitle}>User access</Text>
                <Text style={styles.adminSub}>
                  {loadingUsers
                    ? 'Refreshing users...'
                    : 'Approve requests or block admins.'}
                </Text>
              </View>
              <Button
                title="Refresh"
                variant="secondary"
                onPress={loadUsers}
                style={styles.refreshButton}
              />
            </View>
            {users.map(item => (
              <View key={item.id} style={styles.userRow}>
                <View style={styles.userIcon}>
                  <Ionicons
                    name={
                      item.is_blocked
                        ? 'lock-closed-outline'
                        : 'shield-checkmark-outline'
                    }
                    size={19}
                    color={item.is_blocked ? colors.rose : colors.teal}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userMeta}>
                    {item.email} | {roleLabel(item.role)}
                  </Text>
                </View>
                <View style={styles.switchWrap}>
                  <Text
                    style={[
                      styles.statusText,
                      item.is_blocked && styles.blockedText,
                    ]}
                  >
                    {accessLabel(item)}
                  </Text>
                  <Switch
                    value={item.is_blocked}
                    onValueChange={value => toggleBlocked(item, value)}
                    disabled={
                      item.id === user.id ||
                      (item.role === 'super_admin' && !item.is_blocked)
                    }
                    trackColor={{ false: '#D1FAE5', true: '#FFE4E6' }}
                    thumbColor={item.is_blocked ? colors.rose : colors.teal}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
        <Button
          title="Sign out"
          variant="primary"
          icon="log-out-outline"
          onPress={logout}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 14,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue,
  },
  name: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  email: {
    color: colors.muted,
    marginTop: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    marginTop: 10,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#ECFDF5',
  },
  roleText: {
    color: colors.teal,
    fontSize: 12,
    fontWeight: '900',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
  },
  cardLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  cardValue: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    fontWeight: '700',
  },
  adminPanel: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    gap: 12,
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'space-between',
  },
  adminTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  adminSub: {
    color: colors.muted,
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
  },
  refreshButton: {
    minWidth: 96,
  },
  userRow: {
    minHeight: 70,
    borderRadius: 12,
    backgroundColor: colors.surfaceSoft,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    color: colors.ink,
    fontWeight: '900',
  },
  userMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  switchWrap: {
    alignItems: 'flex-end',
  },
  statusText: {
    color: colors.teal,
    fontSize: 12,
    fontWeight: '900',
  },
  blockedText: {
    color: colors.rose,
  },
});
