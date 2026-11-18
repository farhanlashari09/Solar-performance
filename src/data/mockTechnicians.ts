import { Technician } from '../types';

export const mockTechnicians: Technician[] = [
  {
    id: 'tech-1',
    name: 'Engr. Tariq Mehmood',
    initials: 'TM',
    phone: '+92 300 8472190',
    serviceArea: 'Lahore (DHA, Gulberg, Cantt & Johar Town)',
    distanceKm: 4.2,
    supportedInverters: ['Huawei', 'Growatt', 'Solis', 'GoodWe', 'Inverex'],
    isVerified: true,
    verificationBadge: 'SolarCare Certified Master Partner',
    availability: 'Available Today',
    experienceYears: 8,
    rating: 4.9,
    completedJobsCount: 524,
    specialization: 'High-Voltage DC Diagnostics, Net Metering Commissioning & Fault Remediation',
    hourlyRatePkr: 3500,
    bio: 'PEC Registered Electrical Engineer with 8+ years specializing in residential and commercial grid-tied and hybrid solar system troubleshooting, inverter repair, and thermal imaging string audits.',
    certifications: [
      'PEC Certified Electrical Engineer',
      'Huawei Certified PV Specialist (HCIA-Solar)',
      'Growatt Academy Advanced Inverter Commissioning',
      'OSHA High-Voltage Electrical Safety Certified'
    ]
  },
  {
    id: 'tech-2',
    name: 'Muhammad Usman Farooq',
    initials: 'UF',
    phone: '+92 321 4981120',
    serviceArea: 'Karachi (Clifton, DHA, PECHS, Korangi)',
    distanceKm: 1267,
    supportedInverters: ['GoodWe', 'Solis', 'Sungrow', 'Fronius'],
    isVerified: true,
    verificationBadge: 'Verified SolarCare Partner',
    availability: 'Next Available: Tomorrow',
    experienceYears: 6,
    rating: 4.8,
    completedJobsCount: 342,
    specialization: 'Inverter Grid Synchronization, Inverter Error Codes & Coastal Corrosion Protection',
    hourlyRatePkr: 4000,
    bio: 'Dedicated solar service expert focused on Karachi coastal PV installations. Experienced with grid voltage fluctuation protection and anti-salinity terminal treatments.',
    certifications: [
      'NED PV Training Diploma',
      'GoodWe Certified Service Engineer',
      'NFPA 70E Electrical Safety Standards'
    ]
  },
  {
    id: 'tech-3',
    name: 'Bilal Ahmed Khan',
    initials: 'BK',
    phone: '+92 333 5521908',
    serviceArea: 'Islamabad / Rawalpindi (F-Sectors, Bahria Town, DHA)',
    distanceKm: 382,
    supportedInverters: ['Huawei', 'Knox', 'Sungrow', 'Inverex', 'Growatt'],
    isVerified: true,
    verificationBadge: 'Verified SolarCare Partner',
    availability: 'Available Today',
    experienceYears: 7,
    rating: 5.0,
    completedJobsCount: 298,
    specialization: 'Net-Metering Bi-Directional Green Meter Audits & Lightning Surge Protection',
    hourlyRatePkr: 3200,
    bio: 'Comprehensive after-sales specialist servicing Islamabad and Rawalpindi. Expert in resolving IESCO net-metering synchronization faults and lightning surge arrestor installations.',
    certifications: [
      'IESCO Approved Solar Contractor Licensure',
      'Sungrow Inverter Field Specialist',
      'NABCEP Solar PV Associate'
    ]
  },
  {
    id: 'tech-4',
    name: 'Zeeshan Ali & Team',
    initials: 'ZA',
    phone: '+92 301 7762391',
    serviceArea: 'Lahore & Faisalabad',
    distanceKm: 7.8,
    supportedInverters: ['Huawei', 'Growatt', 'Solis', 'GoodWe', 'Inverex', 'Knox', 'Crown'],
    isVerified: true,
    verificationBadge: 'SolarCare Cleaning Specialist',
    availability: 'Available Today',
    experienceYears: 5,
    rating: 4.7,
    completedJobsCount: 680,
    specialization: 'Professional Demineralized Panel Washing, Robotic Cleaning & Dust Mitigation',
    hourlyRatePkr: 2500,
    bio: 'Specialized photovoltaic cleaning team utilizing purified RO de-ionized water, rotating soft-bristle non-scratch brushes, and drone inspection for hotspots.',
    certifications: [
      'Certified Solar Cleaning Contractor',
      'Safe Working at Heights Certification',
      'TÜV SÜD Module Maintenance Training'
    ]
  },
  {
    id: 'tech-5',
    name: 'Hamza Siddiqui',
    initials: 'HS',
    phone: '+92 312 9901452',
    serviceArea: 'Multan & South Punjab',
    distanceKm: 341,
    supportedInverters: ['Growatt', 'Huawei', 'Solis', 'Inverex'],
    isVerified: false,
    verificationBadge: 'Independent Solar Contractor',
    availability: 'Booked This Week',
    experienceYears: 9,
    rating: 4.6,
    completedJobsCount: 190,
    specialization: 'Tubewell Agrivoltaics & Off-Grid Battery Systems',
    hourlyRatePkr: 2800,
    bio: 'Experienced field technician in South Punjab focusing on rural agricultural solar installations, VFD solar tubewells, and large rooftop arrays.',
    certifications: [
      'TEVTA Certified Solar Electrician',
      'VFD Tubewell Drive Integration Expert'
    ]
  }
];
