// Recettes du protocole « Dose Matinale GLP-1 ».
// Deux parties :
//   1) Le SHOT MATINAL (sel rose + vinaigre de cidre) — quantités personnalisées
//      selon le poids via calculateProtocolQuantities().
//   2) Le MENU 4 REPAS en déficit calorique — la cible kcal s'adapte au poids
//      via getCaloriePlan().
//
// Chaque recette contient : la quantité, le pas à pas et « Pourquoi ça marche ».

import { calculateProtocolQuantities } from '../lib/weightPlan';

export interface RecipeIngredient {
  label: string;
  amount: string;
}

export interface MealRecipe {
  id: string;
  /** Moment de la journée (Petit-déjeuner, Déjeuner...) */
  slot: string;
  title: string;
  /** Calories indicatives de la portion */
  kcal: number;
  ingredients: RecipeIngredient[];
  steps: string[];
  /** Pourquoi ça marche */
  why: string;
}

export interface ShotRecipe {
  title: string;
  /** Fonction principale mise en avant */
  functionTag: string;
  intro: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  why: string;
  /** Conseil d'usage / régularité */
  tip: string;
}

/**
 * Construit la recette du shot matinal avec des quantités adaptées au poids.
 * @param weight poids actuel en kg (utilisé pour personnaliser les doses)
 */
export function getShotMatinal(weight: number): ShotRecipe {
  const q = calculateProtocolQuantities(weight);
  return {
    title: 'Le Shot Matinal',
    functionTag: 'Active les hormones GIP et GLP-1 de manière naturelle',
    intro:
      "Pris à jeun, chaque matin, avec régularité et de la bonne façon, ce shot soutient naturellement la production des hormones GIP et GLP-1 — celles qui régulent l'appétit et favorisent l'utilisation des graisses.",
    ingredients: [
      { label: 'Eau tiède', amount: `${q.water} ml` },
      { label: 'Sel rose de l\'Himalaya', amount: `${q.pinkSalt} g (une petite pincée)` },
      { label: 'Vinaigre de cidre de pomme', amount: `${q.appleCiderVinegar} ml (1 c. à café)` },
      { label: 'Jus de citron frais', amount: `${q.lemon} ml` },
      { label: 'Gingembre frais râpé', amount: `${q.ginger} g` },
      { label: 'Cannelle', amount: `${q.cinnamon} g (une pincée)` },
    ],
    steps: [
      'Faites tiédir l\'eau (ni froide, ni bouillante).',
      'Ajoutez le sel rose et remuez jusqu\'à dissolution complète.',
      'Versez le vinaigre de cidre et le jus de citron frais.',
      'Incorporez le gingembre râpé et la cannelle, puis mélangez bien.',
      'Buvez le shot à jeun, lentement, le matin avant le petit-déjeuner.',
    ],
    why:
      "Le sel rose réhydrate et reminéralise l'organisme au réveil ; le vinaigre de cidre et le citron aident à stabiliser la glycémie et à ralentir la vidange gastrique, ce qui stimule la libération naturelle de GLP-1 et GIP. Le gingembre et la cannelle soutiennent le métabolisme et prolongent la sensation de satiété.",
    tip:
      "Les résultats viennent avec la constance : prenez-le chaque matin, à jeun, pendant au moins 30 jours. Les quantités ci-dessus sont déjà ajustées à votre poids actuel.",
  };
}

/** Menu 4 repas en déficit calorique. */
export const mealPlan: MealRecipe[] = [
  {
    id: 'petit-dejeuner',
    slot: 'Petit-déjeuner',
    title: 'Bol protéiné pomme & cannelle',
    kcal: 350,
    ingredients: [
      { label: 'Flocons d\'avoine', amount: '60 g' },
      { label: 'Lait d\'amande sans sucre', amount: '200 ml' },
      { label: 'Pomme râpée', amount: '1 petite' },
      { label: 'Yaourt grec 0%', amount: '2 c. à soupe' },
      { label: 'Graines de chia', amount: '1 c. à soupe' },
      { label: 'Cannelle', amount: '1/2 c. à café' },
    ],
    steps: [
      'Versez les flocons d\'avoine et le lait d\'amande dans un bol.',
      'Ajoutez la pomme râpée, les graines de chia et la cannelle.',
      'Laissez reposer 5 minutes (ou toute la nuit au frais).',
      'Garnissez du yaourt grec avant de déguster.',
    ],
    why:
      'Riche en fibres et en protéines, ce petit-déjeuner ralentit la digestion et prolonge la satiété toute la matinée — parfait après le shot matinal.',
  },
  {
    id: 'dejeuner',
    slot: 'Déjeuner',
    title: 'Poulet grillé, quinoa & légumes verts',
    kcal: 450,
    ingredients: [
      { label: 'Blanc de poulet', amount: '120 g' },
      { label: 'Quinoa (cru)', amount: '60 g' },
      { label: 'Brocoli', amount: '150 g' },
      { label: 'Épinards frais', amount: '1 poignée' },
      { label: 'Huile d\'olive', amount: '1 c. à café' },
    ],
    steps: [
      'Faites cuire le quinoa selon les instructions, puis égouttez.',
      'Grillez le blanc de poulet assaisonné dans une poêle légèrement huilée.',
      'Faites cuire le brocoli à la vapeur et faites tomber les épinards.',
      'Dressez le tout, arrosez d\'un filet d\'huile d\'olive et servez.',
    ],
    why:
      'Protéines maigres pour préserver le muscle et glucides à index glycémique bas pour une énergie stable sans pic de sucre.',
  },
  {
    id: 'collation',
    slot: 'Collation',
    title: 'Yaourt grec, fruits rouges & chia',
    kcal: 180,
    ingredients: [
      { label: 'Yaourt grec 0%', amount: '150 g' },
      { label: 'Fruits rouges', amount: '80 g' },
      { label: 'Graines de chia', amount: '1 c. à café' },
      { label: 'Amandes', amount: '6 unités' },
    ],
    steps: [
      'Versez le yaourt grec dans un bol.',
      'Ajoutez les fruits rouges et les graines de chia.',
      'Parsemez d\'amandes concassées et dégustez.',
    ],
    why:
      'Cette collation stabilise la glycémie en milieu de journée et coupe l\'envie de sucre avant le dîner.',
  },
  {
    id: 'diner',
    slot: 'Dîner',
    title: 'Saumon, brocoli & filet d\'huile d\'olive',
    kcal: 400,
    ingredients: [
      { label: 'Pavé de saumon', amount: '150 g' },
      { label: 'Brocoli', amount: '150 g' },
      { label: 'Huile d\'olive', amount: '1 c. à café' },
      { label: 'Citron', amount: '1/2' },
      { label: 'Aneth frais', amount: 'au goût' },
    ],
    steps: [
      'Assaisonnez le saumon avec le citron, l\'aneth, sel et poivre.',
      'Cuisez-le au four ou à la poêle 4 à 5 min de chaque côté.',
      'Faites cuire le brocoli à la vapeur jusqu\'à ce qu\'il soit tendre.',
      'Servez avec un filet d\'huile d\'olive.',
    ],
    why:
      'Léger le soir, riche en oméga-3 et en protéines : favorise la récupération et la combustion des graisses pendant le sommeil.',
  },
];

/** Total calorique indicatif du menu (somme des 4 repas). */
export const mealPlanTotalKcal = mealPlan.reduce((n, m) => n + m.kcal, 0);
