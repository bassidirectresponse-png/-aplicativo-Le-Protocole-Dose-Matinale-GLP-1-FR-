export interface ProfileMetrics {
  current_weight: number;
  target_weight?: number;
  height?: number;
  age?: number;
}

export interface CaloriePlan {
  range: string;
  target: number;
  protein: string;
  water: string;
  note: string;
}

export const CALORIE_TABLE = [
  { min: 0, max: 59.9, range: '< 60 kg', target: 1300, protein: '75-95 g', water: '1.8-2.2 L' },
  { min: 60, max: 69.9, range: '60-69 kg', target: 1400, protein: '85-105 g', water: '2.0-2.4 L' },
  { min: 70, max: 79.9, range: '70-79 kg', target: 1500, protein: '95-120 g', water: '2.2-2.7 L' },
  { min: 80, max: 89.9, range: '80-89 kg', target: 1600, protein: '105-130 g', water: '2.4-3.0 L' },
  { min: 90, max: 104.9, range: '90-104 kg', target: 1750, protein: '115-145 g', water: '2.7-3.2 L' },
  { min: 105, max: 119.9, range: '105-119 kg', target: 1900, protein: '125-155 g', water: '3.0-3.5 L' },
  { min: 120, max: Infinity, range: '120 kg+', target: 2100, protein: '135-170 g', water: '3.2-3.8 L' },
];

export const getCaloriePlan = (weight: number): CaloriePlan => {
  const row = CALORIE_TABLE.find(item => weight >= item.min && weight <= item.max) || CALORIE_TABLE[3];

  return {
    range: row.range,
    target: row.target,
    protein: row.protein,
    water: row.water,
    note: "Ajustez chaque semaine avec votre nouveau poids pour garder un deficit realiste.",
  };
};

export const calculateProtocolQuantities = (weight: number) => {
  let pinkSalt = 0.5;
  let lemon = 15;
  let water = 220;

  if (weight >= 70) {
    pinkSalt = 0.75;
    lemon = 20;
    water = 250;
  }

  if (weight >= 90) {
    pinkSalt = 1;
    lemon = 25;
    water = 280;
  }

  return {
    pinkSalt,
    lemon,
    water,
    appleCiderVinegar: 5,
    ginger: 2,
    cinnamon: 0.5,
  };
};
