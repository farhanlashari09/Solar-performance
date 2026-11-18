import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SolarSystem,
  HourlyReading,
  DailyProduction,
  DiagnosticResult,
  AlertItem,
  WeatherInfo,
} from '../types';
import { mockWeatherInfo } from '../data/mockSolarData';
import {
  generateDynamicHourly,
  generateDynamicWeekly,
  generateDynamicMonthly,
  generateInitialAlerts,
} from '../utils/solarCalculations';
import { evaluateSystemPerformance } from '../utils/diagnosticEngine';
import { useAuth } from './AuthContext';
import { solarSystemsApi } from '../services/api';

interface SolarContextType {
  systems: SolarSystem[];
  activeSystem: SolarSystem;
  isNewUser: boolean;
  setActiveSystemId: (id: string) => void;
  addSolarSystem: (system: Omit<SolarSystem, 'id'>) => SolarSystem;
  updateSolarSystem: (id: string, updates: Partial<SolarSystem>) => void;
  hourlyReadings: HourlyReading[];
  weeklyReadings: DailyProduction[];
  monthlyReadings: { period: string; actualKwh: number; expectedKwh: number; performanceRatio: number }[];
  diagnosticResult: DiagnosticResult;
  weather: WeatherInfo;
  alerts: AlertItem[];
  unreadAlertCount: number;
  markAlertAsRead: (id: string) => void;
  markAlertAsUnread: (id: string) => void;
  markAllAlertsAsRead: () => void;
  resetDemoData: () => void;
}

const SolarContext = createContext<SolarContextType | undefined>(undefined);

const EMPTY_SYSTEM: SolarSystem = {
  id: '__empty__',
  name: 'No Solar System Configured',
  location: 'Not configured',
  capacityKw: 0,
  inverterBrand: '',
  inverterModel: '',
  installationDate: '',
  connectionMethod: '',
  connectionStatus: 'demo',
  panelCount: 0,
  panelType: '',
};

export const SolarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const userKey = currentUser ? `solarcare_systems_${currentUser.id}` : 'solarcare_systems_guest';
  const alertsKey = currentUser ? `solarcare_alerts_${currentUser.id}` : 'solarcare_alerts_guest';
  const activeIdKey = currentUser ? `solarcare_active_id_${currentUser.id}` : 'solarcare_active_id_guest';

  const [systems, setSystems] = useState<SolarSystem[]>(() => {
    const saved = localStorage.getItem(userKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // ignore
      }
    }
    return [];
  });

  const [activeSystemId, setActiveSystemIdState] = useState<string>(() => {
    const saved = localStorage.getItem(activeIdKey);
    return saved || '';
  });

  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    const saved = localStorage.getItem(alertsKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Fetch user systems from backend server when user logs in or switches
  useEffect(() => {
    if (!currentUser) {
      setSystems([]);
      setActiveSystemIdState('');
      setAlerts([]);
      return;
    }

    const currentSaved = localStorage.getItem(userKey);
    if (currentSaved) {
      try {
        const parsed = JSON.parse(currentSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSystems(parsed);
          setActiveSystemIdState(parsed[0].id);
          return;
        }
      } catch {
        // fallback to server
      }
    }

    // Attempt to query server for this user's solar systems
    solarSystemsApi.getSystemsForUser(currentUser.id).then((res) => {
      if (res.success && Array.isArray(res.systems) && res.systems.length > 0) {
        setSystems(res.systems);
        setActiveSystemIdState(res.systems[0].id);
      } else {
        // Brand new user with 0 systems
        setSystems([]);
        setActiveSystemIdState('');
      }
    });
  }, [currentUser?.id]);

  // Sync to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(userKey, JSON.stringify(systems));
      localStorage.setItem(activeIdKey, activeSystemId);
      localStorage.setItem(alertsKey, JSON.stringify(alerts));
    }
  }, [systems, activeSystemId, alerts, currentUser]);

  const isNewUser = systems.length === 0;

  const activeSystem: SolarSystem = systems.length > 0
    ? (systems.find(s => s.id === activeSystemId) || systems[0])
    : EMPTY_SYSTEM;

  const setActiveSystemId = (id: string) => {
    setActiveSystemIdState(id);
  };

  const addSolarSystem = (newSysData: Omit<SolarSystem, 'id'>): SolarSystem => {
    const newSystem: SolarSystem = {
      ...newSysData,
      id: `sys-${Date.now()}`,
    };

    const updated = [...systems, newSystem];
    setSystems(updated);
    setActiveSystemIdState(newSystem.id);

    // Initial alert for this system
    const newAlerts = generateInitialAlerts(newSystem.id, newSystem.name, newSystem.capacityKw);
    setAlerts(prev => [...newAlerts, ...prev]);

    // Send to backend server
    if (currentUser) {
      solarSystemsApi.addSystem({
        userId: currentUser.id,
        ...newSystem,
      });
    }

    return newSystem;
  };

  const updateSolarSystem = (id: string, updates: Partial<SolarSystem>) => {
    setSystems(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    solarSystemsApi.updateSystem(id, updates);
  };

  // DYNAMICALLY CALCULATE DATA BASED ON USER'S ACTUAL SYSTEM CAPACITY
  // This guarantees that a 5kW, 10kW, 15kW, or 25kW system receives mathematically
  // accurate curves instead of static dummy mock files.
  const capacity = activeSystem.capacityKw > 0 ? activeSystem.capacityKw : 0;
  const hourlyReadings = generateDynamicHourly(capacity);
  const weeklyReadings = generateDynamicWeekly(capacity);
  const monthlyReadings = generateDynamicMonthly(capacity);

  // Diagnostic result from rule-based engine
  const diagnosticResult = evaluateSystemPerformance(
    activeSystem,
    weeklyReadings,
    mockWeatherInfo.irradianceWm2
  );

  const markAlertAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, isRead: true } : a)));
  };

  const markAlertAsUnread = (id: string) => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, isRead: false } : a)));
  };

  const markAllAlertsAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
  };

  const unreadAlertCount = alerts.filter(a => !a.isRead).length;

  const resetDemoData = () => {
    if (currentUser) {
      localStorage.removeItem(userKey);
      localStorage.removeItem(activeIdKey);
      localStorage.removeItem(alertsKey);
    }
    setSystems([]);
    setActiveSystemIdState('');
    setAlerts([]);
  };

  return (
    <SolarContext.Provider
      value={{
        systems,
        activeSystem,
        isNewUser,
        setActiveSystemId,
        addSolarSystem,
        updateSolarSystem,
        hourlyReadings,
        weeklyReadings,
        monthlyReadings,
        diagnosticResult,
        weather: mockWeatherInfo,
        alerts,
        unreadAlertCount,
        markAlertAsRead,
        markAlertAsUnread,
        markAllAlertsAsRead,
        resetDemoData,
      }}
    >
      {children}
    </SolarContext.Provider>
  );
};

export const useSolar = () => {
  const context = useContext(SolarContext);
  if (!context) {
    throw new Error('useSolar must be used within a SolarProvider');
  }
  return context;
};
