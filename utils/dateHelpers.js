/**
 * Date Helpers - Utility functions for date formatting
 * Task List App 2026
 */

/**
 * Format a date as relative time (e.g., "hace 5 min", "hace 2 días")
 * @param {Date|string} date - The date to format
 * @returns {string} Relative time string in Spanish
 */
export function formatRelativeTime(date) {
  if (!date) return '';
  
  const now = new Date();
  const then = date instanceof Date ? date : new Date(date);
  const diffMs = now - then;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) {
    return 'hace un momento';
  } else if (diffMinutes < 60) {
    return diffMinutes === 1 ? 'hace 1 min' : `hace ${diffMinutes} min`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? 'hace 1 hora' : `hace ${diffHours} horas`;
  } else if (diffDays < 7) {
    return diffDays === 1 ? 'hace 1 día' : `hace ${diffDays} días`;
  } else if (diffWeeks < 4) {
    return diffWeeks === 1 ? 'hace 1 semana' : `hace ${diffWeeks} semanas`;
  } else if (diffMonths < 12) {
    return diffMonths === 1 ? 'hace 1 mes' : `hace ${diffMonths} meses`;
  } else {
    const diffYears = Math.floor(diffMonths / 12);
    return diffYears === 1 ? 'hace 1 año' : `hace ${diffYears} años`;
  }
}

/**
 * Format a date in a friendly local format
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatDateTime(date) {
  if (!date) return 'Desconocida';
  
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a date for display (short format)
 * @param {Date|string} date - The date to format
 * @returns {string} Short formatted date string
 */
export function formatDateShort(date) {
  if (!date) return '';
  
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Check if a date is today
 * @param {Date|string} date - The date to check
 * @returns {boolean}
 */
export function isToday(date) {
  if (!date) return false;
  
  const d = date instanceof Date ? date : new Date(date);
  const today = new Date();
  
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is overdue
 * @param {Date|string} date - The date to check
 * @returns {boolean}
 */
export function isOverdue(date) {
  if (!date) return false;
  
  const d = date instanceof Date ? date : new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return d < today;
}
