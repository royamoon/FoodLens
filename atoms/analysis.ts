import { atom } from 'jotai';
const fakeResponse = require('@/assets/response.json');

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface FoodAnalysis {
  id: string;
  timestamp: number;
  identifiedFood: string;
  image: string;
  mealType?: MealType;
  notes?: string;

  // Original data from Gemini
  portionSize: string;
  recognizedServingSize: string;
  nutritionFactsPerPortion: NutritionFactsPerPortion;
  additionalNotes: string[];
}

interface NutritionFactsPerPortion {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  sugar: string;
  sodium: string;
  cholesterol: string;
}

export const analysisAtom = atom<Omit<FoodAnalysis, 'id' | 'timestamp' | 'mealType' | 'notes'> | null>(
  null
);

const fakeHistoryItem: FoodAnalysis = {
  ...fakeResponse,
  id: '1',
  timestamp: new Date('2024-06-13T08:30:00').getTime(),
  mealType: 'Breakfast',
};
export const historyAtom = atom<FoodAnalysis[]>([fakeHistoryItem]);
