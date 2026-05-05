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
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { AuthStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import LinearGradient from 'react-native-linear-gradient';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [role, setRole] = useState<'admin' | 'super_admin'>('admin');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name || !email || password.length < 8) {
      Alert.alert(
        'Check details',
        'Name, email, and an 8+ character password are required.',
      );
      return;
    }
    setLoading(true);
    try {
      const requiresApproval = await signUp(name, email, password, role);
      if (requiresApproval) {
        Alert.alert(
          'Request sent',
          'Your Super Admin account is waiting for approval.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }],
        );
      }
    } catch (error) {
      Alert.alert(
        'Registration failed',
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join our financial management platform
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.labelGroup}>SELECT ROLE</Text>
            <View style={styles.segment}>
              {(['admin', 'super_admin'] as const).map(item => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setRole(item)}
                  style={[
                    styles.segmentItem,
                    role === item && styles.segmentActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      role === item && styles.segmentTextActive,
                    ]}
                  >
                    {item === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextField
              label="Full Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholder="Your Name"
              labelColor='#FFF'
            />

            <TextField
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="you@example.com"
              labelColor='#FFF'
            />

            <View style={styles.passwordContainer}>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  placeholder="8+ characters"
                  labelColor='#FFF'
                />
              </View>
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                <Ionicons
                  name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={colors.blue}
                />
              </TouchableOpacity>
            </View>

            <Button
              title="Create account"
              onPress={submit}
              loading={loading}
              icon="sparkles-outline"
              style={styles.submitBtn}
            />
          </View>

          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.linkWrap}
          >
            <Text style={styles.linkText}>
              Already have an account?{' '}
              <Text style={styles.linkHighlight}>Sign in</Text>
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
    padding: 15,
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 16,
  },
  labelGroup: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: -8,
    marginLeft: 4,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: colors.blue,
  },
  segmentText: {
    color: '#94A3B8',
    fontWeight: '800',
    fontSize: 14,
  },
  segmentTextActive: {
    color: '#FFFFFF',
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
