import React, { useEffect, useState } from 'react';
import {
  ChefHat, ChevronDown, ChevronUp, Clock3,
  Flame, Sparkles, Star, Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getCaloriePlan } from '../lib/weightPlan';
import { getShotMatinal, mealPlan, mealPlanTotalKcal } from '../data/protocolRecipes';

interface UserProfile {
  id: string;
  full_name: string;
  current_weight: number;
  target_weight: number;
}

const Recipes: React.FC = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (profileError) throw profileError;

        const { data: latestWeight } = await supabase
          .from('weight_entries')
          .select('weight')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(1);

        const currentWeight = latestWeight?.length
          ? Number(latestWeight[0].weight)
          : Number(profileData.current_weight);
        setProfile({ ...profileData, current_weight: currentWeight });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50 pb-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
      </div>
    );
  }

  // Poids par défaut si pas de profil (75 kg) pour que la page reste utilisable.
  const weight = profile?.current_weight ?? 75;
  const shot = getShotMatinal(weight);
  const caloriePlan = getCaloriePlan(weight);
  const firstName = profile?.full_name?.split(' ')[0];

  return (
    <div className="pb-28 min-h-screen bg-[#fff7fb]">
      {/* En-tête */}
      <div className="px-5 pt-8 pb-5 bg-white border-b border-pink-100">
        <p className="text-pink-500 text-xs font-bold uppercase tracking-widest">Le Protocole Dose Matinale GLP-1</p>
        <h1 className="text-3xl font-black text-gray-900 mt-1 leading-tight">
          {firstName ? `Vos recettes, ${firstName}` : 'Vos recettes'}
        </h1>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          Commencez par le Shot Matinal, puis suivez le menu 4 repas en déficit calorique. Chaque recette indique les quantités, le pas à pas et pourquoi ça marche.
        </p>
      </div>

      {/* Mode d'emploi */}
      <div className="px-5 mt-5">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-pink-100">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-pink-500" />
            <h2 className="font-black text-gray-900">Comment l'utiliser pour mincir</h2>
          </div>
          <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
            <p>
              Prenez le Shot Matinal à jeun, chaque matin, 15 à 30 minutes avant le petit-déjeuner. La régularité fait toute la différence.
            </p>
            <p>
              Visez ensuite votre cible de <strong>{caloriePlan.target} kcal</strong>, gardez {caloriePlan.protein} de protéines et buvez {caloriePlan.water} d'eau. Le menu ci-dessous (~{mealPlanTotalKcal} kcal) vous garde déjà en déficit.
            </p>
            <p>
              Votre poids actuel est de <strong>{weight} kg</strong>. Mettez-le à jour dans le calendrier pour recalculer automatiquement les doses et les calories.
            </p>
          </div>
        </div>
      </div>

      {/* Shot Matinal — recette vedette */}
      <div className="px-5 mt-5">
        <section className="bg-gradient-to-br from-gray-950 via-rose-950 to-pink-700 rounded-3xl overflow-hidden shadow-xl shadow-pink-200/40 text-white">
          <div className="p-6">
            <div className="bg-white/15 px-3 py-1 rounded-full inline-flex items-center gap-1 mb-4">
              <Star size={14} className="fill-current" />
              <span className="text-xs font-bold uppercase tracking-wider">Recette principale</span>
            </div>

            <h2 className="text-2xl font-black mb-3">{shot.title}</h2>

            {/* Fonction GIP / GLP-1 */}
            <div className="bg-white/10 rounded-2xl p-4 mb-4 border border-white/20 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500 flex items-center justify-center flex-shrink-0">
                <Zap size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-pink-200">Fonction</p>
                <p className="text-sm font-bold leading-snug mt-0.5">{shot.functionTag}</p>
              </div>
            </div>

            <p className="text-pink-100 text-sm mb-5 leading-relaxed">{shot.intro}</p>

            {/* Ingrédients */}
            <div className="bg-white/10 rounded-2xl p-4 mb-4 backdrop-blur-sm border border-white/20">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                <ChefHat size={16} /> Ingrédients & quantités
              </h3>
              <ul className="space-y-2 text-sm text-pink-50">
                {shot.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex justify-between gap-3">
                    <span>{ing.label}</span>
                    <span className="font-bold text-white whitespace-nowrap">{ing.amount}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Préparation */}
            <div className="bg-white/10 rounded-2xl p-4 mb-4 backdrop-blur-sm border border-white/20">
              <h3 className="font-bold text-sm mb-3">Préparation (pas à pas)</h3>
              <ol className="space-y-3 text-sm text-pink-50 list-decimal list-inside">
                {shot.steps.map((step, idx) => (
                  <li key={idx} className="leading-relaxed pl-1">{step}</li>
                ))}
              </ol>
            </div>

            {/* Pourquoi ça marche */}
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
              <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                <Flame size={16} /> Pourquoi ça marche
              </h3>
              <p className="text-sm text-pink-50 leading-relaxed">{shot.why}</p>
              <div className="mt-4 pt-4 border-t border-white/20 text-xs font-medium text-pink-100 flex items-start gap-2">
                <Clock3 size={14} className="flex-shrink-0 mt-0.5" />
                <span>{shot.tip}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Menu 4 repas */}
      <div className="px-5 mt-7">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-black text-gray-900">Menu 4 repas</h2>
          <span className="text-xs font-black text-pink-500 bg-pink-50 px-3 py-1 rounded-full">
            ~{mealPlanTotalKcal} kcal
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-4">Déficit calorique pour accompagner votre perte de poids.</p>

        <div className="flex flex-col gap-4">
          {mealPlan.map(meal => {
            const isExpanded = expandedMeal === meal.id;
            return (
              <section
                key={meal.id}
                className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden transition-all"
              >
                <button
                  className="w-full p-5 text-left"
                  onClick={() => setExpandedMeal(isExpanded ? null : meal.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md bg-pink-50 text-pink-600">
                      {meal.slot}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-gray-400">{meal.kcal} kcal</span>
                      {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-gray-900">{meal.title}</h3>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-pink-50 bg-gray-50/50">
                    <div className="my-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Ingrédients & quantités</h4>
                      <ul className="space-y-2">
                        {meal.ingredients.map((ing, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex justify-between gap-3">
                            <span className="flex items-start gap-2">
                              <span className="text-pink-300">-</span> {ing.label}
                            </span>
                            <span className="font-bold text-gray-900 whitespace-nowrap">{ing.amount}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Préparation (pas à pas)</h4>
                      <ol className="space-y-3">
                        {meal.steps.map((step, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="font-bold text-pink-300 w-4">{idx + 1}.</span>
                            <span className="flex-1">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="bg-pink-50 rounded-xl p-3 text-sm text-pink-800 flex items-start gap-2">
                      <Flame size={15} className="text-pink-500 flex-shrink-0 mt-0.5" />
                      <p><span className="font-bold">Pourquoi ça marche :</span> {meal.why}</p>
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Recipes;
