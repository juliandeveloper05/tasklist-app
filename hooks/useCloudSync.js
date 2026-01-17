/**
 * useCloudSync Hook
 * TaskList App - Phase 2 Cloud Backup
 * 
 * Hook for managing cloud synchronization state and operations
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { 
  syncTasks, 
  getSyncStatus, 
  uploadToCloud,
  isAuthenticated,
} from '../services/cloudSyncService';
import { createBackup, isBackupNeeded } from '../services/backupService';
import { isSupabaseConfigured, SYNC_CONFIG } from '../config/supabase';

/**
 * Cloud sync hook for managing synchronization
 */
export const useCloudSync = (tasks, setTasks) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [syncStatus, setSyncStatus] = useState({
    isConfigured: false,
    isAuthenticated: false,
    lastSync: null,
  });

  const syncIntervalRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  // Check sync status on mount
  useEffect(() => {
    checkSyncStatus();
  }, []);

  // Auto-sync interval
  useEffect(() => {
    if (syncStatus.isAuthenticated && syncStatus.isConfigured) {
      // Start auto-sync interval
      syncIntervalRef.current = setInterval(() => {
        if (!isSyncing) {
          performSync(true); // silent sync
        }
      }, SYNC_CONFIG.AUTO_SYNC_INTERVAL_MS);

      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
        }
      };
    }
  }, [syncStatus.isAuthenticated, syncStatus.isConfigured]);

  // Sync when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        syncStatus.isAuthenticated
      ) {
        performSync(true);
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription?.remove();
    };
  }, [syncStatus.isAuthenticated]);

  /**
   * Check current sync status
   */
  const checkSyncStatus = useCallback(async () => {
    try {
      const status = await getSyncStatus();
      setSyncStatus(status);
      setLastSync(status.lastSync);
    } catch (error) {
      console.error('Error checking sync status:', error);
    }
  }, []);

  /**
   * Perform sync operation
   * @param {boolean} silent - If true, don't show errors to user
   */
  const performSync = useCallback(async (silent = false) => {
    if (isSyncing) return;
    if (!isSupabaseConfigured()) return;

    const isAuth = await isAuthenticated();
    if (!isAuth) return;

    setIsSyncing(true);
    setSyncError(null);

    try {
      const result = await syncTasks(tasks);

      if (result.success) {
        setTasks(result.tasks);
        setLastSync(new Date());
        
        // Check if auto backup is needed
        const needsBackup = await isBackupNeeded();
        if (needsBackup) {
          await createBackup(result.tasks, true);
        }
      } else if (!silent) {
        setSyncError(result.error);
      }

      await checkSyncStatus();
      return result;
    } catch (error) {
      console.error('Sync error:', error);
      if (!silent) {
        setSyncError(error.message);
      }
      return { success: false, error: error.message };
    } finally {
      setIsSyncing(false);
    }
  }, [tasks, setTasks, isSyncing, checkSyncStatus]);

  /**
   * Force upload all local tasks to cloud
   */
  const forceUpload = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase no configurado' };
    }

    const isAuth = await isAuthenticated();
    if (!isAuth) {
      return { success: false, error: 'No autenticado' };
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const result = await uploadToCloud(tasks);
      setLastSync(new Date());
      await checkSyncStatus();
      return result;
    } catch (error) {
      console.error('Force upload error:', error);
      setSyncError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsSyncing(false);
    }
  }, [tasks, checkSyncStatus]);

  /**
   * Manual sync trigger
   */
  const sync = useCallback(() => {
    return performSync(false);
  }, [performSync]);

  /**
   * Clear sync error
   */
  const clearError = useCallback(() => {
    setSyncError(null);
  }, []);

  return {
    isSyncing,
    syncError,
    lastSync,
    syncStatus,
    sync,
    forceUpload,
    checkSyncStatus,
    clearError,
  };
};

export default useCloudSync;
