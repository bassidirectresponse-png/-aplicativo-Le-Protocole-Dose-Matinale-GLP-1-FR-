import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, CookingPot, Download, Droplet, Flame, Scale, Target, TrendingDown,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { calculateProtocolQuantities, getCaloriePlan } from '../lib/weightPlan';
import { enablePushNotifications, isPushSupported } from '../lib/pushNotifications';
import { products } from '../data/products';
import { ProductCard } from '../components/products/ProductCard';

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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installStatus, setInstallStatus] = useState('');
  const [notificationStatus, setNotificationStatus] = useState('');
  const [notificationLoading, setNotificationLoading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // maybeSingle() ne jette pas si 0 ligne ; on retente une fois pour couvrir
      // la course avec la création du profil (trigger / réplication).
      let profileData = null;
      for (let attempt = 0; attempt < 2 && !profileData; attempt += 1) {
        if (attempt > 0) await new Promise(r => setTimeout(r, 600));
        const { data } = await supabase
          .from('user_profiles').select('*').eq('id', user.id).maybeSingle();
        profileData = data;
      }
      if (!profileData) {
        setProfile(null);
        return;
      }

      const { data: weightData, error: weightError } = await supabase
        .from('weight_entries').select('weight').eq('user_id', user.id)
        .order('date', { ascending: false }).limit(1);

      const newestWeight = !weightError && weightData?.length ? Number(weightData[0].weight) : Number(profileData.current_weight);
      setLatestWeight(newestWeight);
      setProfile({ ...profileData, current_weight: newestWeight });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
      setInstallStatus("Sur iPhone : ouvrez Partager puis « Sur l'écran d'accueil ». Sur Android : « Installer l'application » dans le menu du navigateur.");
      return;
    }

    await deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    setDeferredInstallPrompt(null);
    setInstallStatus(choice.outcome === 'accepted' ? 'Application installée avec succès.' : 'Installation ignorée pour le moment.');
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
          <p className="text-pink-400 text-sm font-medium">Préparation de votre espace...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf2f8] px-6">
        <div className="text-center max-w-xs">
          <h2 className="font-display text-2xl text-gray-900 mb-2">Profil introuvable</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            Nous n'avons pas pu charger votre profil. Vérifiez votre connexion et réessayez.
          </p>
          <button
            onClick={() => fetchDashboardData()}
            className="w-full bg-pink-500 text-white font-bold py-4 rounded-2xl mb-3 cursor-pointer"
          >
            Réessayer
          </button>
          <button
            onClick={() => navigate('/onboarding')}
            className="w-full bg-white border border-pink-100 text-pink-600 font-bold py-4 rounded-2xl cursor-pointer"
          >
            Recommencer
          </button>
        </div>
      </div>
    );
  }

  const { pinkSalt, lemon, water } = calculateProtocolQuantities(profile.current_weight);
  const caloriePlan = getCaloriePlan(profile.current_weight);
  const kilosToLose = profile.current_weight - profile.target_weight;
  const kilosLost = profile.current_weight - (latestWeight || profile.current_weight);
  const progressPct = kilosToLose > 0 ? Math.min(100, Math.round((Math.max(0, kilosLost) / kilosToLose) * 100)) : 0;
  const firstName = profile.full_name.split(' ')[0];
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="min-h-screen bg-[#fdf2f8] pb-28">

      {/* ── En-tête personnel ───────────────────────────────────── */}
      <div className="px-5 pt-9 pb-6">
        <p className="text-pink-500 text-[13px] font-semibold capitalize">{today}</p>
        <h1 className="font-display text-[32px] text-gray-900 leading-tight mt-1">
          Bonjour, {firstName}
        </h1>
        <p className="text-gray-500 text-[15px] mt-1.5">
          Choisissez votre programme du jour.
        </p>
      </div>

      {/* ── VITRINE : vos programmes (façon Netflix) ────────────── */}
      <div className="px-5 flex flex-col gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* ── Votre journée : doses du shot + cible kcal ──────────── */}
      <div className="px-5 mt-9">
        <h2 className="font-display text-[22px] text-gray-900 mb-4">Votre journée</h2>

        <div className="bg-white rounded-[28px] shadow-soft border border-white overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                <Flame size={22} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Votre shot du jour</h3>
                <p className="text-[13px] text-gray-500">Doses ajustées à {profile.current_weight} kg</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-2xl bg-[#fdf2f8] p-3.5 text-center">
                <p className="text-xl font-extrabold text-gray-900">{pinkSalt} g</p>
                <p className="text-[11px] text-gray-500 font-semibold mt-0.5">sel rose</p>
              </div>
              <div className="rounded-2xl bg-[#fdf2f8] p-3.5 text-center">
                <p className="text-xl font-extrabold text-gray-900">{water} ml</p>
                <p className="text-[11px] text-gray-500 font-semibold mt-0.5">eau tiède</p>
              </div>
              <div className="rounded-2xl bg-[#fdf2f8] p-3.5 text-center">
                <p className="text-xl font-extrabold text-gray-900">{lemon} ml</p>
                <p className="text-[11px] text-gray-500 font-semibold mt-0.5">citron</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/recipes')}
              className="mt-4 w-full bg-gray-950 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-colors duration-200 hover:bg-gray-800"
            >
              <CookingPot size={18} />
              Préparer mon shot
            </button>
          </div>

          <div className="border-t border-pink-50 grid grid-cols-3 divide-x divide-pink-50">
            <div className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-gray-400 uppercase mb-1">
                <Target size={12} /> Cible
              </div>
              <p className="font-extrabold text-gray-900 text-[15px]">{caloriePlan.target} kcal</p>
            </div>
            <div className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-gray-400 uppercase mb-1">
                <Droplet size={12} /> Eau
              </div>
              <p className="font-extrabold text-gray-900 text-[15px]">{caloriePlan.water}</p>
            </div>
            <div className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-gray-400 uppercase mb-1">
                <TrendingDown size={12} /> Perdus
              </div>
              <p className="font-extrabold text-gray-900 text-[15px]">{Math.max(0, kilosLost).toFixed(1)} kg</p>
            </div>
          </div>
        </div>

        {/* Progression vers l'objectif */}
        <div className="mt-4 bg-white rounded-[28px] shadow-soft border border-white p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Scale size={17} className="text-pink-500" />
              <h3 className="font-bold text-gray-900 text-[15px]">Objectif : {profile.target_weight} kg</h3>
            </div>
            <span className="text-[13px] font-bold text-pink-500">{progressPct}%</span>
          </div>
          <div className="w-full h-3 bg-pink-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.max(3, progressPct)}%` }}
            />
          </div>
          <p className="text-[13px] text-gray-500 mt-3">
            Encore {Math.max(0, kilosToLose).toFixed(1)} kg — mettez votre poids à jour dans l'onglet Poids pour recalculer vos doses.
          </p>
        </div>
      </div>

      {/* ── Installation & rappels ──────────────────────────────── */}
      <div className="px-5 mt-6">
        <div className="bg-white rounded-[28px] shadow-soft border border-white p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center flex-shrink-0">
              <Bell size={21} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Gardez l'app à portée de main</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed mt-0.5">
                Installez l'application et activez les rappels du shot.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleInstallApp}
              className="rounded-2xl bg-gray-950 text-white py-3.5 px-3 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors duration-200 hover:bg-gray-800"
            >
              <Download size={17} />
              Installer
            </button>
            <button
              onClick={handleEnableNotifications}
              disabled={!isPushSupported() || notificationLoading}
              className="rounded-2xl bg-pink-500 text-white py-3.5 px-3 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors duration-200 hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Bell size={17} />
              {notificationLoading ? 'Activation...' : 'Rappels'}
            </button>
          </div>

          {(installStatus || notificationStatus) && (
            <div className="mt-4 rounded-2xl bg-pink-50 border border-pink-100 px-4 py-3 text-[13px] text-gray-600 leading-relaxed">
              {installStatus && <p>{installStatus}</p>}
              {notificationStatus && <p className={installStatus ? 'mt-1' : ''}>{notificationStatus}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
