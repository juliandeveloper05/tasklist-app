/**
 * StatsContext - Historical Statistics Management
 * Task List App 2026
 */

import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const StatsContext = createContext();

const STATS_STORAGE_KEY = '@stats_history';

// Helper to get date string in YYYY-MM-DD format
const getDateKey = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};

// Helper to get start of week (Monday)
const getWeekStart = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Helper to get day name in Spanish
const getDayName = (date) => {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days[date.getDay()];
};

export const StatsProvider = ({ children }) => {
  const [statsHistory, setStatsHistory] = useState({});
  const [loading, setLoading] = useState(true);

  // Load stats history on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const saved = await AsyncStorage.getItem(STATS_STORAGE_KEY);
        if (saved) {
          setStatsHistory(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading stats history:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  // Save stats when they change
  useEffect(() => {
    if (!loading) {
      const saveStats = async () => {
        try {
          await AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(statsHistory));
        } catch (error) {
          console.error('Error saving stats history:', error);
        }
      };
      saveStats();
    }
  }, [statsHistory, loading]);

  /**
   * Record a completed task for today
   */
  const recordTaskCompleted = useCallback(() => {
    const dateKey = getDateKey();
    setStatsHistory((prev) => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        tasksCompleted: (prev[dateKey]?.tasksCompleted || 0) + 1,
      },
    }));
  }, []);

  /**
   * Record a completed Pomodoro session
   */
  const recordPomodoroSession = useCallback((minutes = 25) => {
    const dateKey = getDateKey();
    setStatsHistory((prev) => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        pomodoroSessions: (prev[dateKey]?.pomodoroSessions || 0) + 1,
        focusMinutes: (prev[dateKey]?.focusMinutes || 0) + minutes,
      },
    }));
  }, []);

  /**
   * Get stats for a specific date
   */
  const getDayStats = useCallback((date = new Date()) => {
    const dateKey = getDateKey(date);
    return statsHistory[dateKey] || {
      tasksCompleted: 0,
      pomodoroSessions: 0,
      focusMinutes: 0,
    };
  }, [statsHistory]);

  /**
   * Get weekly stats (last 7 days)
   */
  const getWeeklyStats = useCallback(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = getDateKey(date);
      const dayStats = statsHistory[dateKey] || {
        tasksCompleted: 0,
        pomodoroSessions: 0,
        focusMinutes: 0,
      };
      
      days.push({
        date: dateKey,
        dayName: getDayName(date),
        isToday: i === 0,
        ...dayStats,
      });
    }

    // Calculate totals
    const totals = days.reduce(
      (acc, day) => ({
        tasksCompleted: acc.tasksCompleted + day.tasksCompleted,
        pomodoroSessions: acc.pomodoroSessions + day.pomodoroSessions,
        focusMinutes: acc.focusMinutes + day.focusMinutes,
      }),
      { tasksCompleted: 0, pomodoroSessions: 0, focusMinutes: 0 }
    );

    return { days, totals };
  }, [statsHistory]);

  /**
   * Get monthly stats (current month)
   */
  const getMonthlyStats = useCallback(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let tasksCompleted = 0;
    let pomodoroSessions = 0;
    let focusMinutes = 0;
    let activeDays = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    // Iterate through all days of the month
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const dateKey = getDateKey(d);
      const dayStats = statsHistory[dateKey];
      
      if (dayStats) {
        tasksCompleted += dayStats.tasksCompleted || 0;
        pomodoroSessions += dayStats.pomodoroSessions || 0;
        focusMinutes += dayStats.focusMinutes || 0;
        
        if ((dayStats.tasksCompleted || 0) + (dayStats.pomodoroSessions || 0) > 0) {
          activeDays++;
          tempStreak++;
          if (tempStreak > maxStreak) maxStreak = tempStreak;
        } else {
          tempStreak = 0;
        }
      } else {
        tempStreak = 0;
      }
    }

    // Calculate current streak (consecutive days ending today)
    currentStreak = 0;
    for (let d = new Date(today); d >= firstDay; d.setDate(d.getDate() - 1)) {
      const dateKey = getDateKey(d);
      const dayStats = statsHistory[dateKey];
      if (dayStats && ((dayStats.tasksCompleted || 0) + (dayStats.pomodoroSessions || 0) > 0)) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Month name in Spanish
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return {
      monthName: monthNames[month],
      year,
      tasksCompleted,
      pomodoroSessions,
      focusMinutes,
      activeDays,
      currentStreak,
      maxStreak,
      daysInMonth: lastDay.getDate(),
    };
  }, [statsHistory]);

  /**
   * Get today's stats
   */
  const getTodayStats = useCallback(() => {
    return getDayStats(new Date());
  }, [getDayStats]);

  return (
    <StatsContext.Provider
      value={{
        // State
        statsHistory,
        loading,
        
        // Actions
        recordTaskCompleted,
        recordPomodoroSession,
        
        // Getters
        getDayStats,
        getWeeklyStats,
        getMonthlyStats,
        getTodayStats,
      }}
    >
      {children}
    </StatsContext.Provider>
  );
};

// Custom hook for easy access
export const useStats = () => {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
};
