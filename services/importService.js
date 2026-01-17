/**
 * Import Service
 * TaskList App - Phase 2 Export/Import
 * 
 * Imports tasks from JSON and CSV formats
 */

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

/**
 * Valid categories in the app
 */
const VALID_CATEGORIES = ['personal', 'work', 'shopping', 'health'];

/**
 * Valid priorities in the app
 */
const VALID_PRIORITIES = ['low', 'medium', 'high'];

/**
 * Validate a single task
 * @param {Object} task - Task to validate
 * @param {number} index - Task index for error reporting
 * @returns {Object} Validation result
 */
const validateTask = (task, index) => {
  const errors = [];
  const warnings = [];

  // Required: title
  if (!task.title || String(task.title).trim() === '') {
    errors.push(`Tarea ${index + 1}: Falta el título`);
  }

  // Validate category
  if (task.category && !VALID_CATEGORIES.includes(task.category)) {
    warnings.push(`Tarea ${index + 1}: Categoría "${task.category}" no válida, usando "personal"`);
    task.category = 'personal';
  }

  // Validate priority
  if (task.priority && !VALID_PRIORITIES.includes(task.priority)) {
    warnings.push(`Tarea ${index + 1}: Prioridad "${task.priority}" no válida, usando "medium"`);
    task.priority = 'medium';
  }

  // Validate dueDate if present
  if (task.dueDate && isNaN(new Date(task.dueDate).getTime())) {
    warnings.push(`Tarea ${index + 1}: Fecha límite inválida, ignorando`);
    task.dueDate = null;
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validate import data structure
 * @param {Object} data - Parsed import data
 * @returns {Object} Validation result
 */
export const validateImportData = (data) => {
  const result = {
    valid: true,
    errors: [],
    warnings: [],
    tasks: [],
    stats: {
      total: 0,
      valid: 0,
      invalid: 0,
    },
  };

  // Check if data has tasks array
  if (!data || !Array.isArray(data.tasks)) {
    result.valid = false;
    result.errors.push('Formato de archivo inválido');
    return result;
  }

  // Version compatibility check
  if (data.version) {
    const version = parseFloat(data.version);
    if (version > 2.0) {
      result.warnings.push(`Versión del archivo (${data.version}) es más nueva que la app`);
    }
  }

  result.stats.total = data.tasks.length;

  // Validate each task
  data.tasks.forEach((task, index) => {
    const validation = validateTask(task, index);
    
    result.errors.push(...validation.errors);
    result.warnings.push(...validation.warnings);

    if (validation.valid) {
      result.tasks.push(normalizeTask(task));
      result.stats.valid++;
    } else {
      result.stats.invalid++;
    }
  });

  result.valid = result.tasks.length > 0;

  return result;
};

/**
 * Normalize a task to match app schema
 * @param {Object} task - Task to normalize
 * @returns {Object} Normalized task
 */
const normalizeTask = (task) => {
  const now = new Date().toISOString();

  return {
    id: task.id || `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: String(task.title).trim(),
    description: task.description || '',
    category: VALID_CATEGORIES.includes(task.category) ? task.category : 'personal',
    priority: VALID_PRIORITIES.includes(task.priority) ? task.priority : 'medium',
    completed: Boolean(task.completed),
    dueDate: task.dueDate || null,
    enableReminder: task.enableReminder || false,
    notificationId: null,
    subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
    attachments: [], // Don't import file attachments
    isRecurring: false,
    recurringSeriesId: null,
    instanceDate: null,
    skipped: false,
    createdAt: task.createdAt || now,
    updatedAt: now,
    imported: true,
    importedAt: now,
  };
};

/**
 * Parse JSON content
 * @param {string} content - JSON string
 * @returns {Object} Parsed data
 */
export const parseJSON = (content) => {
  try {
    const parsed = JSON.parse(content);
    
    // Handle both wrapped and unwrapped formats
    if (parsed.tasks && Array.isArray(parsed.tasks)) {
      return parsed;
    }
    
    // If it's an array of tasks directly
    if (Array.isArray(parsed)) {
      return { tasks: parsed, version: '1.0' };
    }

    throw new Error('Formato de JSON no reconocido');
  } catch (error) {
    throw new Error(`Error al parsear JSON: ${error.message}`);
  }
};

/**
 * Parse CSV content
 * @param {string} content - CSV string
 * @returns {Object} Parsed data
 */
export const parseCSV = (content) => {
  try {
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('El archivo CSV está vacío o no tiene datos');
    }

    // Parse headers
    const headers = parseCSVLine(lines[0]);
    
    // Find column indices
    const titleIndex = headers.findIndex(h => 
      h.toLowerCase().includes('title') || h.toLowerCase().includes('título') || h.toLowerCase().includes('titulo')
    );
    const descIndex = headers.findIndex(h => 
      h.toLowerCase().includes('description') || h.toLowerCase().includes('descripción') || h.toLowerCase().includes('descripcion')
    );
    const categoryIndex = headers.findIndex(h => 
      h.toLowerCase().includes('category') || h.toLowerCase().includes('categoría') || h.toLowerCase().includes('categoria')
    );
    const priorityIndex = headers.findIndex(h => 
      h.toLowerCase().includes('priority') || h.toLowerCase().includes('prioridad')
    );
    const completedIndex = headers.findIndex(h => 
      h.toLowerCase().includes('completed') || h.toLowerCase().includes('completada') || h.toLowerCase().includes('completado')
    );
    const dueDateIndex = headers.findIndex(h => 
      h.toLowerCase().includes('due') || h.toLowerCase().includes('fecha')
    );

    if (titleIndex === -1) {
      throw new Error('No se encontró columna de título');
    }

    // Parse data rows
    const tasks = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      
      if (values.length === 0) continue;

      const task = {
        title: values[titleIndex] || '',
        description: descIndex >= 0 ? values[descIndex] || '' : '',
        category: categoryIndex >= 0 ? mapCategory(values[categoryIndex]) : 'personal',
        priority: priorityIndex >= 0 ? mapPriority(values[priorityIndex]) : 'medium',
        completed: completedIndex >= 0 ? isCompletedValue(values[completedIndex]) : false,
        dueDate: dueDateIndex >= 0 ? parseDate(values[dueDateIndex]) : null,
      };

      if (task.title.trim()) {
        tasks.push(task);
      }
    }

    return { tasks, version: '1.0', format: 'csv' };
  } catch (error) {
    throw new Error(`Error al parsear CSV: ${error.message}`);
  }
};

/**
 * Parse a single CSV line handling quoted values
 */
const parseCSVLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && !inQuotes) {
      inQuotes = true;
    } else if (char === '"' && inQuotes) {
      if (nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = false;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
};

/**
 * Map category string to valid category
 */
const mapCategory = (value) => {
  if (!value) return 'personal';
  const lower = value.toLowerCase();
  
  if (lower.includes('work') || lower.includes('trabajo')) return 'work';
  if (lower.includes('shop') || lower.includes('compra')) return 'shopping';
  if (lower.includes('health') || lower.includes('salud')) return 'health';
  return 'personal';
};

/**
 * Map priority string to valid priority
 */
const mapPriority = (value) => {
  if (!value) return 'medium';
  const lower = value.toLowerCase();
  
  if (lower.includes('high') || lower.includes('alta') || lower === 'alto') return 'high';
  if (lower.includes('low') || lower.includes('baja') || lower === 'bajo') return 'low';
  return 'medium';
};

/**
 * Check if value represents completed
 */
const isCompletedValue = (value) => {
  if (!value) return false;
  const lower = value.toLowerCase();
  return ['true', 'yes', 'sí', 'si', '1', 'completada', 'completado'].includes(lower);
};

/**
 * Parse date string
 */
const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date.toISOString();
};

/**
 * Detect duplicates between new and existing tasks
 * @param {Array} newTasks - Tasks to import
 * @param {Array} existingTasks - Existing tasks in app
 * @returns {Object} Duplicate detection result
 */
export const detectDuplicates = (newTasks, existingTasks) => {
  const duplicates = [];
  const unique = [];

  newTasks.forEach(newTask => {
    const isDuplicate = existingTasks.some(existing => 
      existing.title.toLowerCase() === newTask.title.toLowerCase() &&
      existing.category === newTask.category
    );

    if (isDuplicate) {
      duplicates.push(newTask);
    } else {
      unique.push(newTask);
    }
  });

  return {
    duplicates,
    unique,
    hasDuplicates: duplicates.length > 0,
  };
};

/**
 * Pick and read import file
 * @returns {Promise<Object>} Parsed file content
 */
export const pickAndReadImportFile = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/json', 'text/csv', 'text/plain', '*/*'],
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return null;
    }

    const file = result.assets[0];
    const content = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Detect format
    const isJSON = file.mimeType?.includes('json') || 
                   file.name?.endsWith('.json') || 
                   content.trim().startsWith('{') ||
                   content.trim().startsWith('[');

    const parsed = isJSON ? parseJSON(content) : parseCSV(content);

    return {
      ...parsed,
      filename: file.name,
      filesize: file.size,
    };
  } catch (error) {
    console.error('Error reading import file:', error);
    throw error;
  }
};

export default {
  validateImportData,
  parseJSON,
  parseCSV,
  detectDuplicates,
  pickAndReadImportFile,
};
