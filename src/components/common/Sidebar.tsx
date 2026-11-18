import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSolar } from '../../context/SolarContext';
import { useMaintenance } from '../../context/MaintenanceContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Activity,
  SunMedium,
  AlertTriangle,
  Wrench,
  Users,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  RefreshCw,
  X,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  portalMode: 'client' | 'admin';
  onTogglePortalMode: (mode: 'client' | 'admin') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  isMobileOpen,
  onCloseMobile,
  portalMode,
  onTogglePortalMode,
}) => {
  const { t, isRtl } = useLanguage();
  const { unreadAlertCount, resetDemoData } = useSolar();
  const { serviceRequests } = useMaintenance();
  const { logout } = useAuth();

  const activeRequestsCount = serviceRequests.filter(r => r.status !== 'Completed').length;

  const navItems = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'performance', label: t.nav.performance, icon: Activity },
    { id: 'systems', label: t.nav.systems, icon: SunMedium },
    {
      id: 'alerts',
      label: t.nav.alerts,
      icon: AlertTriangle,
      badge: unreadAlertCount > 0 ? unreadAlertCount : undefined,
      badgeColor: 'bg-amber-500',
    },
    {
      id: 'maintenance',
      label: t.nav.maintenance,
      icon: Wrench,
      badge: activeRequestsCount > 0 ? activeRequestsCount : undefined,
      badgeColor: 'bg-emerald-600',
    },
    { id: 'technicians', label: t.nav.technicians, icon: Users },
    { id: 'assistant', label: t.nav.assistant, icon: MessageSquare },
    { id: 'notifications', label: t.nav.notifications, icon: Bell },
    { id: 'profile', label: t.nav.profile, icon: Settings },
  ];

  const handleNavClick = (route: string) => {
    onNavigate(route);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 lg:hidden border-b border-slate-800">
        <span className="font-extrabold text-white tracking-normal text-base">
          Solar <span className="text-emerald-400">Care</span>
        </span>
        <button
          onClick={onCloseMobile}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Portal Mode Switcher */}
      <div className="px-3 pt-3 pb-2 border-b border-slate-800/80">
        <div className="flex items-center rounded-xl bg-slate-800/90 p-1 border border-slate-700/80">
          <button
            type="button"
            onClick={() => onTogglePortalMode('client')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
              portalMode === 'client'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            👤 Client View
          </button>
          <button
            type="button"
            onClick={() => onTogglePortalMode('admin')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
              portalMode === 'admin'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🛡️ Admin Portal
          </button>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>{portalMode === 'admin' ? 'Admin Sections' : 'Client Navigation'}</span>
          {portalMode === 'admin' && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
              PRO
            </span>
          )}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-600/90 text-white shadow-sm shadow-emerald-900/30 font-semibold'
                  : 'hover:bg-slate-800/80 hover:text-white text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white ${item.badgeColor || 'bg-slate-700'}`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <ChevronRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom section: Demo Reset & Logout */}
      <div className="p-3 border-t border-slate-800/80 space-y-2 bg-slate-950/40">
        <button
          onClick={() => {
            if (confirm('Reset prototype demo state to clean defaults?')) {
              resetDemoData();
            }
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-emerald-400 hover:bg-slate-800/60 transition-colors"
          title="Reset all demo alterations"
        >
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t.resetDemoData}</span>
          </div>
          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Demo</span>
        </button>

        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t.nav.logout}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16 z-20">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          ></div>
          <div className={`relative w-72 max-w-[80vw] h-full shadow-2xl z-10 ${isRtl ? 'mr-auto' : 'ml-auto'}`}>
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
