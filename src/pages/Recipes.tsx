import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChefHat, ChevronDown, ChevronUp, Clock3,
  Flame, Heart, Search, Sparkles, Star
} from 'lucide-react';
import { recipesData } from '../data/recipes';
import type { MealTime } from '../data/recipes';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { calculateProtocolQuantities, getCaloriePlan } from '../lib/weightPlan';

interface UserProfile {
  id: string;
  full_name: string;
  current_weight: number;
  target_weight: number;
  height: number;
  age: number;
}

const FILTERS: Array<MealTime | 'all' | 'favourites'> = ['all', 'morning', 'lunch', 'dinner', 'snack', 'night', 'favourites'];

const Recipes: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [activeFilter, setActiveFilter] = useState<MealTime | 'all' | 'favourites'>('all');
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
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

        const currentWeight = latestWeight?.length ? Number(latestWeight[0].weight) : Number(profileData.current_weight);
        setProfile({ ...profileData, current_weight: currentWeight });

        const { data: favData, error: favError } = await supabase
          .from('user_recipe_views')
          .select('recipe_id, is_favourite')
          .eq('user_id', user.id)
          .eq('is_favourite', true);

        if (favError && favError.code !== '42P01') console.error(favError);

        const favMap: Record<string, boolean> = {};
        favData?.forEach(f => {
          if (f.is_favourite) favMap[f.recipe_id] = true;
        });
        setFavorites(favMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    const scrollTo = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (!scrollTo || loading) return;
    window.setTimeout(() => {
      setActiveFilter('all');
      setExpandedRecipe(scrollTo);
      document.getElementById(`recipe-${scrollTo}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  }, [location.state, loading]);

  const toggleFavorite = async (recipeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    const isFav = !favorites[recipeId];
    setFavorites(prev => ({ ...prev, [recipeId]: isFav }));

    try {
      const { data: existing } = await supabase
        .from('user_recipe_views')
        .select('*')
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId)
        .single();

      if (existing) {
        await supabase
          .from('user_recipe_views')
          .update({ is_favourite: isFav, viewed_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('user_recipe_views')
          .insert({ user_id: user.id, recipe_id: recipeId, is_favourite: isFav });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getWeightLossCategory = (current: number, target: number) => {
    const toLose = current - target;
    if (toLose > 15) return 'high';
    if (toLose >= 5) return 'medium';
    return 'low';
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50 pb-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
      </div>
    );
  }

  const weightCategory = getWeightLossCategory(profile.current_weight, profile.target_weight);
  const { pinkSalt, lemon, water, appleCiderVinegar, ginger, cinnamon } = calculateProtocolQuantities(profile.current_weight);
  const caloriePlan = getCaloriePlan(profile.current_weight);
  const firstName = profile.full_name.split(' ')[0];

  const filteredRecipes = recipesData.filter(recipe => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'favourites') return favorites[recipe.id];
    return recipe.mealTime.includes(activeFilter as MealTime);
  }).sort((a, b) => {
    if (a.isFeatured) return -1;
    if (b.isFeatured) return 1;

    const aIsHighProtein = a.titleKey.includes('egg') || a.titleKey.includes('salmon');
    const aIsLight = a.titleKey.includes('soup') || a.titleKey.includes('chia');
    const bIsHighProtein = b.titleKey.includes('egg') || b.titleKey.includes('salmon');
    const bIsLight = b.titleKey.includes('soup') || b.titleKey.includes('chia');

    if (weightCategory === 'high') {
      if (aIsHighProtein && !bIsHighProtein) return -1;
      if (!aIsHighProtein && bIsHighProtein) return 1;
    } else if (weightCategory === 'low') {
      if (aIsLight && !bIsLight) return -1;
      if (!aIsLight && bIsLight) return 1;
    }

    return 0;
  });

  const getReasonKey = () => {
    if (weightCategory === 'high') return 'recipes.reason_high_loss';
    if (weightCategory === 'medium') return 'recipes.reason_med_loss';
    return 'recipes.reason_low_loss';
  };

  return (
    <div className="pb-28 min-h-screen bg-[#fff7fb]">
      <div className="px-5 pt-8 pb-5 bg-white border-b border-pink-100">
        <p className="text-pink-500 text-xs font-bold uppercase tracking-widest">Recettes</p>
        <h1 className="text-3xl font-black text-gray-900 mt-1 leading-tight">
          {t('recipes.title', { name: firstName })}
        </h1>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          Le shot Pink Salt reste votre base. Les autres recettes sont des options fit pour soutenir la satiete, les fibres, les proteines et le deficit calorique.
        </p>
      </div>

      <div className="px-5 mt-5">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-pink-100">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-pink-500" />
            <h2 className="font-black text-gray-900">Mode d emploi pour mincir</h2>
          </div>
          <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
            <p>
              Prenez le shot principal aux horaires indiques, idealement 15 a 30 minutes avant le premier repas ou en fin d apres-midi si vos envies de sucre arrivent plus tard.
            </p>
            <p>
              Pour amplifier le resultat, respectez votre cible de {caloriePlan.target} kcal, gardez {caloriePlan.protein} de proteines, buvez {caloriePlan.water} d eau et ajoutez une marche ou des exercices legers.
            </p>
            <p>
              Votre poids actuel est {profile.current_weight} kg. Si vous le mettez a jour dans le calendrier, les doses ci-dessous et les calories se recalculent automatiquement.
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 mt-5">
        <div className="flex overflow-x-auto pb-3 gap-2 hide-scrollbar">
          {FILTERS.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                activeFilter === filter
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-pink-100 hover:bg-pink-50'
              }`}
            >
              {t(`recipes.filter_${filter}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-1 flex flex-col gap-5">
        {filteredRecipes.map((recipe) => {
          const isExpanded = expandedRecipe === recipe.id;
          const isFav = favorites[recipe.id];

          if (recipe.isFeatured) {
            return (
              <section
                id={`recipe-${recipe.id}`}
                key={recipe.id}
                className="bg-gradient-to-br from-gray-950 via-rose-950 to-pink-700 rounded-3xl overflow-hidden shadow-xl shadow-pink-200/40 text-white"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-white/15 px-3 py-1 rounded-full flex items-center gap-1">
                      <Star size={14} className="fill-current" />
                      <span className="text-xs font-bold uppercase tracking-wider">{t('recipes.featured_badge')}</span>
                    </div>
                    <button onClick={(e) => toggleFavorite(recipe.id, e)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                      <Heart size={20} className={isFav ? 'fill-white' : ''} />
                    </button>
                  </div>

                  <h2 className="text-2xl font-black mb-2">{t(recipe.titleKey)}</h2>
                  <p className="text-pink-100 text-sm mb-5 leading-relaxed">{t(recipe.descriptionKey)}</p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                      <p className="text-3xl font-black">{pinkSalt}g</p>
                      <p className="text-xs text-pink-100 font-semibold mt-1">sel rose</p>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                      <p className="text-3xl font-black">{water}ml</p>
                      <p className="text-xs text-pink-100 font-semibold mt-1">eau citronnee</p>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-2xl p-4 mb-4 backdrop-blur-sm border border-white/20">
                    <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                      <ChefHat size={16} /> {t('recipes.ingredients')}
                    </h3>
                    <ul className="space-y-2 text-sm text-pink-50">
                      <li>- {t('recipes.salt_burn.ing_1', { amount: pinkSalt })}</li>
                      <li>- {t('recipes.salt_burn.ing_2', { amount: water })}</li>
                      <li>- {t('recipes.salt_burn.ing_3', { amount: lemon })}</li>
                      <li>- {t('recipes.salt_burn.ing_4', { amount: appleCiderVinegar })}</li>
                      <li>- {t('recipes.salt_burn.ing_5', { amount: ginger })}</li>
                      <li>- {t('recipes.salt_burn.ing_6', { amount: cinnamon })}</li>
                    </ul>
                  </div>

                  <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
                    <h3 className="font-bold text-sm mb-3">{t('recipes.preparation')}</h3>
                    <ol className="space-y-3 text-sm text-pink-50 list-decimal list-inside">
                      {recipe.stepsKeys.map((stepKey, idx) => (
                        <li key={idx} className="leading-relaxed pl-1 pb-1">{t(stepKey)}</li>
                      ))}
                    </ol>
                    <div className="mt-4 pt-4 border-t border-white/20 text-xs font-medium text-pink-100">
                      <Clock3 size={14} className="inline mr-1" />
                      {t(recipe.timeKey)}
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          return (
            <section
              id={`recipe-${recipe.id}`}
              key={recipe.id}
              className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden transition-all duration-300"
            >
              <div
                className="p-5 cursor-pointer"
                onClick={() => setExpandedRecipe(isExpanded ? null : recipe.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md ${
                      recipe.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        recipe.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                    }`}>
                      {t(`recipes.difficulty_${recipe.difficulty}`)}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md bg-pink-50 text-pink-600">
                      {t(`recipes.filter_${recipe.mealTime[0]}`)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => toggleFavorite(recipe.id, e)}
                      className="text-gray-400 hover:text-pink-500 transition-colors"
                    >
                      <Heart size={20} className={isFav ? 'fill-pink-500 text-pink-500' : ''} />
                    </button>
                    {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                  </div>
                </div>

                <h3 className="text-lg font-black text-gray-900 mb-1">{t(recipe.titleKey)}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{t(recipe.descriptionKey)}</p>

                <div className="mt-4 bg-pink-50 rounded-xl p-3 text-xs text-pink-800 font-medium flex items-start gap-2">
                  <Flame size={14} className="text-pink-500 flex-shrink-0 mt-0.5" />
                  <p>{t(getReasonKey())}</p>
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-pink-50 bg-gray-50/50">
                  <div className="mb-5">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t('recipes.ingredients')}</h4>
                    <ul className="space-y-2">
                      {recipe.ingredientsKeys.map((ingKey, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-pink-300">-</span> {t(ingKey)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t('recipes.preparation')}</h4>
                    <ol className="space-y-3">
                      {recipe.stepsKeys.map((stepKey, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="font-bold text-pink-300 w-4">{idx + 1}.</span>
                          <span className="flex-1">{t(stepKey)}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-200">
                    <div className="flex flex-col gap-1 text-sm">
                      <span className="font-bold text-gray-600">Meilleur moment: <span className="text-pink-600 font-medium">{t(recipe.timeKey)}</span></span>
                      <span className="font-bold text-gray-600">Benefice: <span className="text-gray-500 font-normal">{t(recipe.benefitKey)}</span></span>
                    </div>
                  </div>
                </div>
              )}
            </section>
          );
        })}

        {filteredRecipes.length === 0 && (
          <div className="bg-white rounded-3xl p-8 text-center border border-pink-100 shadow-sm mt-4">
            <Search className="mx-auto text-pink-200 mb-3" size={32} />
            <h3 className="text-gray-800 font-bold mb-1">Aucune recette trouvee</h3>
            <p className="text-gray-500 text-sm">Essayez un autre filtre.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recipes;
