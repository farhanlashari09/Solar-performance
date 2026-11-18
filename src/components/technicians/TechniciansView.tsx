import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useMaintenance } from '../../context/MaintenanceContext';
import { Technician } from '../../types';
import {
  Users,
  Search,
  Filter,
  Star,
  CheckCircle,
  MapPin,
  Cpu,
  Clock,
  Briefcase,
  ShieldCheck,
  X,
  Phone,
  ArrowRight,
  Navigation2,
} from 'lucide-react';

// Helper to format distance from user's home
const formatDistance = (km: number): { label: string; colorClass: string } => {
  if (km < 20) return { label: `${km.toFixed(1)} km away`, colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (km < 500) return { label: `${Math.round(km)} km away`, colorClass: 'text-amber-700 bg-amber-50 border-amber-200' };
  return { label: `${Math.round(km)} km away`, colorClass: 'text-rose-700 bg-rose-50 border-rose-200' };
};

interface TechniciansViewProps {
  onSelectTechnicianForService: (tech: Technician) => void;
}

export const TechniciansView: React.FC<TechniciansViewProps> = ({
  onSelectTechnicianForService,
}) => {
  const { t } = useLanguage();
  const { technicians } = useMaintenance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [activeProfileModal, setActiveProfileModal] = useState<Technician | null>(null);

  // Filter technicians
  const filteredTechnicians = technicians.filter((tech) => {
    if (verifiedOnly && !tech.isVerified) return false;
    if (selectedArea !== 'All' && !tech.serviceArea.toLowerCase().includes(selectedArea.toLowerCase())) return false;
    if (selectedBrand !== 'All' && !tech.supportedInverters.includes(selectedBrand)) return false;
    if (selectedAvailability !== 'All' && tech.availability !== selectedAvailability) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = tech.name.toLowerCase().includes(q);
      const matchArea = tech.serviceArea.toLowerCase().includes(q);
      const matchBrand = tech.supportedInverters.some((b) => b.toLowerCase().includes(q));
      if (!matchName && !matchArea && !matchBrand) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t.technicians.title}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {t.technicians.subtitle}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="solar-card p-4 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.technicians.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {/* Area */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              {t.technicians.filterArea}
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
            >
              <option value="All">{t.technicians.allAreas}</option>
              <option value="Lahore">Lahore</option>
              <option value="Karachi">Karachi</option>
              <option value="Islamabad">Islamabad / Rawalpindi</option>
              <option value="Multan">Multan & South Punjab</option>
            </select>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              {t.technicians.filterBrand}
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
            >
              <option value="All">{t.technicians.allBrands}</option>
              <option value="Huawei">Huawei</option>
              <option value="Growatt">Growatt</option>
              <option value="Solis">Solis</option>
              <option value="GoodWe">GoodWe</option>
              <option value="Sungrow">Sungrow</option>
              <option value="Inverex">Inverex</option>
            </select>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              {t.technicians.filterAvailability}
            </label>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
            >
              <option value="All">{t.technicians.allAvailability}</option>
              <option value="Available Today">Available Today</option>
              <option value="Next Available: Tomorrow">Next Available: Tomorrow</option>
              <option value="Booked This Week">Booked This Week</option>
            </select>
          </div>

          {/* Verified Toggle */}
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 select-none py-2">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>{t.technicians.filterVerified}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTechnicians.map((tech) => (
          <div
            key={tech.id}
            className="solar-card p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative"
          >
            <div>
              {/* Header: Avatar, Name, Verified Badge */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-dark to-emerald-700 text-white font-bold text-base flex items-center justify-center shadow-xs">
                    {tech.initials}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">
                      {tech.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[160px]">{tech.serviceArea.split('(')[0]}</span>
                    </p>
                  </div>
                </div>

                {tech.isVerified && (
                  <span
                    title={tech.verificationBadge}
                    className="p-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </span>
                )}
              </div>

              {/* Rating & Completed Jobs */}
              <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 text-xs mb-3">
                <div className="flex items-center gap-1 font-bold text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{tech.rating}</span>
                </div>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-medium">
                  {tech.completedJobsCount} {t.technicians.completedJobs}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-medium">
                  {tech.experienceYears} {t.technicians.experienceYears}
                </span>
              </div>

              {/* Distance from home */}
              {(() => {
                const dist = formatDistance(tech.distanceKm);
                return (
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold mb-3 ${dist.colorClass}`}>
                    <Navigation2 className="w-3 h-3" />
                    {dist.label} from your home
                  </div>
                );
              })()}

              {/* Supported Brands */}
              <div className="mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Supported Inverters
                </span>
                <div className="flex flex-wrap gap-1">
                  {tech.supportedInverters.slice(0, 4).map((b) => (
                    <span
                      key={b}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold"
                    >
                      {b}
                    </span>
                  ))}
                  {tech.supportedInverters.length > 4 && (
                    <span className="px-1.5 py-0.5 text-[10px] text-slate-400">
                      +{tech.supportedInverters.length - 4}
                    </span>
                  )}
                </div>
              </div>

              {/* Availability status */}
              <div className="flex items-center justify-between text-xs mb-4">
                <span className="text-slate-500">Availability:</span>
                <span
                  className={`font-semibold ${
                    tech.availability === 'Available Today'
                      ? 'text-emerald-700'
                      : tech.availability === 'Next Available: Tomorrow'
                      ? 'text-blue-700'
                      : 'text-slate-500'
                  }`}
                >
                  {tech.availability}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setActiveProfileModal(tech)}
                className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 transition-colors"
              >
                {t.technicians.viewProfileBtn}
              </button>

              <button
                onClick={() => onSelectTechnicianForService(tech)}
                className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-xs"
              >
                {t.technicians.requestServiceBtn}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Technician Profile Modal */}
      {activeProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="p-6 bg-gradient-to-r from-brand-dark to-emerald-800 text-white flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 text-white text-xl font-bold flex items-center justify-center backdrop-blur-xs">
                  {activeProfileModal.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold">{activeProfileModal.name}</h2>
                    {activeProfileModal.isVerified && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-bold border border-emerald-300/30">
                        Verified Partner
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-100 mt-0.5">{activeProfileModal.specialization}</p>
                  <p className="text-[11px] text-emerald-200 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{activeProfileModal.serviceArea}</span>
                  </p>
                  <p className="text-[11px] text-emerald-300 flex items-center gap-1 mt-0.5">
                    <Navigation2 className="w-3 h-3" />
                    <span>{formatDistance(activeProfileModal.distanceKm).label} from your home</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveProfileModal(null)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-slate-600">
              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Rating</span>
                  <span className="text-base font-extrabold text-amber-600">★ {activeProfileModal.rating}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Experience</span>
                  <span className="text-base font-extrabold text-slate-800">{activeProfileModal.experienceYears} Years</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Jobs Done</span>
                  <span className="text-base font-extrabold text-emerald-700">{activeProfileModal.completedJobsCount}+</span>
                </div>
              </div>

              {/* Bio */}
              <div>
                <h4 className="font-bold text-slate-900 mb-1">{t.technicians.bio}</h4>
                <p className="leading-relaxed text-slate-600">{activeProfileModal.bio}</p>
              </div>

              {/* Supported Brands */}
              <div>
                <h4 className="font-bold text-slate-900 mb-1">{t.technicians.supportedBrands}</h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeProfileModal.supportedInverters.map((b) => (
                    <span key={b} className="px-2.5 py-1 bg-slate-100 text-slate-800 font-semibold rounded-lg">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <h4 className="font-bold text-slate-900 mb-1">{t.technicians.certifications}</h4>
                <ul className="space-y-1.5">
                  {activeProfileModal.certifications.map((cert, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-700">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{cert}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rate & Availability */}
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[11px]">Estimated On-site Inspection Fee:</span>
                  <span className="text-sm font-extrabold text-emerald-900">PKR {activeProfileModal.hourlyRatePkr.toLocaleString()}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white text-emerald-800 font-bold border border-emerald-300">
                  {activeProfileModal.availability}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setActiveProfileModal(null)}
                className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const tech = activeProfileModal;
                  setActiveProfileModal(null);
                  onSelectTechnicianForService(tech);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-700/20"
              >
                {t.technicians.requestServiceBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
