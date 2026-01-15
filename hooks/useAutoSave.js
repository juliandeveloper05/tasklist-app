/**
 * useAutoSave - Auto-save hook with debounce
 * Task List App 2026
 * 
 * Features:
 * - Debounced auto-save after 2 seconds of inactivity
 * - Save state management (saving, success, error)
 * - Configurable debounce delay
 * - Cancel on unmount
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTO_SAVE_PREFERENCE_KEY = '@tasklist_autosave_enabled';
const DEFAULT_DEBOUNCE_DELAY = 2000; // 2 seconds

/**
 * Hook to manage auto-save preference
 */
export function useAutoSavePreference() {
  const [autoSaveEnabled, setAutoSaveEnabledState] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load preference on mount
  useEffect(() => {
    const loadPreference = async () => {
      try {
        const value = await AsyncStorage.getItem(AUTO_SAVE_PREFERENCE_KEY);
        setAutoSaveEnabledState(value === 'true');
      } catch (error) {
        console.error('Error loading auto-save preference:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPreference();
  }, []);

  // Save preference when changed
  const setAutoSaveEnabled = useCallback(async (enabled) => {
    try {
      await AsyncStorage.setItem(AUTO_SAVE_PREFERENCE_KEY, enabled ? 'true' : 'false');
      setAutoSaveEnabledState(enabled);
    } catch (error) {
      console.error('Error saving auto-save preference:', error);
    }
  }, []);

  return { autoSaveEnabled, setAutoSaveEnabled, loading };
}

/**
 * Auto-save states
 */
export const AUTO_SAVE_STATES = {
  IDLE: 'idle',
  PENDING: 'pending',
  SAVING: 'saving',
  SAVED: 'saved',
  ERROR: 'error',
};

/**
 * Hook to handle auto-save with debounce
 * @param {Function} saveFunction - The async function to call for saving
 * @param {Object} data - The data to save (changes trigger debounce)
 * @param {Object} options - Configuration options
 */
export function useAutoSave(saveFunction, data, options = {}) {
  const {
    enabled = true,
    debounceDelay = DEFAULT_DEBOUNCE_DELAY,
    onSaveStart,
    onSaveSuccess,
    onSaveError,
  } = options;

  const [saveState, setSaveState] = useState(AUTO_SAVE_STATES.IDLE);
  const timerRef = useRef(null);
  const lastDataRef = useRef(data);
  const isMountedRef = useRef(true);

  // Clear timer on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Debounced save effect
  useEffect(() => {
    if (!enabled) {
      setSaveState(AUTO_SAVE_STATES.IDLE);
      return;
    }

    // Skip if data hasn't changed (shallow comparison of JSON)
    const currentDataString = JSON.stringify(data);
    const lastDataString = JSON.stringify(lastDataRef.current);
    
    if (currentDataString === lastDataString) {
      return;
    }

    lastDataRef.current = data;

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set pending state
    setSaveState(AUTO_SAVE_STATES.PENDING);

    // Start new debounce timer
    timerRef.current = setTimeout(async () => {
      if (!isMountedRef.current) return;

      setSaveState(AUTO_SAVE_STATES.SAVING);
      onSaveStart?.();

      try {
        await saveFunction(data);
        
        if (!isMountedRef.current) return;
        
        setSaveState(AUTO_SAVE_STATES.SAVED);
        onSaveSuccess?.();

        // Reset to idle after showing success
        setTimeout(() => {
          if (isMountedRef.current) {
            setSaveState(AUTO_SAVE_STATES.IDLE);
          }
        }, 1500);
      } catch (error) {
        if (!isMountedRef.current) return;
        
        setSaveState(AUTO_SAVE_STATES.ERROR);
        onSaveError?.(error);

        // Reset to idle after showing error
        setTimeout(() => {
          if (isMountedRef.current) {
            setSaveState(AUTO_SAVE_STATES.IDLE);
          }
        }, 3000);
      }
    }, debounceDelay);
  }, [data, enabled, debounceDelay, saveFunction, onSaveStart, onSaveSuccess, onSaveError]);

  // Manual save function (bypasses debounce)
  const saveNow = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setSaveState(AUTO_SAVE_STATES.SAVING);
    onSaveStart?.();

    try {
      await saveFunction(data);
      setSaveState(AUTO_SAVE_STATES.SAVED);
      onSaveSuccess?.();
      
      setTimeout(() => {
        if (isMountedRef.current) {
          setSaveState(AUTO_SAVE_STATES.IDLE);
        }
      }, 1500);
    } catch (error) {
      setSaveState(AUTO_SAVE_STATES.ERROR);
      onSaveError?.(error);
    }
  }, [data, saveFunction, onSaveStart, onSaveSuccess, onSaveError]);

  // Cancel pending save
  const cancelPendingSave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setSaveState(AUTO_SAVE_STATES.IDLE);
  }, []);

  return {
    saveState,
    saveNow,
    cancelPendingSave,
    isPending: saveState === AUTO_SAVE_STATES.PENDING,
    isSaving: saveState === AUTO_SAVE_STATES.SAVING,
    isSaved: saveState === AUTO_SAVE_STATES.SAVED,
    hasError: saveState === AUTO_SAVE_STATES.ERROR,
  };
}

export default useAutoSave;
