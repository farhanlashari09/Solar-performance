import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SolarProvider, useSolar } from './context/SolarContext';
import { MaintenanceProvider, useMaintenance } from './context/MaintenanceContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { AuthFlow } from './components/auth/AuthFlow';
import { LandingPage } from './components/landing/LandingPage';
import { SolarSetupScreen } from './components/onboarding/SolarSetupScreen';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { PerformanceView } from './components/performance/PerformanceView';
import { MySolarSystemsView } from './components/systems/MySolarSystemsView';
import { AlertsView } from './components/alerts/AlertsView';
import { MaintenanceHub } from './components/maintenance/MaintenanceHub';
import { TechniciansView } from './components/technicians/TechniciansView';
import { SolarAssistantChatbot } from './components/assistant/SolarAssistantChatbot';
import { ProfileSettingsView } from './components/profile/ProfileSettingsView';
import { AdminPortal } from './components/admin/AdminPortal';
import { Technician } from './types';

const AppContent: React.FC = () => {
  const { isAuthenticated, setAuthScreen } = useAuth();
  const { isRtl } = useLanguage();
  const { setSelectedTechnicianForBooking } = useMaintenance();
  const { isNewUser } = useSolar();

  const [currentRoute, setCurrentRoute] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [selectedTechForService, setSelectedTechForService] = useState<Technician | null>(null);
  const [showAuthFlow, setShowAuthFlow] = useState(false);
  const [portalMode, setPortalMode] = useState<'client' | 'admin'>('client');

  // If user is unauthenticated, show the awesome Landing Page first,
  // or the AuthFlow if they click Log In / Sign Up
  if (!isAuthenticated) {
    if (showAuthFlow) {
      return <AuthFlow onBackToLanding={() => setShowAuthFlow(false)} />;
    }
    return (
      <LandingPage
        onLogin={() => {
          setAuthScreen('login');
          setShowAuthFlow(true);
        }}
        onSignUp={() => {
          setAuthScreen('signup');
          setShowAuthFlow(true);
        }}
      />
    );
  }

  // If newly registered user has not added their solar system yet,
  // do NOT show any dummy data! Ensure they configure their solar system first.
  if (isNewUser) {
    return <SolarSetupScreen />;
  }

  // Handle selecting technician from Directory to create a maintenance request
  const handleSelectTechnicianForService = (tech: Technician) => {
    setSelectedTechForService(tech);
    setSelectedTechnicianForBooking(tech);
    setCurrentRoute('maintenance');
  };

  const handleOpenNewServiceRequest = () => {
    setSelectedTechForService(null);
    setCurrentRoute('maintenance');
  };

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col ${isRtl ? 'font-urdu' : ''}`}>
      {/* Header */}
      <Header
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onNavigate={(route) => {
          if (route === 'admin') {
            setPortalMode('admin');
          } else {
            setPortalMode('client');
            setCurrentRoute(route);
          }
        }}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        portalMode={portalMode}
        onTogglePortalMode={(mode) => setPortalMode(mode)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          currentRoute={portalMode === 'admin' ? 'admin' : currentRoute}
          onNavigate={(route) => {
            if (route === 'admin') {
              setPortalMode('admin');
            } else if (route === 'assistant') {
              setIsAssistantOpen(true);
            } else {
              setPortalMode('client');
              setCurrentRoute(route);
            }
          }}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          portalMode={portalMode}
          onTogglePortalMode={(mode) => setPortalMode(mode)}
        />

        {/* Main Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* If in Admin Portal Mode, render Admin Control Center */}
          {portalMode === 'admin' ? (
            <AdminPortal onBackToClientView={() => setPortalMode('client')} />
          ) : (
            <>
              {/* Views Router for Customer / Client Side */}
              {currentRoute === 'dashboard' && (
                <DashboardView
                  onNavigate={(route) => setCurrentRoute(route)}
                  onOpenAssistant={() => setIsAssistantOpen(true)}
                  onOpenNewServiceRequest={handleOpenNewServiceRequest}
                />
              )}

          {currentRoute === 'performance' && (
            <PerformanceView
              onNavigateToMaintenance={() => setCurrentRoute('maintenance')}
              onNavigateToTechnicians={() => setCurrentRoute('technicians')}
            />
          )}

          {currentRoute === 'systems' && (
            <MySolarSystemsView
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              onNavigateToPerformance={() => setCurrentRoute('performance')}
            />
          )}

          {(currentRoute === 'alerts' || currentRoute === 'notifications') && (
            <AlertsView onNavigate={(route) => setCurrentRoute(route)} />
          )}

          {currentRoute === 'technicians' && (
            <TechniciansView
              onSelectTechnicianForService={handleSelectTechnicianForService}
            />
          )}

          {currentRoute === 'maintenance' && (
            <MaintenanceHub
              initialTab={selectedTechForService ? 'newRequest' : 'tracking'}
              preSelectedTechnician={selectedTechForService}
              onClearPreSelectedTechnician={() => setSelectedTechForService(null)}
            />
          )}

          {currentRoute === 'profile' && (
            <ProfileSettingsView
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
            />
          )}
            </>
          )}
        </main>
      </div>

      {/* Floating Solar AI Assistant */}
      <SolarAssistantChatbot
        isOpen={isAssistantOpen}
        onToggle={() => setIsAssistantOpen(!isAssistantOpen)}
        onNavigateToTechnicians={() => {
          setIsAssistantOpen(false);
          setCurrentRoute('technicians');
        }}
      />

      {/* Additional System Add Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SolarProvider>
          <MaintenanceProvider>
            <AppContent />
          </MaintenanceProvider>
        </SolarProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
