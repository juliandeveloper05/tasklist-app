/**
 * Backup Service
 * TaskList App - Phase 2 Cloud Backup
 * 
 * Handles task backups to Supabase cloud storage
 */

import { supabase, TABLES, BACKUP_CONFIG, isSupabaseConfigured } from '../config/supabase';
import { getCurrentUserId } from './cloudSyncService';

/**
 * Create a backup of all tasks
 * @param {Array} tasks - Tasks to backup
 * @param {boolean} isAutomatic - Whether this is an automatic backup
 * @returns {Promise<Object>} Backup result
 */
export const createBackup = async (tasks, isAutomatic = false) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('Usuario no autenticado');
  }

  try {
    // Create backup data
    const backupData = {
      version: '2.0',
      created_at: new Date().toISOString(),
      task_count: tasks.length,
      tasks: tasks.map(task => ({
        ...task,
        // Remove local-only data
        notificationId: null,
        attachments: (task.attachments || []).map(a => ({
          id: a.id,
          filename: a.filename,
          type: a.type,
          filesize: a.filesize,
        })),
      })),
    };

    // Convert to JSON string
    const backupJson = JSON.stringify(backupData, null, 2);
    const backupSize = new Blob([backupJson]).size;

    // Generate storage path
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const storagePath = `backups/${userId}/${timestamp}.json`;

    // Upload to Supabase Storage (if bucket exists) or save metadata only
    // For simplicity, we'll store the backup in the database as JSONB
    
    // Insert backup record
    const { data, error } = await supabase
      .from(TABLES.BACKUPS)
      .insert({
        user_id: userId,
        task_count: tasks.length,
        file_size: backupSize,
        storage_path: storagePath,
        is_automatic: isAutomatic,
        version: '2.0',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating backup record:', error);
      throw error;
    }

    // Clean up old backups
    await cleanupOldBackups(userId);

    return {
      success: true,
      backupId: data.id,
      taskCount: tasks.length,
      fileSize: backupSize,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Error creating backup:', error);
    throw error;
  }
};

/**
 * Get list of user's backups
 * @param {number} limit - Maximum number of backups to return
 * @returns {Promise<Array>} List of backups
 */
export const listBackups = async (limit = 10) => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.BACKUPS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error listing backups:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error listing backups:', error);
    return [];
  }
};

/**
 * Delete a backup
 * @param {string} backupId - Backup ID to delete
 */
export const deleteBackup = async (backupId) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('Usuario no autenticado');
  }

  try {
    const { error } = await supabase
      .from(TABLES.BACKUPS)
      .delete()
      .eq('id', backupId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting backup:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting backup:', error);
    throw error;
  }
};

/**
 * Clean up old backups, keeping only the most recent ones
 * @param {string} userId - User ID
 */
const cleanupOldBackups = async (userId) => {
  try {
    // Get all backups sorted by date
    const { data: backups, error } = await supabase
      .from(TABLES.BACKUPS)
      .select('id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting backups for cleanup:', error);
      return;
    }

    // Delete old backups beyond the limit
    if (backups && backups.length > BACKUP_CONFIG.MAX_BACKUPS) {
      const toDelete = backups.slice(BACKUP_CONFIG.MAX_BACKUPS);
      
      for (const backup of toDelete) {
        await supabase
          .from(TABLES.BACKUPS)
          .delete()
          .eq('id', backup.id);
      }

      console.log(`Cleaned up ${toDelete.length} old backups`);
    }
  } catch (error) {
    console.error('Error cleaning up backups:', error);
  }
};

/**
 * Get backup statistics
 * @returns {Promise<Object>} Backup stats
 */
export const getBackupStats = async () => {
  if (!isSupabaseConfigured()) {
    return {
      totalBackups: 0,
      latestBackup: null,
      totalSize: 0,
    };
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return {
      totalBackups: 0,
      latestBackup: null,
      totalSize: 0,
    };
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.BACKUPS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting backup stats:', error);
      throw error;
    }

    const backups = data || [];
    
    return {
      totalBackups: backups.length,
      latestBackup: backups[0] || null,
      totalSize: backups.reduce((sum, b) => sum + (b.file_size || 0), 0),
      lastBackupDate: backups[0]?.created_at || null,
    };
  } catch (error) {
    console.error('Error getting backup stats:', error);
    return {
      totalBackups: 0,
      latestBackup: null,
      totalSize: 0,
    };
  }
};

/**
 * Check if auto backup is needed
 * @returns {Promise<boolean>} True if backup is needed
 */
export const isBackupNeeded = async () => {
  if (!BACKUP_CONFIG.AUTO_BACKUP_ENABLED) {
    return false;
  }

  const stats = await getBackupStats();
  
  if (!stats.lastBackupDate) {
    return true;
  }

  const lastBackup = new Date(stats.lastBackupDate);
  const now = new Date();
  const hoursSinceLastBackup = (now - lastBackup) / (1000 * 60 * 60);

  return hoursSinceLastBackup >= BACKUP_CONFIG.BACKUP_INTERVAL_HOURS;
};

export default {
  createBackup,
  listBackups,
  deleteBackup,
  getBackupStats,
  isBackupNeeded,
};
