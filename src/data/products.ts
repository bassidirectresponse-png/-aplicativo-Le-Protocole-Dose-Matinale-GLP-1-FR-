// Catalogue des produits/programmes de l'application.
// Chaque entrée = un produit. L'app est multi-produits : pour en ajouter un
// nouveau, dupliquez un objet ci-dessous et reliez ses modules/recettes.

export type ProductStatus = 'active' | 'coming_soon';

export interface ProductSummary {
  id: string;
  /** Nom complet du produit */
  title: string;
  /** Sous-titre court (ex: les ingrédients clés) */
  subtitle: string;
  /** Description courte affichée sur la carte */
  description: string;
  /** Badge optionnel ('Votre programme', 'Nouveau'...) */
  badge?: string;
  status: ProductStatus;
  /** Nom de l'icône lucide-react à afficher (voir mapping dans le composant) */
  icon: string;
  /** Classes Tailwind du dégradé de la carte */
  gradient: string;
  /** Route interne ouverte au clic (laisser vide pour les produits 'coming_soon') */
  route?: string;
}

export const products: ProductSummary[] = [
  {
    id: 'dose-matinale-glp1',
    title: 'Le Protocole Dose Matinale GLP-1',
    subtitle: 'Sel rose & vinaigre de cidre',
    description:
      "Le shot matinal qui active GIP et GLP-1 naturellement, plus un menu 4 repas en déficit calorique et 10 cours vidéo.",
    badge: 'Votre programme',
    status: 'active',
    icon: 'Flame',
    gradient: 'from-gray-950 via-rose-950 to-pink-700',
    route: '/courses',
  },
  // --- Exemple de futur produit (décommentez et adaptez) -------------------
  // {
  //   id: 'detox-7-jours',
  //   title: 'Detox 7 Jours',
  //   subtitle: 'Programme court',
  //   description: 'Un protocole de 7 jours pour relancer votre métabolisme.',
  //   status: 'coming_soon',
  //   icon: 'Sparkles',
  //   gradient: 'from-emerald-900 to-teal-700',
  // },
];

export const activeProduct = products.find(p => p.status === 'active') ?? products[0];
