import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Bell, CalendarCheck, CheckCircle2, CookingPot, Download, Flame, PlayCircle,
  Scale, Sparkles, Target, TrendingDown
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { calculateProtocolQuantities, getCaloriePlan } from '../lib/weightPlan';
import { enablePushNotifications, isPushSupported } from '../lib/pushNotifications';

interface UserProfile {
  full_name: string;
  current_weight: number;
  height: number;
  target_weight: number;
  age: number;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installStatus, setInstallStatus] = useState('');
  const [notificationStatus, setNotificationStatus] = useState('');
  const [notificationLoading, setNotificationLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles').select('*').eq('id', user.id).single();
        if (profileError) throw profileError;

        const { data: weightData, error: weightError } = await supabase
          .from('weight_entries').select('weight').eq('user_id', user.id)
          .order('date', { ascending: false }).limit(1);

        const newestWeight = !weightError && weightData?.length ? Number(weightData[0].weight) : Number(profileData.current_weight);
        setLatestWeight(newestWeight);
        setProfile({ ...profileData, current_weight: newestWeight });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  useEffect(() => {
    const ready = (event: Event) => {
      event.preventDefault();
      setDeferredInstallPrompt(event as BeforeInstallPromptEvent);
      setInstallStatus('');
    };

    window.addEventListener('beforeinstallprompt', ready);
    return () => window.removeEventListener('beforeinstallprompt', ready);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredInstallPrompt) {
      setInstallStatus("Sur iPhone, ouvrez Partager puis Ajouter a l'ecran d'accueil. Sur Android, utilisez Installer dans le menu du navigateur.");
      return;
    }

    await deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    setDeferredInstallPrompt(null);
    setInstallStatus(choice.outcome === 'accepted' ? 'App installee avec succes.' : 'Installation ignoree pour le moment.');
  };

  const handleEnableNotifications = async () => {
    if (!user || notificationLoading) return;
    setNotificationLoading(true);
    setNotificationStatus('');

    try {
      const result = await enablePushNotifications(user.id);
      setNotificationStatus(result.message);
    } catch (error) {
      console.error(error);
      setNotificationStatus("Impossible d'activer les notifications pour le moment.");
    } finally {
      setNotificationLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-pink-200 border-t-pink-500 animate-spin" />
          <p className="text-pink-400 text-sm font-medium">Preparation de votre protocole Pink Salt...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const { pinkSalt, lemon, water } = calculateProtocolQuantities(profile.current_weight);
  const caloriePlan = getCaloriePlan(profile.current_weight);
  const kilosToLose = profile.current_weight - profile.target_weight;
  const kilosLost = profile.current_weight - (latestWeight || profile.current_weight);
  const progressPct = kilosToLose > 0 ? Math.min(100, Math.round((Math.max(0, kilosLost) / kilosToLose) * 100)) : 0;
  const firstName = profile.full_name.split(' ')[0];

  const tutorial = [
    {
      icon: PlayCircle,
      title: '1. Regardez les videos dans l ordre',
      text: 'Ouvrez Cours et commencez par le chapitre 1. Marquez chaque video comme terminee avant de passer a la suivante.',
      action: () => navigate('/courses'),
    },
    {
      icon: CookingPot,
      title: '2. Preparez le shot principal',
      text: 'Allez dans Recettes pour voir vos doses personnalisees. Faites le shot exactement comme indique, sans sucre ajoute.',
      action: () => navigate('/recipes'),
    },
    {
      icon: Scale,
      title: '3. Notez votre poids actuel',
      text: 'Ajoutez votre poids dans le calendrier aussi souvent que possible. Le profil, les doses et les calories se recalibrent avec ce poids.',
      action: () => navigate('/calendar'),
    },
  ];

  return (
    <div className="min-h-screen bg-[#fff7fb] pb-28">
      <div className="px-5 pt-8 pb-5 bg-white border-b border-pink-100">
        <p className="text-pink-500 text-sm font-bold mb-1">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-3xl font-black text-gray-900 leading-tight">
          {t('dashboard.greeting', { name: firstName })}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Votre shot Pink Salt, vos videos et vos calories du jour au meme endroit.
        </p>
      </div>

      <div className="px-5 pt-5">
        <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-gray-950 via-rose-950 to-pink-800 text-white shadow-xl shadow-pink-200/40">
          <div className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-pink-200 text-xs font-bold uppercase tracking-widest">Aujourd hui</p>
                <h2 className="text-2xl font-black mt-1">Shot actif</h2>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
                <Flame size={28} className="text-pink-100" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                <p className="text-3xl font-black">{pinkSalt}g</p>
                <p className="text-xs text-pink-100 font-semibold mt-1">sel rose</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                <p className="text-3xl font-black">{water}ml</p>
                <p className="text-xs text-pink-100 font-semibold mt-1">eau + {lemon}ml citron</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/recipes')}
            className="w-full bg-white text-pink-600 font-black py-4 flex items-center justify-center gap-2"
          >
            <CookingPot size={19} />
            Ouvrir le shot principal
          </button>
        </div>
      </div>

      <div className="px-5 mt-5">
        <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-pink-500 font-bold uppercase tracking-widest">App mobile</p>
              <h2 className="text-lg font-black text-gray-900 mt-1">Installez et recevez les rappels</h2>
              <p className="text-sm text-gray-500 leading-relaxed mt-2">
                Gardez le protocole sur votre ecran d'accueil et activez les notifications pour ne pas oublier le shot, les calories et le suivi.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center flex-shrink-0">
              <Bell size={23} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <button
              onClick={handleInstallApp}
              className="rounded-2xl bg-gray-950 text-white py-3.5 px-3 font-black text-sm flex items-center justify-center gap-2 active:scale-[0.99] transition"
            >
              <Download size={18} />
              Installer
            </button>
            <button
              onClick={handleEnableNotifications}
              disabled={!isPushSupported() || notificationLoading}
              className="rounded-2xl bg-pink-500 text-white py-3.5 px-3 font-black text-sm flex items-center justify-center gap-2 active:scale-[0.99] transition disabled:opacity-50"
            >
              <Bell size={18} />
              {notificationLoading ? 'Activation...' : 'Notifications'}
            </button>
          </div>

          {(installStatus || notificationStatus) && (
            <div className="mt-4 rounded-2xl bg-pink-50 border border-pink-100 px-4 py-3 text-xs text-gray-600 leading-relaxed">
              {installStatus && <p>{installStatus}</p>}
              {notificationStatus && <p className={installStatus ? 'mt-1' : ''}>{notificationStatus}</p>}
            </div>
          )}
        </div>
      </div>

      <div className="px-5 mt-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown size={16} className="text-pink-500" />
              <span className="text-xs font-bold text-gray-400 uppercase">Progression</span>
            </div>
            <p className="text-3xl font-black text-gray-900">{Math.max(0, kilosLost).toFixed(1)}<span className="text-base text-gray-300"> kg</span></p>
            <p className="text-xs text-gray-400 mt-1">perdus jusqu ici</p>
            <div className="mt-3 bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-pink-500 rounded-full" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Target size={16} className="text-rose-500" />
              <span className="text-xs font-bold text-gray-400 uppercase">Objectif</span>
            </div>
            <p className="text-3xl font-black text-gray-900">{profile.target_weight}<span className="text-base text-gray-300"> kg</span></p>
            <p className="text-xs text-gray-400 mt-1">{Math.max(0, kilosToLose).toFixed(1)} kg restants</p>
          </div>
        </div>
      </div>

      <div className="px-5 mt-5">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-pink-500" />
            <h2 className="text-lg font-black text-gray-900">Comment evoluer avec l app</h2>
          </div>
          <div className="flex flex-col gap-3">
            {tutorial.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  onClick={item.action}
                  className="text-left rounded-2xl bg-pink-50/70 border border-pink-100 p-4 flex gap-3 active:scale-[0.99] transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-white text-pink-500 flex items-center justify-center flex-shrink-0">
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed mt-1">{item.text}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-5 mt-5">
        <div className="bg-white rounded-3xl overflow-hidden border border-pink-100 shadow-sm">
          <div className="bg-gradient-to-br from-gray-950 via-rose-950 to-pink-700 text-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-pink-200 font-bold uppercase tracking-widest">Objectif d aujourd hui</p>
                <h2 className="text-4xl font-black mt-1">{caloriePlan.target} kcal</h2>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
                <CalendarCheck size={25} className="text-pink-100" />
              </div>
            </div>
            <p className="text-sm text-pink-50 leading-relaxed mt-4">
              Votre mission: rester proche de cette cible, prendre le shot au bon moment et garder assez de proteines. Pas besoin d etre parfaite, la regularite fait le resultat.
            </p>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-pink-50 p-3">
                <p className="text-[10px] text-pink-500 font-black uppercase">Poids actuel</p>
                <p className="font-black text-gray-900 mt-1">{profile.current_weight} kg</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-3">
                <p className="text-[10px] text-gray-400 font-black uppercase">Proteines</p>
                <p className="font-black text-gray-900 mt-1">{caloriePlan.protein}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-3">
                <p className="text-[10px] text-gray-400 font-black uppercase">Eau</p>
                <p className="font-black text-gray-900 mt-1">{caloriePlan.water}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-pink-100 bg-pink-50/70 p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white text-pink-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={19} />
                </div>
                <div>
                  <p className="font-black text-gray-900 text-sm">Votre protocole reste ajuste</p>
                  <p className="text-xs text-gray-600 leading-relaxed mt-1">
                    Quand vous ajoutez un nouveau poids dans le calendrier, cette cible et les doses du shot se mettent a jour automatiquement.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/recipes')}
              className="mt-4 w-full rounded-2xl bg-pink-500 text-white font-black py-3.5 flex items-center justify-center gap-2"
            >
              Voir le shot du jour
              <CookingPot size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
