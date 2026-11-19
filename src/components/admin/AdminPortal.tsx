import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useMaintenance } from '../../context/MaintenanceContext';
import { useSolar } from '../../context/SolarContext';
import { useAuth } from '../../context/AuthContext';
import { Technician, ServiceStatus } from '../../types';
import {
  ShieldCheck,
  Database,
  Users,
  Wrench,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  Star,
  Activity,
  Layers,
  Trash2,
  Edit2,
  RefreshCw,
  Server,
  Cpu,
  X,
  Sliders,
  DollarSign,
  AlertTriangle,
  Download,
  Check,
  FileCode,
  Zap,
  Sun,
  LogOut
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const { language, isRtl } = useLanguage();
  const {
    technicians,
    addTechnician,
    updateTechnician,
    deleteTechnician,
    resetTechniciansToDefault,
    serviceRequests,
    advanceRequestStatus,
    assignTechnicianToRequest,
  } = useMaintenance();

  const { systems } = useSolar();
  const { currentUser, logout } = useAuth();

  // Active Admin Sub-tab
  const [activeTab, setActiveTab] = useState<'technicians' | 'database' | 'tickets' | 'fleet'>('technicians');

  // Technician Management States
  const [isAddTechModalOpen, setIsAddTechModalOpen] = useState(false);
  const [techSearch, setTechSearch] = useState('');
  const [techCityFilter, setTechCityFilter] = useState('All');
  const [editingTech, setEditingTech] = useState<Technician | null>(null);

  // New Technician Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '+92 ',
    serviceArea: 'Lahore (DHA, Gulberg & Cantt)',
    distanceKm: 4.5,
    supportedInverters: ['Huawei', 'Growatt'],
    isVerified: true,
    verificationBadge: 'Solar Care Certified Partner',
    availability: 'Available Today' as 'Available Today' | 'Next Available: Tomorrow' | 'Booked This Week',
    experienceYears: 5,
    rating: 4.9,
    completedJobsCount: 120,
    specialization: 'Inverter Diagnostics & Fault Remediation',
    hourlyRatePkr: 3500,
    bio: 'Certified Solar PV Specialist experienced in inverter troubleshooting, net-metering audits, and DC string balancing.',
    certifications: 'PEC Electrical Engineer, Huawei HCIA-Solar',
  });

  // DB Live Section states
  const [dbCollectionTab, setDbCollectionTab] = useState<'users' | 'systems' | 'requests' | 'technicians'>('users');
  const [dbSearch, setDbSearch] = useState('');
  const [isRefreshingDb, setIsRefreshingDb] = useState(false);
  const [lastDbSync, setLastDbSync] = useState(new Date().toLocaleTimeString());

  // Ticket Assignment State
  const [assigningTicketId, setAssigningTicketId] = useState<string | null>(null);
  const [selectedTechForAssign, setSelectedTechForAssign] = useState<string>('');

  // Toast / Banner
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Pre-defined inverter options
  const AVAILABLE_INVERTERS = [
    'Huawei',
    'Growatt',
    'Sungrow',
    'Solis',
    'GoodWe',
    'Inverex',
    'Knox',
    'Fronius',
    'Sofar',
    'Crown',
  ];

  // Handle Inverter Checkbox Toggle
  const toggleInverter = (brand: string) => {
    setFormData((prev) => {
      const exists = prev.supportedInverters.includes(brand);
      return {
        ...prev,
        supportedInverters: exists
          ? prev.supportedInverters.filter((b) => b !== brand)
          : [...prev.supportedInverters, brand],
      };
    });
  };

  // Handle Form Submit to Add Technician
  const handleCreateTechnician = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Please provide at least a name and phone number.');
      return;
    }

    const initials = formData.name
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'SC';

    const certsArray = formData.certifications
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    addTechnician({
      name: formData.name.trim(),
      initials,
      phone: formData.phone.trim(),
      serviceArea: formData.serviceArea,
      distanceKm: Number(formData.distanceKm) || 5,
      supportedInverters: formData.supportedInverters.length > 0 ? formData.supportedInverters : ['Huawei'],
      isVerified: formData.isVerified,
      verificationBadge: formData.verificationBadge,
      availability: formData.availability,
      experienceYears: Number(formData.experienceYears) || 3,
      rating: Number(formData.rating) || 4.9,
      completedJobsCount: Number(formData.completedJobsCount) || 1,
      specialization: formData.specialization,
      hourlyRatePkr: Number(formData.hourlyRatePkr) || 3000,
      bio: formData.bio,
      certifications: certsArray.length > 0 ? certsArray : ['Solar Care Verified Expert'],
    });

    setIsAddTechModalOpen(false);
    showNotification(`✓ Technician "${formData.name}" added successfully and is now active for clients!`);

    // Reset form
    setFormData({
      name: '',
      phone: '+92 ',
      serviceArea: 'Lahore (DHA, Gulberg & Cantt)',
      distanceKm: 4.5,
      supportedInverters: ['Huawei', 'Growatt'],
      isVerified: true,
      verificationBadge: 'Solar Care Certified Partner',
      availability: 'Available Today',
      experienceYears: 5,
      rating: 4.9,
      completedJobsCount: 120,
      specialization: 'Inverter Diagnostics & Fault Remediation',
      hourlyRatePkr: 3500,
      bio: 'Certified Solar PV Specialist experienced in inverter troubleshooting, net-metering audits, and DC string balancing.',
      certifications: 'PEC Electrical Engineer, Huawei HCIA-Solar',
    });
  };

  // Filter technicians
  const filteredTechnicians = technicians.filter((tech) => {
    if (techCityFilter !== 'All' && !tech.serviceArea.toLowerCase().includes(techCityFilter.toLowerCase())) {
      return false;
    }
    if (techSearch.trim()) {
      const q = techSearch.toLowerCase();
      const matchName = tech.name.toLowerCase().includes(q);
      const matchArea = tech.serviceArea.toLowerCase().includes(q);
      const matchBrand = tech.supportedInverters.some((b) => b.toLowerCase().includes(q));
      if (!matchName && !matchArea && !matchBrand) return false;
    }
    return true;
  });

  // Export DB as JSON file
  const handleExportDatabase = () => {
    const dbPayload = {
      exportedAt: new Date().toISOString(),
      cluster: 'Solar Care Production Local Cluster',
      collections: {
        technicians,
        serviceRequests,
        solarSystems: systems,
        activeUser: currentUser,
      },
    };
    const blob = new Blob([JSON.stringify(dbPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solarcare_db_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Database snapshot downloaded successfully.');
  };

  return (
    <div className={`space-y-6 ${isRtl ? 'font-urdu' : ''}`}>
      {/* ────────────────── TOP ADMIN BANNER & HEADER ────────────────── */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#0B1526] border border-slate-700/80 p-5 sm:p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  Admin Control Center
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase tracking-wider">
                  Admin Exclusive
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Manage technicians, monitor live database collections, and dispatch client service requests.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-slate-200 transition-colors hover:bg-white/20"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>

        {/* Status ticker */}
        <div className="mt-5 pt-4 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Database Connected
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">Engine: JSON Engine (Express 5 &amp; MERN API)</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">Latency: 11ms</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsRefreshingDb(true);
                setTimeout(() => {
                  setLastDbSync(new Date().toLocaleTimeString());
                  setIsRefreshingDb(false);
                  showNotification('Database records refreshed successfully.');
                }, 500);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshingDb ? 'animate-spin' : ''}`} />
              <span>Sync (Last: {lastDbSync})</span>
            </button>
            <button
              type="button"
              onClick={handleExportDatabase}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* ────────────────── NOTIFICATION TOAST ────────────────── */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification}</span>
          </div>
          <button type="button" onClick={() => setNotification(null)} className="cursor-pointer text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ────────────────── KPI METRIC TILES ────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Fleet Technicians</span>
            <Wrench className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{technicians.length}</p>
          <p className="mt-1 text-[11px] text-emerald-700 font-semibold">
            {technicians.filter((t) => t.availability === 'Available Today').length} Available Today
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Client Service Tickets</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{serviceRequests.length}</p>
          <p className="mt-1 text-[11px] text-amber-600 font-semibold">
            {serviceRequests.filter((r) => r.status !== 'Completed').length} Pending Dispatch
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Monitored Solar Fleet</span>
            <Sun className="w-4 h-4 text-solar-DEFAULT" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {systems.length} <span className="text-xs font-normal text-slate-500">Arrays</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {systems.reduce((acc, s) => acc + (s.capacityKw || 0), 0)} kW Total Capacity
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Database Health</span>
            <Database className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">99.98%</p>
          <p className="mt-1 text-[11px] text-indigo-700 font-semibold">
            Zero Unhandled Exceptions
          </p>
        </div>
      </div>

      {/* ────────────────── SECTION TABS ────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('technicians')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'technicians'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Manage Technicians ({technicians.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'database'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Database Live Section</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'tickets'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Client Service Tickets ({serviceRequests.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fleet')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'fleet'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sun className="w-4 h-4" />
          <span>Client Solar Fleet ({systems.length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: TECHNICIANS MANAGEMENT                                  */}
      {/* ============================================================== */}
      {activeTab === 'technicians' && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={techSearch}
                onChange={(e) => setTechSearch(e.target.value)}
                placeholder="Search technician by name, city, or inverter brand..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* City Filter */}
            <select
              value={techCityFilter}
              onChange={(e) => setTechCityFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
            >
              <option value="All">All Cities</option>
              <option value="Lahore">Lahore</option>
              <option value="Karachi">Karachi</option>
              <option value="Islamabad">Islamabad / Rawalpindi</option>
              <option value="Faisalabad">Faisalabad</option>
              <option value="Multan">Multan</option>
            </select>

            {/* ADD TECHNICIAN BUTTON */}
            <button
              type="button"
              onClick={() => setIsAddTechModalOpen(true)}
              className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-700/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Technician</span>
            </button>
          </div>

          {/* Technicians Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Technician</th>
                    <th className="py-3 px-4">Service Area</th>
                    <th className="py-3 px-4">Inverters Supported</th>
                    <th className="py-3 px-4">Rate (PKR/hr)</th>
                    <th className="py-3 px-4">Rating / Jobs</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredTechnicians.map((tech) => (
                    <tr key={tech.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold flex items-center justify-center text-xs">
                            {tech.initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{tech.name}</span>
                              {tech.isVerified && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{tech.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-slate-800 font-medium">{tech.serviceArea}</span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {tech.supportedInverters.slice(0, 3).map((brand) => (
                            <span
                              key={brand}
                              className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-600 font-semibold"
                            >
                              {brand}
                            </span>
                          ))}
                          {tech.supportedInverters.length > 3 && (
                            <span className="text-[10px] text-slate-500 font-semibold self-center">
                              +{tech.supportedInverters.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        Rs {tech.hourlyRatePkr.toLocaleString()}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 font-semibold text-slate-800">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{tech.rating}</span>
                          <span className="text-slate-400 text-[11px]">({tech.completedJobsCount} jobs)</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => {
                            const nextAvail =
                              tech.availability === 'Available Today'
                                ? 'Next Available: Tomorrow'
                                : tech.availability === 'Next Available: Tomorrow'
                                ? 'Booked This Week'
                                : 'Available Today';
                            updateTechnician(tech.id, { availability: nextAvail });
                            showNotification(`Status updated for ${tech.name}: ${nextAvail}`);
                          }}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer border ${
                            tech.availability === 'Available Today'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : tech.availability === 'Next Available: Tomorrow'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                          title="Click to toggle status"
                        >
                          {tech.availability}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              updateTechnician(tech.id, { isVerified: !tech.isVerified });
                              showNotification(`Verification toggled for ${tech.name}`);
                            }}
                            className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                              tech.isVerified
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : 'bg-slate-100 border-slate-200 text-slate-500'
                            }`}
                            title="Toggle Verified Partner"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete technician "${tech.name}"?`)) {
                                deleteTechnician(tech.id);
                                showNotification(`Technician "${tech.name}" removed from platform.`);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 cursor-pointer transition-colors"
                            title="Delete technician"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: DATABASE LIVE SECTION                                   */}
      {/* ============================================================== */}
      {activeTab === 'database' && (
        <div className="space-y-4">
          {/* DB Status Box */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Live Cluster Engine &amp; Collections Explorer
                  </h2>
                  <p className="text-xs text-slate-400">
                    Host: Local Storage Database Engine • Protocol: Express 5 MERN API
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-3 py-1 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                  Read/Write: UNRESTRICTED
                </span>
                <span className="text-[11px] font-mono px-3 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  RAM: 42.4 MB
                </span>
              </div>
            </div>

            {/* Collection Tabs */}
            <div className="flex items-center gap-2 pt-4">
              <button
                type="button"
                onClick={() => setDbCollectionTab('users')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  dbCollectionTab === 'users' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                Users Collection (2)
              </button>
              <button
                type="button"
                onClick={() => setDbCollectionTab('systems')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  dbCollectionTab === 'systems' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                Solar Systems Collection ({systems.length})
              </button>
              <button
                type="button"
                onClick={() => setDbCollectionTab('requests')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  dbCollectionTab === 'requests' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                Service Requests Collection ({serviceRequests.length})
              </button>
              <button
                type="button"
                onClick={() => setDbCollectionTab('technicians')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  dbCollectionTab === 'technicians' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                Technicians Collection ({technicians.length})
              </button>
            </div>
          </div>

          {/* Collection Data Display */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Active Collection: <span className="text-emerald-700">{dbCollectionTab.toUpperCase()}</span>
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Format: JSON Records Document Model
              </span>
            </div>

            {/* Code / Record Display */}
            <div className="bg-slate-950 rounded-xl p-4 overflow-x-auto max-h-[420px] text-[11px] font-mono text-emerald-400 border border-slate-800">
              {dbCollectionTab === 'users' && (
                <pre>
                  {JSON.stringify(
                    [
                      {
                        _id: 'usr-001',
                        name: 'Farhan khan',
                        email: 'farhan@example.com',
                        role: 'admin',
                        isVerified: true,
                        registeredSolarArrays: systems.length,
                        createdAt: '2026-01-15T10:00:00Z',
                      },
                      {
                        _id: 'usr-002',
                        name: 'Client Demo Account',
                        email: 'client@example.com',
                        role: 'customer',
                        isVerified: true,
                        registeredSolarArrays: 1,
                        createdAt: '2026-02-01T08:30:00Z',
                      },
                    ],
                    null,
                    2
                  )}
                </pre>
              )}

              {dbCollectionTab === 'systems' && (
                <pre>{JSON.stringify(systems, null, 2)}</pre>
              )}

              {dbCollectionTab === 'requests' && (
                <pre>{JSON.stringify(serviceRequests, null, 2)}</pre>
              )}

              {dbCollectionTab === 'technicians' && (
                <pre>{JSON.stringify(technicians, null, 2)}</pre>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: CLIENT SERVICE TICKETS                                  */}
      {/* ============================================================== */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Client Service Requests Dispatch</h2>
                <p className="text-xs text-slate-500">Assign technicians and advance resolution status</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Issue Category</th>
                    <th className="py-3 px-4">Assigned Technician</th>
                    <th className="py-3 px-4">Preferred Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Dispatch Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {serviceRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{req.id}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{req.problemCategory}</span>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">{req.description}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-emerald-800">{req.technicianName || 'Unassigned'}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{req.preferredDate}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            req.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-800'
                              : req.status === 'Accepted'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {req.status === 'Requested' && (
                            <button
                              type="button"
                              onClick={() => {
                                advanceRequestStatus(req.id, 'Accepted');
                                showNotification(`Ticket ${req.id} marked as Accepted`);
                              }}
                              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] cursor-pointer"
                            >
                              Accept
                            </button>
                          )}
                          {req.status === 'Accepted' && (
                            <button
                              type="button"
                              onClick={() => {
                                advanceRequestStatus(req.id, 'In Progress');
                                showNotification(`Ticket ${req.id} set to In Progress`);
                              }}
                              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] cursor-pointer"
                            >
                              Dispatch
                            </button>
                          )}
                          {req.status === 'In Progress' && (
                            <button
                              type="button"
                              onClick={() => {
                                advanceRequestStatus(req.id, 'Completed');
                                showNotification(`Ticket ${req.id} marked as Completed`);
                              }}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: CLIENT SOLAR FLEET                                      */}
      {/* ============================================================== */}
      {activeTab === 'fleet' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systems.map((sys) => (
              <div key={sys.id} className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{sys.name}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">
                    {sys.capacityKw} kW
                  </span>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sys.location}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sys.inverterBrand} ({sys.inverterModel})</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sys.panelCount} Panels • {sys.panelType}</span>
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <span className="text-emerald-700">● Telemetry Active</span>
                  <span className="text-slate-400">Commissioned: {sys.installationDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD NEW TECHNICIAN                                      */}
      {/* ============================================================== */}
      {isAddTechModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add New Certified Technician</h3>
                  <p className="text-xs text-slate-500">Register a new engineer to receive client service dispatches</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddTechModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateTechnician} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Technician / Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Engr. Asad Qureshi"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Direct Phone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Service Area */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Service Area &amp; City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.serviceArea}
                  onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                  placeholder="e.g. Lahore (DHA, Gulberg & Cantt) or Islamabad"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Hourly Rate */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hourly Rate (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="500"
                    step="100"
                    value={formData.hourlyRatePkr}
                    onChange={(e) => setFormData({ ...formData, hourlyRatePkr: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Initial Rating (Stars)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Supported Inverters Multi-select checkboxes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Supported Inverter Brands
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {AVAILABLE_INVERTERS.map((brand) => {
                    const isChecked = formData.supportedInverters.includes(brand);
                    return (
                      <button
                        type="button"
                        key={brand}
                        onClick={() => toggleInverter(brand)}
                        className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span>{brand}</span>
                        {isChecked && <Check className="w-3 h-3 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Specialization */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Primary Specialization
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="e.g. Inverter Board Repair, Net-Metering Commissioning, Panel Washing"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Certifications */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Certifications (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.certifications}
                  onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                  placeholder="PEC Registered Engineer, Huawei HCIA-Solar, Growatt Academy"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Professional Bio / Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Verified Partner & Availability */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.isVerified}
                    onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                  />
                  <span>Mark as Solar Care Verified Partner</span>
                </label>

                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-600">Availability:</span>
                  <select
                    value={formData.availability}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        availability: e.target.value as any,
                      })
                    }
                    className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-800 font-medium"
                  >
                    <option value="Available Today">Available Today</option>
                    <option value="Next Available: Tomorrow">Next Available: Tomorrow</option>
                    <option value="Booked This Week">Booked This Week</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTechModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer transition-colors"
                >
                  Save &amp; Register Technician
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
