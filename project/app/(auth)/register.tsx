import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { UserPlus, Eye, EyeOff, Check, X } from 'lucide-react-native';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { signUp } = useAuth();
  const { t, isRTL } = useLanguage();

  const getPasswordStrength = () => {
    if (password.length === 0) return { label: '', color: '#94A3B8', percentage: 0 };
    if (password.length < 6) return { label: 'Trop court', color: '#EF4444', percentage: 25 };
    if (password.length < 8) return { label: 'Faible', color: '#F59E0B', percentage: 50 };
    if (password.length < 12) return { label: 'Moyen', color: '#3B82F6', percentage: 75 };
    return { label: 'Fort', color: '#10B981', percentage: 100 };
  };

  const passwordValidations = [
    { label: 'Au moins 6 caractères', valid: password.length >= 6 },
    { label: 'Au moins 8 caractères (recommandé)', valid: password.length >= 8 },
    { label: 'Les mots de passe correspondent', valid: confirmPassword.length > 0 && password === confirmPassword },
  ];

  const handleRegister = async () => {
    setError('');
    setSuccess('');

    if (!fullName || !email || !password || !confirmPassword) {
      setError('❌ Veuillez remplir tous les champs');
      return;
    }

    if (fullName.length < 3) {
      setError('❌ Le nom doit contenir au moins 3 caractères');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('❌ Adresse email invalide');
      return;
    }

    if (password.length < 6) {
      setError('❌ Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (password !== confirmPassword) {
      setError('❌ Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    const { error: signUpError } = await signUp(email, password, fullName);

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError('❌ Cet email est déjà utilisé. Connectez-vous ou utilisez un autre email.');
      } else if (signUpError.message.includes('Invalid email')) {
        setError('❌ Format d\'email invalide');
      } else {
        setError('❌ Erreur: ' + signUpError.message);
      }
      setLoading(false);
    } else {
      setSuccess('✅ Compte créé avec succès! Bienvenue sur OuechDZ!');
      setLoading(false);

      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1500);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <UserPlus size={52} color="#FFFFFF" />
          </View>
          <Text style={[styles.title, isRTL && styles.textRTL]}>{t('auth.register')}</Text>
          <Text style={[styles.subtitle, isRTL && styles.textRTL]}>Rejoignez {t('home.logo')} aujourd'hui</Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{success}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.textRTL]}>{t('auth.fullName')}</Text>
            <TextInput
              style={[
                styles.input,
                focusedField === 'fullName' && styles.inputFocused,
                !fullName && styles.inputEmpty,
              ]}
              placeholder="Quel est votre nom complet ?"
              placeholderTextColor="#94A3B8"
              value={fullName}
              onChangeText={setFullName}
              onFocus={() => setFocusedField('fullName')}
              onBlur={() => setFocusedField(null)}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[
                styles.input,
                focusedField === 'email' && styles.inputFocused,
                !email && styles.inputEmpty,
              ]}
              placeholder="Quelle est votre adresse email ?"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.textRTL]}>{t('auth.password')}</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.inputWithIcon,
                  focusedField === 'password' && styles.inputFocused,
                  !password && styles.inputEmpty,
                ]}
                placeholder="Choisissez un mot de passe sécurisé"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#64748B" />
                ) : (
                  <Eye size={20} color="#64748B" />
                )}
              </TouchableOpacity>
            </View>
            {password.length > 0 && (
              <View style={styles.passwordStrengthContainer}>
                <View style={styles.passwordStrengthBar}>
                  <View
                    style={[
                      styles.passwordStrengthFill,
                      {
                        width: `${getPasswordStrength().percentage}%`,
                        backgroundColor: getPasswordStrength().color,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.passwordStrengthText, { color: getPasswordStrength().color }]}>
                  {getPasswordStrength().label}
                </Text>
              </View>
            )}
            {(password.length > 0 || confirmPassword.length > 0) && (
              <View style={styles.passwordValidations}>
                {passwordValidations.map((validation, index) => (
                  <View key={index} style={styles.validationItem}>
                    {validation.valid ? (
                      <Check size={14} color="#10B981" />
                    ) : (
                      <X size={14} color="#94A3B8" />
                    )}
                    <Text
                      style={[
                        styles.validationText,
                        { color: validation.valid ? '#10B981' : '#94A3B8' },
                      ]}
                    >
                      {validation.label}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.textRTL]}>{t('auth.confirmPassword')}</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.inputWithIcon,
                  focusedField === 'confirmPassword' && styles.inputFocused,
                  !confirmPassword && styles.inputEmpty,
                  confirmPassword && password !== confirmPassword && styles.inputError,
                ]}
                placeholder="Retapez votre mot de passe"
                placeholderTextColor="#94A3B8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#64748B" />
                ) : (
                  <Eye size={20} color="#64748B" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{t('auth.signUp')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.loginLinkText}>
              {t('auth.hasAccount')} <Text style={styles.loginLinkBold}>{t('auth.signIn')}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 110,
    height: 110,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  successContainer: {
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#10B981',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1E293B',
  },
  inputEmpty: {
    backgroundColor: '#F8FAFC',
  },
  inputFocused: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFFFF',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  passwordContainer: {
    position: 'relative',
  },
  inputWithIcon: {
    paddingRight: 48,
  },
  eyeIcon: {
    position: 'absolute',
    right: 14,
    top: 14,
    padding: 4,
  },
  passwordStrengthContainer: {
    marginTop: 8,
    gap: 6,
  },
  passwordStrengthBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.3s ease',
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  passwordValidations: {
    marginTop: 12,
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  validationText: {
    fontSize: 13,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
  },
  buttonText: {
    color: '#1A202C',
    fontSize: 16,
    fontWeight: '800',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 24,
  },
  loginLinkText: {
    fontSize: 14,
    color: '#64748B',
  },
  loginLinkBold: {
    color: '#2563EB',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
