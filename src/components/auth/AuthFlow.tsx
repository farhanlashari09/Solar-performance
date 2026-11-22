import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../types';
import {
  Sun,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Check,
  RotateCw,
  Globe,
  UserPlus,
} from 'lucide-react';

// ── Language Switcher Component ──────────────────────────────────────────────
const LANG_OPTIONS: { code: Language; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ur-roman', label: 'Roman Urdu', short: 'UR' },
  { code: 'ur', label: 'اردو', short: 'اردو' },
];

const LanguageSwitcher: React.FC<{ language: Language; setLanguage: (l: Language) => void; dark?: boolean }> = ({ language, setLanguage, dark }) => {
  const [open, setOpen] = useState(false);
  const current = LANG_OPTIONS.find(l => l.code === language) || LANG_OPTIONS[0];
  const btnBase = dark
    ? 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm cursor-pointer'
    : 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 cursor-pointer';

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(o => !o)} className={btnBase} title="Switch Language">
        <Globe className="w-3.5 h-3.5" />
        <span>{current.short}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-xl py-1 min-w-[150px]">
          {LANG_OPTIONS.map(lang => (
            <button
              key={lang.code}
              type="button"
              onClick={() => { setLanguage(lang.code); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                language === lang.code ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="font-bold text-[11px] text-slate-400 w-8">{lang.short}</span>
              <span>{lang.label}</span>
              {language === lang.code && <Check className="w-3 h-3 ml-auto text-emerald-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Strict email regex
const isValidEmailFormat = (email: string) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
};

// Password strength validator — requires 8+ chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
const validatePassword = (pw: string) => ({
  minLength: pw.length >= 8,
  hasUpper: /[A-Z]/.test(pw),
  hasLower: /[a-z]/.test(pw),
  hasNumber: /[0-9]/.test(pw),
  hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pw),
});

const isPasswordValid = (pw: string) => Object.values(validatePassword(pw)).every(Boolean);

export interface AuthFlowProps {
  onBackToLanding?: () => void;
}

export const AuthFlow: React.FC<AuthFlowProps> = ({ onBackToLanding }) => {
  const {
    currentAuthScreen,
    setAuthScreen,
    startSignUp,
    verifyEmailCode,
    completeRegistration,
    login,
    pendingEmail,
    isEmailVerified,
    startForgotPassword,
    verifyForgotCode,
    resetPassword,
  } = useAuth();

  const { t, isRtl, language, setLanguage } = useLanguage();

  // Returns the appropriate message based on selected language
  const msg = (en: string, ur: string, roman: string) => {
    if (language === 'ur') return ur;
    if (language === 'ur-roman') return roman;
    return en;
  };

  // Form states
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Status banners
  const [showLoginRedirect, setShowLoginRedirect] = useState(false);
  const [showSignUpRedirect, setShowSignUpRedirect] = useState(false);

  // Clear messages helper
  const resetFeedback = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setShowLoginRedirect(false);
    setShowSignUpRedirect(false);
  };

  // Screen A: Sign Up - Step 1: Send verification code to user's real email
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    if (!isValidEmailFormat(email)) {
      setErrorMessage(msg(
        'Please enter a valid Gmail / Email address (e.g. name@gmail.com).',
        'براہ کرم درست ای میل ایڈریس درج کریں۔',
        'Barah-e-karam durust email address darj karein (e.g. name@gmail.com).'
      ));
      return;
    }

    setIsLoading(true);
    const res = await startSignUp(email);
    setIsLoading(false);

    if (res.success) {
      setVerificationCode('');
      setSuccessMessage(msg(
        `Verification code sent to ${email}. Check your inbox and spam folder.`,
        `تصدیقی کوڈ ${email} پر بھیج دیا گیا۔ اپنا ان باکس اور سپیم فولڈر چیک کریں۔`,
        `Verification code ${email} par bhej diya gaya. Inbox aur Spam folder check karein.`
      ));
    } else if (res.errorCode === 'EMAIL_ALREADY_EXISTS') {
      setShowLoginRedirect(true);
      setErrorMessage(msg(
        `An account already exists for "${email}". Please log in instead.`,
        `اس ای میل "${email}" پر پہلے سے اکاؤنٹ موجود ہے۔ براہ کرم لاگ ان کریں۔`,
        `Is email "${email}" par pehle se account mojood hai. Login karein.`
      ));
    } else {
      setErrorMessage(res.message || msg(
        'Could not send verification code. Please try again.',
        'تصدیقی کوڈ نہیں بھیجا جا سکا۔ براہ کرم دوبارہ کوشش کریں۔',
        'Verification code send nahi ho saka. Dobara koshish karein.'
      ));
    }
  };

  // Screen B: Sign Up - Step 2: Verify 6-digit code received via email
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    if (!verificationCode || verificationCode.trim().length !== 6) {
      setErrorMessage(msg(
        'Please enter the 6-digit verification code received in your email.',
        'براہ کرم ای میل پر موصول ہونے والا 6 ہندسوں کا کوڈ درج کریں۔',
        'Barah-e-karam 6-digit ka code darj karein jo aap ko email par mila hai.'
      ));
      return;
    }

    setIsLoading(true);
    const res = await verifyEmailCode(verificationCode);
    setIsLoading(false);

    if (res.success) {
      setPassword('');
      setConfirmPassword('');
      setSuccessMessage(msg(
        'Email verified successfully! Now choose a strong password.',
        'ای میل تصدیق ہو گئی! اب مضبوط پاس ورڈ منتخب کریں۔',
        'Email kamyabi se verify ho gaya! Ab apna strong password muntakhib karein.'
      ));
    } else {
      setErrorMessage(msg(
        'Invalid or expired code. Please check your email again.',
        'غلط یا زائد المیعاد کوڈ۔ براہ کرم دوبارہ چیک کریں۔',
        'Ghalat ya expire shuda code. Barah-e-karam apna email dobara check karein.'
      ));
    }
  };

  // Screen C: Sign Up - Step 3: Create strong password & Complete registration
  const handleCreatePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    if (!isPasswordValid(password)) {
      setErrorMessage(msg(
        'Password does not meet the security requirements. See checklist below.',
        'پاس ورڈ سیکیورٹی شرائط پر پورا نہیں اتر رہا۔ نیچے دی گئی فہرست دیکھیں۔',
        'Password mayar par poora nahi utar raha. Neechay checklist check karein.'
      ));
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage(msg(
        'Passwords do not match.',
        'پاس ورڈز آپس میں نہیں ملتے۔',
        'Password aur Confirm Password aapas mein match nahi kar rahe.'
      ));
      return;
    }

    setIsLoading(true);
    const res = await completeRegistration(password, userName);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.message || msg('Account creation failed.', 'اکاؤنٹ نہیں بنایا جا سکا۔', 'Account creation fail ho gayi.'));
    }
  };

  // Screen D: Login (Queries Database)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    if (!isValidEmailFormat(email)) {
      setErrorMessage(msg(
        'Please enter a valid email address.',
        'براہ کرم درست ای میل ایڈریس درج کریں۔',
        'Barah-e-karam durust email address darj karein.'
      ));
      return;
    }

    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);

    if (!res.success) {
      if (res.errorCode === 'ACCOUNT_NOT_FOUND') {
        setShowSignUpRedirect(true);
        setErrorMessage(msg(
          `No account found with "${email}". Please sign up first.`,
          `اس ای میل "${email}" پر کوئی اکاؤنٹ موجود نہیں ہے۔ پہلے سائن اپ کریں۔`,
          `Is email "${email}" par koi account mojood nahi hai. Pehle Sign Up karein.`
        ));
      } else if (res.errorCode === 'INVALID_CREDENTIALS') {
        setErrorMessage(msg(
          'Incorrect password. Please verify or use Forgot Password to reset.',
          'غلط پاس ورڈ۔ براہ کرم تصدیق کریں یا پاس ورڈ ری سیٹ کریں۔',
          'Ghalat password. Barah-e-karam password check karein ya Reset karein.'
        ));
      } else {
        setErrorMessage(res.message || msg(
          'Login failed. Please check your connection and try again.',
          'لاگ ان ناکام رہا۔ براہ کرم رابطہ چیک کر کے دوبارہ کوشش کریں۔',
          'Login fail ho gaya. Rabta check kar ke dobara koshish karein.'
        ));
      }
    }
  };

  // Screen E: Forgot Password - Step 1: Send recovery OTP to user's real email
  const handleForgotEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    if (!isValidEmailFormat(email)) {
      setErrorMessage(msg(
        'Please enter a valid registered email address.',
        'براہ کرم رجسٹرڈ ای میل ایڈریس درج کریں۔',
        'Barah-e-karam durust registered email address darj karein.'
      ));
      return;
    }

    setIsLoading(true);
    const res = await startForgotPassword(email);
    setIsLoading(false);

    if (res.success) {
      setVerificationCode('');
      setSuccessMessage(msg(
        `Recovery code sent to ${email}. Check your inbox and spam folder.`,
        `${email} پر ریکوری کوڈ بھیجا گیا۔ ان باکس اور سپیم چیک کریں۔`,
        `Recovery code ${email} par bhej diya gaya. Inbox aur Spam check karein.`
      ));
    } else if (res.errorCode === 'ACCOUNT_NOT_FOUND') {
      setShowSignUpRedirect(true);
      setErrorMessage(msg(
        `No account found for "${email}". Please sign up first.`,
        `اس ای میل "${email}" کے لیے کوئی اکاؤنٹ موجود نہیں ہے۔ پہلے سائن اپ کریں۔`,
        `"${email}" par koi account registered nahi hai. Pehle Sign Up karein.`
      ));
    } else {
      setErrorMessage(res.message || msg(
        'Could not send recovery code. Try again.',
        'ریکوری کوڈ نہیں بھیجا جا سکا۔ دوبارہ کوشش کریں۔',
        'Recovery code send nahi ho saka. Dobara koshish karein.'
      ));
    }
  };

  // Screen E: Forgot Password - Step 2: Verify code
  const handleForgotCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    if (!verificationCode || verificationCode.trim().length !== 6) {
      setErrorMessage(msg(
        'Please enter the 6-digit recovery code.',
        'براہ کرم 6 ہندسوں کا ریکوری کوڈ درج کریں۔',
        'Barah-e-karam 6-digit recovery code darj karein.'
      ));
      return;
    }

    setIsLoading(true);
    const res = await verifyForgotCode(verificationCode);
    setIsLoading(false);

    if (res.success) {
      setPassword('');
      setConfirmPassword('');
      setSuccessMessage(msg(
        'Recovery code verified! Now enter your new password.',
        'ریکوری کوڈ کی تصدیق ہو گئی! اب نیا پاس ورڈ درج کریں۔',
        'Code verify ho gaya! Ab apna naya password set karein.'
      ));
    } else {
      setErrorMessage(msg(
        'Invalid recovery code. Please check again.',
        'غلط ریکوری کوڈ۔ براہ کرم دوبارہ چیک کریں۔',
        'Ghalat recovery code. Dobara check karein.'
      ));
    }
  };

  // Screen E: Forgot Password - Step 3: Reset password
  const handleForgotResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    if (!isPasswordValid(password)) {
      setErrorMessage(msg(
        'New password does not meet the security requirements.',
        'نیا پاس ورڈ سیکیورٹی شرائط پر پورا نہیں اتر رہا۔',
        'Naya password mayar par poora nahi utar raha.'
      ));
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage(msg(
        'Passwords do not match.',
        'پاس ورڈز آپس میں مماثلت نہیں رکھتے۔',
        'Passwords match nahi kar rahe.'
      ));
      return;
    }

    setIsLoading(true);
    const res = await resetPassword(password);
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage(msg(
        'Password updated successfully! You can now log in with your new password.',
        'پاس ورڈ کامیابی سے تبدیل ہو گیا! اب آپ لاگ ان کر سکتے ہیں۔',
        'Password kamyabi se update ho gaya! Ab naye password ke sath login karein.'
      ));
      setPassword('');
      setConfirmPassword('');
    } else {
      setErrorMessage(res.message || msg(
        'Failed to update password.',
        'پاس ورڈ اپ ڈیٹ نہیں ہو سکا۔',
        'Password update nahi ho saka.'
      ));
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-brand-darkest via-brand-dark to-slate-900 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden ${isRtl ? 'font-urdu' : ''}`}
      style={{
        backgroundImage: "linear-gradient(135deg, rgba(23, 28, 25, 0.78), rgba(23, 28, 25, 0.42)), url('/images/solar-monitoring-display.jpg')",
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Back to Landing Page button */}
      {onBackToLanding && (
        <button
          type="button"
          onClick={onBackToLanding}
          className="absolute top-5 left-5 z-20 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{msg('Back to Home', 'ہوم پیج', 'Back to Home')}</span>
        </button>
      )}
      <span className="absolute bottom-4 left-4 z-10 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-[10px] font-medium text-white/80 backdrop-blur-sm">
        Illustrative interface · Not live telemetry
      </span>

      {/* Language switcher — always visible top-right on dark background */}
      <div className="absolute top-5 right-5 z-20">
        <LanguageSwitcher language={language} setLanguage={setLanguage} dark />
      </div>

      {/* Main card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-8 sm:p-10 backdrop-blur-sm">
        {/* Brand header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-dark to-emerald-600 text-white shadow-lg shadow-emerald-950/20 mb-3">
            <Sun className="w-8 h-8 text-amber-300 animate-spin-slow" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {t.appName}
          </h1>
          <p className="text-xs font-semibold text-emerald-700 tracking-wider uppercase mt-0.5">
            {msg('Smart Solar Performance & Telemetry', 'سمارٹ سولر پرفارمنس پلیٹ فارم', 'Smart Solar Performance Platform')}
          </p>
          {/* Language switcher inside card — visible on mobile */}
          <div className="flex justify-center mt-2.5 sm:hidden">
            <LanguageSwitcher language={language} setLanguage={setLanguage} />
          </div>
        </div>

        {/* ── Error Alert ────────────────────────────────────────────── */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 shadow-sm animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="leading-relaxed font-medium flex-1">
              <span className="font-bold block text-rose-800 mb-0.5">{msg('Notice', 'اطلاع', 'Notice')}:</span>
              {errorMessage}
              {showLoginRedirect && (
                <button
                  type="button"
                  onClick={() => { resetFeedback(); setEmail(''); setPassword(''); setAuthScreen('login'); }}
                  className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3" />
                  {msg('Go to Login', 'لاگ ان پر جائیں', 'Login Par Jayein')}
                </button>
              )}
              {showSignUpRedirect && (
                <button
                  type="button"
                  onClick={() => { resetFeedback(); setPassword(''); setAuthScreen('signup'); }}
                  className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3 h-3" />
                  {msg('Create an Account (Sign Up)', 'اکاؤنٹ بنائیں (سائن اپ)', 'Naya Account Banayein (Sign Up)')}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Success Alert ───────────────────────────────────────────── */}
        {successMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <div className="leading-relaxed font-medium">
              <span className="font-bold block text-emerald-900 mb-0.5">{msg('Success', 'کامیابی', 'Kamyabi')}:</span>
              {successMessage}
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* SCREEN D: LOGIN (DEFAULT SCREEN)           */}
        {/* ========================================= */}
        {currentAuthScreen === 'login' && (
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-slate-900">
                {t.auth.loginTitle}
              </h2>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.auth.emailLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    {t.auth.passwordLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      resetFeedback();
                      setAuthScreen('forgot-password');
                    }}
                    className="text-xs text-emerald-700 hover:underline font-medium cursor-pointer"
                  >
                    {t.auth.forgotPasswordLink}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {isLoading
                    ? msg('Verifying with Database...', 'تصدیق کی جا رہی ہے...', 'Database check ho raha hai...')
                    : t.auth.loginBtn}
                </span>
                <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600">
                {msg("Don't have an account?", 'کیا نیا اکاؤنٹ بنانا ہے؟', 'Naye user hain?')}{' '}
                <button
                  type="button"
                  onClick={() => {
                    resetFeedback();
                    setEmail('');
                    setPassword('');
                    setAuthScreen('signup');
                  }}
                  className="font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  {msg('Create Account (Sign Up)', 'نیا اکاؤنٹ بنائیں (سائن اپ)', 'Naya Account Banayein (Sign Up)')}
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* SCREEN A: SIGN UP (ENTER GMAIL)           */}
        {/* ========================================= */}
        {currentAuthScreen === 'signup' && (
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-slate-900">
                {t.auth.signUpTitle}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {msg(
                  'Step 1: Enter your Gmail to receive a 6-digit verification code',
                  'مرحلہ 1: 6 ہندسوں کا تصدیقی کوڈ حاصل کرنے کے لیے اپنا ای میل درج کریں',
                  'Step 1: 6-digit verification code ke liye apna Gmail darj karein'
                )}
              </p>
            </div>

            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {msg('Valid Gmail Address', 'درست ای میل ایڈریس', 'Valid Gmail Address')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {msg(
                    '🔒 Security note: A 6-digit OTP will be dispatched straight to your Gmail inbox.',
                    '🔒 سیکیورٹی نوٹ: 6 ہندسوں کا کوڈ آپ کے ای میل ان باکس پر بھیجا جائے گا۔',
                    '🔒 Security note: 6-digit OTP seedha aap ke Gmail inbox par bheja jaye ga.'
                  )}
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {isLoading
                    ? msg('Sending Code...', 'کوڈ بھیجا جا رہا ہے...', 'Code bhej rahe hain...')
                    : msg('Send Verification Code via Email', 'ای میل کے ذریعے تصدیقی کوڈ بھیجیں', 'Email ke Zariye Verification Code Bhejein')}
                </span>
                <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600">
                {msg('Already registered?', 'پہلے سے اکاؤنٹ موجود ہے؟', 'Pehle se account mojood hai?')}{' '}
                <button
                  type="button"
                  onClick={() => {
                    resetFeedback();
                    setAuthScreen('login');
                  }}
                  className="font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  {msg('Log In', 'لاگ ان کریں', 'Log In')}
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* SCREEN B: EMAIL VERIFICATION CODE         */}
        {/* ========================================= */}
        {currentAuthScreen === 'verify' && (
          <div>
            <div className="mb-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mb-2">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {msg('Verify Your Email', 'اپنے ای میل کی تصدیق کریں', 'Apna Email Verify Karein')}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {msg('Enter the 6-digit code dispatched to:', 'اس پتے پر بھیجا گیا 6 ہندسوں کا کوڈ درج کریں:', 'Is email par bheja gaya 6-digit code enter karein:')}{' '}
                <strong className="text-emerald-800 block text-sm mt-0.5">{pendingEmail}</strong>
              </p>
              <p className="text-[11px] text-slate-400 mt-1 italic">
                {msg('(Please check your Gmail Inbox & Spam folder)', '(برائے مہربانی اپنا ان باکس اور سپیم فولڈر چیک کریں)', '(Gmail Inbox aur Spam folder check karein)')}
              </p>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 text-center">
                  {msg('Enter 6-Digit Code', '6 ہندسوں کا کوڈ درج کریں', '6-Digit Code Enter Karein')}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {isLoading
                    ? msg('Verifying Code...', 'کوڈ کی تصدیق کی جا رہی ہے...', 'Code verify ho raha hai...')
                    : msg('Verify & Continue', 'تصدیق کریں اور آگے بڑھیں', 'Verify Karein & Aagay Barhein')}
                </span>
                <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </form>

            <div className="mt-5 flex items-center justify-between text-xs pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  resetFeedback();
                  setAuthScreen('signup');
                }}
                className="text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{msg('Change Email', 'ای میل تبدیل کریں', 'Email Change Karein')}</span>
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={async () => {
                  resetFeedback();
                  setIsLoading(true);
                  const res = await startSignUp(pendingEmail);
                  setIsLoading(false);
                  if (res.success) {
                    setSuccessMessage(msg(
                      'A new 6-digit code has been sent to your email!',
                      'نیا 6 ہندسوں کا کوڈ دوبارہ بھیج دیا گیا ہے!',
                      'Naya 6-digit code aap ke email par dobara bhej diya gaya hai!'
                    ));
                  } else {
                    setErrorMessage(res.message || msg('Failed to resend code.', 'کوڈ دوبارہ نہیں بھیجا جا سکا۔', 'Code dobara nahi bheja ja saka.'));
                  }
                }}
                className="text-emerald-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>{msg('Resend Code', 'کوڈ دوبارہ بھیجیں', 'Code Dobara Bhejein')}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* SCREEN C: CREATE STRONG PASSWORD          */}
        {/* ========================================= */}
        {currentAuthScreen === 'create-password' && (
          <div>
            {!isEmailVerified ? (
              <div className="text-center py-6">
                <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800">
                  {msg('Email Verification Required', 'ای میل کی تصدیق ضروری ہے', 'Email Verification Lazmi Hai')}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {msg('You must verify your email before setting a password.', 'پاس ورڈ بنانے سے پہلے ای میل تصدیق کریں۔', 'Password set karne se pehle email verify karna hoga.')}
                </p>
                <button
                  onClick={() => setAuthScreen('signup')}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  {msg('Go to Sign Up', 'سائن اپ پر جائیں', 'Sign Up Par Jayein')}
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-5 text-center">
                  <h2 className="text-xl font-bold text-slate-900">
                    {msg('Set Your Password', 'اپنا پاس ورڈ سیٹ کریں', 'Apna Password Set Karein')}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {msg('Verified for:', 'تصدیق شدہ برائے:', 'Verified for:')} <strong className="text-emerald-800">{pendingEmail}</strong>
                  </p>
                </div>

                <form onSubmit={handleCreatePasswordSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {msg('Full Name', 'آپ کا مکمل نام', 'Aap Ka Poora Naam')}
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="e.g. Farhan Khan"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {msg('New Password', 'نیا پاس ورڈ', 'Naya Password')} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {msg('Confirm Password', 'پاس ورڈ کی تصدیق کریں', 'Password Confirm Karein')} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>

                  {/* Visual Password Strength Checklist */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <p className="font-semibold text-slate-700 mb-1 text-[11px] uppercase tracking-wider">
                      {msg('Password Requirements:', 'پاس ورڈ کے تقاضے:', 'Password Requirements:')}
                    </p>
                    {(() => {
                      const rules = validatePassword(password);
                      const checks = [
                        { pass: rules.minLength, label: msg('At least 8 characters', 'کم از کم 8 حروف', 'Kam az kam 8 characters') },
                        { pass: rules.hasUpper,  label: msg('At least 1 uppercase letter (A–Z)', 'کم از کم 1 بڑا حرف (A–Z)', 'Kam az kam 1 bara harf (A–Z)') },
                        { pass: rules.hasLower,  label: msg('At least 1 lowercase letter (a–z)', 'کم از کم 1 چھوٹا حرف (a–z)', 'Kam az kam 1 chota harf (a–z)') },
                        { pass: rules.hasNumber, label: msg('At least 1 number (0–9)', 'کم از کم 1 نمبر (0–9)', 'Kam az kam 1 number (0–9)') },
                        { pass: rules.hasSpecial,label: msg('At least 1 special character (!@#$...)', 'کم از کم 1 خاص علامت (!@#$...)', 'Kam az kam 1 special character (!@#$...)') },
                        { pass: password.length > 0 && password === confirmPassword, label: msg('Passwords match', 'پاس ورڈز آپس میں ملتے ہیں', 'Dono passwords match karte hain') },
                      ];
                      return checks.map((c, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${c.pass ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            {c.pass ? '✓' : '•'}
                          </span>
                          <span className={c.pass ? 'text-emerald-800 font-medium' : 'text-slate-500'}>
                            {c.label}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !isPasswordValid(password) || password !== confirmPassword}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>
                      {isLoading
                        ? msg('Creating Account...', 'اکاؤنٹ بنایا جا رہا ہے...', 'Account ban raha hai...')
                        : msg('Complete Sign Up & Go To Setup', 'رجسٹریشن مکمل کریں اور سیٹ اپ پر جائیں', 'Sign Up Mukammal Karein & Setup Par Jayein')}
                    </span>
                    <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ========================================= */}
        {/* SCREEN E: FORGOT PASSWORD                 */}
        {/* ========================================= */}
        {currentAuthScreen === 'forgot-password' && (
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-slate-900">
                {msg('Reset Password', 'پاس ورڈ دوبارہ ترتیب دیں', 'Password Reset Karein')}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {msg(
                  'Enter your registered Gmail to receive a password reset code',
                  'پاس ورڈ ری سیٹ کوڈ حاصل کرنے کے لیے اپنا رجسٹرڈ ای میل درج کریں',
                  'Registered Gmail darj karein taake recovery code bhej sakein'
                )}
              </p>
            </div>

            <form onSubmit={handleForgotEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {msg('Registered Gmail Address', 'رجسٹرڈ ای میل ایڈریس', 'Registered Gmail Address')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {isLoading
                    ? msg('Checking Database...', 'ڈیٹابیس چیک ہو رہا ہے...', 'Database check ho raha hai...')
                    : msg('Send Recovery Code to Email', 'ای میل پر ریکوری کوڈ بھیجیں', 'Recovery Code Email Par Bhejein')}
                </span>
                <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </form>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => {
                  resetFeedback();
                  setAuthScreen('login');
                }}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{msg('Back to Login', 'لاگ ان پر واپس جائیں', 'Wapis Login Par Jayein')}</span>
              </button>
            </div>
          </div>
        )}

        {/* SCREEN E - Step 2: Verify Forgot Password OTP */}
        {currentAuthScreen === 'forgot-verify' && (
          <div>
            <div className="mb-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mb-2">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {msg('Verify Recovery Code', 'ریکوری کوڈ کی تصدیق کریں', 'Recovery Code Verify Karein')}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {msg('Enter the 6-digit recovery code sent to:', 'اس پتے پر بھیجا گیا 6 ہندسوں کا کوڈ درج کریں:', 'Is email par bheja gaya 6-digit code enter karein:')}{' '}
                <strong className="text-emerald-800 block text-sm mt-0.5">{pendingEmail}</strong>
              </p>
            </div>

            <form onSubmit={handleForgotCodeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 text-center">
                  {msg('6-Digit Recovery Code', '6 ہندسوں کا ریکوری کوڈ', '6-Digit Recovery Code')}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {isLoading
                    ? msg('Checking Code...', 'کوڈ چیک ہو رہا ہے...', 'Code check ho raha hai...')
                    : msg('Verify Recovery Code', 'ریکوری کوڈ کی تصدیق کریں', 'Recovery Code Verify Karein')}
                </span>
                <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </form>

            <div className="mt-5 flex items-center justify-between text-xs pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  resetFeedback();
                  setAuthScreen('forgot-password');
                }}
                className="text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{msg('Change Email', 'ای میل تبدیل کریں', 'Email Change Karein')}</span>
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={async () => {
                  resetFeedback();
                  setIsLoading(true);
                  const res = await startForgotPassword(pendingEmail);
                  setIsLoading(false);
                  if (res.success) {
                    setSuccessMessage(msg(
                      'A new 6-digit recovery code has been sent to your email!',
                      'نیا 6 ہندسوں کا ریکوری کوڈ دوبارہ بھیج دیا گیا ہے!',
                      'Naya 6-digit recovery code aap ke email par dobara bhej diya gaya hai!'
                    ));
                  } else {
                    setErrorMessage(res.message || msg('Failed to resend code.', 'کوڈ دوبارہ نہیں بھیجا جا سکا۔', 'Code dobara nahi bheja ja saka.'));
                  }
                }}
                className="text-emerald-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>{msg('Resend Code', 'کوڈ دوبارہ بھیجیں', 'Code Dobara Bhejein')}</span>
              </button>
            </div>
          </div>
        )}

        {/* SCREEN E - Step 3: Set New Password */}
        {currentAuthScreen === 'forgot-reset' && (
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-slate-900">
                {msg('Set New Password', 'نیا پاس ورڈ سیٹ کریں', 'Naya Password Set Karein')}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {msg(`Enter your new secure password for ${pendingEmail}`, `${pendingEmail} کے لیے نیا پاس ورڈ درج کریں`, `${pendingEmail} ke liye naya password darj karein`)}
              </p>
            </div>

            <form onSubmit={handleForgotResetSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {msg('New Password', 'نیا پاس ورڈ', 'Naya Password')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {msg('Confirm New Password', 'نئے پاس ورڈ کی تصدیق کریں', 'Naye Password ki Tasdeeq')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {/* Password strength checklist */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <p className="font-semibold text-slate-700 mb-1 text-[11px] uppercase tracking-wider">
                  {msg('Password Requirements:', 'پاس ورڈ کے تقاضے:', 'Password Requirements:')}
                </p>
                {(() => {
                  const rules = validatePassword(password);
                  const checks = [
                    { pass: rules.minLength, label: msg('At least 8 characters', 'کم از کم 8 حروف', 'Kam az kam 8 characters') },
                    { pass: rules.hasUpper,  label: msg('At least 1 uppercase letter (A–Z)', 'کم از کم 1 بڑا حرف (A–Z)', 'Kam az kam 1 bara harf (A–Z)') },
                    { pass: rules.hasLower,  label: msg('At least 1 lowercase letter (a–z)', 'کم از کم 1 چھوٹا حرف (a–z)', 'Kam az kam 1 chota harf (a–z)') },
                    { pass: rules.hasNumber, label: msg('At least 1 number (0–9)', 'کم از کم 1 نمبر (0–9)', 'Kam az kam 1 number (0–9)') },
                    { pass: rules.hasSpecial,label: msg('At least 1 special character (!@#$...)', 'کم از کم 1 خاص علامت (!@#$...)', 'Kam az kam 1 special character (!@#$...)') },
                    { pass: password.length > 0 && password === confirmPassword, label: msg('Passwords match', 'پاس ورڈز آپس میں ملتے ہیں', 'Dono passwords match karte hain') },
                  ];
                  return checks.map((c, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${c.pass ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        {c.pass ? '✓' : '•'}
                      </span>
                      <span className={c.pass ? 'text-emerald-800 font-medium' : 'text-slate-500'}>
                        {c.label}
                      </span>
                    </div>
                  ));
                })()}
              </div>

              <button
                type="submit"
                disabled={isLoading || !isPasswordValid(password) || password !== confirmPassword}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {isLoading
                    ? msg('Updating Password...', 'پاس ورڈ اپ ڈیٹ ہو رہا ہے...', 'Password update ho raha hai...')
                    : msg('Update Password & Login', 'پاس ورڈ اپ ڈیٹ کر کے لاگ ان کریں', 'Password Update Karein & Login')}
                </span>
                <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
