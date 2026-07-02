import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CookingPot,
  FlaskConical,
  Lock,
  Play,
  PlayCircle,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { lessons, totalLessons, lessonHasVideo } from '../data/courseModules';
import type { Lesson } from '../data/courseModules';
import { CourseVideoModal } from '../components/video/CourseVideoModal';

// Les cours se débloquent ce nombre de jours après l'achat (création du compte).
// Mettez une valeur élevée (ex: 9999) pour tout garder verrouillé,
// ou 0 pour tout débloquer immédiatement.
const UNLOCK_AFTER_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

// Mapping nom d'icône (data) -> composant lucide.
const THEME_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Brain,
  FlaskConical,
  CalendarDays,
  Sparkles,
  Trophy,
};

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

  // ── Verrouillage temporisé : 7 jours après l'achat ──────────────────
  const createdAt = user?.created_at ? new Date(user.created_at) : null;
  const unlockAt = createdAt ? new Date(createdAt.getTime() + UNLOCK_AFTER_DAYS * DAY_MS) : null;
  const now = new Date();
  const isLocked = !unlockAt || now < unlockAt;
  const daysLeft = unlockAt
    ? Math.max(0, Math.ceil((unlockAt.getTime() - now.getTime()) / DAY_MS))
    : UNLOCK_AFTER_DAYS;

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
    if (!lessonHasVideo(lesson)) return; // vidéo pas encore prête
    setActiveLesson(lesson);
    if (progressData[lesson.number]?.status !== 'completed') {
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
          <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em]">
            {totalLessons} leçons · Programme vidéo
          </p>
          <h1 className="font-display text-3xl leading-tight mt-2">Les Cours Vidéo</h1>
          <p className="text-white/85 text-base leading-relaxed mt-3">
            Suivez les leçons dans l'ordre : chaque vidéo s'ouvre ici, dans l'application.
          </p>
          {!isLocked && (
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white/80 uppercase">
                  {completedCount}/{totalLessons} terminées
                </span>
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
                  {daysLeft > 0 && (
                    <>
                      {' '}
                      Encore <strong>{daysLeft} {daysLeft > 1 ? 'jours' : 'jour'}</strong>.
                    </>
                  )}
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
                  Regardez les leçons dans l'ordre, de « Pourquoi votre corps est bloqué » jusqu'au
                  maintien de vos résultats.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Parcours des leçons (roadmap) */}
      <div className="px-5 mt-7">
        <p className="text-[11px] font-black text-pink-500 uppercase tracking-[0.18em] mb-4">
          Votre parcours
        </p>

        <div>
          {lessons.map((lesson, index) => {
            const status = progressData[lesson.number]?.status || 'not_started';
            const isCompleted = status === 'completed';
            const isInProgress = status === 'in_progress';
            const ready = lessonHasVideo(lesson);
            const isLast = index === lessons.length - 1;
            const Icon = THEME_ICONS[lesson.icon] ?? PlayCircle;
            const disabled = isLocked || !ready;

            return (
              <div key={lesson.id} className="relative flex gap-4">
                {/* Rail : pastille numérotée + trait de liaison */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white flex-shrink-0 relative shadow-lg ${
                      isLocked
                        ? 'bg-gray-300 shadow-none'
                        : `bg-gradient-to-br ${lesson.gradient}`
                    }`}
                  >
                    {isLocked ? (
                      <Lock size={20} />
                    ) : isCompleted ? (
                      <CheckCircle2 size={26} />
                    ) : (
                      <Icon size={24} className="text-white" />
                    )}
                    {!isLocked && !isCompleted && (
                      <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white text-gray-900 text-[11px] font-black flex items-center justify-center shadow">
                        {lesson.number}
                      </span>
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={`w-[3px] flex-1 my-2 rounded-full ${
                        isCompleted ? 'bg-green-300' : 'bg-pink-100'
                      }`}
                    />
                  )}
                </div>

                {/* Carte cliquable de la leçon */}
                <button
                  onClick={() => handleOpenLesson(lesson)}
                  disabled={disabled}
                  className={`flex-1 mb-4 text-left rounded-3xl border p-4 transition-all ${
                    isLocked
                      ? 'bg-gray-50 border-gray-100 cursor-default'
                      : ready
                        ? 'bg-white border-pink-100/70 shadow-soft hover:shadow-md hover:border-pink-200 active:scale-[0.99]'
                        : 'bg-white/70 border-gray-100 cursor-default'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[10px] font-black uppercase tracking-wider ${
                          isLocked ? 'text-gray-400' : 'text-pink-500'
                        }`}
                      >
                        Leçon {lesson.number} · {lesson.theme}
                      </p>
                      <h3
                        className={`font-display text-lg leading-tight mt-0.5 ${
                          isLocked ? 'text-gray-500' : 'text-gray-900'
                        }`}
                      >
                        {lesson.title}
                      </h3>
                    </div>

                    {/* Statut / action */}
                    <div className="flex-shrink-0">
                      {isLocked ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-gray-400 bg-gray-200 px-2 py-1 rounded-full">
                          <Lock size={10} /> Verrouillé
                        </span>
                      ) : isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          <CheckCircle2 size={11} /> Terminé
                        </span>
                      ) : ready ? (
                        <div className="w-11 h-11 rounded-2xl bg-pink-500 text-white flex items-center justify-center shadow-md shadow-pink-500/30">
                          <Play size={19} fill="currentColor" className="ml-0.5" />
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                          Bientôt
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description (masquée si verrouillé) */}
                  {isLocked ? (
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Lock size={11} /> Se débloque 7 jours après l'achat
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 leading-relaxed mt-2">{lesson.description}</p>
                  )}

                  {/* Pied de carte : appel à l'action */}
                  {!isLocked && ready && !isCompleted && (
                    <div className="mt-3 flex items-center gap-1 text-xs font-black text-pink-500">
                      {isInProgress ? 'Reprendre la leçon' : 'Regarder la leçon'}
                      <ChevronRight size={15} />
                    </div>
                  )}
                  {!isLocked && isCompleted && (
                    <div className="mt-3 flex items-center gap-1 text-xs font-black text-green-600">
                      Revoir la leçon
                      <ChevronRight size={15} />
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Raccourci vers la recette (toujours disponible) */}
      <div className="px-5 mt-3">
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
      {activeLesson && activeLesson.video && !isLocked && (
        <CourseVideoModal
          account={activeLesson.video.account}
          player={activeLesson.video.player}
          title={`Leçon ${activeLesson.number} — ${activeLesson.title}`}
          subtitle={activeLesson.theme}
          onClose={() => setActiveLesson(null)}
          onComplete={() => handleComplete(activeLesson)}
        />
      )}
    </div>
  );
};

export default Courses;
