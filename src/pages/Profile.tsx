import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Settings as SettingsIcon, Headphones, Mail, RefreshCw,
  ChevronDown, CheckCircle, Globe, LogOut, User
} from 'lucide-react';

interface UserProfile {
  full_name: string;
  email: string;
  current_weight: number;
  target_weight: number;
  height: number;
  age: number;
  preferred_language: string;
}

const SUPPORT_EMAIL = 'healthylife.help24h@gmail.com';

const LANGUAGES = [
  { code: 'fr', label: 'Francais', flag: 'FR' },
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'pt', label: 'Portugues', flag: 'PT' },
  { code: 'es', label: 'Espanol', flag: 'ES' },
  { code: 'de', label: 'Deutsch', flag: 'DE' },
  { code: 'it', label: 'Italiano', flag: 'IT' },
];

const FAQ_KEYS = [
  { q: 'support.faq_q1', a: 'support.faq_a1' },
  { q: 'support.faq_q2', a: 'support.faq_a2' },
  { q: 'support.faq_q3', a: 'support.faq_a3' },
  { q: 'support.faq_q4', a: 'support.faq_a4' },
  { q: 'support.faq_q5', a: 'support.faq_a5' },
];

const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full py-4 text-left gap-3"
      >
        <span className="text-sm font-semibold text-gray-700 leading-snug">{t(q)}</span>
        <ChevronDown
          size={18}
          className={`text-pink-400 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-out ${open ? 'max-h-60 pb-4' : 'max-h-0'}`}>
        <p className="text-sm text-gray-500 leading-relaxed">{t(a)}</p>
      </div>
    </div>
  );
};

const Profile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('user_profiles').select('*').eq('id', user.id).single();
        if (error) throw error;
        setProfile(data);
        if (data.preferred_language && data.preferred_language !== i18n.language) {
          i18n.changeLanguage(data.preferred_language);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, i18n]);

  const handleChange = (field: keyof UserProfile, value: string | number) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('user_profiles').update({
        full_name: profile.full_name,
        current_weight: profile.current_weight,
        target_weight: profile.target_weight,
        height: profile.height,
        age: profile.age,
        preferred_language: profile.preferred_language || i18n.language || 'fr',
      }).eq('id', user.id);
      if (error) throw error;
      if (profile.preferred_language && profile.preferred_language !== i18n.language) {
        i18n.changeLanguage(profile.preferred_language);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="w-12 h-12 rounded-full border-4 border-pink-200 border-t-pink-500 animate-spin" />
      </div>
    );
  }

  const firstName = profile.full_name.split(' ')[0];
  const currentLang = LANGUAGES.find(l => l.code === (profile.preferred_language || i18n.language)) || LANGUAGES[0];

  const questionMailto = `mailto:${SUPPORT_EMAIL}?subject=Pink%20Salt%20Burn%20%E2%80%94%20Question`;
  const refundMailto = `mailto:${SUPPORT_EMAIL}?subject=Pink%20Salt%20Burn%20%E2%80%94%20Refund%20Request&body=Hello%2C%20I%20would%20like%20to%20request%20a%20refund%20for%20my%20purchase%20of%20the%20Pink%20Salt%20Burn%20Protocol.%20My%20registered%20email%20is%3A%20${encodeURIComponent(profile.email)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 pb-28">

      {/* Page Header */}
      <div className="px-5 pt-8 pb-5">
        <h1 className="text-2xl font-black text-gray-800">{t('profile.settings_title', 'Settings')}</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          {t('profile.settings_sub', 'Manage your profile and get support')}
        </p>
      </div>

      {/* ── SETTINGS SECTION ── */}
      <div className="px-5 mb-2">
        <div className="flex items-center gap-2 mb-3">
          <SettingsIcon size={15} className="text-pink-400" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {t('profile.section_settings', 'My Profile')}
          </span>
        </div>
      </div>

      {/* Avatar + name header */}
      <div className="px-5 mb-4">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-pink-200">
            <span className="text-white text-2xl font-black">{firstName[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-gray-800 text-lg truncate">{profile.full_name}</p>
            <p className="text-gray-400 text-sm truncate">{profile.email}</p>
          </div>
          <div className="text-3xl">{currentLang?.flag}</div>
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={handleSave}>
        <div className="px-5 mb-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                <User size={11} className="inline mr-1" />{t('onboarding.fullname', 'Full Name')}
              </label>
              <input
                type="text"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-gray-800 font-semibold outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-50 transition-all"
                value={profile.full_name}
                onChange={e => handleChange('full_name', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {([
                { label: t('onboarding.q_weight', 'Current Weight') + ' (kg)', key: 'current_weight', step: '0.1' },
                { label: t('onboarding.q_target_weight', 'Target Weight') + ' (kg)', key: 'target_weight', step: '0.1' },
                { label: t('onboarding.q_height', 'Height') + ' (cm)', key: 'height', step: '1' },
                { label: t('onboarding.q_age', 'Age'), key: 'age', step: '1' },
              ] as Array<{ label: string; key: 'current_weight' | 'target_weight' | 'height' | 'age'; step: string }>).map(({ label, key, step }) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</label>
                  <input
                    type="number"
                    step={step}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-gray-800 font-semibold outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-50 transition-all"
                    value={profile[key]}
                    onChange={e => handleChange(key, parseFloat(e.target.value))}
                    required
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                <Globe size={11} className="inline mr-1" />{t('profile.language', 'Language')}
              </label>
              <select
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-gray-800 font-semibold outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-50 transition-all appearance-none"
                value={profile.preferred_language || i18n.language || 'fr'}
                onChange={e => {
                  handleChange('preferred_language', e.target.value);
                  i18n.changeLanguage(e.target.value);
                }}
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-4 rounded-2xl shadow-md shadow-pink-200 hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : saveSuccess ? (
                <><CheckCircle size={18} /> {t('profile.saved', 'Saved!')}</>
              ) : (
                t('common.save', 'Save Changes')
              )}
            </button>
          </div>
        </div>
      </form>

      {/* ── SUPPORT SECTION ── */}
      <div className="px-5 mb-2 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <Headphones size={15} className="text-pink-400" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {t('support.section_title', 'Support')}
          </span>
        </div>
      </div>

      {/* Support greeting */}
      <div className="px-5 mb-4">
        <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl p-5 text-white shadow-lg shadow-pink-200/50">
          <div className="text-3xl mb-3">💬</div>
          <h2 className="text-xl font-extrabold leading-tight mb-1">
            {t('support.greeting', { name: firstName, defaultValue: `How can we help you, {{name}}?` })}
          </h2>
          <p className="text-pink-100 text-sm leading-relaxed">
            {t('support.greeting_sub', 'Our team is here to help with any questions or issues. We respond within 24h on business days.')}
          </p>
        </div>
      </div>

      {/* Two support cards */}
      <div className="px-5 mb-4 flex flex-col gap-3">
        {/* General questions */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center flex-shrink-0">
              <Mail size={18} className="text-pink-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-800">{t('support.question_title', 'Got a question?')}</h3>
              <p className="text-sm text-gray-400 mt-0.5 leading-snug">
                {t('support.question_desc', 'Protocol doubts, recipe questions, or anything about the app.')}
              </p>
            </div>
          </div>
          <a
            href={questionMailto}
            className="block w-full text-center bg-pink-50 text-pink-600 font-bold py-3.5 rounded-2xl hover:bg-pink-100 transition-colors border border-pink-100"
          >
            {t('support.question_cta', 'Send a Question →')}
          </a>
        </div>

        {/* Refund request */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center flex-shrink-0">
              <RefreshCw size={18} className="text-rose-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-800">{t('support.refund_title', 'Refund Request')}</h3>
              <p className="text-sm text-gray-400 mt-0.5 leading-snug">
                {t('support.refund_desc', 'Not satisfied? We honour our 30-day refund policy.')}
              </p>
            </div>
          </div>
          <a
            href={refundMailto}
            className="block w-full text-center bg-rose-50 text-rose-600 font-bold py-3.5 rounded-2xl hover:bg-rose-100 transition-colors border border-rose-100"
          >
            {t('support.refund_cta', 'Request a Refund →')}
          </a>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="px-5 mb-4">
        <div className="bg-white rounded-3xl px-5 shadow-sm border border-gray-100">
          <div className="py-4 border-b border-gray-100">
            <h3 className="font-extrabold text-gray-800">{t('support.faq_title', 'Frequently Asked Questions')}</h3>
          </div>
          {FAQ_KEYS.map((item, i) => (
            <FaqItem key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </div>

      {/* Support email footer */}
      <div className="px-5 mb-4">
        <div className="bg-pink-50 rounded-3xl p-5 border border-pink-100 text-center">
          <p className="text-xs text-gray-400 mb-2">{t('support.contact_note', 'You can also reach us directly at')}</p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-pink-500 font-bold text-sm hover:text-pink-700 transition-colors"
          >
            {SUPPORT_EMAIL}
          </a>
          <p className="text-xs text-gray-400 mt-2">
            {t('support.response_time', '⏱ We respond within 24h on business days')}
          </p>
        </div>
      </div>

      {/* Logout */}
      <div className="px-5">
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 bg-white text-gray-500 font-bold py-4 rounded-2xl hover:bg-gray-50 transition-colors border border-gray-100 shadow-sm"
        >
          <LogOut size={18} />
          {t('common.logout', 'Log Out')}
        </button>
      </div>
    </div>
  );
};

export default Profile;
