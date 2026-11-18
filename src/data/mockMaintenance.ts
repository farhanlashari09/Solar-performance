import { ServiceRequest } from '../types';

export const initialServiceRequests: ServiceRequest[] = [
  {
    id: 'REQ-2026-8841',
    systemId: 'sys-1',
    technicianId: 'tech-1',
    technicianName: 'Engr. Tariq Mehmood',
    problemCategory: 'Panel Cleaning & Dust/Soiling Removal',
    description: 'Noticeable red sand and dust accumulation after the storm on Oct 08. Generation dropped approximately 15% during midday peak sun.',
    preferredDate: '2026-10-14',
    photoUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=600&q=80',
    photoName: 'dusty_solar_panels_rooftop.jpg',
    createdAt: '2026-10-11 15:30',
    status: 'In Progress',
    statusTimeline: [
      {
        status: 'Requested',
        timestamp: '2026-10-11 15:30',
        note: 'Customer submitted service request for rooftop panel cleaning and MC4 connector check.'
      },
      {
        status: 'Accepted',
        timestamp: '2026-10-11 17:15',
        note: 'Engr. Tariq Mehmood accepted the request and scheduled on-site arrival for 09:30 AM.'
      },
      {
        status: 'In Progress',
        timestamp: '2026-10-12 09:45',
        note: 'Technician arrived on-site. Beginning de-ionized water washing and string voltage verification.'
      }
    ],
  },
  {
    id: 'REQ-2026-7219',
    systemId: 'sys-1',
    technicianId: 'tech-4',
    technicianName: 'Zeeshan Ali & Team',
    problemCategory: 'Panel Cleaning & Dust/Soiling Removal',
    description: 'Bi-monthly scheduled demineralized panel washing and frame earthing check.',
    preferredDate: '2026-09-15',
    createdAt: '2026-09-12 10:00',
    status: 'Completed',
    statusTimeline: [
      { status: 'Requested', timestamp: '2026-09-12 10:00', note: 'Request initiated by homeowner.' },
      { status: 'Accepted', timestamp: '2026-09-12 11:20', note: 'Technician confirmed appointment.' },
      { status: 'In Progress', timestamp: '2026-09-15 08:30', note: 'Washing initiated.' },
      { status: 'Completed', timestamp: '2026-09-15 11:45', note: 'All 18 panels washed. Post-wash VOC readings checked.' }
    ],
    workReport: {
      completedDate: '2026-09-15',
      technicianNotes: 'All 18 monocrystalline panels washed thoroughly using RO water. Removed heavy urban carbon smog film. Verified MC4 connectors and cable clips.',
      workPerformed: 'Demineralized high-flow water washing, soft-bristle squeegee wiping, structure earthing resistance test (measured 2.4 ohms - excellent).',
      partsReplaced: 'None (Preventative maintenance)',
      beforeKwhDaily: 24.8,
      afterKwhDaily: 34.2,
      improvementPct: 37.9,
    }
  },
  {
    id: 'REQ-2026-5590',
    systemId: 'sys-2',
    technicianId: 'tech-1',
    technicianName: 'Engr. Tariq Mehmood',
    problemCategory: 'Inverter Fault / Error Code Investigation',
    description: 'Growatt inverter showed Error 102 (Grid Voltage Out of Range) three times during midday.',
    preferredDate: '2026-08-05',
    createdAt: '2026-08-03 14:10',
    status: 'Completed',
    statusTimeline: [
      { status: 'Requested', timestamp: '2026-08-03 14:10', note: 'Request submitted.' },
      { status: 'Accepted', timestamp: '2026-08-03 16:00', note: 'Engineer allocated.' },
      { status: 'In Progress', timestamp: '2026-08-05 10:00', note: 'Diagnostics underway.' },
      { status: 'Completed', timestamp: '2026-08-05 13:30', note: 'Inverter grid voltage parameters reconfigured in accordance with DISCO grid standard.' }
    ],
    workReport: {
      completedDate: '2026-08-05',
      technicianNotes: 'Measured incoming grid AC voltage at 254V. Reconfigured inverter upper voltage disconnect threshold to 258V compliant with local utility rules. Updated inverter firmware.',
      workPerformed: 'Firmware upgrade, grid protection profile calibration, AC terminal torquing.',
      partsReplaced: 'AC surge protection cartridge replaced on DB box.',
      beforeKwhDaily: 48.0,
      afterKwhDaily: 84.5,
      improvementPct: 76.0,
    }
  }
];

// Pre- vs Post-Maintenance Verification Data for System 1
export const mockVerificationDataset = {
  serviceDate: 'September 15, 2026',
  serviceType: 'Professional Demineralized Cleaning & String Inspection',
  technician: 'Zeeshan Ali & Team',
  preServiceDays: [
    { day: 'Sep 11', actualKwh: 24.2, expectedKwh: 35.0, irradianceWm2: 810, condition: 'Dusty' },
    { day: 'Sep 12', actualKwh: 25.1, expectedKwh: 35.2, irradianceWm2: 830, condition: 'Dusty' },
    { day: 'Sep 13', actualKwh: 24.6, expectedKwh: 34.8, irradianceWm2: 820, condition: 'Dusty' },
    { day: 'Sep 14', actualKwh: 25.3, expectedKwh: 35.0, irradianceWm2: 825, condition: 'Dusty' },
  ],
  postServiceDays: [
    { day: 'Sep 16', actualKwh: 34.4, expectedKwh: 35.1, irradianceWm2: 830, condition: 'Clear' },
    { day: 'Sep 17', actualKwh: 33.9, expectedKwh: 35.0, irradianceWm2: 820, condition: 'Clear' },
    { day: 'Sep 18', actualKwh: 34.6, expectedKwh: 35.2, irradianceWm2: 835, condition: 'Clear' },
    { day: 'Sep 19', actualKwh: 34.1, expectedKwh: 34.9, irradianceWm2: 815, condition: 'Clear' },
  ],
  preAvgKwh: 24.8,
  postAvgKwh: 34.25,
  yieldGainKwh: 9.45,
  yieldGainPct: 38.1,
  weatherContext: 'Pre-service period experienced airborne particulate dust with clear solar irradiance (avg 821 W/m²). Post-service period had similar ambient irradiance (avg 825 W/m²), confirming that glass transmission recovery directly drove the yield uplift.'
};
