import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, ChevronRight, CookingPot, Play, PlayCircle, X } from 'lucide-react';
import { recipesData } from '../data/recipes';

const COURSE_VIDEOS = [
  { id: 'KWnxEuTSSgM' },
  { id: 'H5cFNGf8QdA' },
  { id: 'osWQddCS6Y8' },
  { id: 'p2NXn32qlpw' },
  { id: '7MMwBpDtjXQ' },
];

interface CourseProgress {
  step_number: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

const RECIPE_LINKS: Record<number, string[]> = {
  1: ['morning-pink-salt-lemon', 'pomegranate-antioxidant-bowl'],
  2: ['pink-salt-burn-shot'],
  3: ['green-protein-smoothie', 'cinnamon-apple-oats'],
  4: ['night-craving-shot', 'chia-coconut-pudding'],
  5: ['grilled-salmon-broccoli', 'fat-burning-soup'],
};

const RECIPE_TITLE_KEYS = new Map(recipesData.map(recipe => [recipe.id, recipe.titleKey]));

export const Courses: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [progressData, setProgressData] = useState<Record<number, CourseProgress>>({});
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('course_progress')
          .select('*')
          .eq('user_id', user.id);

        if (error && error.code !== '42P01') throw error;

        const map: Record<number, CourseProgress> = {};
        data?.forEach((p: CourseProgress) => {
          map[p.step_number] = p;
        });
        setProgressData(map);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [user]);

  const updateProgress = async (stepNumber: number, status: 'in_progress' | 'completed') => {
    if (!user) return;

    setProgressData(prev => ({ ...prev, [stepNumber]: { step_number: stepNumber, status } }));

    try {
      const existing = progressData[stepNumber];
      if (existing) {
        await supabase
          .from('course_progress')
          .update({ status, updated_at: new Date().toISOString() })
          .match({ user_id: user.id, step_number: stepNumber });
      } else {
        await supabase
          .from('course_progress')
          .insert({ user_id: user.id, step_number: stepNumber, status });
      }
    } catch (err) {
      console.error('Failed to update progress', err);
    }
  };

  const handleOpenVideo = (stepNumber: number) => {
    setActiveModal(stepNumber);
    if (progressData[stepNumber]?.status !== 'completed') {
      updateProgress(stepNumber, 'in_progress');
    }
  };

  const handleCompleteVideo = (stepNumber: number) => {
    updateProgress(stepNumber, 'completed');
    setActiveModal(null);
  };

  const navigateToRecipe = (recipeId: string) => {
    navigate('/recipes', { state: { scrollTo: recipeId } });
  };

  const scrollChapters = (direction: 'left' | 'right') => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const distance = Math.min(380, carousel.clientWidth * 0.86);
    carousel.scrollBy({ left: direction === 'right' ? distance : -distance, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="w-12 h-12 rounded-full border-4 border-pink-200 border-t-pink-500 animate-spin" />
      </div>
    );
  }

  const completedCount = Object.values(progressData).filter(p => p.status === 'completed').length;
  const totalSteps = COURSE_VIDEOS.length;

  return (
    <div className="min-h-screen bg-[#fff7fb] pb-28">
      <div className="px-5 pt-8 pb-5 bg-white border-b border-pink-100">
        <p className="text-pink-500 text-xs font-bold uppercase tracking-widest">Programme video</p>
        <h1 className="text-3xl font-black text-gray-900 mt-1">{t('courses.title', 'Cours')}</h1>
        <p className="text-gray-500 text-sm mt-2 leading-relaxed">
          Regardez les chapitres comme une serie: commencez au 1, terminez la video, puis passez au chapitre suivant.
        </p>
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-pink-500 uppercase">{completedCount}/{totalSteps} termines</span>
            <span className="text-xs font-bold text-gray-400">{Math.round((completedCount / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full h-2.5 bg-pink-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-700"
              style={{ width: `${(completedCount / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="px-5 mt-5">
        <div className="bg-gray-950 text-white rounded-3xl p-5 shadow-xl shadow-pink-200/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-pink-500 flex items-center justify-center flex-shrink-0">
              <PlayCircle size={24} />
            </div>
            <div>
              <h2 className="font-black text-lg">Avant de commencer</h2>
              <p className="text-sm text-gray-300 leading-relaxed mt-1">
                Installez-vous, lancez le chapitre 1 et appliquez le shot seulement apres avoir compris les doses. Les recettes liees a chaque video sont juste en dessous du chapitre.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="px-5 flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900">Chapitres</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-bold">glissez</span>
            <button
              onClick={() => scrollChapters('left')}
              aria-label="Chapitre precedent"
              className="w-9 h-9 rounded-full bg-white border border-pink-100 text-gray-700 shadow-sm flex items-center justify-center"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scrollChapters('right')}
              aria-label="Chapitre suivant"
              className="w-9 h-9 rounded-full bg-gray-950 text-white shadow-sm flex items-center justify-center"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div ref={carouselRef} className="mt-4 flex gap-4 overflow-x-auto snap-x snap-mandatory px-5 pb-4 hide-scrollbar scroll-smooth">
          {[1, 2, 3, 4, 5].map(step => {
            const video = COURSE_VIDEOS[step - 1];
            const status = progressData[step]?.status || 'not_started';
            const isCompleted = status === 'completed';
            const isInProgress = status === 'in_progress';

            return (
              <article
                key={step}
                className="w-[86%] flex-shrink-0 snap-center bg-white rounded-3xl overflow-hidden border border-pink-100 shadow-sm"
              >
                <button
                  onClick={() => handleOpenVideo(step)}
                  className="relative w-full aspect-video bg-gray-950 overflow-hidden text-left"
                >
                  <img
                    src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                    alt=""
                    className="w-full h-full object-cover opacity-80"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute left-4 bottom-4 right-4 flex items-end justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase text-white backdrop-blur">
                        Chapitre {step}
                      </span>
                      <h3 className="text-white text-lg font-black mt-2 leading-tight">{t(`courses.step${step}_title`)}</h3>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-white text-pink-500 flex items-center justify-center shadow-lg">
                      <Play size={23} fill="currentColor" className="ml-0.5" />
                    </div>
                  </div>
                </button>

                <div className="p-5">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                      isCompleted ? 'bg-green-100 text-green-700' : isInProgress ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {isCompleted ? t('courses.status_completed', 'Termine') : isInProgress ? t('courses.status_in_progress', 'En cours') : t('courses.status_not_started', 'A commencer')}
                    </span>
                    {isCompleted && <CheckCircle2 size={18} className="text-green-500" />}
                  </div>

                  <p className="text-sm text-gray-500 leading-relaxed min-h-[58px]">
                    {t(`courses.step${step}_desc`)}
                  </p>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-black text-gray-400 uppercase mb-2">Recettes associees</p>
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                      {RECIPE_LINKS[step].map(recipeId => {
                        const titleKey = RECIPE_TITLE_KEYS.get(recipeId);
                        const label = titleKey ? t(titleKey) : 'Recette';

                        return (
                          <button
                            key={recipeId}
                            onClick={() => navigateToRecipe(recipeId)}
                            className={`flex-shrink-0 max-w-[210px] rounded-xl px-3 py-2 text-xs font-black flex items-center gap-2 ${
                              recipeId === 'pink-salt-burn-shot'
                                ? 'bg-pink-500 text-white'
                                : 'bg-pink-50 text-pink-600'
                            }`}
                          >
                            <CookingPot size={14} />
                            <span className="truncate">{recipeId === 'pink-salt-burn-shot' ? 'Shot principal' : label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenVideo(step)}
                    className="mt-5 w-full bg-gray-950 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2"
                  >
                    Lancer le chapitre <ChevronRight size={18} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="px-5 mt-2">
        <button
          onClick={() => navigateToRecipe('pink-salt-burn-shot')}
          className="w-full bg-white border border-pink-100 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center">
              <CookingPot size={23} />
            </div>
            <div>
              <p className="font-black text-gray-900">Shot principal</p>
              <p className="text-xs text-gray-500 mt-0.5">Ajustee avec votre poids actuel</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-pink-500" />
        </button>
      </div>

      {activeModal && COURSE_VIDEOS[activeModal - 1]?.id && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-fade-in backdrop-blur-md">
          <div className="flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent">
            <h3 className="text-white font-bold text-sm truncate flex-1 pr-4">
              Chapitre {activeModal}: {t(`courses.step${activeModal}_title`)}
            </h3>
            <button
              onClick={() => setActiveModal(null)}
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors flex-shrink-0"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center w-full px-4">
            <div className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${COURSE_VIDEOS[activeModal - 1].id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title="Course Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>

          <div className="p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center pb-safe">
            <button
              onClick={() => handleCompleteVideo(activeModal)}
              className="bg-green-500 hover:bg-green-600 text-white font-extrabold py-4 px-8 rounded-2xl shadow-lg shadow-green-500/30 transition-all flex items-center gap-2 text-lg w-full max-w-sm justify-center"
            >
              <CheckCircle2 size={22} />
              {t('courses.mark_complete', 'Marquer comme termine')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
