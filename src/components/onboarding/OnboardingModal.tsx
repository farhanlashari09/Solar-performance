import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSolar } from '../../context/SolarContext';
import {
  Sun,
  X,
  PlusCircle,
  HelpCircle,
  CheckCircle,
  Zap,
  Radio,
  Calendar,
  MapPin,
  Cpu,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { addSolarSystem } = useSolar();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacityKw, setCapacityKw] = useState('10.0');
  const [inverterBrand, setInverterBrand] = useState('Huawei');
  const [inverterModel, setInverterModel] = useState('');
  const [installationDate, setInstallationDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [panelCount, setPanelCount] = useState('18');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await addSolarSystem({
        name: name.trim(),
        location: location.trim(),
        capacityKw: Number(capacityKw),
        inverterBrand,
        inverterModel: inverterModel.trim(),
        installationDate,
        connectionMethod: 'Not connected',
        connectionStatus: 'unavailable',
        panelCount: Number(panelCount) || 0,
        panelType: '',
      });
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save this solar system.');
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-brand-dark to-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
              <Sun className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{t.onboarding.title}</h2>
              <p className="text-xs text-emerald-200">{t.onboarding.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* System Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.onboarding.systemName} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.onboarding.systemNamePlaceholder}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.onboarding.location} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter city or address"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Capacity in kW and Panel Count */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.onboarding.capacity} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Zap className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="number"
                  step="0.1"
                  required
                  value={capacityKw}
                  onChange={(e) => setCapacityKw(e.target.value)}
                  placeholder={t.onboarding.capacityPlaceholder}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Approx Panel Count (Optional)
              </label>
              <input
                type="number"
                value={panelCount}
                onChange={(e) => setPanelCount(e.target.value)}
                placeholder="18"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Inverter Brand and Model */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.onboarding.inverterBrand}
              </label>
              <select
                value={inverterBrand}
                onChange={(e) => setInverterBrand(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                <option value="Huawei">Huawei</option>
                <option value="Growatt">Growatt</option>
                <option value="Solis">Solis</option>
                <option value="GoodWe">GoodWe</option>
                <option value="Sungrow">Sungrow</option>
                <option value="Inverex">Inverex</option>
                <option value="Knox">Knox</option>
                <option value="Fronius">Fronius</option>
                <option value="Other">Other Brand</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.onboarding.inverterModel}
              </label>
              <input
                type="text"
                value={inverterModel}
                onChange={(e) => setInverterModel(e.target.value)}
                placeholder={t.onboarding.inverterModelPlaceholder}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Installation Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.onboarding.installDate}
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="date"
                value={installationDate}
                onChange={(e) => setInstallationDate(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>


          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            {errorMessage && <p role="alert" className="text-xs text-rose-700">{errorMessage}</p>}
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 py-2.5 px-3"
            >
              {t.onboarding.skipForNow}
            </button>

            <button
              type="submit"
              disabled={!name.trim() || !location.trim() || !Number.isFinite(Number(capacityKw)) || Number(capacityKw) <= 0}
              className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all"
            >
              {t.onboarding.saveAndStart}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
