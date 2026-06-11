import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Globe, ChevronDown, CheckCircle2, ArrowRight } from 'lucide-react';

const LANGUAGES = [
  { code: 'fr', label: 'Francais', flag: 'FR' },
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'pt', label: 'Portugues', flag: 'PT' },
  { code: 'es', label: 'Espanol', flag: 'ES' },
  { code: 'de', label: 'Deutsch', flag: 'DE' },
  { code: 'it', label: 'Italiano', flag: 'IT' },
];

const STEPS_CONFIG = [
  { key: 'currentWeight', icon: '⚖️', unit: 'kg', placeholder: '75' },
  { key: 'targetWeight', icon: '🎯', unit: 'kg', placeholder: '60' },
  { key: 'height', icon: '📏', unit: 'cm', placeholder: '165' },
  { key: 'age', icon: '🌸', unit: 'years', placeholder: '35' },
];

const DIET_OPTIONS = [
  { key: 'none', emoji: '🌱', labelKey: 'onboarding.diets_none', sub: 'Fresh start — best results' },
  { key: '1_3', emoji: '💪', labelKey: 'onboarding.diets_1_3', sub: 'Some experience' },
  { key: '4_10', emoji: '🔄', labelKey: 'onboarding.diets_4_10', sub: 'Experienced dieter' },
  { key: 'more_10', emoji: '🌟', labelKey: 'onboarding.diets_more_10', sub: 'I know my body well' },
];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { session } = useAuth();

  const [showLangMenu, setShowLangMenu] = useState(false);
  const [step, setStep] = useState(0);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    currentWeight: '', targetWeight: '', height: '', age: '',
    previousDiets: '', fullName: '', email: '',
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (session) navigate('/', { replace: true });
  }, [session, navigate]);

  const updateFormData = (key: string, value: string) =>
    setFormData(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error: authError } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.fullName,
            current_weight: parseFloat(formData.currentWeight),
            target_weight: parseFloat(formData.targetWeight),
            height: parseFloat(formData.height),
            age: parseInt(formData.age, 10),
            previous_diets: formData.previousDiets,
            preferred_language: i18n.language || 'fr',
          }
        }
      });
      if (authError) throw authError;
      if (data?.session) {
        navigate('/', { replace: true });
      } else {
        setSignupSuccess(true);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('onboarding.error_generic', 'An error occurred. Please try again.');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];
  const totalSteps = 7; // 0=welcome, 1-4=numeric, 5=diet, 6=account
  const progress = step === 0 ? 0 : (step / (totalSteps - 1)) * 100;
  const currentStepMeta = step >= 1 && step <= 4 ? STEPS_CONFIG[step - 1] : null;
  const currentValue = currentStepMeta ? formData[currentStepMeta.key as keyof typeof formData] : '';

  // ── Email confirmation screen ──────────────────────────────────────
  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center animate-fade-in">
          <div className="text-7xl mb-6">📧</div>
          <h2 className="text-2xl font-black text-gray-800 mb-3">
            {t('onboarding.confirm_title', 'Check your email!')}
          </h2>
          <p className="text-gray-500 leading-relaxed mb-8 max-w-xs mx-auto">
            {t('onboarding.confirm_desc', 'We sent a confirmation link to')}{' '}
            <span className="font-bold text-pink-500">{formData.email}</span>.{' '}
            {t('onboarding.confirm_desc2', 'Click the link to activate your account.')}
          </p>
          <div className="bg-pink-50 border border-pink-100 rounded-2xl p-5 text-sm text-pink-700 font-medium mb-8">
            💡 {t('onboarding.confirm_tip', 'After confirming, come back and')}{' '}
            <Link to="/login" className="underline font-bold">{t('common.login', 'log in')}</Link>{' '}
            {t('onboarding.confirm_tip2', 'to see your personalized dashboard.')}
          </div>
          <button onClick={() => setSignupSuccess(false)} className="text-xs text-pink-500 underline">
            {t('onboarding.confirm_retry', "Didn't receive it? Try again")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex flex-col" onClick={() => { if (showLangMenu) setShowLangMenu(false); }}>
      <div className="w-full max-w-md mx-auto flex flex-col min-h-screen">

        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          {/* Language Switcher */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 bg-white border border-gray-100 shadow-sm rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 hover:border-pink-200 transition-all"
            >
              <Globe size={15} className="text-pink-400" />
              <span>{currentLang.flag} {currentLang.label}</span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
            </button>
            {showLangMenu && (
              <div className="absolute left-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 w-44">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      i18n.changeLanguage(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-pink-50 transition-colors text-left ${
                      lang.code === i18n.language ? 'bg-pink-50 text-pink-600 font-bold' : 'text-gray-700'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                    {lang.code === i18n.language && <CheckCircle2 size={14} className="ml-auto text-pink-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Login Button */}
          <Link
            to="/login"
            className="flex items-center gap-2 bg-pink-500 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-md shadow-pink-200/50 hover:bg-pink-600 transition-all"
          >
            {t('common.login', 'Log In')} →
          </Link>
        </div>

        {/* Progress Bar (only from step 1 onwards) */}
        {step > 0 && (
          <div className="px-5 mb-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(s => Math.max(0, s - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-100 shadow-sm text-pink-400 hover:bg-pink-50 flex-shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-pink-400 to-rose-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, progress)}%` }}
                />
              </div>
              <span className="text-xs font-bold text-gray-400 w-8 text-right flex-shrink-0">{step}/{totalSteps - 1}</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center px-5 pb-10">

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-2xl mb-5 text-sm text-center font-medium">
              {error}
            </div>
          )}

          {/* ── STEP 0: Post-purchase Welcome ── */}
          {step === 0 && (
            <div className="animate-fade-in">
              {/* Thank you card */}
              <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl p-6 text-white text-center mb-6 shadow-xl shadow-pink-200/50">
                <div className="mx-auto mb-4 w-20 h-20 rounded-3xl bg-white/95 shadow-xl shadow-pink-900/10 p-2">
                  <img src="/app-icon.png" alt="Pink Salt Burn" className="w-full h-full rounded-2xl" />
                </div>
                <h1 className="text-2xl font-black leading-tight mb-2">
                  {t('onboarding.welcome_title', 'Thank you for your purchase!')}
                </h1>
                <p className="text-pink-100 text-sm leading-relaxed">
                  {t('onboarding.welcome_subtitle', 'Your Pink Salt Burn Protocol is ready. Create your free account to access your personalized shot.')}
                </p>
              </div>

              {/* Steps guide */}
              <div className="bg-white rounded-3xl p-5 mb-6 shadow-sm border border-gray-100">
                <h2 className="font-extrabold text-gray-800 mb-4">
                  {t('onboarding.steps_title', 'How to access your protocol:')}
                </h2>
                <div className="flex flex-col gap-3">
                  {[
                    { num: '1', text: t('onboarding.step_guide_1', 'Answer 4 quick questions about your body') },
                    { num: '2', text: t('onboarding.step_guide_2', 'Create your free account (takes 30 seconds)') },
                    { num: '3', text: t('onboarding.step_guide_3', 'Access your personalized daily recipe instantly') },
                  ].map(s => (
                    <div key={s.num} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-pink-500 text-white text-sm font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                        {s.num}
                      </div>
                      <p className="text-gray-600 text-sm font-medium leading-snug pt-1">{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep(1)}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold py-5 rounded-2xl shadow-lg shadow-pink-300/50 hover:from-pink-600 hover:to-rose-600 transition-all text-lg flex items-center justify-center gap-2"
              >
                {t('onboarding.start_cta', "Let's Get Started")} <ArrowRight size={22} />
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">
                {t('onboarding.start_note', 'Free • Takes less than 2 minutes')}
              </p>
            </div>
          )}

          {/* ── STEPS 1–4: Numeric inputs ── */}
          {step >= 1 && step <= 4 && currentStepMeta && (
            <div key={step} className="flex flex-col items-center text-center animate-fade-in">
              <div className="text-6xl mb-5">{currentStepMeta.icon}</div>
              <h2 className="text-2xl font-extrabold text-gray-800 mb-2 leading-tight">
                {t(`onboarding.step${step}_label`, t(`onboarding.q_${['weight','target_weight','height','age'][step-1]}`, '...'))}
              </h2>
              <p className="text-gray-400 text-sm mb-10 max-w-xs leading-relaxed">
                {t(`onboarding.step${step}_sub`, '')}
              </p>

              <div className="flex items-end justify-center gap-3 mb-8 w-full">
                <input
                  type="number"
                  value={currentValue}
                  onChange={e => updateFormData(currentStepMeta.key, e.target.value)}
                  placeholder={currentStepMeta.placeholder}
                  autoFocus
                  className="text-center text-6xl font-black text-pink-500 bg-transparent border-none outline-none w-48 placeholder-pink-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-2xl font-bold text-gray-300 mb-2">{currentStepMeta.unit}</span>
              </div>

              <div className="w-20 h-1 bg-gradient-to-r from-pink-200 via-pink-400 to-pink-200 rounded-full mb-8" />

              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!currentValue}
                className="w-full max-w-xs bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-5 rounded-2xl shadow-lg shadow-pink-200 hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-40 disabled:shadow-none text-lg"
              >
                {t('common.next', 'Continue')} →
              </button>
            </div>
          )}

          {/* ── STEP 5: Diet history ── */}
          {step === 5 && (
            <div className="animate-fade-in">
              <div className="text-center mb-7">
                <div className="text-5xl mb-4">🥗</div>
                <h2 className="text-2xl font-extrabold text-gray-800 mb-2">
                  {t('onboarding.q_diets', 'How many diets have you tried?')}
                </h2>
              </div>
              <div className="flex flex-col gap-3">
                {DIET_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      updateFormData('previousDiets', opt.key);
                      setTimeout(() => setStep(6), 200);
                    }}
                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
                      formData.previousDiets === opt.key
                        ? 'border-pink-500 bg-pink-50 shadow-md shadow-pink-100'
                        : 'border-gray-100 bg-white hover:border-pink-200'
                    }`}
                  >
                    <span className="text-3xl">{opt.emoji}</span>
                    <div className="flex-1">
                      <div className="font-bold text-gray-800">{t(opt.labelKey)}</div>
                      <div className="text-xs text-gray-400 font-medium">{opt.sub}</div>
                    </div>
                    {formData.previousDiets === opt.key && (
                      <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 6: Account creation ── */}
          {step === 6 && (
            <div className="animate-fade-in">
              <div className="text-center mb-7">
                <div className="text-5xl mb-4">💖</div>
                <h2 className="text-2xl font-extrabold text-gray-800 mb-2">
                  {t('onboarding.q_profile', 'Create your account')}
                </h2>
                <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
                  {t('onboarding.account_sub', 'Your personalized recipe is ready. Save your progress and access it anytime.')}
                </p>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {[
                  { label: t('onboarding.fullname', 'Full Name'), key: 'fullName', type: 'text', placeholder: t('onboarding.name_placeholder'), autoComplete: 'name' },
                  { label: t('common.email', 'Email'), key: 'email', type: 'email', placeholder: t('onboarding.email_placeholder'), autoComplete: 'email' },
                ].map(({ label, key, type, placeholder, autoComplete }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      autoComplete={autoComplete}
                      required
                      className="w-full bg-white border-2 border-gray-100 rounded-2xl px-5 py-4 text-gray-800 font-semibold outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-50 transition-all"
                      value={formData[key as keyof typeof formData]}
                      onChange={e => updateFormData(key, e.target.value)}
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={loading || !formData.fullName || !formData.email}
                  className="w-full mt-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-5 rounded-2xl shadow-lg shadow-pink-200 hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-40 text-lg flex items-center justify-center gap-2"
                >
                  {loading
                    ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : `✨ ${t('onboarding.finish', 'Finish & See My Recipe')}`
                  }
                </button>
                <p className="text-center text-xs text-gray-400">
                  {t('onboarding.terms', 'By continuing you agree to personalized nutritional guidance.')}
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
