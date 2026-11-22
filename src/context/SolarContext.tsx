import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SolarSystem,
  HourlyReading,
  DailyProduction,
  DiagnosticResult,
  AlertItem,
} from '../types';
import { evaluateSystemPerformance } from '../utils/diagnosticEngine';
import { useAuth } from './AuthContext';
import { adminSystemsApi, solarSystemsApi } from '../services/api';

interface SolarContextType {
  systems: SolarSystem[];
  activeSystem: SolarSystem;
  isNewUser: boolean;
  setActiveSystemId: (id: string) => void;
  addSolarSystem: (system: Omit<SolarSystem, 'id'>) => Promise<SolarSystem>;
  updateSolarSystem: (id: string, updates: Partial<SolarSystem>) => void;
  refreshMonitoring: (id?: string) => Promise<string | null>;
  hourlyReadings: HourlyReading[];
  weeklyReadings: DailyProduction[];
  monthlyReadings: { period: string; actualKwh: number; expectedKwh: number; performanceRatio: number }[];
  diagnosticResult: DiagnosticResult;
  weather: null;
  alerts: AlertItem[];
  unreadAlertCount: number;
  markAlertAsRead: (id: string) => void;
  markAlertAsUnread: (id: string) => void;
  markAllAlertsAsRead: () => void;
}

const SolarContext = createContext<SolarContextType | undefined>(undefined);

const EMPTY_SYSTEM: SolarSystem = {
  id: '__empty__',
  name: 'No Solar System Configured',
  location: '',
  capacityKw: 0,
  inverterBrand: '',
  inverterModel: '',
  installationDate: '',
  connectionMethod: '',
  connectionStatus: 'unavailable',
  monitoringStatus: 'unlinked',
  panelCount: 0,
  panelType: '',
};

export const SolarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const alertsKey = currentUser ? `solarcare_alerts_${currentUser.id}` : 'solarcare_alerts_guest';

  const [systems, setSystems] = useState<SolarSystem[]>([]);
  const [activeSystemId, setActiveSystemIdState] = useState('');

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

  useEffect(() => {
    if (!currentUser) {
      setSystems([]);
      setActiveSystemIdState('');
      setAlerts([]);
      return;
    }

    let active = true;
    const loadSystems = currentUser.role === 'admin'
      ? adminSystemsApi.getAllSystems()
      : solarSystemsApi.getSystemsForUser();

    loadSystems.then((res) => {
      if (!active) return;
      const loaded = res.success && Array.isArray(res.systems) ? res.systems : [];
      setSystems(loaded);
      setActiveSystemIdState((previous) => loaded.some((system: SolarSystem) => system.id === previous)
        ? previous
        : (loaded[0]?.id || ''));
    });
    return () => { active = false; };
  }, [currentUser?.id, currentUser?.role]);

  useEffect(() => {
    if (currentUser) localStorage.setItem(alertsKey, JSON.stringify(alerts));
  }, [alerts, currentUser, alertsKey]);

  const isNewUser = systems.length === 0;

  const activeSystem: SolarSystem = systems.length > 0
    ? (systems.find(s => s.id === activeSystemId) || systems[0])
    : EMPTY_SYSTEM;

  const setActiveSystemId = (id: string) => {
    setActiveSystemIdState(id);
  };

  const addSolarSystem = async (newSysData: Omit<SolarSystem, 'id'>): Promise<SolarSystem> => {
    if (!currentUser) throw new Error('Sign in before adding a solar system.');
    const response = await solarSystemsApi.addSystem(newSysData);
    if (!response.success || !response.system) {
      throw new Error(response.message || 'Could not save the solar system.');
    }

    const newSystem = response.system as SolarSystem;
    setSystems((previous) => [...previous, newSystem]);
    setActiveSystemIdState(newSystem.id);
    return newSystem;
  };

  const updateSolarSystem = (id: string, updates: Partial<SolarSystem>) => {
    solarSystemsApi.updateSystem(id, updates).then((response) => {
      if (response.success && response.system) {
        setSystems((previous) => previous.map((system) => system.id === id ? response.system : system));
      }
    });
  };

  const hourlyReadings: HourlyReading[] = [];
  const weeklyReadings: DailyProduction[] = [];
  const monthlyReadings: { period: string; actualKwh: number; expectedKwh: number; performanceRatio: number }[] = [];

  const diagnosticResult = evaluateSystemPerformance(activeSystem, weeklyReadings);

  const refreshMonitoring = async (id = activeSystem.id): Promise<string | null> => {
    void id;
    return 'Demo monitoring data is already up to date.';
  };

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

  return (
    <SolarContext.Provider
      value={{
        systems,
        activeSystem,
        isNewUser,
        setActiveSystemId,
        addSolarSystem,
        updateSolarSystem,
        refreshMonitoring,
        hourlyReadings,
        weeklyReadings,
        monthlyReadings,
        diagnosticResult,
        weather: null,
        alerts,
        unreadAlertCount,
        markAlertAsRead,
        markAlertAsUnread,
        markAllAlertsAsRead,
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
