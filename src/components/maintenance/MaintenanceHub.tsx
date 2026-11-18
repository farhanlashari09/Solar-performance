import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSolar } from '../../context/SolarContext';
import { useMaintenance } from '../../context/MaintenanceContext';
import { ServiceStatus, Technician } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  Wrench,
  PlusCircle,
  Clock,
  CheckCircle2,
  Calendar,
  Camera,
  UserCheck,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  FileText,
  Upload,
  Sparkles,
  Zap,
} from 'lucide-react';

interface MaintenanceHubProps {
  initialTab?: 'tracking' | 'newRequest' | 'history' | 'verification';
  preSelectedTechnician?: Technician | null;
  onClearPreSelectedTechnician?: () => void;
}

export const MaintenanceHub: React.FC<MaintenanceHubProps> = ({
  initialTab = 'tracking',
  preSelectedTechnician,
  onClearPreSelectedTechnician,
}) => {
  const { t, isRtl } = useLanguage();
  const { systems, activeSystem } = useSolar();
  const {
    serviceRequests,
    technicians,
    createServiceRequest,
    advanceRequestStatus,
    verificationData,
  } = useMaintenance();

  const [activeTab, setActiveTab] = useState<'tracking' | 'newRequest' | 'history' | 'verification'>(
    preSelectedTechnician ? 'newRequest' : initialTab
  );

  // Form state for New Service Request
  const [selectedSystemId, setSelectedSystemId] = useState(activeSystem.id);
  const [problemCategory, setProblemCategory] = useState('Panel Cleaning & Dust/Soiling Removal');
  const [description, setDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState('2026-10-15');
  const [selectedTechId, setSelectedTechId] = useState<string>(
    preSelectedTechnician ? preSelectedTechnician.id : ''
  );
  const [attachedPhotoName, setAttachedPhotoName] = useState<string>('');
  const [attachedPhotoUrl, setAttachedPhotoUrl] = useState<string>('');
  const [submissionSuccessRef, setSubmissionSuccessRef] = useState<string | null>(null);

  // Handle Photo upload simulation
  const handlePhotoUploadSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachedPhotoName(file.name);
      setAttachedPhotoUrl(URL.createObjectURL(file));
    } else {
      // Mock photo
      setAttachedPhotoName('solar_panel_dirt_sample.jpg');
      setAttachedPhotoUrl('https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=600&q=80');
    }
  };

  const handleNewRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const newReq = createServiceRequest({
      systemId: selectedSystemId,
      technicianId: selectedTechId || undefined,
      problemCategory,
      description,
      preferredDate,
      photoUrl: attachedPhotoUrl || undefined,
      photoName: attachedPhotoName || undefined,
    });

    setSubmissionSuccessRef(newReq.id);
    setDescription('');
    setAttachedPhotoName('');
    setAttachedPhotoUrl('');
    if (onClearPreSelectedTechnician) onClearPreSelectedTechnician();
  };

  const activeRequests = serviceRequests.filter((r) => r.status !== 'Completed');
  const completedRequests = serviceRequests.filter((r) => r.status === 'Completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t.maintenance.title}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {t.maintenance.subtitle}
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto text-xs">
        <button
          onClick={() => {
            setActiveTab('tracking');
            setSubmissionSuccessRef(null);
          }}
          className={`pb-3 px-4 font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'tracking'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{t.maintenance.tabs.tracking} ({activeRequests.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('newRequest');
            setSubmissionSuccessRef(null);
          }}
          className={`pb-3 px-4 font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'newRequest'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.maintenance.tabs.newRequest}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('history');
            setSubmissionSuccessRef(null);
          }}
          className={`pb-3 px-4 font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'history'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t.maintenance.tabs.history} ({completedRequests.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('verification');
            setSubmissionSuccessRef(null);
          }}
          className={`pb-3 px-4 font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'verification'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>{t.maintenance.tabs.verification}</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE REQUESTS & TIMELINE TRACKING */}
      {activeTab === 'tracking' && (
        <div className="space-y-6">
          {activeRequests.length === 0 ? (
            <div className="solar-card p-12 text-center text-slate-400 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">No Active Maintenance Requests</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All scheduled servicing has been resolved or none have been logged yet for your solar array.
              </p>
              <button
                onClick={() => setActiveTab('newRequest')}
                className="mt-2 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                Log New Service Request
              </button>
            </div>
          ) : (
            activeRequests.map((req) => {
              const system = systems.find((s) => s.id === req.systemId);
              const stages: ServiceStatus[] = ['Requested', 'Accepted', 'In Progress', 'Completed'];
              const currentStageIdx = stages.indexOf(req.status);

              return (
                <div key={req.id} className="solar-card p-6 space-y-6">
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-sm font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          {req.id}
                        </span>
                        <h3 className="text-base font-bold text-slate-900">
                          {req.problemCategory}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        System: <span className="font-bold text-slate-800">{system?.name || req.systemId}</span> • Preferred Date: {req.preferredDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={req.status} />
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                      Service Progress Milestone Timeline
                    </h4>

                    {/* Progress Bar Line */}
                    <div className="grid grid-cols-4 gap-2 relative">
                      {stages.map((stg, idx) => {
                        const isReached = idx <= currentStageIdx;
                        const isCurrent = idx === currentStageIdx;

                        return (
                          <div key={stg} className="flex flex-col items-center text-center">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                                isCurrent
                                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                                  : isReached
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-100 text-slate-400 border border-slate-200'
                              }`}
                            >
                              {isReached ? '✓' : idx + 1}
                            </div>
                            <span
                              className={`text-xs mt-2 font-semibold ${
                                isReached ? 'text-slate-900' : 'text-slate-400'
                              }`}
                            >
                              {stg}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Description & Details */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
                    <p className="text-slate-700 leading-relaxed">
                      <span className="font-bold text-slate-900">Reported Issue: </span>
                      {req.description}
                    </p>
                    <div className="flex items-center gap-4 text-slate-500 pt-1">
                      <span>Technician: <strong className="text-slate-800">{req.technicianName}</strong></span>
                      <span>Logged on: {req.createdAt}</span>
                    </div>

                    {req.photoUrl && (
                      <div className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-3">
                        <img
                          src={req.photoUrl}
                          alt="Fault attachment"
                          className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                        />
                        <span className="text-slate-500 text-[11px]">
                          Attached photo: {req.photoName || 'fault_photo.jpg'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Interactive Demo Control Bar */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-slate-50 border border-emerald-200/80">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-1.5 py-0.2 bg-emerald-700 text-white text-[10px] font-bold rounded">
                        Interactive Demo Workflow
                      </span>
                      <p className="text-xs text-slate-600 font-medium">
                        {t.maintenance.demoControlsNotice}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {req.status === 'Requested' && (
                        <button
                          onClick={() => advanceRequestStatus(req.id, 'Accepted')}
                          className="py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <span>{t.maintenance.simulateAccept}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {req.status === 'Accepted' && (
                        <button
                          onClick={() => advanceRequestStatus(req.id, 'In Progress')}
                          className="py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <span>{t.maintenance.simulateStart}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {req.status === 'In Progress' && (
                        <button
                          onClick={() => advanceRequestStatus(req.id, 'Completed')}
                          className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <span>{t.maintenance.simulateComplete}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {req.status === 'Requested' && (
                        <button
                          onClick={() => advanceRequestStatus(req.id, 'Completed')}
                          className="py-1.5 px-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
                        >
                          Quick Fast-Forward to Completed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: NEW SERVICE REQUEST FORM */}
      {activeTab === 'newRequest' && (
        <div className="solar-card p-6 sm:p-8 max-w-2xl">
          {submissionSuccessRef ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Service Request Submitted!
              </h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                {t.maintenance.requestCreatedSuccess}{' '}
                <strong className="font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {submissionSuccessRef}
                </strong>
                . Our technician has been dispatched in simulation mode.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setSubmissionSuccessRef(null);
                    setActiveTab('tracking');
                  }}
                  className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20"
                >
                  Track Request in Live Timeline
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900">
                  {t.maintenance.newRequestTitle}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Connect with accredited technicians for cleaning, inverter inspection, or DC wiring repair.
                </p>
              </div>

              <form onSubmit={handleNewRequestSubmit} className="space-y-4 text-xs">
                {/* System Selection */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Solar System
                  </label>
                  <select
                    value={selectedSystemId}
                    onChange={(e) => setSelectedSystemId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  >
                    {systems.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.capacityKw} kW, {s.location})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Problem Category */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.maintenance.problemCategory}
                  </label>
                  <select
                    value={problemCategory}
                    onChange={(e) => setProblemCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  >
                    <option value="Panel Cleaning & Dust/Soiling Removal">
                      {t.maintenance.problemCatCleaning}
                    </option>
                    <option value="Inverter Fault / Error Code Investigation">
                      {t.maintenance.problemCatInverter}
                    </option>
                    <option value="DC Cabling / MC4 Connector / Earthing Check">
                      {t.maintenance.problemCatWiring}
                    </option>
                    <option value="Net Metering / Grid Synchronization">
                      {t.maintenance.problemCatNetMetering}
                    </option>
                    <option value="Annual Preventative Health Inspection">
                      {t.maintenance.problemCatAnnual}
                    </option>
                  </select>
                </div>

                {/* Problem Description */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.maintenance.problemDescription} <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t.maintenance.problemDescPlaceholder}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white leading-relaxed"
                  />
                </div>

                {/* Preferred Date */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.maintenance.preferredDate}
                  </label>
                  <input
                    type="date"
                    required
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>

                {/* Technician Selection */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.maintenance.selectTechnician}
                  </label>
                  <select
                    value={selectedTechId}
                    onChange={(e) => setSelectedTechId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  >
                    <option value="">{t.maintenance.autoAssignTech}</option>
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.name} ({tech.serviceArea.split('(')[0].trim()} • ★ {tech.rating})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Photo Attachment (Simulated) */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.maintenance.attachPhoto}
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer font-bold text-slate-700">
                      <Camera className="w-4 h-4 text-emerald-600" />
                      <span>{attachedPhotoName ? 'Change Photo' : 'Upload Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUploadSim}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAttachedPhotoName('sample_panel_photo.jpg');
                        setAttachedPhotoUrl('https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=600&q=80');
                      }}
                      className="text-emerald-700 underline text-[11px] font-semibold"
                    >
                      Use Sample Photo
                    </button>
                    {attachedPhotoName && (
                      <span className="text-slate-500 text-[11px] font-medium truncate max-w-[200px]">
                        ✓ {attachedPhotoName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2"
                  >
                    <span>{t.maintenance.submitRequestBtn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COMPLETED MAINTENANCE HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {completedRequests.map((rec) => (
            <div key={rec.id} className="solar-card p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {rec.id}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">{rec.problemCategory}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Completed on: <strong className="text-slate-800">{rec.workReport?.completedDate || rec.createdAt}</strong> • Assigned: <strong className="text-slate-800">{rec.technicianName}</strong>
                  </p>
                </div>
                <StatusBadge status="Completed" />
              </div>

              {rec.workReport && (
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block mb-0.5">{t.maintenance.workPerformed}:</span>
                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {rec.workReport.workPerformed}
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-900 block mb-0.5">{t.maintenance.technicianNotes}:</span>
                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {rec.workReport.technicianNotes}
                    </p>
                  </div>

                  {rec.workReport.beforeKwhDaily && rec.workReport.afterKwhDaily && (
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-slate-500 text-[11px] block">Before vs After Daily Yield:</span>
                        <span className="font-semibold text-slate-900">
                          {rec.workReport.beforeKwhDaily} kWh/day ➔ {rec.workReport.afterKwhDaily} kWh/day
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-2xs">
                        +{rec.workReport.improvementPct}% Output Recovery
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: POST-MAINTENANCE PERFORMANCE VERIFICATION */}
      {activeTab === 'verification' && (
        <div className="space-y-6">
          <div className="solar-card p-6 border-l-4 border-l-emerald-600">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Verified Case Study
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {verificationData.serviceType}
                </h3>
                <p className="text-xs text-slate-500">
                  Serviced on {verificationData.serviceDate} by {verificationData.technician}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-right">
                <span className="text-[11px] text-slate-500 block">Measured Daily Uplift</span>
                <span className="text-xl font-extrabold text-emerald-700">
                  +{verificationData.yieldGainPct}% (+{verificationData.yieldGainKwh} kWh/day)
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed mb-6">
              {verificationData.weatherContext}
            </p>

            {/* Before vs After Tables Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Pre-Service 4 Days */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-800">Pre-Service Daily Readings</span>
                  <span className="text-slate-500 font-semibold">Avg: {verificationData.preAvgKwh} kWh</span>
                </div>
                <div className="space-y-1.5">
                  {verificationData.preServiceDays.map((d) => (
                    <div key={d.day} className="flex items-center justify-between py-1 px-2 rounded bg-slate-50 text-slate-700">
                      <span>{d.day} ({d.condition})</span>
                      <span className="font-bold">{d.actualKwh} kWh</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Post-Service 4 Days */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/20">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-100">
                  <span className="font-bold text-emerald-900">Post-Service Daily Readings</span>
                  <span className="text-emerald-700 font-semibold">Avg: {verificationData.postAvgKwh} kWh</span>
                </div>
                <div className="space-y-1.5">
                  {verificationData.postServiceDays.map((d) => (
                    <div key={d.day} className="flex items-center justify-between py-1 px-2 rounded bg-emerald-50 text-emerald-900">
                      <span>{d.day} ({d.condition})</span>
                      <span className="font-bold">{d.actualKwh} kWh</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Honest Causality Disclaimer per Section 10 */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-500">
              <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {t.maintenance.causalityNotice}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
