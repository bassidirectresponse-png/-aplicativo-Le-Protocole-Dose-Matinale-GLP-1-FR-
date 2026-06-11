// Catalogue des produits/programmes — la « vitrine » de l'accueil.
// Chaque entrée = une carte façon Netflix (capa + nom). Pour ajouter un
// produit : dupliquez un objet, choisissez un dégradé et une route.

export type ProductStatus = 'active' | 'coming_soon';

export interface ProductSummary {
  id: string;
  /** Nom complet du produit (affiché en serif sur la capa) */
  title: string;
  /** Sous-titre court (ingrédients clés / promesse) */
  subtitle: string;
  /** Description courte affichée sous le titre */
  description: string;
  /** Badge optionnel ('Programme principal', 'Nouveau'...) */
  badge?: string;
  status: ProductStatus;
  /** Nom de l'icône lucide-react (mapping dans ProductCard) */
  icon: string;
  /** Classes Tailwind du dégradé de la capa */
  gradient: string;
  /** Couleur d'accent des éléments décoratifs de la capa */
  accent: string;
  /** Route interne ouverte au clic */
  route: string;
  /** Petit texte d'appel en bas de la capa */
  cta: string;
}

export const products: ProductSummary[] = [
  {
    id: 'dose-matinale-glp1',
    title: 'Le Protocole Dose Matinale GLP-1',
    subtitle: 'Sel rose & vinaigre de cidre',
    description: 'Le shot matinal qui active GIP et GLP-1, avec votre menu 4 repas personnalisé.',
    badge: 'Programme principal',
    status: 'active',
    icon: 'Flame',
    gradient: 'from-[#3b0a23] via-[#7e1d44] to-[#c4456f]',
    accent: 'bg-rose-300/30',
    route: '/recipes',
    cta: 'Ouvrir le protocole',
  },
  {
    id: 'accelerateur-10x',
    title: "L'Accélérateur de Résultats 10x",
    subtitle: 'Boissons & rituels métaboliques',
    description: 'Les recettes naturelles qui potentialisent la perte de poids, jour après jour.',
    badge: 'Nouveau',
    status: 'active',
    icon: 'Zap',
    gradient: 'from-[#2a1158] via-[#5b2a9d] to-[#9d6bdb]',
    accent: 'bg-violet-300/30',
    route: '/produit/accelerateur-10x',
    cta: 'Découvrir les recettes',
  },
  {
    id: 'zero-retention',
    title: 'Protocole Zéro Rétention & Fermeté',
    subtitle: 'Drainage naturel & peau ferme',
    description: "Éliminez l'eau retenue et raffermissez votre peau pendant l'amincissement.",
    badge: 'Nouveau',
    status: 'active',
    icon: 'Droplets',
    gradient: 'from-[#062c3e] via-[#0e5b71] to-[#2fa3ad]',
    accent: 'bg-cyan-300/30',
    route: '/produit/zero-retention',
    cta: 'Découvrir les recettes',
  },
  {
    id: 'cours-video',
    title: 'Les Cours Vidéo',
    subtitle: '5 modules · 10 leçons guidées',
    description: 'Le programme complet en vidéo, du mindset au protocole pas à pas.',
    badge: 'Formation',
    status: 'active',
    icon: 'PlayCircle',
    gradient: 'from-[#1c1320] via-[#3d2030] to-[#8a4a5e]',
    accent: 'bg-pink-300/25',
    route: '/courses',
    cta: 'Voir les leçons',
  },
];

export const activeProduct = products[0];
