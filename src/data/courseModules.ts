// Cours vidéo du programme « Le Protocole Dose Matinale GLP-1 ».
//
// COMMENT AJOUTER VOS VIDÉOS :
// Pour chaque leçon, collez simplement le lien dans le champ `videoUrl`.
// Formats acceptés automatiquement :
//   • YouTube   -> https://www.youtube.com/watch?v=XXXX  (ou youtu.be/XXXX, /shorts/XXXX)
//   • Vimeo     -> https://vimeo.com/123456789
//   • Fichier   -> https://.../ma-video.mp4 (ou .webm, .mov, .m3u8)
//   • Autre     -> n'importe quel lien d'intégration (iframe)
// Laissez `videoUrl: ''` (vide) tant que la vidéo n'est pas prête :
// la leçon s'affichera comme « Bientôt disponible ».
//
// La vidéo s'ouvre TOUJOURS dans l'application (même page), jamais sur un site externe.

export interface Lesson {
  id: string;
  /** Numéro global de la leçon (1 à 10), utilisé pour la progression */
  number: number;
  title: string;
  description: string;
  /** Collez ici le lien de la vidéo. Vide = « Bientôt disponible ». */
  videoUrl: string;
}

export interface CourseModule {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  lessons: Lesson[];
}

export const courseModules: CourseModule[] = [
  {
    id: 'module-1',
    number: 1,
    title: 'La Fin des Régimes',
    subtitle: 'Bienvenue & état d\'esprit',
    lessons: [
      {
        id: 'lesson-1',
        number: 1,
        title: 'Bienvenue dans votre nouvelle vie',
        description: 'Commencez ici : découvrez comment le protocole va transformer votre rapport au poids, sans privation ni régime strict.',
        videoUrl: '',
      },
      {
        id: 'lesson-2',
        number: 2,
        title: 'Pourquoi vous avez échoué jusqu\'ici',
        description: 'Ce n\'est pas votre faute. Comprenez les vraies raisons des échecs passés pour ne plus jamais les répéter.',
        videoUrl: '',
      },
    ],
  },
  {
    id: 'module-2',
    number: 2,
    title: 'La Science de la Perte de Poids Naturelle',
    subtitle: 'Ce qui se passe dans votre corps',
    lessons: [
      {
        id: 'lesson-3',
        number: 3,
        title: 'Le secret du GLP-1 et du GIP',
        description: 'Comment votre corps va brûler la graisse : le rôle des hormones GLP-1 et GIP et pourquoi le shot matinal les active naturellement.',
        videoUrl: '',
      },
    ],
  },
  {
    id: 'module-3',
    number: 3,
    title: 'Le Protocole en Pratique',
    subtitle: 'Le cœur du programme',
    lessons: [
      {
        id: 'lesson-4',
        number: 4,
        title: 'La Recette en Or : préparer votre Shot Matinal',
        description: 'Les mesures exactes, le pas à pas et les erreurs à éviter pour préparer votre shot au sel rose et vinaigre de cidre.',
        videoUrl: '',
      },
      {
        id: 'lesson-5',
        number: 5,
        title: 'La Routine Parfaite : comment et quand le prendre',
        description: 'Le bon moment, la bonne façon et la régularité qui font toute la différence sur vos résultats.',
        videoUrl: '',
      },
    ],
  },
  {
    id: 'module-4',
    number: 4,
    title: 'Les Accélérateurs de Résultats',
    subtitle: 'Aller plus loin, plus vite',
    lessons: [
      {
        id: 'lesson-6',
        number: 6,
        title: 'Comment manger ce que vous aimez et continuer à mincir',
        description: 'Les stratégies pour garder le plaisir de manger tout en restant en déficit calorique.',
        videoUrl: '',
      },
      {
        id: 'lesson-7',
        number: 7,
        title: 'Que faire si le poids stagne ?',
        description: 'Les ajustements simples pour relancer la perte de poids quand la balance ne bouge plus.',
        videoUrl: '',
      },
    ],
  },
  {
    id: 'module-5',
    number: 5,
    title: 'Bonus & Rituels Secrets',
    subtitle: 'Vos avantages exclusifs',
    lessons: [
      {
        id: 'lesson-8',
        number: 8,
        title: 'Bonus 1 — L\'Astuce du Café',
        description: 'Peau ferme, sans relâchement : le geste à ajouter à votre café pour accompagner la perte de poids.',
        videoUrl: '',
      },
      {
        id: 'lesson-9',
        number: 9,
        title: 'Bonus 2 — Le Rituel Affinant pour la Taille',
        description: '2 minutes par jour : le rituel ciblé pour affiner la taille et tonifier la silhouette.',
        videoUrl: '',
      },
      {
        id: 'lesson-10',
        number: 10,
        title: 'Prochaines étapes & accès à la Communauté Secrète',
        description: 'Comment continuer après le protocole et rejoindre la communauté privée des membres.',
        videoUrl: '',
      },
    ],
  },
];

/** Nombre total de leçons (toutes modules confondus) */
export const totalLessons = courseModules.reduce((n, m) => n + m.lessons.length, 0);

/** Liste à plat de toutes les leçons, dans l'ordre */
export const allLessons: Lesson[] = courseModules.flatMap(m => m.lessons);
