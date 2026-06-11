import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ChevronRight, Clock, CookingPot, Lock, Play, PlayCircle } from 'lucide-react';
import { courseModules, totalLessons } from '../data/courseModules';
import type { Lesson } from '../data/courseModules';
import { hasVideo } from '../lib/videoEmbed';
import { VideoPlayer } from '../components/video/VideoPlayer';

// Les cours se débloquent ce nombre de jours après l'achat (création du compte).
// Mettez une valeur élevée (ex: 9999) pour tout garder verrouillé,
// ou 0 pour tout débloquer immédiatement.
const UNLOCK_AFTER_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

interface CourseProgress {
  step_number: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

export const Courses: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [progressData, setProgressData] = useState<Record<number, CourseProgress>>({});
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [openModule, setOpenModule] = useState<string>(courseModules[0]?.id ?? '');

  // ── Verrouillage temporisé : 7 jours après l'achat ──────────────────
  const createdAt = user?.created_at ? new Date(user.created_at) : null;
  const unlockAt = createdAt ? new Date(createdAt.getTime() + UNLOCK_AFTER_DAYS * DAY_MS) : null;
  const now = new Date();
  const isLocked = !unlockAt || now < unlockAt;
  const daysLeft = unlockAt ? Math.max(0, Math.ceil((unlockAt.getTime() - now.getTime()) / DAY_MS)) : UNLOCK_AFTER_DAYS;

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
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

  const handleOpenLesson = (lesson: Lesson) => {
    if (isLocked) return; // verrouillé : on n'ouvre pas
    setActiveLesson(lesson);
    if (hasVideo(lesson.videoUrl) && progressData[lesson.number]?.status !== 'completed') {
      updateProgress(lesson.number, 'in_progress');
    }
  };

  const handleComplete = (lesson: Lesson) => {
    updateProgress(lesson.number, 'completed');
    setActiveLesson(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="w-12 h-12 rounded-full border-4 border-pink-200 border-t-pink-500 animate-spin" />
      </div>
    );
  }

  const completedCount = Object.values(progressData).filter(p => p.status === 'completed').length;
  const pct = Math.round((completedCount / totalLessons) * 100);

  return (
    <div className="min-h-screen bg-[#fdf2f8] pb-28">
      {/* En-tête héros (capa du produit) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1c1320] via-[#3d2030] to-[#8a4a5e] text-white">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-pink-300/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative px-5 pt-6 pb-8">
          <button
            onClick={() => navigate('/')}
            aria-label="Retour à l'accueil"
            className="inline-flex items-center gap-2 text-white/80 text-sm font-semibold mb-6 cursor-pointer hover:text-white transition-colors duration-200 py-2 pr-3 -ml-1"
          >
            <ArrowLeft size={18} /> Accueil
          </button>
          <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em]">5 modules · 10 leçons guidées</p>
          <h1 className="font-display text-3xl leading-tight mt-2">Les Cours Vidéo</h1>
          <p className="text-white/85 text-base leading-relaxed mt-3">
            Suivez les leçons dans l'ordre : chaque vidéo s'ouvre ici, dans l'application.
          </p>
          {!isLocked && (
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white/80 uppercase">{completedCount}/{totalLessons} terminées</span>
                <span className="text-xs font-bold text-white/60">{pct}%</span>
              </div>
              <div className="w-full h-2.5 bg-white/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-400 to-rose-400 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bannière : état du verrouillage */}
      <div className="px-5 mt-5">
        {isLocked ? (
          <div className="bg-gray-950 text-white rounded-3xl p-5 shadow-xl shadow-pink-200/40">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-pink-500 flex items-center justify-center flex-shrink-0">
                <Lock size={22} />
              </div>
              <div>
                <h2 className="font-black text-lg">Vos cours arrivent bientôt</h2>
                <p className="text-sm text-gray-300 leading-relaxed mt-1">
                  Les vidéos se débloquent <strong>7 jours après l'achat</strong>.
                  {daysLeft > 0 && <> Encore <strong>{daysLeft} {daysLeft > 1 ? 'jours' : 'jour'}</strong>.</>}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-950 text-white rounded-3xl p-5 shadow-xl shadow-pink-200/40">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-pink-500 flex items-center justify-center flex-shrink-0">
                <PlayCircle size={24} />
              </div>
              <div>
                <h2 className="font-black text-lg">Avant de commencer</h2>
                <p className="text-sm text-gray-300 leading-relaxed mt-1">
                  Commencez par le Module 1, regardez chaque leçon dans l'ordre, puis appliquez le Shot Matinal.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modules en accordéon */}
      <div className="px-5 mt-6 space-y-4">
        {courseModules.map(module => {
          const isOpen = openModule === module.id;
          const moduleCompleted = module.lessons.filter(l => progressData[l.number]?.status === 'completed').length;

          return (
            <div key={module.id} className="bg-white rounded-3xl border border-white shadow-soft overflow-hidden">
              <button
                onClick={() => setOpenModule(isOpen ? '' : module.id)}
                className="w-full flex items-center gap-3 p-5 text-left"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center font-black text-lg flex-shrink-0 relative">
                  {module.number}
                  {isLocked && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-950 flex items-center justify-center">
                      <Lock size={11} className="text-white" />
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-pink-500 uppercase tracking-wider">Module {module.number}</p>
                  <h3 className="font-display text-lg text-gray-900 leading-tight">{module.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{module.subtitle}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {!isLocked && <span className="text-[10px] font-black text-gray-400">{moduleCompleted}/{module.lessons.length}</span>}
                  <ChevronRight
                    size={20}
                    className={`text-pink-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                  />
                </div>
              </button>

              {isOpen && (
                <div className="px-3 pb-3 space-y-2">
                  {module.lessons.map(lesson => {
                    const status = progressData[lesson.number]?.status || 'not_started';
                    const isCompleted = status === 'completed';
                    const isInProgress = status === 'in_progress';
                    const ready = hasVideo(lesson.videoUrl);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => handleOpenLesson(lesson)}
                        disabled={isLocked}
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-colors ${
                          isLocked ? 'bg-gray-50 cursor-default' : 'bg-[#fff7fb] hover:bg-pink-50'
                        }`}
                      >
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isLocked
                              ? 'bg-gray-200 text-gray-400'
                              : isCompleted
                                ? 'bg-green-100 text-green-600'
                                : ready
                                  ? 'bg-pink-500 text-white'
                                  : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {isLocked ? (
                            <Lock size={17} />
                          ) : isCompleted ? (
                            <CheckCircle2 size={20} />
                          ) : ready ? (
                            <Play size={18} fill="currentColor" className="ml-0.5" />
                          ) : (
                            <Clock size={16} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-black text-sm leading-tight ${isLocked ? 'text-gray-500' : 'text-gray-900'}`}>
                            <span className="text-pink-400">{lesson.number}.</span> {lesson.title}
                          </p>
                          {isLocked ? (
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                              <Lock size={11} /> Se débloque 7 jours après l'achat
                            </p>
                          ) : (
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{lesson.description}</p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {isLocked ? (
                            <span className="text-[9px] font-black uppercase text-gray-400 bg-gray-200 px-2 py-1 rounded-full">Verrouillé</span>
                          ) : isCompleted ? (
                            <span className="text-[9px] font-black uppercase text-green-600 bg-green-100 px-2 py-1 rounded-full">Terminé</span>
                          ) : isInProgress ? (
                            <span className="text-[9px] font-black uppercase text-pink-600 bg-pink-100 px-2 py-1 rounded-full">En cours</span>
                          ) : !ready ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                              <Clock size={10} /> Bientôt
                            </span>
                          ) : (
                            <ChevronRight size={18} className="text-pink-300" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Raccourci vers la recette (toujours disponible) */}
      <div className="px-5 mt-5">
        <button
          onClick={() => navigate('/recipes')}
          className="w-full bg-white border border-pink-100 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center">
              <CookingPot size={23} />
            </div>
            <div>
              <p className="font-black text-gray-900">Le Shot Matinal & le menu</p>
              <p className="text-xs text-gray-500 mt-0.5">Disponible dès maintenant</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-pink-500" />
        </button>
      </div>

      {/* Lecteur vidéo in-app (seulement si déverrouillé) */}
      {activeLesson && !isLocked && (
        <VideoPlayer
          url={activeLesson.videoUrl}
          title={`Leçon ${activeLesson.number} — ${activeLesson.title}`}
          subtitle={activeLesson.description}
          onClose={() => setActiveLesson(null)}
          onComplete={() => handleComplete(activeLesson)}
        />
      )}
    </div>
  );
};

export default Courses;
