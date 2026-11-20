import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSolar } from '../../context/SolarContext';
import { useAuth } from '../../context/AuthContext';
import { Language } from '../../types';
import {
  Sun,
  Globe,
  Bell,
  Menu,
  X,
  ChevronDown,
  Info,
  Check,
  PlusCircle,
  Zap,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onNavigate: (route: string) => void;
  onOpenOnboarding: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onNavigate,
  onOpenOnboarding,
}) => {
  const { language, setLanguage, t, isRtl } = useLanguage();
  const { systems, activeSystem, setActiveSystemId, unreadAlertCount } = useSolar();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.email.trim().toLowerCase() === 'admin@solarcare.com';

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isSystemMenuOpen, setIsSystemMenuOpen] = useState(false);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ur', label: 'اردو (Urdu)', flag: '🇵🇰' },
    { code: 'ur-roman', label: 'Roman Urdu', flag: '🇵🇰' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Mobile Menu button & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Open sidebar navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <div
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-brand-dark flex items-center justify-center text-white shadow-sm shadow-emerald-700/20 group-hover:scale-105 transition-transform">
                <Sun className="w-5 h-5 text-amber-300 animate-spin-slow" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold text-slate-900 tracking-normal leading-none group-hover:text-emerald-800 transition-colors">
                  Solar <span className="text-emerald-600">Care</span>
                </span>
                <span className="text-[11px] text-emerald-700 font-medium tracking-wide">
                  {t.tagline.split('—')[0]}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Solar System Selector */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <button
                onClick={() => setIsSystemMenuOpen(!isSystemMenuOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-800 text-sm font-medium transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 text-xs">{t.dashboard.systemSelectLabel}</span>
                  <span className="font-semibold text-slate-900">{activeSystem.name}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    {activeSystem.capacityKw} kW
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isSystemMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* System Dropdown */}
              {isSystemMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsSystemMenuOpen(false)}
                  ></div>
                  <div
                    className={`absolute ${
                      isRtl ? 'left-0' : 'right-0'
                    } mt-2 w-80 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-left`}
                  >
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Registered Solar Assets
                      </p>
                    </div>
                    <div className="max-h-60 overflow-y-auto py-1">
                      {systems.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setActiveSystemId(s.id);
                            setIsSystemMenuOpen(false);
                          }}
                          className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors ${
                            s.id === activeSystem.id ? 'bg-emerald-50/70' : ''
                          }`}
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-900">{s.name}</p>
                            <p className="text-xs text-slate-500">{s.location} • {s.inverterBrand}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-700 bg-white border border-emerald-200 px-1.5 py-0.5 rounded">
                              {s.capacityKw} kW
                            </span>
                            {s.id === activeSystem.id && (
                              <Check className="w-4 h-4 text-emerald-600" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                      <button
                        onClick={() => {
                          setIsSystemMenuOpen(false);
                          onOpenOnboarding();
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold text-emerald-700 hover:bg-emerald-100/60 border border-emerald-200 transition-colors"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        {t.profile.addNewSystem}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right: Database Live Badge, Language Selector, Alerts, Profile */}
          <div className="flex items-center gap-2.5">
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                title="Open admin database and platform controls"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>DB Live</span>
              </button>
            )}

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                aria-label="Change application language"
              >
                <Globe className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">
                  {languages.find((l) => l.code === language)?.label}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isLangMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsLangMenuOpen(false)}
                  ></div>
                  <div
                    className={`absolute ${
                      isRtl ? 'left-0' : 'right-0'
                    } mt-2 w-44 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-50`}
                  >
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLanguage(l.code);
                          setIsLangMenuOpen(false);
                        }}
                        className={`w-full px-3.5 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 text-slate-800 transition-colors ${
                          language === l.code ? 'font-bold text-emerald-700 bg-emerald-50/70' : ''
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{l.flag}</span>
                          <span>{l.label}</span>
                        </span>
                        {language === l.code && (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => onNavigate('alerts')}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="View notifications and alerts"
            >
              <Bell className="w-5 h-5" />
              {unreadAlertCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-xs">
                  {unreadAlertCount}
                </span>
              )}
            </button>

            {/* User Profile Pill */}
            <div
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-brand-dark text-emerald-300 flex items-center justify-center text-xs font-bold shadow-xs">
                {currentUser?.avatar || 'U'}
              </div>
              <span className="hidden md:inline text-xs font-semibold text-slate-800 truncate max-w-[100px]">
                {currentUser?.name || 'Homeowner'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
