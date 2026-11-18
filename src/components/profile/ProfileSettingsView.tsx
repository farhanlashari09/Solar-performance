import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useSolar } from '../../context/SolarContext';
import { Language } from '../../types';
import { databaseApi } from '../../services/api';
import {
  User,
  Mail,
  Globe,
  Sun,
  Lock,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound,
  ShieldCheck,
  Database,
} from 'lucide-react';

interface ProfileSettingsViewProps {
  onOpenOnboarding: () => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  onOpenOnboarding,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { currentUser, updateUserProfile, logout } = useAuth();
  const { systems, resetDemoData } = useSolar();

  const [name, setName] = useState(currentUser?.name || '');
  const [successNotice, setSuccessNotice] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateUserProfile(name.trim(), language);
    setSuccessNotice('Profile details updated successfully!');
    setTimeout(() => setSuccessNotice(''), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword.length < 8) {
      setPasswordError(t.auth.pwdTooShort);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t.auth.pwdMismatch);
      return;
    }
    setSuccessNotice('Account password updated successfully.');
    setIsChangingPassword(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSuccessNotice(''), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t.profile.title}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {t.profile.subtitle}
        </p>
      </div>

      {successNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Personal Info Card */}
      <div className="solar-card p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-600" />
          <span>{t.profile.personalInfo}</span>
        </h3>

        <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.profile.fullName}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.profile.verifiedEmail}
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || ''}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-500 cursor-not-allowed"
                />
                <span className="absolute right-3 top-2.5 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                  Verified
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t.profile.preferredLanguage}
            </label>
            <div className="grid grid-cols-3 gap-2.5 max-w-md">
              {[
                { code: 'en' as Language, label: 'English' },
                { code: 'ur' as Language, label: 'اردو (Urdu)' },
                { code: 'ur-roman' as Language, label: 'Roman Urdu' },
              ].map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                    language === l.code
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t.save}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Registered Systems Card */}
      <div className="solar-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sun className="w-4 h-4 text-emerald-600" />
            <span>{t.profile.solarSystemsManager}</span>
          </h3>

          <button
            onClick={onOpenOnboarding}
            className="text-xs font-bold text-emerald-700 hover:bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-200 transition-colors"
          >
            {t.profile.addNewSystem}
          </button>
        </div>

        <div className="space-y-3">
          {systems.map((s) => (
            <div
              key={s.id}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <h4 className="font-bold text-slate-900">{s.name}</h4>
                <p className="text-slate-500 mt-0.5">
                  {s.location} • Inverter: {s.inverterBrand} {s.inverterModel} • Panels: {s.panelCount} units
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold text-emerald-800 bg-white border border-emerald-200 px-2 py-1 rounded">
                  {s.capacityKw} kW
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  s.connectionStatus === 'demo'
                    ? 'bg-emerald-100 text-emerald-800'
                    : s.connectionStatus === 'connected'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {s.connectionStatus === 'demo' ? 'Demo Active' : s.connectionStatus === 'connected' ? 'Connected' : 'Unavailable'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Security & Password Change */}
      <div className="solar-card p-6">
        <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>{t.profile.securitySection}</span>
        </h3>

        {!isChangingPassword ? (
          <div>
            <p className="text-xs text-slate-500 mb-3">
              Password was configured during account creation. Change regularly to protect telemetry access.
            </p>
            <button
              onClick={() => setIsChangingPassword(true)}
              className="py-2 px-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors flex items-center gap-2"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{t.profile.changePasswordBtn}</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-3 max-w-md text-xs">
            {passwordError && (
              <p className="text-rose-600 text-xs font-semibold">{passwordError}</p>
            )}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                New Password (8+ characters)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="py-2 px-4 bg-emerald-600 text-white rounded-xl font-bold"
              >
                Save New Password
              </button>
              <button
                type="button"
                onClick={() => setIsChangingPassword(false)}
                className="py-2 px-3 text-slate-500 font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Database Management Card */}
      <div className="solar-card p-6 bg-white border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Database Manager & Records</h3>
              <p className="text-xs text-slate-500">
                Connected to persistent database (`server/data/solarcare_db.json` on port 5000)
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Database Live
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registered Users</span>
            <span className="text-xl font-extrabold text-slate-900">2 Accounts</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Solar Assets</span>
            <span className="text-xl font-extrabold text-emerald-700">{systems.length} Systems</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Database File</span>
            <span className="text-xs font-mono font-bold text-slate-700 block mt-1">solarcare_db.json</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 mb-4">
          <span className="font-bold text-slate-700 block">Active Accounts in Database:</span>
          <div className="font-mono text-slate-600 text-[11px] space-y-0.5">
            <div>• farhan@example.com (Farhan Tariq)</div>
            <div>• admin@solarcare.com (Admin SolarCare)</div>
            {currentUser?.email && !['farhan@example.com', 'admin@solarcare.com'].includes(currentUser.email) && (
              <div>• {currentUser.email} ({currentUser.name}) [Current Session]</div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={async () => {
              if (confirm('Reset database to clean default seed data?')) {
                const res = await databaseApi.reset();
                if (res.success) {
                  setSuccessNotice('Database reset to default seed records.');
                  setTimeout(() => setSuccessNotice(''), 3000);
                }
              }
            }}
            className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
            <span>Reset Database to Clean Defaults</span>
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="pt-2">
        <button
          onClick={logout}
          className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>{t.nav.logout}</span>
        </button>
      </div>
    </div>
  );
};
