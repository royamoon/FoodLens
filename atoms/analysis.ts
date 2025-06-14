import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, authStateAtom } from './auth';

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface FoodAnalysis {
  id: string;
  timestamp: string;
  identifiedFood: string;
  image: string;
  mealType?: MealType;
  notes?: string;
  user_id?: string;
  created_at?: string;

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

export const analysisAtom = atom<Omit<FoodAnalysis, 'id' | 'timestamp' | 'mealType' | 'notes' | 'user_id' | 'created_at'> | null>(
  null
);

// API functions
export const fetchFoodHistory = async (token: string): Promise<FoodAnalysis[]> => {
  try {
    console.log('Fetching food history with token:', !!token);
    console.log('API URL:', `${API_BASE_URL}/food`);
    
    const response = await fetch(`${API_BASE_URL}/food`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error(`Failed to fetch food history: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Food history data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching food history:', error);
    throw error;
  }
};

export const createFoodEntry = async (food: Omit<FoodAnalysis, 'id' | 'created_at' | 'user_id'>, token: string): Promise<FoodAnalysis | null> => {
  try {
    console.log('createFoodEntry - API_BASE_URL:', API_BASE_URL);
    console.log('createFoodEntry - token present:', !!token);
    console.log('createFoodEntry - food data:', food);
    
    const response = await fetch(`${API_BASE_URL}/food`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(food),
    });

    console.log('createFoodEntry - response status:', response.status);
    console.log('createFoodEntry - response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('createFoodEntry - error response:', errorText);
      throw new Error('Failed to create food entry');
    }

    const result = await response.json();
    console.log('createFoodEntry - success result:', result);
    return result;
  } catch (error) {
    console.error('Error creating food entry:', error);
    return null;
  }
};

export const updateFoodEntry = async (id: string, food: Partial<FoodAnalysis>, token: string): Promise<FoodAnalysis | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/food/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(food),
    });

    if (!response.ok) {
      throw new Error('Failed to update food entry');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating food entry:', error);
    return null;
  }
};

export const deleteFoodEntry = async (id: string, token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/food/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Error deleting food entry:', error);
    return false;
  }
};

// Create AsyncStorage for persistence
const storage = createJSONStorage(() => AsyncStorage);

// Atom for storing food history with persistence per user
export const historyAtom = atom<FoodAnalysis[]>([]);

// Helper function to get user-specific storage key
const getUserHistoryKey = (userId: string) => `food-history-${userId}`;

// Atom for user-specific persistent history
export const userHistoryAtom = atom(
  async (get) => {
    const authState = get(authStateAtom);
    if (!authState.user?.id) {
      return [];
    }
    
    try {
      const key = getUserHistoryKey(authState.user.id);
      const stored = await AsyncStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading user history from storage:', error);
      return [];
    }
  },
  async (get, set, newHistory: FoodAnalysis[]) => {
    const authState = get(authStateAtom);
    if (!authState.user?.id) {
      return;
    }
    
    try {
      const key = getUserHistoryKey(authState.user.id);
      await AsyncStorage.setItem(key, JSON.stringify(newHistory));
      set(historyAtom, newHistory);
    } catch (error) {
      console.error('Error saving user history to storage:', error);
    }
  }
);

// Atom for loading food history from API and local storage
export const loadHistoryAtom = atom(
  null,
  async (get, set) => {
    const authState = get(authStateAtom);
    if (!authState.user?.id || !authState.session?.access_token) {
      console.log('No user or access token available for loading history');
      return;
    }

    try {
      // First, load from local storage
      console.log('Loading history from local storage...');
      const localHistory = await get(userHistoryAtom);
      if (localHistory.length > 0) {
        console.log('Found local history:', localHistory.length, 'items');
        set(historyAtom, localHistory);
      }

      // Then, fetch from server to get latest data
      console.log('Loading food history from server...');
      const serverHistory = await fetchFoodHistory(authState.session.access_token);
      console.log('Successfully loaded server history:', serverHistory.length, 'items');
      
      // Update both local storage and current state
      if (serverHistory.length >= 0) { // Always update, even if empty (user might have deleted all)
        set(userHistoryAtom, serverHistory);
        set(historyAtom, serverHistory);
      }
    } catch (error) {
      console.error('Failed to load food history:', error);
      // If server fails, at least we have local data
    }
  }
);

// Atom for adding new food entry
export const addFoodEntryAtom = atom(
  null,
  async (get, set, food: Omit<FoodAnalysis, 'id' | 'created_at' | 'user_id'>) => {
    const authState = get(authStateAtom);
    console.log('addFoodEntryAtom - authState:', authState);
    console.log('addFoodEntryAtom - user:', authState.user);
    console.log('addFoodEntryAtom - session:', authState.session);
    console.log('addFoodEntryAtom - access_token present:', !!authState.session?.access_token);
    
    if (!authState.session?.access_token) {
      console.error('addFoodEntryAtom - No access token available');
      throw new Error('Not authenticated');
    }

    const newEntry = await createFoodEntry(food, authState.session.access_token);
    if (newEntry) {
      const currentHistory = get(historyAtom);
      const updatedHistory = [newEntry, ...currentHistory];
      
      // Update both local storage and current state
      set(userHistoryAtom, updatedHistory);
      set(historyAtom, updatedHistory);
      return newEntry;
    }
    return null;
  }
);

// Atom for clearing user data on logout
export const clearUserDataAtom = atom(
  null,
  async (get, set) => {
    // Clear current history
    set(historyAtom, []);
    
    // Clear all user-specific data from AsyncStorage
    try {
      const keys = await AsyncStorage.getAllKeys();
      const userKeys = keys.filter(key => key.startsWith('food-history-'));
      if (userKeys.length > 0) {
        await AsyncStorage.multiRemove(userKeys);
        console.log('Cleared user data from storage');
      }
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }
);
