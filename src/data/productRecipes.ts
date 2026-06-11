// Recettes des produits « Accélérateur de Résultats 10x » et
// « Protocole Zéro Rétention & Fermeté ».
// Chaque recette contient : la quantité, le pas à pas et « Pourquoi ça marche ».
// La page générique src/pages/ProductRecipes.tsx lit ces données par id produit.

export interface NaturalRecipe {
  id: string;
  /** Moment conseillé (Au réveil, Avant le déjeuner...) */
  moment: string;
  title: string;
  /** Bénéfice principal en une phrase */
  benefit: string;
  ingredients: { label: string; amount: string }[];
  steps: string[];
  /** Pourquoi ça marche */
  why: string;
}

export interface RecipeProductData {
  id: string;
  title: string;
  subtitle: string;
  /** Texte d'introduction sous le héros */
  intro: string;
  /** Conseil d'usage global du protocole */
  usage: string;
  gradient: string;
  recipes: NaturalRecipe[];
}

export const recipeProducts: Record<string, RecipeProductData> = {
  // ════════════════════════════════════════════════════════════════
  // L'ACCÉLÉRATEUR DE RÉSULTATS 10X
  // ════════════════════════════════════════════════════════════════
  'accelerateur-10x': {
    id: 'accelerateur-10x',
    title: "L'Accélérateur de Résultats 10x",
    subtitle: 'Boissons & rituels métaboliques',
    intro:
      "Des recettes naturelles, simples et délicieuses, à intégrer à votre journée pour potentialiser les effets du Shot Matinal et accélérer la perte de poids.",
    usage:
      "Choisissez 1 à 2 recettes par jour selon le moment. La constance compte plus que la quantité : mieux vaut une recette chaque jour que trois recettes une fois par semaine.",
    gradient: 'from-[#2a1158] via-[#5b2a9d] to-[#9d6bdb]',
    recipes: [
      {
        id: 'the-vert-bruleur',
        moment: 'Milieu de matinée',
        title: 'Le Thé Vert Brûleur',
        benefit: 'Active la thermogenèse et la combustion des graisses',
        ingredients: [
          { label: 'Thé vert (sencha ou matcha)', amount: '1 c. à café (2 g)' },
          { label: 'Eau chaude (non bouillante, ~80°C)', amount: '250 ml' },
          { label: 'Gingembre frais en lamelles', amount: '3 lamelles fines' },
          { label: 'Jus de citron', amount: '1/2 citron' },
        ],
        steps: [
          "Faites chauffer l'eau sans la faire bouillir (l'eau bouillante détruit les catéchines).",
          'Infusez le thé vert et le gingembre pendant 3 minutes.',
          'Filtrez, laissez tiédir 2 minutes puis ajoutez le jus de citron.',
          'Buvez en milieu de matinée, entre le petit-déjeuner et le déjeuner.',
        ],
        why:
          "Les catéchines du thé vert (EGCG) associées au gingembre augmentent la dépense énergétique et l'oxydation des graisses. Le citron ajoute de la vitamine C, qui soutient la combustion pendant l'effort quotidien.",
      },
      {
        id: 'eau-detox',
        moment: 'Toute la journée',
        title: "L'Eau Détox Concombre-Menthe",
        benefit: 'Hydrate, coupe les fringales et soutient le déficit',
        ingredients: [
          { label: 'Eau fraîche', amount: '1,5 litre' },
          { label: 'Concombre en rondelles', amount: '1/2 concombre' },
          { label: 'Menthe fraîche', amount: '8 feuilles' },
          { label: 'Citron en rondelles', amount: '1/2 citron' },
        ],
        steps: [
          'Le matin, déposez le concombre, la menthe et le citron dans une carafe.',
          "Versez l'eau fraîche et laissez infuser au moins 1 heure au réfrigérateur.",
          'Buvez tout au long de la journée, surtout 20 minutes avant chaque repas.',
        ],
        why:
          "Boire avant les repas remplit partiellement l'estomac et réduit naturellement les portions. Une bonne hydratation est aussi indispensable pour que le corps déstocke : un corps déshydraté retient et brûle moins.",
      },
      {
        id: 'shot-dore',
        moment: "Début d'après-midi",
        title: 'Le Shot Doré Cannelle-Curcuma',
        benefit: 'Stabilise la glycémie et coupe les envies de sucre',
        ingredients: [
          { label: 'Eau tiède', amount: '100 ml' },
          { label: 'Curcuma en poudre', amount: '1/2 c. à café' },
          { label: 'Cannelle de Ceylan', amount: '1/2 c. à café' },
          { label: 'Poivre noir moulu', amount: '1 pincée' },
          { label: 'Miel (optionnel)', amount: '1/2 c. à café' },
        ],
        steps: [
          "Mélangez le curcuma, la cannelle et le poivre dans l'eau tiède.",
          'Remuez énergiquement jusqu\'à dissolution complète.',
          "Buvez d'un trait en début d'après-midi, au moment où les envies de sucre arrivent.",
        ],
        why:
          "La cannelle améliore la sensibilité à l'insuline et lisse les pics de glycémie — la cause numéro un des fringales de 16 h. Le poivre noir multiplie l'absorption de la curcumine, anti-inflammatoire naturel qui soutient un métabolisme efficace.",
      },
      {
        id: 'cafe-metabolique',
        moment: 'Avant la marche',
        title: 'Le Café Métabolique',
        benefit: "Augmente l'énergie et la combustion pendant l'activité",
        ingredients: [
          { label: 'Café filtre ou expresso', amount: '1 tasse (150 ml)' },
          { label: 'Cannelle', amount: '1/4 c. à café' },
          { label: 'Cacao pur non sucré', amount: '1/2 c. à café' },
        ],
        steps: [
          'Préparez votre café comme d\'habitude, sans sucre.',
          'Ajoutez la cannelle et le cacao, mélangez bien.',
          'Buvez 20 à 30 minutes avant votre marche ou vos exercices légers.',
        ],
        why:
          "La caféine mobilise les graisses stockées et les rend disponibles comme carburant — à condition de bouger ensuite. Prendre ce café avant une marche de 20 minutes peut augmenter sensiblement les graisses brûlées pendant l'effort.",
      },
      {
        id: 'infusion-soir',
        moment: 'Le soir',
        title: "L'Infusion du Soir Camomille-Gingembre",
        benefit: 'Améliore le sommeil — le brûleur de graisse oublié',
        ingredients: [
          { label: 'Fleurs de camomille', amount: '1 c. à soupe' },
          { label: 'Gingembre frais', amount: '2 lamelles' },
          { label: 'Eau chaude', amount: '250 ml' },
        ],
        steps: [
          'Infusez la camomille et le gingembre 5 minutes dans l\'eau chaude.',
          'Filtrez et buvez 30 à 45 minutes avant le coucher.',
          'Éloignez les écrans pendant que vous la dégustez : c\'est votre rituel de fin de journée.',
        ],
        why:
          "Un sommeil court ou agité augmente le cortisol et la ghréline (l'hormone de la faim) : vous mangez plus le lendemain sans vous en rendre compte. Mieux dormir est l'un des accélérateurs de perte de poids les plus puissants — et les plus négligés.",
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════
  // PROTOCOLE ZÉRO RÉTENTION & FERMETÉ
  // ════════════════════════════════════════════════════════════════
  'zero-retention': {
    id: 'zero-retention',
    title: 'Protocole Zéro Rétention & Fermeté',
    subtitle: 'Drainage naturel & peau ferme',
    intro:
      "Quand on mincit, deux ennemies apparaissent : l'eau retenue qui gonfle et masque les résultats, et le relâchement de la peau. Ces recettes naturelles agissent sur les deux.",
    usage:
      "Alternez les recettes drainantes (fenouil, hibiscus, jus vert) selon vos journées, et prenez le Smoothie Fermeté 3 à 4 fois par semaine pour soutenir la peau pendant toute la perte de poids.",
    gradient: 'from-[#062c3e] via-[#0e5b71] to-[#2fa3ad]',
    recipes: [
      {
        id: 'eau-fenouil',
        moment: 'Au réveil',
        title: "L'Eau de Fenouil Drainante",
        benefit: "Stimule l'élimination de l'eau retenue",
        ingredients: [
          { label: 'Graines de fenouil', amount: '1 c. à café' },
          { label: 'Eau', amount: '300 ml' },
        ],
        steps: [
          'La veille au soir, portez l\'eau à ébullition avec les graines de fenouil.',
          'Laissez infuser à couvert toute la nuit.',
          'Au réveil, filtrez et buvez tiède, à jeun (en alternance ou en complément du Shot Matinal).',
        ],
        why:
          "Le fenouil est l'un des diurétiques naturels les plus doux et les plus étudiés : il aide les reins à éliminer l'excès d'eau et de sodium sans déminéraliser. Résultat : moins de gonflement au niveau du ventre, des jambes et du visage.",
      },
      {
        id: 'jus-vert-drainant',
        moment: 'Avant le déjeuner',
        title: 'Le Jus Vert Anti-Rétention',
        benefit: "Riche en potassium — l'antidote du sel",
        ingredients: [
          { label: 'Concombre', amount: '1/2' },
          { label: 'Céleri branche', amount: '2 branches' },
          { label: 'Persil frais', amount: '1 petite poignée' },
          { label: 'Jus de citron', amount: '1/2 citron' },
          { label: 'Eau fraîche', amount: '150 ml' },
        ],
        steps: [
          'Lavez et coupez grossièrement le concombre et le céleri.',
          'Mixez tous les ingrédients 30 à 40 secondes.',
          'Buvez sans filtrer (les fibres comptent), 15 minutes avant le déjeuner.',
        ],
        why:
          "La rétention d'eau vient souvent d'un déséquilibre sodium/potassium. Ce jus apporte une dose concentrée de potassium qui rééquilibre la balance et permet aux tissus de relâcher l'eau stockée. Le persil ajoute un effet diurétique doux.",
      },
      {
        id: 'the-hibiscus',
        moment: 'Après-midi',
        title: "Le Thé d'Hibiscus Dégonflant",
        benefit: 'Réduit le gonflement et la sensation de jambes lourdes',
        ingredients: [
          { label: "Fleurs d'hibiscus séchées", amount: '1 c. à soupe' },
          { label: 'Eau chaude', amount: '300 ml' },
          { label: 'Bâton de cannelle (optionnel)', amount: '1' },
        ],
        steps: [
          "Infusez l'hibiscus (et la cannelle) 5 à 7 minutes dans l'eau chaude.",
          'Filtrez. Se boit chaud ou glacé, sans sucre.',
          "Buvez 1 tasse dans l'après-midi, surtout les jours où vous vous sentez gonflée.",
        ],
        why:
          "L'hibiscus a un effet diurétique démontré et il est riche en anthocyanes qui soutiennent la microcirculation — c'est pourquoi il soulage aussi la sensation de jambes lourdes en fin de journée.",
      },
      {
        id: 'smoothie-fermete',
        moment: 'Collation (3-4x/semaine)',
        title: 'Le Smoothie Fermeté Peau Neuve',
        benefit: 'Donne à la peau les briques du collagène',
        ingredients: [
          { label: 'Fruits rouges (frais ou surgelés)', amount: '100 g' },
          { label: 'Yaourt grec 0%', amount: '150 g' },
          { label: 'Graines de chia', amount: '1 c. à café' },
          { label: 'Jus de citron', amount: '1/2 citron' },
          { label: "Eau ou lait d'amande", amount: '100 ml' },
        ],
        steps: [
          'Mixez tous les ingrédients 30 secondes jusqu\'à texture lisse.',
          'Dégustez en collation, idéalement après votre marche ou vos exercices.',
          'Répétez 3 à 4 fois par semaine pendant toute la perte de poids.',
        ],
        why:
          "La peau a besoin de protéines et de vitamine C pour fabriquer du collagène — exactement ce que ce smoothie apporte. Pris régulièrement pendant l'amincissement, il aide la peau à se retendre au fur et à mesure, au lieu de se relâcher.",
      },
      {
        id: 'bouillon-potassium',
        moment: 'Le soir (2-3x/semaine)',
        title: 'Le Bouillon Reminéralisant',
        benefit: 'Élimine le sodium accumulé dans la journée',
        ingredients: [
          { label: 'Courgette', amount: '1' },
          { label: 'Céleri', amount: '2 branches' },
          { label: 'Poireau', amount: '1' },
          { label: 'Persil', amount: '1 poignée' },
          { label: 'Eau', amount: '1 litre' },
          { label: 'Curcuma', amount: '1/2 c. à café' },
        ],
        steps: [
          'Coupez les légumes et faites-les mijoter 20 minutes dans l\'eau.',
          'Ajoutez le persil et le curcuma en fin de cuisson.',
          'Buvez le bouillon (avec ou sans les légumes) en entrée du dîner, sans ajouter de sel.',
        ],
        why:
          "Ce bouillon est un concentré de potassium et de minéraux qui aide le corps à évacuer le sodium accumulé dans la journée — l'une des premières causes du réveil avec le visage et les doigts gonflés.",
      },
    ],
  },
};
