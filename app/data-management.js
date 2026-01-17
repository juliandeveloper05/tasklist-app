/**
 * Data Management Screen
 * TaskList App - Phase 2 Export/Import
 * 
 * Export and Import data with wizard-style UI
 */

import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, borderRadius } from '../constants/theme';
import { exportToJSON, exportToCSV, exportToMarkdown, saveAndShareExport } from '../services/exportService';
import { pickAndReadImportFile, validateImportData, detectDuplicates } from '../services/importService';

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

// Tab component
const TabButton = ({ title, icon, isActive, onPress, colors }) => (
  <TouchableOpacity
    style={[
      styles.tab,
      { borderColor: colors.glassBorder },
      isActive && { backgroundColor: colors.accentPurple + '20', borderColor: colors.accentPurple },
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Ionicons
      name={icon}
      size={20}
      color={isActive ? colors.accentPurple : colors.textSecondary}
    />
    <Text
      style={[
        styles.tabText,
        { color: isActive ? colors.accentPurple : colors.textSecondary },
      ]}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

// Format option card
const FormatCard = ({ title, subtitle, icon, isSelected, onPress, colors }) => (
  <TouchableOpacity
    style={[
      styles.formatCard,
      { backgroundColor: colors.glassLight, borderColor: colors.glassBorder },
      isSelected && { borderColor: colors.accentPurple, backgroundColor: colors.accentPurple + '10' },
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.radioOuter, { borderColor: isSelected ? colors.accentPurple : colors.textTertiary }]}>
      {isSelected && <View style={[styles.radioInner, { backgroundColor: colors.accentPurple }]} />}
    </View>
    <Ionicons
      name={icon}
      size={24}
      color={isSelected ? colors.accentPurple : colors.textSecondary}
    />
    <View style={styles.formatInfo}>
      <Text style={[styles.formatTitle, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.formatSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

export default function DataManagement() {
  const router = useRouter();
  const { tasks, addTask } = useContext(TaskContext);
  const { colors, isDarkMode } = useTheme();

  const [activeTab, setActiveTab] = useState('export');
  const [exportFormat, setExportFormat] = useState('json');
  const [includeCompleted, setIncludeCompleted] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Import state
  const [importPreview, setImportPreview] = useState(null);
  const [importResult, setImportResult] = useState(null);

  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  // Handle export
  const handleExport = async () => {
    setIsLoading(true);
    
    try {
      let content;
      
      switch (exportFormat) {
        case 'json':
          content = exportToJSON(tasks, { includeCompleted });
          break;
        case 'csv':
          content = exportToCSV(tasks, { includeCompleted });
          break;
        case 'markdown':
          content = exportToMarkdown(tasks, { includeCompleted });
          break;
        default:
          content = exportToJSON(tasks, { includeCompleted });
      }

      await saveAndShareExport(content, exportFormat);
      safeHaptics.notification(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert('Éxito', 'Datos exportados correctamente');
    } catch (error) {
      console.error('Export error:', error);
      safeHaptics.notification(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'No se pudieron exportar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle import file selection
  const handleSelectFile = async () => {
    setIsLoading(true);
    setImportPreview(null);
    setImportResult(null);

    try {
      const fileData = await pickAndReadImportFile();
      
      if (!fileData) {
        setIsLoading(false);
        return;
      }

      const validation = validateImportData(fileData);
      const duplicates = detectDuplicates(validation.tasks, tasks);

      setImportPreview({
        filename: fileData.filename,
        filesize: fileData.filesize,
        validation,
        duplicates,
      });

      safeHaptics.notification(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Import file error:', error);
      safeHaptics.notification(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'No se pudo leer el archivo');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle import confirm
  const handleImportConfirm = async () => {
    if (!importPreview?.validation?.tasks) return;

    setIsLoading(true);

    try {
      const tasksToImport = importPreview.duplicates.unique;
      let importedCount = 0;

      for (const task of tasksToImport) {
        await addTask(task);
        importedCount++;
      }

      setImportResult({
        success: true,
        imported: importedCount,
        skipped: importPreview.duplicates.duplicates.length,
      });

      safeHaptics.notification(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Import error:', error);
      safeHaptics.notification(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'No se pudieron importar las tareas');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset import state
  const handleResetImport = () => {
    setImportPreview(null);
    setImportResult(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* Header */}
      <Animated.View
        style={styles.header}
        entering={FadeInDown.springify()}
      >
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.glassMedium }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Gestión de Datos
        </Text>

        <View style={styles.headerRight} />
      </Animated.View>

      {/* Tabs */}
      <Animated.View
        style={styles.tabsContainer}
        entering={FadeInUp.delay(100).springify()}
      >
        <TabButton
          title="Exportar"
          icon="cloud-download-outline"
          isActive={activeTab === 'export'}
          onPress={() => setActiveTab('export')}
          colors={colors}
        />
        <TabButton
          title="Importar"
          icon="cloud-upload-outline"
          isActive={activeTab === 'import'}
          onPress={() => {
            setActiveTab('import');
            handleResetImport();
          }}
          colors={colors}
        />
      </Animated.View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'export' ? (
          <Animated.View entering={FadeIn.duration(200)}>
            {/* Export Stats */}
            <View style={[styles.statsCard, { backgroundColor: colors.glassLight, borderColor: colors.glassBorder }]}>
              <Text style={[styles.statsTitle, { color: colors.textPrimary }]}>
                Resumen de datos
              </Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.accentPurple }]}>{totalTasks}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.success }]}>{completedTasks}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completadas</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.warning }]}>{pendingTasks}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pendientes</Text>
                </View>
              </View>
            </View>

            {/* Format Selection */}
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              FORMATO DE EXPORTACIÓN
            </Text>

            <FormatCard
              title="JSON"
              subtitle="Respaldo completo con todos los datos"
              icon="code-slash"
              isSelected={exportFormat === 'json'}
              onPress={() => setExportFormat('json')}
              colors={colors}
            />

            <FormatCard
              title="CSV"
              subtitle="Compatible con Excel y Google Sheets"
              icon="grid-outline"
              isSelected={exportFormat === 'csv'}
              onPress={() => setExportFormat('csv')}
              colors={colors}
            />

            <FormatCard
              title="Markdown"
              subtitle="Formato legible para documentación"
              icon="document-text-outline"
              isSelected={exportFormat === 'markdown'}
              onPress={() => setExportFormat('markdown')}
              colors={colors}
            />

            {/* Options */}
            <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: spacing.lg }]}>
              OPCIONES
            </Text>

            <TouchableOpacity
              style={[styles.optionRow, { backgroundColor: colors.glassLight, borderColor: colors.glassBorder }]}
              onPress={() => setIncludeCompleted(!includeCompleted)}
              activeOpacity={0.7}
            >
              <View style={styles.optionInfo}>
                <Ionicons name="checkmark-done" size={20} color={colors.textSecondary} />
                <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                  Incluir tareas completadas
                </Text>
              </View>
              <View style={[
                styles.checkbox,
                { borderColor: includeCompleted ? colors.accentPurple : colors.textTertiary },
                includeCompleted && { backgroundColor: colors.accentPurple }
              ]}>
                {includeCompleted && <Ionicons name="checkmark" size={16} color={colors.white} />}
              </View>
            </TouchableOpacity>

            {/* Export Button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleExport}
              disabled={isLoading || totalTasks === 0}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={totalTasks > 0 ? [colors.gradientStart, colors.gradientEnd] : [colors.textTertiary, colors.textTertiary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionGradient}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Ionicons name="download-outline" size={24} color={colors.white} />
                    <Text style={[styles.actionText, { color: colors.white }]}>
                      Exportar {includeCompleted ? totalTasks : pendingTasks} tareas
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(200)}>
            {/* Import Success Result */}
            {importResult?.success ? (
              <View style={[styles.resultCard, { backgroundColor: colors.success + '15', borderColor: colors.success }]}>
                <Ionicons name="checkmark-circle" size={48} color={colors.success} />
                <Text style={[styles.resultTitle, { color: colors.success }]}>
                  ¡Importación completada!
                </Text>
                <Text style={[styles.resultSubtitle, { color: colors.textSecondary }]}>
                  {importResult.imported} tareas importadas
                  {importResult.skipped > 0 && ` (${importResult.skipped} duplicadas omitidas)`}
                </Text>
                <TouchableOpacity
                  style={[styles.resultButton, { backgroundColor: colors.success }]}
                  onPress={() => router.back()}
                >
                  <Text style={[styles.resultButtonText, { color: colors.white }]}>
                    Ver mis tareas
                  </Text>
                </TouchableOpacity>
              </View>
            ) : importPreview ? (
              /* Import Preview */
              <>
                <View style={[styles.previewCard, { backgroundColor: colors.glassLight, borderColor: colors.glassBorder }]}>
                  <View style={styles.previewHeader}>
                    <Ionicons name="document-text" size={24} color={colors.accentPurple} />
                    <View style={styles.previewInfo}>
                      <Text style={[styles.previewFilename, { color: colors.textPrimary }]}>
                        {importPreview.filename}
                      </Text>
                      <Text style={[styles.previewSize, { color: colors.textSecondary }]}>
                        {Math.round((importPreview.filesize || 0) / 1024)} KB
                      </Text>
                    </View>
                    <TouchableOpacity onPress={handleResetImport}>
                      <Ionicons name="close-circle" size={24} color={colors.textTertiary} />
                    </TouchableOpacity>
                  </View>

                  {/* Validation results */}
                  <View style={styles.validationResults}>
                    <View style={[styles.validationItem, { backgroundColor: colors.success + '15' }]}>
                      <Text style={[styles.validationValue, { color: colors.success }]}>
                        {importPreview.validation.stats.valid}
                      </Text>
                      <Text style={[styles.validationLabel, { color: colors.textSecondary }]}>
                        Válidas
                      </Text>
                    </View>
                    
                    {importPreview.duplicates.hasDuplicates && (
                      <View style={[styles.validationItem, { backgroundColor: colors.warning + '15' }]}>
                        <Text style={[styles.validationValue, { color: colors.warning }]}>
                          {importPreview.duplicates.duplicates.length}
                        </Text>
                        <Text style={[styles.validationLabel, { color: colors.textSecondary }]}>
                          Duplicadas
                        </Text>
                      </View>
                    )}

                    {importPreview.validation.stats.invalid > 0 && (
                      <View style={[styles.validationItem, { backgroundColor: colors.error + '15' }]}>
                        <Text style={[styles.validationValue, { color: colors.error }]}>
                          {importPreview.validation.stats.invalid}
                        </Text>
                        <Text style={[styles.validationLabel, { color: colors.textSecondary }]}>
                          Inválidas
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Warnings */}
                  {importPreview.validation.warnings.length > 0 && (
                    <View style={[styles.warningsBox, { backgroundColor: colors.warning + '10' }]}>
                      <Text style={[styles.warningsTitle, { color: colors.warning }]}>
                        Advertencias:
                      </Text>
                      {importPreview.validation.warnings.slice(0, 3).map((warning, i) => (
                        <Text key={i} style={[styles.warningText, { color: colors.textSecondary }]}>
                          • {warning}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>

                {/* Import Actions */}
                <View style={styles.importActions}>
                  <TouchableOpacity
                    style={[styles.secondaryButton, { borderColor: colors.glassBorder }]}
                    onPress={handleResetImport}
                  >
                    <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleImportConfirm}
                    disabled={isLoading || importPreview.duplicates.unique.length === 0}
                  >
                    <LinearGradient
                      colors={importPreview.duplicates.unique.length > 0 ? [colors.gradientStart, colors.gradientEnd] : [colors.textTertiary, colors.textTertiary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.actionGradient}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color={colors.white} />
                      ) : (
                        <Text style={[styles.actionText, { color: colors.white }]}>
                          Importar {importPreview.duplicates.unique.length} tareas
                        </Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              /* Import Initial State */
              <>
                <View style={[styles.uploadArea, { backgroundColor: colors.glassLight, borderColor: colors.glassBorder }]}>
                  <Ionicons name="cloud-upload-outline" size={48} color={colors.accentPurple} />
                  <Text style={[styles.uploadTitle, { color: colors.textPrimary }]}>
                    Seleccionar archivo
                  </Text>
                  <Text style={[styles.uploadSubtitle, { color: colors.textSecondary }]}>
                    Formatos soportados: JSON, CSV
                  </Text>

                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={handleSelectFile}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={[colors.gradientStart, colors.gradientEnd]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.selectButtonGradient}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color={colors.white} />
                      ) : (
                        <>
                          <Ionicons name="folder-open-outline" size={20} color={colors.white} />
                          <Text style={[styles.selectButtonText, { color: colors.white }]}>
                            Examinar archivos
                          </Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Import tips */}
                <View style={[styles.tipsCard, { backgroundColor: colors.accentPurple + '10', borderColor: colors.accentPurple + '30' }]}>
                  <Text style={[styles.tipsTitle, { color: colors.accentPurple }]}>
                    💡 Consejos de importación
                  </Text>
                  <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
                    • Usa archivos exportados de Bitrova para mejores resultados
                  </Text>
                  <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
                    • Los archivos CSV deben tener columna "Title" o "Título"
                  </Text>
                  <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
                    • Las tareas duplicadas se detectarán automáticamente
                  </Text>
                </View>
              </>
            )}
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
    fontWeight: typography.fontWeight.semibold,
  },

  content: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },

  statsCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },

  statsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  statItem: {
    alignItems: 'center',
  },

  statValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },

  statLabel: {
    fontSize: typography.fontSize.sm,
  },

  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 1.5,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },

  formatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  formatInfo: {
    flex: 1,
  },

  formatTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  formatSubtitle: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },

  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  optionText: {
    fontSize: typography.fontSize.md,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionButton: {
    marginTop: spacing.xl,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
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

  uploadArea: {
    alignItems: 'center',
    padding: spacing.xxl,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
  },

  uploadTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.md,
  },

  uploadSubtitle: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },

  selectButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },

  selectButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },

  selectButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  tipsCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },

  tipsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },

  tipsText: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },

  previewCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },

  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },

  previewInfo: {
    flex: 1,
  },

  previewFilename: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  previewSize: {
    fontSize: typography.fontSize.sm,
  },

  validationResults: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  validationItem: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },

  validationValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },

  validationLabel: {
    fontSize: typography.fontSize.xs,
  },

  warningsBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },

  warningsTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },

  warningText: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },

  importActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  secondaryButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },

  secondaryButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  resultCard: {
    alignItems: 'center',
    padding: spacing.xxl,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },

  resultTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.md,
  },

  resultSubtitle: {
    fontSize: typography.fontSize.md,
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  resultButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },

  resultButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
});
