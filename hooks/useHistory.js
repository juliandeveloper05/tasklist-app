/**
 * useHistory - Undo/Redo hook for change history
 * Task List App 2026
 * 
 * Features:
 * - Stack-based history with configurable limit
 * - Undo and redo operations
 * - Keyboard shortcuts support
 */

import { useState, useCallback, useRef, useEffect } from 'react';

const DEFAULT_MAX_HISTORY = 10;

/**
 * Hook to manage undo/redo history
 * @param {any} initialValue - The initial value
 * @param {Object} options - Configuration options
 */
export function useHistory(initialValue, options = {}) {
  const { maxHistory = DEFAULT_MAX_HISTORY } = options;

  // History stacks
  const [past, setPast] = useState([]);
  const [present, setPresent] = useState(initialValue);
  const [future, setFuture] = useState([]);
  
  // Track if change was from undo/redo to avoid pushing to history
  const isUndoRedoRef = useRef(false);

  // Check if we can undo/redo
  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  // Push a new value to history
  const set = useCallback((newValue) => {
    // If this is from undo/redo, just update present
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      setPresent(newValue);
      return;
    }

    // Check if value actually changed
    const newValueString = JSON.stringify(newValue);
    const presentString = JSON.stringify(present);
    
    if (newValueString === presentString) {
      return;
    }

    setFuture([]); // Clear redo stack
    setPast((prev) => {
      const newPast = [...prev, present];
      // Limit history size
      if (newPast.length > maxHistory) {
        return newPast.slice(newPast.length - maxHistory);
      }
      return newPast;
    });
    setPresent(newValue);
  }, [present, maxHistory]);

  // Undo - go back one step
  const undo = useCallback(() => {
    if (!canUndo) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    isUndoRedoRef.current = true;
    setPast(newPast);
    setPresent(previous);
    setFuture([present, ...future]);
  }, [past, present, future, canUndo]);

  // Redo - go forward one step
  const redo = useCallback(() => {
    if (!canRedo) return;

    const next = future[0];
    const newFuture = future.slice(1);

    isUndoRedoRef.current = true;
    setPast([...past, present]);
    setPresent(next);
    setFuture(newFuture);
  }, [past, present, future, canRedo]);

  // Reset history
  const reset = useCallback((newValue) => {
    setPast([]);
    setPresent(newValue);
    setFuture([]);
  }, []);

  // Clear history but keep present value
  const clearHistory = useCallback(() => {
    setPast([]);
    setFuture([]);
  }, []);

  return {
    value: present,
    set,
    undo,
    redo,
    reset,
    clearHistory,
    canUndo,
    canRedo,
    historyLength: past.length,
    futureLength: future.length,
  };
}

/**
 * Hook to handle keyboard shortcuts for undo/redo (web only)
 * @param {Function} onUndo - Undo callback
 * @param {Function} onRedo - Redo callback
 * @param {boolean} enabled - Whether shortcuts are enabled
 */
export function useUndoRedoKeyboard(onUndo, onRedo, enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleKeyDown = (e) => {
      // Check for Ctrl/Cmd + Z (undo) or Ctrl/Cmd + Shift + Z (redo)
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifierKey = isMac ? e.metaKey : e.ctrlKey;

      if (modifierKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          onRedo?.();
        } else {
          onUndo?.();
        }
      }
      
      // Also support Ctrl/Cmd + Y for redo (Windows style)
      if (modifierKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        onRedo?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onUndo, onRedo, enabled]);
}

export default useHistory;
