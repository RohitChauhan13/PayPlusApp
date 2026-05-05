import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { AuthStackParamList, AppStackParamList, MainTabParamList } from './types';
import { DashboardScreen } from '../screens/DashboardScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { RatesScreen } from '../screens/RatesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { WorkFormScreen } from '../screens/WorkFormScreen';
import { WorkListScreen } from '../screens/WorkListScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.blue,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          height: 66,
          paddingTop: 8,
          paddingBottom: 10,
          borderTopColor: colors.line
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700'
        },
        tabBarIcon: ({ color, size }) => {
          const names: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
            Dashboard: 'grid-outline',
            Work: 'receipt-outline',
            Rates: 'trending-up-outline',
            Settings: 'person-circle-outline'
          };
          return <Ionicons name={names[route.name]} color={color} size={size} />;
        }
      })}
    >
      <Tabs.Screen name="Dashboard" component={DashboardScreen} />
      <Tabs.Screen name="Work" component={WorkListScreen} />
      <Tabs.Screen name="Rates" component={RatesScreen} />
      <Tabs.Screen name="Settings" component={SettingsScreen} />
    </Tabs.Navigator>
  );
}

function AppNavigator() {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="MainTabs" component={MainTabs} />
      <AppStack.Screen name="WorkForm" component={WorkFormScreen} />
    </AppStack.Navigator>
  );
}

export function RootNavigator() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.navy }}>
        <ActivityIndicator color="#FFFFFF" />
      </View>
    );
  }

  return token ? <AppNavigator /> : <AuthNavigator />;
}
