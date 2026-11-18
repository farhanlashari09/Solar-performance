import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Language } from '../types';
import { authApi } from '../services/api';

export type AuthScreen = 'login' | 'signup' | 'verify' | 'create-password' | 'forgot-password' | 'forgot-verify' | 'forgot-reset';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  currentAuthScreen: AuthScreen;
  pendingEmail: string;
  isEmailVerified: boolean;
  setAuthScreen: (screen: AuthScreen) => void;
  startSignUp: (email: string) => Promise<{ success: boolean; message?: string; errorCode?: string; mailDelivered?: boolean }>;
  verifyEmailCode: (code: string) => Promise<{ success: boolean; message?: string }>;
  completeRegistration: (password: string, name?: string) => Promise<{ success: boolean; message?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; errorCode?: string }>;
  logout: () => void;
  startForgotPassword: (email: string) => Promise<{ success: boolean; message?: string; errorCode?: string; mailDelivered?: boolean }>;
  verifyForgotCode: (code: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (password: string) => Promise<{ success: boolean; message?: string }>;
  updateUserProfile: (name: string, preferredLang?: Language) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'solarcare_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null; // Show Login screen by default
  });

  const [currentAuthScreen, setCurrentAuthScreen] = useState<AuthScreen>('login');
  const [pendingEmail, setPendingEmail] = useState<string>('');
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [verifiedResetCode, setVerifiedResetCode] = useState<string>('');

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [currentUser]);

  // Screen A: Send Verification Code to User's Gmail
  const startSignUp = async (email: string) => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    const res = await authApi.sendVerificationCode(trimmed);
    if (res.success) {
      setPendingEmail(trimmed);
      setIsEmailVerified(false);
      setCurrentAuthScreen('verify');
      return { success: true, message: res.message, mailDelivered: res.mailDelivered };
    }
    return { success: false, errorCode: res.errorCode, message: res.message || 'Failed to send verification code.' };
  };

  // Screen B: Verify Email Code
  const verifyEmailCode = async (code: string) => {
    const res = await authApi.verifyCode(pendingEmail, code);
    if (res.success) {
      setIsEmailVerified(true);
      setCurrentAuthScreen('create-password');
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'Invalid or expired verification code.' };
  };

  // Screen C: Create Password & Register in Database
  const completeRegistration = async (password: string, name = 'Solar Homeowner') => {
    if (!isEmailVerified) {
      setCurrentAuthScreen('signup');
      return { success: false, message: 'Email verification is required before setting password.' };
    }
    if (password.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters long.' };
    }

    const res = await authApi.register({
      email: pendingEmail,
      password,
      name,
    });

    if (res.success && res.user) {
      setCurrentUser(res.user);
      setIsEmailVerified(false);
      setPendingEmail('');
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'Account creation failed.' };
  };

  // Screen D: Login (Queries Database)
  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.user) {
      setCurrentUser(res.user);
      return { success: true, message: res.message };
    }
    return { success: false, errorCode: res.errorCode, message: res.message || 'Login failed.' };
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentAuthScreen('login');
    setIsEmailVerified(false);
    setPendingEmail('');
    setVerifiedResetCode('');
  };

  // Screen E: Forgot Password - Step 1: Send OTP
  const startForgotPassword = async (email: string) => {
    const trimmed = email.trim();
    const res = await authApi.forgotSendCode(trimmed);
    if (res.success) {
      setPendingEmail(trimmed);
      setCurrentAuthScreen('forgot-verify');
      return { success: true, message: res.message, mailDelivered: res.mailDelivered };
    }
    return { success: false, errorCode: res.errorCode, message: res.message || 'Could not initiate password reset.' };
  };

  // Screen E: Forgot Password - Step 2: Verify OTP
  const verifyForgotCode = async (code: string) => {
    const res = await authApi.forgotVerifyCode(pendingEmail, code);
    if (res.success) {
      setVerifiedResetCode(code.trim());
      setCurrentAuthScreen('forgot-reset');
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'Invalid or expired recovery code.' };
  };

  // Screen E: Forgot Password - Step 3: Reset Password
  const resetPassword = async (password: string) => {
    const res = await authApi.forgotReset({
      email: pendingEmail,
      code: verifiedResetCode,
      newPassword: password,
    });
    if (res.success) {
      setVerifiedResetCode('');
      setCurrentAuthScreen('login');
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'Password reset failed.' };
  };

  const updateUserProfile = (name: string, preferredLang?: Language) => {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      name,
      preferredLanguage: preferredLang || currentUser.preferredLanguage,
    };
    setCurrentUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        currentAuthScreen,
        pendingEmail,
        isEmailVerified,
        setAuthScreen: setCurrentAuthScreen,
        startSignUp,
        verifyEmailCode,
        completeRegistration,
        login,
        logout,
        startForgotPassword,
        verifyForgotCode,
        resetPassword,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
