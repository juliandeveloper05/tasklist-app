/**
 * Auth Screen - Bitrova Minimalist
 * Estética Dark Neon con la estructura de posicionamiento original.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext'; 

// --- TEMA BITROVA MINIMALISTA ---
const theme = {
  bg: '#050511', // Fondo principal oscuro
  // Tarjeta: más transparente y sutil para el minimalismo
  cardBg: 'rgba(20, 20, 35, 0.7)', 
  cardBorderGlowing: 'rgba(139, 92, 246, 0.5)', // Violeta brillante para el borde
  cardBorderStatic: 'rgba(255, 255, 255, 0.1)', // Borde sutil
  
  primaryGradient: ['#7C3AED', '#C026D3'], // Gradiente violeta a fucsia más moderno
  
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8', // Gris azulado claro
  textTertiary: '#64748B',  // Gris más oscuro para elementos secundarios
  
  inputBg: 'rgba(15, 23, 42, 0.6)',
  inputBorder: 'rgba(148, 163, 184, 0.15)',
  
  accentNeon: '#A855F7', // Color de acento principal
};

const { width, height } = Dimensions.get('window');

// Safe haptics wrapper
const safeHaptics = {
  impact: (style) => { if (Platform.OS !== 'web') Haptics.impactAsync(style); },
  notification: (type) => { if (Platform.OS !== 'web') Haptics.notificationAsync(type); }
};

export default function AuthScreen() {
  const auth = useAuth();
  
  // Estados
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // --- Animaciones Minimalistas ---
  // Animación sutil de respiración para el borde de la tarjeta
  const glowOpacity = useSharedValue(0.3);
  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(withTiming(0.6, { duration: 2500 }), withTiming(0.3, { duration: 2500 })),
      -1, true
    );
  }, []);

  const animatedBorderGlow = useAnimatedStyle(() => ({
    borderColor: theme.cardBorderGlowing,
    opacity: glowOpacity.value,
  }));

  // Lógica de autenticación (Mantenida igual)
  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos');
      safeHaptics.notification(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    setIsLoading(true); setError('');
    safeHaptics.impact(Haptics.ImpactFeedbackStyle.Medium);
    try {
      if (authMode === 'login') {
        await auth.signIn(email, password);
      } else {
        await auth.signUp(email, password, displayName);
        Alert.alert('¡Cuenta creada!', 'Bienvenido a Bitrova.');
      }
    } catch (err) {
      setError('Error de autenticación. Verifica tus datos.');
      safeHaptics.notification(Haptics.NotificationFeedbackType.Error);
    } finally { setIsLoading(false); }
  };

  return (
    <View style={styles.wrapper}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Fondo Minimalista con gradiente sutil */}
        <LinearGradient
          colors={[theme.bg, '#0F0F24']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {/* Un solo foco de luz sutil en la parte superior */}
      <View style={styles.ambientLightTop} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* --- HEADER SECTION (Fuera de la tarjeta, posición original) --- */}
        <Animated.View 
          style={styles.headerSection}
          entering={FadeInDown.delay(100).springify()}
        >
          <View style={styles.logoContainer}>
             <Ionicons name="checkmark-done" size={54} color={theme.accentNeon} /> 
          </View>
          <Text style={styles.appName}>Bitrova</Text>
          <Text style={styles.tagline}>Organiza tu vida, simplifica tu día</Text>
        </Animated.View>

        {/* --- MAIN CARD SECTION --- */}
        <Animated.View 
          style={styles.cardContainer}
          entering={FadeInUp.delay(200).springify()}
        >
          {/* Capa de borde animado brillante */}
          <Animated.View style={[styles.cardGlowBorder, animatedBorderGlow]} />
          
          {/* Contenido de la tarjeta */}
          <View style={styles.cardContent}>
              
              <Text style={styles.cardTitle}>
                {authMode === 'login' ? 'Bienvenido de nuevo' : 'Crear cuenta'}
              </Text>

              {/* Inputs */}
              <View style={styles.formGroup}>
                {authMode === 'register' && (
                  <Animated.View entering={FadeInDown} style={styles.inputWrapper}>
                    <Ionicons name="person-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nombre"
                      placeholderTextColor={theme.textTertiary}
                      value={displayName}
                      onChangeText={setDisplayName}
                      onFocus={() => safeHaptics.impact(Haptics.ImpactFeedbackStyle.Light)}
                    />
                  </Animated.View>
                )}

                <View style={styles.inputWrapper}>
                  <Ionicons name="at-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={theme.textTertiary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => safeHaptics.impact(Haptics.ImpactFeedbackStyle.Light)}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    placeholderTextColor={theme.textTertiary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    onFocus={() => safeHaptics.impact(Haptics.ImpactFeedbackStyle.Light)}
                  />
                  <TouchableOpacity 
                    style={styles.eyeIcon} 
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {/* Botón Principal */}
              <TouchableOpacity
                onPress={handleAuth}
                disabled={isLoading}
                activeOpacity={0.8}
                style={styles.primaryButtonContainer}
              >
                <LinearGradient
                  colors={theme.primaryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButton}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      {authMode === 'login' ? 'Iniciar sesión' : 'Registrarse'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {authMode === 'login' && (
                <TouchableOpacity 
                  style={styles.forgotPassBtn}
                  onPress={() => {
                    if (!email.trim()) {
                      Alert.alert(
                        'Email requerido',
                        'Por favor ingresa tu email primero para poder enviarte las instrucciones de recuperación.',
                        [{ text: 'OK' }]
                      );
                      return;
                    }
                    
                    Alert.alert(
                      'Recuperar contraseña',
                      `¿Enviar instrucciones de recuperación a ${email}?`,
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Enviar',
                          onPress: async () => {
                            try {
                              setIsLoading(true);
                              await auth.resetPassword(email);
                              Alert.alert(
                                '¡Correo enviado!',
                                'Revisa tu bandeja de entrada para restablecer tu contraseña.',
                                [{ text: 'OK' }]
                              );
                            } catch (err) {
                              Alert.alert(
                                'Error',
                                'No se pudo enviar el correo. Verifica que el email sea correcto.',
                                [{ text: 'OK' }]
                              );
                            } finally {
                              setIsLoading(false);
                            }
                          }
                        }
                      ]
                    );
                  }}
                >
                  <Text style={styles.forgotPassText}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>
              )}

              {/* Divisor Minimalista (Estilo Original "o") */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>o</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Botón Secundario (Switch) */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  safeHaptics.impact(Haptics.ImpactFeedbackStyle.Light);
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setError('');
                }}
              >
                <Text style={styles.secondaryButtonText}>
                  {authMode === 'login' ? 'Crear una cuenta nueva' : 'Ya tengo cuenta'}
                </Text>
              </TouchableOpacity>

            </View>
        </Animated.View>

        {/* --- FOOTER SECTION (Fuera de la tarjeta, posición original) --- */}
        <Animated.View 
          style={styles.footerSection}
          entering={FadeInUp.delay(400)}
        >
          <Text style={styles.footerText}>
            Hecho con ❤️ por Julian Javier Soto
          </Text>
          <Text style={styles.copyrightText}>
            © {new Date().getFullYear()} Bitrova. Todos los derechos reservados.
          </Text>
        </Animated.View>

      </ScrollView>
    </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#050511',
  },
  container: {
    flex: 1,
    backgroundColor: '#050511',
  },
  // Luz ambiental minimalista
  ambientLightTop: {
    position: 'absolute',
    top: -height * 0.2,
    left: -width * 0.1,
    width: width * 1.2,
    height: height * 0.5,
    backgroundColor: theme.accentNeon,
    opacity: 0.06,
    transform: [{ rotate: '-15deg' }],
    borderRadius: width,
    blurRadius: 150, 
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingBottom: 40,
  },

  // --- HEADER STYLES ---
  headerSection: {
    alignItems: 'center',
    marginBottom: 40, // Espaciado grande antes de la tarjeta
  },
  logoContainer: {
    marginBottom: 10,
    // Sombra muy sutil en el logo
    shadowColor: theme.accentNeon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.textPrimary,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 15,
    color: theme.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },

  // --- CARD STYLES ---
  cardContainer: {
    position: 'relative',
    borderRadius: 24,
    // Sombra de la tarjeta principal más suave
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  // El borde animado brillante detrás del contenido
  cardGlowBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: theme.cardBorderGlowing,
    zIndex: 1,
  },
  cardContent: {
    backgroundColor: theme.cardBg,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    // Borde estático sutil interno
    borderWidth: 1,
    borderColor: theme.cardBorderStatic,
    zIndex: 2,
    backdropFilter: 'blur(20px)', // Para soporte web/algunos nativos
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 28,
  },
  formGroup: {
    width: '100%',
    gap: 14,
    marginBottom: 10,
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
  },
  inputIcon: {
    position: 'absolute',
    left: 18,
    top: 15,
    zIndex: 2,
  },
  input: {
    width: '100%',
    backgroundColor: theme.inputBg,
    borderWidth: 1,
    borderColor: theme.inputBorder,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    paddingLeft: 50, 
    color: theme.textPrimary,
    fontSize: 15,
  },
  eyeIcon: {
    position: 'absolute',
    right: 18,
    top: 15,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center',
  },
  primaryButtonContainer: {
    width: '100%',
    marginTop: 24,
    // Sombra del botón suavizada
    shadowColor: theme.accentNeon,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  forgotPassBtn: {
    marginTop: 20,
    padding: 5,
  },
  forgotPassText: {
    color: theme.textSecondary,
    fontSize: 14,
  },

  // --- DIVIDER (Estilo Original Minimalista) ---
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 28,
  },
  dividerLine: {
    height: 1,
    flex: 1,
    backgroundColor: theme.cardBorderStatic,
  },
  dividerText: {
    marginHorizontal: 16,
    color: theme.textTertiary,
    fontSize: 14,
  },

  secondaryButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.inputBorder,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: theme.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },

  // --- FOOTER STYLES ---
  footerSection: {
    marginTop: 40, // Espaciado grande después de la tarjeta
    alignItems: 'center',
  },
  footerText: {
    color: theme.textSecondary,
    fontSize: 13,
    marginBottom: 6,
  },
  copyrightText: {
    color: theme.textTertiary,
    fontSize: 12,
  },
});