import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { AuthStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert(
        'Missing details',
        'Enter your email and password to continue.',
      );
      return;
    }

    setLoading(true);
    try {
      await signIn(trimmedEmail, password);
    } catch (error) {
      Alert.alert(
        'Login failed',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0F172A', '#1E3A8A', '#1E1B4B']}
      style={styles.screen}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.screen}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.logo}>PayPlus</Text>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in to review totals and add today's work.
            </Text>
          </View>

          <View style={styles.formCard}>
            <TextField
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="you@example.com"
              labelColor={'#FFF'}
            />

            <View style={styles.passwordContainer}>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!passwordVisible}
                  placeholder="Minimum 8 characters"
                  labelColor={'#FFF'}
                />
              </View>
              <Pressable
                onPress={() => setPasswordVisible(!passwordVisible)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={colors.blue}
                />
              </Pressable>
            </View>

            <Button
              title="Sign in"
              onPress={submit}
              loading={loading}
              icon="log-in-outline"
              style={styles.submitBtn}
            />
          </View>

          <Pressable
            onPress={() => navigation.navigate('Register')}
            style={styles.linkWrap}
          >
            <Text style={styles.linkText}>
              New here?{' '}
              <Text style={styles.linkHighlight}>Create an account</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  logo: {
    color: '#38BDF8',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 8,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 16,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Match register glass effect
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    bottom: 14,
    height: 24,
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtn: {
    marginTop: 8,
  },
  linkWrap: {
    alignItems: 'center',
    marginTop: 24,
  },
  linkText: {
    color: '#94A3B8',
    fontSize: 15,
  },
  linkHighlight: {
    color: '#38BDF8',
    fontWeight: '800',
  },
});
