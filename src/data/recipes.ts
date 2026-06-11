export type MealTime = 'morning' | 'lunch' | 'dinner' | 'snack' | 'night';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface RecipeData {
  id: string;
  isFeatured?: boolean;
  mealTime: MealTime[];
  difficulty: Difficulty;
  // Translation keys for i18n
  titleKey: string;
  descriptionKey: string;
  benefitKey: string;
  timeKey: string;
  ingredientsKeys: string[];
  stepsKeys: string[];
}

export const recipesData: RecipeData[] = [
  {
    id: 'pink-salt-burn-shot',
    isFeatured: true,
    mealTime: ['night'],
    difficulty: 'easy',
    titleKey: 'recipes.salt_burn.title',
    descriptionKey: 'recipes.salt_burn.description',
    benefitKey: 'recipes.salt_burn.benefit',
    timeKey: 'recipes.salt_burn.time',
    ingredientsKeys: [
      'recipes.salt_burn.ing_1',
      'recipes.salt_burn.ing_2',
      'recipes.salt_burn.ing_3',
      'recipes.salt_burn.ing_4',
      'recipes.salt_burn.ing_5',
      'recipes.salt_burn.ing_6',
    ],
    stepsKeys: [
      'recipes.salt_burn.step_1',
      'recipes.salt_burn.step_2',
      'recipes.salt_burn.step_3'
    ]
  },
  {
    id: 'lean-protein-smoothie',
    mealTime: ['morning'],
    difficulty: 'easy',
    titleKey: 'recipes.green_smoothie.title',
    descriptionKey: 'recipes.green_smoothie.description',
    benefitKey: 'recipes.green_smoothie.benefit',
    timeKey: 'recipes.green_smoothie.time',
    ingredientsKeys: [
      'recipes.green_smoothie.ing_1',
      'recipes.green_smoothie.ing_2',
      'recipes.green_smoothie.ing_3',
      'recipes.green_smoothie.ing_4',
      'recipes.green_smoothie.ing_5',
      'recipes.green_smoothie.ing_6',
    ],
    stepsKeys: [
      'recipes.green_smoothie.step_1'
    ]
  },
  {
    id: 'morning-pink-salt-lemon',
    mealTime: ['morning', 'snack'],
    difficulty: 'easy',
    titleKey: 'recipes.morning_salt.title',
    descriptionKey: 'recipes.morning_salt.description',
    benefitKey: 'recipes.morning_salt.benefit',
    timeKey: 'recipes.morning_salt.time',
    ingredientsKeys: [
      'recipes.morning_salt.ing_1',
      'recipes.morning_salt.ing_2',
      'recipes.morning_salt.ing_3',
      'recipes.morning_salt.ing_4',
    ],
    stepsKeys: [
      'recipes.morning_salt.step_1',
      'recipes.morning_salt.step_2'
    ]
  },
  {
    id: 'protein-egg-bowl',
    mealTime: ['lunch', 'dinner'],
    difficulty: 'medium',
    titleKey: 'recipes.egg_bowl.title',
    descriptionKey: 'recipes.egg_bowl.description',
    benefitKey: 'recipes.egg_bowl.benefit',
    timeKey: 'recipes.egg_bowl.time',
    ingredientsKeys: [
      'recipes.egg_bowl.ing_1',
      'recipes.egg_bowl.ing_2',
      'recipes.egg_bowl.ing_3',
      'recipes.egg_bowl.ing_4',
      'recipes.egg_bowl.ing_5',
      'recipes.egg_bowl.ing_6',
    ],
    stepsKeys: [
      'recipes.egg_bowl.step_1'
    ]
  },
  {
    id: 'cinnamon-apple-oats',
    mealTime: ['morning'],
    difficulty: 'easy',
    titleKey: 'recipes.apple_oats.title',
    descriptionKey: 'recipes.apple_oats.description',
    benefitKey: 'recipes.apple_oats.benefit',
    timeKey: 'recipes.apple_oats.time',
    ingredientsKeys: [
      'recipes.apple_oats.ing_1',
      'recipes.apple_oats.ing_2',
      'recipes.apple_oats.ing_3',
      'recipes.apple_oats.ing_4',
      'recipes.apple_oats.ing_5',
      'recipes.apple_oats.ing_6',
    ],
    stepsKeys: [
      'recipes.apple_oats.step_1'
    ]
  },
  {
    id: 'fat-burning-soup',
    mealTime: ['dinner'],
    difficulty: 'medium',
    titleKey: 'recipes.veg_soup.title',
    descriptionKey: 'recipes.veg_soup.description',
    benefitKey: 'recipes.veg_soup.benefit',
    timeKey: 'recipes.veg_soup.time',
    ingredientsKeys: [
      'recipes.veg_soup.ing_1',
      'recipes.veg_soup.ing_2',
      'recipes.veg_soup.ing_3',
      'recipes.veg_soup.ing_4',
      'recipes.veg_soup.ing_5',
      'recipes.veg_soup.ing_6',
      'recipes.veg_soup.ing_7',
      'recipes.veg_soup.ing_8',
      'recipes.veg_soup.ing_9',
    ],
    stepsKeys: [
      'recipes.veg_soup.step_1'
    ]
  },
  {
    id: 'pomegranate-antioxidant-bowl',
    mealTime: ['snack', 'morning'],
    difficulty: 'easy',
    titleKey: 'recipes.berry_bowl.title',
    descriptionKey: 'recipes.berry_bowl.description',
    benefitKey: 'recipes.berry_bowl.benefit',
    timeKey: 'recipes.berry_bowl.time',
    ingredientsKeys: [
      'recipes.berry_bowl.ing_1',
      'recipes.berry_bowl.ing_2',
      'recipes.berry_bowl.ing_3',
      'recipes.berry_bowl.ing_4',
      'recipes.berry_bowl.ing_5',
      'recipes.berry_bowl.ing_6',
    ],
    stepsKeys: [
      'recipes.berry_bowl.step_1'
    ]
  },
  {
    id: 'night-craving-shot',
    mealTime: ['night'],
    difficulty: 'easy',
    titleKey: 'recipes.night_shot.title',
    descriptionKey: 'recipes.night_shot.description',
    benefitKey: 'recipes.night_shot.benefit',
    timeKey: 'recipes.night_shot.time',
    ingredientsKeys: [
      'recipes.night_shot.ing_1',
      'recipes.night_shot.ing_2',
      'recipes.night_shot.ing_3',
      'recipes.night_shot.ing_4',
      'recipes.night_shot.ing_5',
    ],
    stepsKeys: [
      'recipes.night_shot.step_1'
    ]
  },
  {
    id: 'grilled-salmon-broccoli',
    mealTime: ['lunch', 'dinner'],
    difficulty: 'medium',
    titleKey: 'recipes.salmon.title',
    descriptionKey: 'recipes.salmon.description',
    benefitKey: 'recipes.salmon.benefit',
    timeKey: 'recipes.salmon.time',
    ingredientsKeys: [
      'recipes.salmon.ing_1',
      'recipes.salmon.ing_2',
      'recipes.salmon.ing_3',
      'recipes.salmon.ing_4',
      'recipes.salmon.ing_5',
    ],
    stepsKeys: [
      'recipes.salmon.step_1',
      'recipes.salmon.step_2'
    ]
  },
  {
    id: 'chia-coconut-pudding',
    mealTime: ['snack'],
    difficulty: 'easy',
    titleKey: 'recipes.chia_pudding.title',
    descriptionKey: 'recipes.chia_pudding.description',
    benefitKey: 'recipes.chia_pudding.benefit',
    timeKey: 'recipes.chia_pudding.time',
    ingredientsKeys: [
      'recipes.chia_pudding.ing_1',
      'recipes.chia_pudding.ing_2',
      'recipes.chia_pudding.ing_3',
      'recipes.chia_pudding.ing_4',
      'recipes.chia_pudding.ing_5',
    ],
    stepsKeys: [
      'recipes.chia_pudding.step_1'
    ]
  }
];
