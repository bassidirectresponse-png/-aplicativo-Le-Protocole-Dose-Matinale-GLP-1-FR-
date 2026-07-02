// Cours vidéo du programme « Le Protocole Dose Matinale GLP-1 ».
//
// Chaque leçon = une vidéo VTurb / ConverteAI (lecteur vertical 9:16) qui
// s'ouvre TOUJOURS dans l'application, jamais sur un site externe.
//
// Les leçons avec une vidéo sont TOUJOURS accessibles.
// Les leçons marquées `comingSoon: true` (vidéo pas encore prête) s'affichent
// comme « Prochainement » : un teaser verrouillé qui donne envie de revenir.
//
// COMMENT PUBLIER UNE LEÇON « À VENIR » :
// 1. Récupérez l'ID du lecteur VTurb (celui du <vturb-smartplayer id="vid-XXXX">,
//    sans le préfixe « vid- »).
// 2. Renseignez-le dans `video` et passez `comingSoon` à `false`.

/** Identifiant de compte ConverteAI (commun à toutes les vidéos du cours). */
export const COURSE_ACCOUNT = 'b3a8e032-a485-4422-ae3b-d3823b0a8869';

export interface LessonVideo {
  /** Compte ConverteAI (voir COURSE_ACCOUNT). */
  account: string;
  /** ID du lecteur VTurb (sans le préfixe « vid- »). */
  player: string;
}

export interface Lesson {
  id: string;
  /** Numéro de la leçon (1..N), utilisé pour la progression. */
  number: number;
  title: string;
  /** Court intitulé du thème (badge/eyebrow). */
  theme: string;
  description: string;
  /** Nom de l'icône lucide-react (mapping dans Courses.tsx). */
  icon: string;
  /** Dégradé Tailwind de la pastille/numéro de la leçon. */
  gradient: string;
  /** Couleur d'accent (texte) du thème. */
  accent: string;
  /** Vidéo VTurb de la leçon. `null` tant que la vidéo n'est pas publiée. */
  video: LessonVideo | null;
  /** `true` = leçon « Prochainement » (teaser verrouillé). */
  comingSoon?: boolean;
  /** Petit texte d'attente affiché sur le teaser (ex: « Bientôt »). */
  eta?: string;
}

export const lessons: Lesson[] = [
  // ── Leçons disponibles (toujours accessibles) ─────────────────────────
  {
    id: 'lesson-1',
    number: 1,
    title: 'Pourquoi Votre Corps Est Bloqué',
    theme: 'Comprendre',
    description:
      "La vraie raison pour laquelle la perte de poids vous résiste — et pourquoi ce n'est pas votre faute. Comprenez le blocage hormonal avant de le débloquer.",
    icon: 'Brain',
    gradient: 'from-[#2a1158] via-[#5b2a9d] to-[#9d6bdb]',
    accent: 'text-violet-300',
    video: { account: COURSE_ACCOUNT, player: '6a33225a20af52de24a9de06' },
  },
  {
    id: 'lesson-2',
    number: 2,
    title: "Le Shot Complet et Comment Utiliser l'Application",
    theme: 'Le protocole',
    description:
      "La recette exacte du Shot Matinal, pas à pas, et comment utiliser l'application au quotidien pour ne jamais vous perdre.",
    icon: 'FlaskConical',
    gradient: 'from-[#3b0a23] via-[#7e1d44] to-[#c4456f]',
    accent: 'text-rose-300',
    video: { account: COURSE_ACCOUNT, player: '6a332236cf79a2944003c45e' },
  },
  {
    id: 'lesson-3',
    number: 3,
    title: 'Les 15 Premiers Jours',
    theme: 'Le démarrage',
    description:
      "Votre feuille de route pour les 2 premières semaines : ce qui se passe dans votre corps, à quoi vous attendre et comment tenir le cap.",
    icon: 'CalendarDays',
    gradient: 'from-[#3a230a] via-[#7e4d1d] to-[#c48a45]',
    accent: 'text-amber-300',
    video: { account: COURSE_ACCOUNT, player: '6a33226e20af52de24a9de24' },
  },
  {
    id: 'lesson-4',
    number: 4,
    title: 'Taille, Cellulite et Peau Ferme',
    theme: 'Le corps',
    description:
      "Les rituels ciblés pour affiner la taille, atténuer la cellulite et raffermir la peau pendant que vous perdez du poids.",
    icon: 'Sparkles',
    gradient: 'from-[#062c3e] via-[#0e5b71] to-[#2fa3ad]',
    accent: 'text-cyan-300',
    video: { account: COURSE_ACCOUNT, player: '6a3322463c053a877e77ef3b' },
  },
  {
    id: 'lesson-5',
    number: 5,
    title: 'Un Résultat Pour Toujours',
    theme: 'Le maintien',
    description:
      "Comment stabiliser votre nouveau poids et garder vos résultats à vie, sans effet yo-yo ni frustration.",
    icon: 'Trophy',
    gradient: 'from-[#052e1f] via-[#0e6b47] to-[#2fad78]',
    accent: 'text-emerald-300',
    video: { account: COURSE_ACCOUNT, player: '6a332226d4dde971df314174' },
  },

  // ── Leçons « Prochainement » (teasers verrouillés) ────────────────────
  // Pour publier : ajoutez le `video` VTurb et passez `comingSoon` à false.
  {
    id: 'lesson-6',
    number: 6,
    title: 'Recettes Brûle-Graisse Avancées',
    theme: 'Bonus',
    description:
      "De nouvelles boissons et recettes pour intensifier la combustion des graisses, semaine après semaine.",
    icon: 'Flame',
    gradient: 'from-[#3a0f0a] via-[#8a2d1d] to-[#d9603f]',
    accent: 'text-orange-300',
    video: null,
    comingSoon: true,
    eta: 'Bientôt',
  },
  {
    id: 'lesson-7',
    number: 7,
    title: 'Le Rituel du Soir Anti-Fringales',
    theme: 'Bonus',
    description:
      "La routine du soir qui coupe les envies de sucre et améliore le sommeil pour de meilleurs résultats.",
    icon: 'Moon',
    gradient: 'from-[#0f1440] via-[#2a2f8a] to-[#5b63d9]',
    accent: 'text-indigo-300',
    video: null,
    comingSoon: true,
    eta: 'Bientôt',
  },
  {
    id: 'lesson-8',
    number: 8,
    title: 'Vos Questions, Nos Réponses',
    theme: 'Communauté',
    description:
      "Une séance vidéo dédiée à vos questions les plus fréquentes pour lever tous vos derniers doutes.",
    icon: 'MessagesSquare',
    gradient: 'from-[#052e2a] via-[#0e6b60] to-[#2fada0]',
    accent: 'text-teal-300',
    video: null,
    comingSoon: true,
    eta: 'Bientôt',
  },
];

/** Vrai si la leçon a une vidéo publiée et accessible. */
export function lessonReady(lesson: Lesson): boolean {
  return !lesson.comingSoon && lesson.video != null;
}

/** Leçons disponibles (avec vidéo). Sert de dénominateur à la progression. */
export const availableLessons = lessons.filter(lessonReady);

/** Nombre de leçons disponibles (progression). */
export const totalLessons = availableLessons.length;
