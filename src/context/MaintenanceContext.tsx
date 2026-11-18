import React, { createContext, useContext, useState, useEffect } from 'react';
import { ServiceRequest, Technician, ServiceStatus } from '../types';
import { initialServiceRequests, mockVerificationDataset } from '../data/mockMaintenance';
import { mockTechnicians } from '../data/mockTechnicians';

interface CreateRequestParams {
  systemId: string;
  technicianId?: string;
  problemCategory: string;
  description: string;
  preferredDate: string;
  photoUrl?: string;
  photoName?: string;
}

interface MaintenanceContextType {
  serviceRequests: ServiceRequest[];
  technicians: Technician[];
  selectedTechnicianForBooking: Technician | null;
  setSelectedTechnicianForBooking: (tech: Technician | null) => void;
  createServiceRequest: (params: CreateRequestParams) => ServiceRequest;
  advanceRequestStatus: (requestId: string, targetStatus: ServiceStatus, customNote?: string) => void;
  assignTechnicianToRequest: (requestId: string, technicianId: string, technicianName: string) => void;
  addTechnician: (techData: Omit<Technician, 'id'>) => Technician;
  updateTechnician: (id: string, updates: Partial<Technician>) => void;
  deleteTechnician: (id: string) => void;
  resetTechniciansToDefault: () => void;
  verificationData: typeof mockVerificationDataset;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

const STORAGE_REQUESTS_KEY = 'solarcare_maintenance_requests';
const STORAGE_TECHNICIANS_KEY = 'solarcare_technicians_list';

export const MaintenanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Service requests state
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_REQUESTS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialServiceRequests;
      }
    }
    return initialServiceRequests;
  });

  // Technicians state (allows admin to add, edit, and delete technicians)
  const [technicians, setTechnicians] = useState<Technician[]>(() => {
    const saved = localStorage.getItem(STORAGE_TECHNICIANS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        return mockTechnicians;
      }
    }
    return mockTechnicians;
  });

  const [selectedTechnicianForBooking, setSelectedTechnicianForBooking] = useState<Technician | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(serviceRequests));
  }, [serviceRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_TECHNICIANS_KEY, JSON.stringify(technicians));
  }, [technicians]);

  // Admin action: Add a new technician
  const addTechnician = (techData: Omit<Technician, 'id'>): Technician => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newId = `tech-${Date.now().toString().slice(-4)}-${randomSuffix}`;
    const newTech: Technician = {
      ...techData,
      id: newId,
    };
    setTechnicians(prev => [newTech, ...prev]);
    return newTech;
  };

  // Admin action: Update technician
  const updateTechnician = (id: string, updates: Partial<Technician>) => {
    setTechnicians(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  // Admin action: Delete technician
  const deleteTechnician = (id: string) => {
    setTechnicians(prev => prev.filter(t => t.id !== id));
  };

  // Reset technicians
  const resetTechniciansToDefault = () => {
    setTechnicians(mockTechnicians);
    localStorage.setItem(STORAGE_TECHNICIANS_KEY, JSON.stringify(mockTechnicians));
  };

  // Customer or Admin: Create service request
  const createServiceRequest = (params: CreateRequestParams): ServiceRequest => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newId = `REQ-2026-${randomDigits}`;
    const tech = technicians.find(t => t.id === params.technicianId);
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newRequest: ServiceRequest = {
      id: newId,
      systemId: params.systemId,
      technicianId: params.technicianId,
      technicianName: tech ? tech.name : 'Auto-Match Best Available Partner',
      problemCategory: params.problemCategory,
      description: params.description,
      preferredDate: params.preferredDate,
      photoUrl: params.photoUrl,
      photoName: params.photoName,
      createdAt: now,
      status: 'Requested',
      statusTimeline: [
        {
          status: 'Requested',
          timestamp: now,
          note: 'Service request logged in Solar Care portal.'
        }
      ]
    };

    setServiceRequests(prev => [newRequest, ...prev]);
    return newRequest;
  };

  // Admin action: Assign technician to pending request
  const assignTechnicianToRequest = (requestId: string, technicianId: string, technicianName: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setServiceRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req;
      return {
        ...req,
        technicianId,
        technicianName,
        status: req.status === 'Requested' ? 'Accepted' : req.status,
        statusTimeline: [
          ...req.statusTimeline,
          {
            status: 'Accepted',
            timestamp: now,
            note: `Admin assigned technician: ${technicianName}`
          }
        ]
      };
    }));
  };

  // Advance request status
  const advanceRequestStatus = (requestId: string, targetStatus: ServiceStatus, customNote?: string) => {
    setServiceRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req;

      const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
      let note = customNote || '';
      let workReport = req.workReport;

      if (!note) {
        if (targetStatus === 'Accepted') {
          note = `${req.technicianName || 'Technician'} confirmed dispatch schedule and reviewed diagnostics.`;
        } else if (targetStatus === 'In Progress') {
          note = `${req.technicianName || 'Technician'} arrived on-site. Isolation breakers checked and work commenced.`;
        } else if (targetStatus === 'Completed') {
          note = `Service successfully finished. System tested at full generation load. Post-inspection log saved.`;
          workReport = {
            completedDate: now.split(' ')[0],
            technicianNotes: `Inspected photovoltaic array and ${req.problemCategory.toLowerCase()}. All DC voltages and terminal torques restored to standard specifications.`,
            workPerformed: `Completed resolution for: ${req.problemCategory}. Performed safety earth grounding continuity test and clean glass wipe down.`,
            beforeKwhDaily: 25.5,
            afterKwhDaily: 34.0,
            improvementPct: 33.3,
          };
        }
      }

      const existingTimeline = req.statusTimeline.filter(t => t.status !== targetStatus);

      return {
        ...req,
        status: targetStatus,
        statusTimeline: [
          ...existingTimeline,
          {
            status: targetStatus,
            timestamp: now,
            note: note || `Request updated to ${targetStatus}`
          }
        ],
        workReport: workReport || req.workReport,
      };
    }));
  };

  return (
    <MaintenanceContext.Provider
      value={{
        serviceRequests,
        technicians,
        selectedTechnicianForBooking,
        setSelectedTechnicianForBooking,
        createServiceRequest,
        advanceRequestStatus,
        assignTechnicianToRequest,
        addTechnician,
        updateTechnician,
        deleteTechnician,
        resetTechniciansToDefault,
        verificationData: mockVerificationDataset,
      }}
    >
      {children}
    </MaintenanceContext.Provider>
  );
};

export const useMaintenance = () => {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
};
