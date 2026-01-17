/**
 * Cloud Backup Screen
 * TaskList App - Phase 2 Cloud Backup
 * 
 * Manage cloud sync, authentication, and backups
 */

import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { TaskContext } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, borderRadius } from '../constants/theme';
import { isSupabaseConfigured, getSetupInstructions } from '../config/supabase';
import { getSyncStatus } from '../services/cloudSyncService';
import { listBackups, createBackup, getBackupStats } from '../services/backupService';
import { useCloudSync } from '../hooks/useCloudSync';

// Safe haptics
const safeHaptics = {
  impact: (style) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(style);
    }
  },
  notification: (type) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(type);
    }
  }
};

// Format file size
const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'Nunca';
  return new Date(dateString).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function CloudBackup() {
  const router = useRouter();
  const { tasks } = useContext(TaskContext);
  const { colors } = useTheme();
  const auth = useAuth();

  const [isConfigured, setIsConfigured] = useState(false);
  const [activeTab, setActiveTab] = useState('sync');
  const [backups, setBackups] = useState([]);
  const [backupStats, setBackupStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auth form state
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState('');

  // Cloud sync hook (only if authenticated)
  const cloudSync = auth?.isAuthenticated ? useCloudSync(tasks, () => {}) : {
    isSyncing: false,
    lastSync: null,
    sync: () => {},
    syncStatus: { isConfigured: false, isAuthenticated: false },
  };

  // Check configuration on mount
  useEffect(() => {
    setIsConfigured(isSupabaseConfigured());
  }, []);

  // Load backups when authenticated
  useEffect(() => {
    if (auth?.isAuthenticated) {
      loadBackups();
    }
  }, [auth?.isAuthenticated]);

  const loadBackups = async () => {
    try {
      const [backupList, stats] = await Promise.all([
        listBackups(5),
        getBackupStats(),
      ]);
      setBackups(backupList);
      setBackupStats(stats);
    } catch (error) {
      console.error('Error loading backups:', error);
    }
  };

  // Handle authentication
  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setAuthError('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    setAuthError('');

    try {
      if (authMode === 'login') {
        await auth.signIn(email, password);
        safeHaptics.notification(Haptics.NotificationFeedbackType.Success);
      } else {
        await auth.signUp(email, password, displayName);
        safeHaptics.notification(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Cuenta creada',
          'Por favor verifica tu email para activar tu cuenta.'
        );
      }
    } catch (error) {
      console.error('Auth error:', error);
      setAuthError(error.message || 'Error de autenticación');
      safeHaptics.notification(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await auth.signOut();
            safeHaptics.notification(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  // Handle manual sync
  const handleSync = async () => {
    setIsLoading(true);
    try {
      await cloudSync.sync();
      safeHaptics.notification(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Sincronizado', 'Tus tareas están actualizadas');
    } catch (error) {
      console.error('Sync error:', error);
      safeHaptics.notification(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'No se pudo sincronizar');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle create backup
  const handleCreateBackup = async () => {
    setIsLoading(true);
    try {
      await createBackup(tasks, false);
      await loadBackups();
      safeHaptics.notification(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Respaldo creado', 'Tu respaldo se guardó correctamente');
    } catch (error) {
      console.error('Backup error:', error);
      safeHaptics.notification(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'No se pudo crear el respaldo');
    } finally {
      setIsLoading(false);
    }
  };

  // Show setup instructions
  const showSetupInstructions = () => {
    Alert.alert(
      'Configurar Supabase',
      'Para usar la sincronización en la nube, necesitas configurar Supabase. Revisa la consola para ver las instrucciones.',
      [{ text: 'Entendido' }]
    );
    console.log(getSetupInstructions());
  };

  // Render not configured state
  if (!isConfigured) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
        {/* Header */}
        <Animated.View style={styles.header} entering={FadeInDown.springify()}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.glassMedium }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Copia de Seguridad
          </Text>
          <View style={styles.headerRight} />
        </Animated.View>

        <View style={styles.notConfiguredContainer}>
          <Ionicons name="cloud-offline-outline" size={64} color={colors.textTertiary} />
          <Text style={[styles.notConfiguredTitle, { color: colors.textPrimary }]}>
            Supabase no configurado
          </Text>
          <Text style={[styles.notConfiguredSubtitle, { color: colors.textSecondary }]}>
            Para habilitar la sincronización en la nube, necesitas configurar Supabase
          </Text>
          <TouchableOpacity
            style={[styles.setupButton, { backgroundColor: colors.accentPurple }]}
            onPress={showSetupInstructions}
          >
            <Ionicons name="settings-outline" size={20} color={colors.white} />
            <Text style={[styles.setupButtonText, { color: colors.white }]}>
              Ver instrucciones
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Render not authenticated state
  if (!auth?.isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
        {/* Header */}
        <Animated.View style={styles.header} entering={FadeInDown.springify()}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.glassMedium }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Copia de Seguridad
          </Text>
          <View style={styles.headerRight} />
        </Animated.View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.authContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeIn.delay(100)}>
            <View style={[styles.authCard, { backgroundColor: colors.glassLight, borderColor: colors.glassBorder }]}>
              <Ionicons name="cloud-outline" size={48} color={colors.accentPurple} />
              <Text style={[styles.authTitle, { color: colors.textPrimary }]}>
                {authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </Text>
              <Text style={[styles.authSubtitle, { color: colors.textSecondary }]}>
                Sincroniza tus tareas en todos tus dispositivos
              </Text>

              {authMode === 'register' && (
                <TextInput
                  style={[styles.input, { backgroundColor: colors.glassMedium, color: colors.textPrimary, borderColor: colors.glassBorder }]}
                  placeholder="Nombre"
                  placeholderTextColor={colors.textTertiary}
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                />
              )}

              <TextInput
                style={[styles.input, { backgroundColor: colors.glassMedium, color: colors.textPrimary, borderColor: colors.glassBorder }]}
                placeholder="Email"
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                style={[styles.input, { backgroundColor: colors.glassMedium, color: colors.textPrimary, borderColor: colors.glassBorder }]}
                placeholder="Contraseña"
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {authError ? (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {authError}
                </Text>
              ) : null}

              <TouchableOpacity
                style={styles.authButton}
                onPress={handleAuth}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.authButtonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={[styles.authButtonText, { color: colors.white }]}>
                      {authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchAuthMode}
                onPress={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setAuthError('');
                }}
              >
                <Text style={[styles.switchAuthText, { color: colors.textSecondary }]}>
                  {authMode === 'login' 
                    ? '¿No tienes cuenta? ' 
                    : '¿Ya tienes cuenta? '}
                  <Text style={{ color: colors.accentPurple }}>
                    {authMode === 'login' ? 'Regístrate' : 'Inicia sesión'}
                  </Text>
                </Text>
              </TouchableOpacity>

              {authMode === 'login' && (
                <TouchableOpacity
                  style={styles.forgotPassword}
                  onPress={async () => {
                    if (!email.trim()) {
                      setAuthError('Ingresa tu email primero');
                      return;
                    }
                    try {
                      setIsLoading(true);
                      await auth.resetPassword(email);
                      Alert.alert(
                        'Email enviado',
                        'Revisa tu bandeja de entrada para restablecer tu contraseña.'
                      );
                    } catch (error) {
                      setAuthError(error.message || 'Error al enviar email');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  <Text style={[styles.forgotPasswordText, { color: colors.accentBlue }]}>
                    ¿Olvidaste tu contraseña?
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  // Render authenticated state
  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* Header */}
      <Animated.View style={styles.header} entering={FadeInDown.springify()}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.glassMedium }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Copia de Seguridad
        </Text>
        <View style={styles.headerRight} />
      </Animated.View>

      {/* User info */}
      <Animated.View
        style={[styles.userCard, { backgroundColor: colors.glassLight, borderColor: colors.glassBorder }]}
        entering={FadeInUp.delay(100).springify()}
      >
        <View style={[styles.avatar, { backgroundColor: colors.accentPurple }]}>
          <Text style={[styles.avatarText, { color: colors.white }]}>
            {auth.getDisplayName().charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.textPrimary }]}>
            {auth.getDisplayName()}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {auth.user?.email}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: colors.error + '20' }]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.error} />
        </TouchableOpacity>
      </Animated.View>

      {/* Tabs */}
      <Animated.View
        style={styles.tabsContainer}
        entering={FadeInUp.delay(150).springify()}
      >
        <TouchableOpacity
          style={[
            styles.tab,
            { borderColor: colors.glassBorder },
            activeTab === 'sync' && { backgroundColor: colors.accentPurple + '20', borderColor: colors.accentPurple },
          ]}
          onPress={() => setActiveTab('sync')}
        >
          <Ionicons
            name="sync-outline"
            size={18}
            color={activeTab === 'sync' ? colors.accentPurple : colors.textSecondary}
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'sync' ? colors.accentPurple : colors.textSecondary },
          ]}>
            Sincronizar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            { borderColor: colors.glassBorder },
            activeTab === 'backups' && { backgroundColor: colors.accentPurple + '20', borderColor: colors.accentPurple },
          ]}
          onPress={() => setActiveTab('backups')}
        >
          <Ionicons
            name="archive-outline"
            size={18}
            color={activeTab === 'backups' ? colors.accentPurple : colors.textSecondary}
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'backups' ? colors.accentPurple : colors.textSecondary },
          ]}>
            Respaldos
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'sync' ? (
          <Animated.View entering={FadeIn.duration(200)}>
            {/* Sync status card */}
            <View style={[styles.statusCard, { backgroundColor: colors.success + '15', borderColor: colors.success + '30' }]}>
              <Ionicons name="cloud-done" size={24} color={colors.success} />
              <View style={styles.statusInfo}>
                <Text style={[styles.statusTitle, { color: colors.success }]}>
                  Conectado
                </Text>
                <Text style={[styles.statusSubtitle, { color: colors.textSecondary }]}>
                  Última sincronización: {formatDate(cloudSync.lastSync)}
                </Text>
              </View>
            </View>

            {/* Stats */}
            <View style={[styles.statsCard, { backgroundColor: colors.glassLight, borderColor: colors.glassBorder }]}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.accentPurple }]}>
                  {tasks.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Tareas locales
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.glassBorder }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.success }]}>
                  {backupStats?.totalBackups || 0}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Respaldos
                </Text>
              </View>
            </View>

            {/* Sync button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSync}
              disabled={isLoading || cloudSync.isSyncing}
            >
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionGradient}
              >
                {isLoading || cloudSync.isSyncing ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Ionicons name="sync" size={24} color={colors.white} />
                    <Text style={[styles.actionText, { color: colors.white }]}>
                      Sincronizar ahora
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Auto sync info */}
            <View style={[styles.infoCard, { backgroundColor: colors.accentPurple + '10', borderColor: colors.accentPurple + '30' }]}>
              <Ionicons name="information-circle-outline" size={20} color={colors.accentPurple} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                La sincronización automática está activada. Tus tareas se sincronizan cada 5 minutos y cuando abres la aplicación.
              </Text>
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(200)}>
            {/* Create backup button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleCreateBackup}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionGradient}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={24} color={colors.white} />
                    <Text style={[styles.actionText, { color: colors.white }]}>
                      Crear respaldo ahora
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Backup list */}
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              RESPALDOS RECIENTES
            </Text>

            {backups.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.glassLight, borderColor: colors.glassBorder }]}>
                <Ionicons name="archive-outline" size={32} color={colors.textTertiary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No hay respaldos todavía
                </Text>
              </View>
            ) : (
              backups.map((backup, index) => (
                <Animated.View
                  key={backup.id}
                  entering={FadeInUp.delay(index * 50)}
                >
                  <View style={[styles.backupItem, { backgroundColor: colors.glassLight, borderColor: colors.glassBorder }]}>
                    <View style={[styles.backupIcon, { backgroundColor: colors.accentPurple + '20' }]}>
                      <Ionicons name="cloud-done" size={20} color={colors.accentPurple} />
                    </View>
                    <View style={styles.backupInfo}>
                      <Text style={[styles.backupDate, { color: colors.textPrimary }]}>
                        {formatDate(backup.created_at)}
                      </Text>
                      <Text style={[styles.backupMeta, { color: colors.textSecondary }]}>
                        {backup.task_count} tareas · {formatSize(backup.file_size || 0)}
                        {backup.is_automatic && ' · Automático'}
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              ))
            )}

            {/* Auto backup info */}
            <View style={[styles.infoCard, { backgroundColor: colors.accentPurple + '10', borderColor: colors.accentPurple + '30' }]}>
              <Ionicons name="information-circle-outline" size={20} color={colors.accentPurple} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Se crean respaldos automáticos cada 24 horas. Se mantienen los últimos 5 respaldos.
              </Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? spacing.xxxl : spacing.xl,
    paddingBottom: spacing.lg,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },

  headerRight: {
    width: 40,
  },

  content: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },

  authContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },

  notConfiguredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },

  notConfiguredTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.lg,
    textAlign: 'center',
  },

  notConfiguredSubtitle: {
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },

  setupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },

  setupButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  authCard: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },

  authTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.lg,
  },

  authSubtitle: {
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },

  input: {
    width: '100%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    fontSize: typography.fontSize.md,
    marginBottom: spacing.md,
  },

  errorText: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
    textAlign: 'center',
  },

  authButton: {
    width: '100%',
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },

  authButtonGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  authButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },

  switchAuthMode: {
    marginTop: spacing.lg,
  },

  switchAuthText: {
    fontSize: typography.fontSize.sm,
  },

  forgotPassword: {
    marginTop: spacing.md,
  },

  forgotPasswordText: {
    fontSize: typography.fontSize.sm,
    textDecorationLine: 'underline',
  },

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },

  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  userName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  userEmail: {
    fontSize: typography.fontSize.sm,
  },

  signOutButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },

  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },

  tabText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },

  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },

  statusInfo: {
    flex: 1,
  },

  statusTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  statusSubtitle: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },

  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },

  statLabel: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },

  statDivider: {
    width: 1,
    height: 40,
  },

  actionButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },

  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },

  actionText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },

  infoCard: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },

  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
  },

  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 1.5,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },

  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },

  emptyText: {
    fontSize: typography.fontSize.md,
    marginTop: spacing.sm,
  },

  backupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },

  backupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backupInfo: {
    flex: 1,
  },

  backupDate: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },

  backupMeta: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
});
