/**
 * Export Service
 * TaskList App - Phase 2 Export/Import
 * 
 * Exports tasks to JSON, CSV, and Markdown formats
 */

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

/**
 * Export version for compatibility tracking
 */
const EXPORT_VERSION = '2.0';

/**
 * Escape special characters for CSV
 */
const escapeCsvValue = (value) => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  // If contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

/**
 * Export tasks to JSON format
 * @param {Array} tasks - Tasks to export
 * @param {Object} options - Export options
 * @returns {string} JSON string
 */
export const exportToJSON = (tasks, options = {}) => {
  const {
    includeCompleted = true,
    includeAttachments = false,
    dateRange = null,
    categories = null,
  } = options;

  let filteredTasks = [...tasks];

  // Filter by completion status
  if (!includeCompleted) {
    filteredTasks = filteredTasks.filter(t => !t.completed);
  }

  // Filter by date range
  if (dateRange?.start || dateRange?.end) {
    filteredTasks = filteredTasks.filter(t => {
      const createdAt = new Date(t.createdAt);
      if (dateRange.start && createdAt < new Date(dateRange.start)) return false;
      if (dateRange.end && createdAt > new Date(dateRange.end)) return false;
      return true;
    });
  }

  // Filter by categories
  if (categories && categories.length > 0) {
    filteredTasks = filteredTasks.filter(t => categories.includes(t.category));
  }

  // Prepare tasks for export
  const exportTasks = filteredTasks.map(task => {
    const exportTask = { ...task };
    
    // Handle attachments
    if (!includeAttachments && exportTask.attachments) {
      // Only include metadata, not file references
      exportTask.attachments = exportTask.attachments.map(a => ({
        id: a.id,
        filename: a.filename,
        type: a.type,
        filesize: a.filesize,
      }));
    }
    
    return exportTask;
  });

  // Build export object
  const exportData = {
    version: EXPORT_VERSION,
    exportDate: new Date().toISOString(),
    appName: 'TaskList App',
    tasks: exportTasks,
    metadata: {
      totalTasks: exportTasks.length,
      completedTasks: exportTasks.filter(t => t.completed).length,
      pendingTasks: exportTasks.filter(t => !t.completed).length,
      categories: [...new Set(exportTasks.map(t => t.category))],
      exportOptions: options,
    },
  };

  return JSON.stringify(exportData, null, 2);
};

/**
 * Export tasks to CSV format
 * @param {Array} tasks - Tasks to export
 * @param {Object} options - Export options
 * @returns {string} CSV string
 */
export const exportToCSV = (tasks, options = {}) => {
  const { includeCompleted = true } = options;

  let filteredTasks = [...tasks];
  if (!includeCompleted) {
    filteredTasks = filteredTasks.filter(t => !t.completed);
  }

  // CSV headers
  const headers = [
    'ID',
    'Title',
    'Description',
    'Category',
    'Priority',
    'Completed',
    'Due Date',
    'Created At',
    'Updated At',
    'Subtasks Count',
    'Attachments Count',
  ];

  // Build CSV rows
  const rows = filteredTasks.map(task => [
    escapeCsvValue(task.id),
    escapeCsvValue(task.title),
    escapeCsvValue(task.description || ''),
    escapeCsvValue(task.category),
    escapeCsvValue(task.priority),
    task.completed ? 'Yes' : 'No',
    escapeCsvValue(task.dueDate || ''),
    escapeCsvValue(task.createdAt),
    escapeCsvValue(task.updatedAt || ''),
    (task.subtasks || []).length,
    (task.attachments || []).length,
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  return csvContent;
};

/**
 * Export tasks to Markdown format
 * @param {Array} tasks - Tasks to export
 * @param {Object} options - Export options
 * @returns {string} Markdown string
 */
export const exportToMarkdown = (tasks, options = {}) => {
  const { includeCompleted = true } = options;

  const now = new Date();
  const dateStr = now.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  let filteredTasks = [...tasks];
  if (!includeCompleted) {
    filteredTasks = filteredTasks.filter(t => !t.completed);
  }

  // Group tasks by status
  const pendingTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  // Group pending by priority
  const highPriority = pendingTasks.filter(t => t.priority === 'high');
  const mediumPriority = pendingTasks.filter(t => t.priority === 'medium');
  const lowPriority = pendingTasks.filter(t => t.priority === 'low');

  // Format task line
  const formatTask = (task) => {
    const checkbox = task.completed ? '[x]' : '[ ]';
    let line = `- ${checkbox} ${task.title}`;
    
    if (task.dueDate) {
      const due = new Date(task.dueDate).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
      });
      line += ` (${due})`;
    }
    
    return line;
  };

  // Build markdown
  let md = `# Mis Tareas - Exportado el ${dateStr}\n\n`;

  // Stats
  md += `> **Total:** ${filteredTasks.length} tareas | `;
  md += `**Pendientes:** ${pendingTasks.length} | `;
  md += `**Completadas:** ${completedTasks.length}\n\n`;

  // Pending tasks
  if (pendingTasks.length > 0) {
    md += `## Pendientes (${pendingTasks.length})\n\n`;

    if (highPriority.length > 0) {
      md += `### 🔴 Alta Prioridad\n`;
      highPriority.forEach(t => { md += formatTask(t) + '\n'; });
      md += '\n';
    }

    if (mediumPriority.length > 0) {
      md += `### 🟡 Media Prioridad\n`;
      mediumPriority.forEach(t => { md += formatTask(t) + '\n'; });
      md += '\n';
    }

    if (lowPriority.length > 0) {
      md += `### 🟢 Baja Prioridad\n`;
      lowPriority.forEach(t => { md += formatTask(t) + '\n'; });
      md += '\n';
    }
  }

  // Completed tasks
  if (completedTasks.length > 0) {
    md += `## Completadas (${completedTasks.length})\n\n`;
    completedTasks.forEach(t => { md += formatTask(t) + '\n'; });
  }

  return md;
};

/**
 * Save export to file and share
 * @param {string} content - Export content
 * @param {string} format - Export format (json, csv, md)
 * @returns {Promise<boolean>} Success status
 */
export const saveAndShareExport = async (content, format) => {
  try {
    const timestamp = new Date().toISOString().split('T')[0];
    const extensions = { json: 'json', csv: 'csv', markdown: 'md' };
    const extension = extensions[format] || 'txt';
    const filename = `tasklist_export_${timestamp}.${extension}`;

    if (Platform.OS === 'web') {
      // Web: Create and download blob
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    }

    // Mobile: Save to file and share
    const fileUri = FileSystem.cacheDirectory + filename;
    await FileSystem.writeAsStringAsync(fileUri, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: format === 'json' ? 'application/json' : 'text/plain',
        dialogTitle: 'Exportar tareas',
      });
    }

    return true;
  } catch (error) {
    console.error('Error saving export:', error);
    throw error;
  }
};

export default {
  exportToJSON,
  exportToCSV,
  exportToMarkdown,
  saveAndShareExport,
};
