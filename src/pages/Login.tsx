import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { MailCheck } from 'lucide-react';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSent(false);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('login.invalid_credentials');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-20 h-20 rounded-3xl bg-white shadow-xl shadow-pink-200/50 border border-pink-100 p-2">
            <img src="/app-icon.png" alt="Protocole Pink Salt Burn" className="w-full h-full rounded-2xl" />
          </div>
          <p className="text-sm font-black text-pink-500 uppercase tracking-widest">Protocole Pink Salt Burn</p>
          <h1 className="text-2xl font-black text-gray-800 mt-2">{t('login.welcome_back')}</h1>
          <p className="text-gray-400 text-sm mt-1">{t('login.subtitle')}</p>
        </div>

        {sent && (
          <div className="bg-green-50 border border-green-100 text-green-700 p-4 rounded-2xl mb-5 text-sm text-center font-semibold">
            <MailCheck size={20} className="mx-auto mb-2" />
            {t('login.magic_link_sent', 'Lien envoye. Ouvrez votre email et cliquez pour entrer dans l app.')}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-2xl mb-5 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t('common.email')}</label>
            <input
              type="email"
              placeholder={t('login.email_placeholder')}
              autoComplete="email"
              required
              className="w-full bg-white border-2 border-gray-100 rounded-2xl px-5 py-4 text-gray-800 font-semibold outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-50 transition-all"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full mt-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-5 rounded-2xl shadow-lg shadow-pink-200 hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-40 disabled:shadow-none text-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              t('login.submit')
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-400 text-sm">{t('login.purchase_note', 'Utilisez le meme email que celui de votre achat.')}</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
