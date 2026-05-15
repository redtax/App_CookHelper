import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import { Recipe } from './types';

const RECIPES_KEY = 'cookhelper_recipes';
const INITIALIZED_KEY = 'cookhelper_initialized_v4';

const loadRecipesFromAsset = async (): Promise<Recipe[]> => {
  try {
    const asset = Asset.fromModule(require('../assets/recipes.txt'));
    await asset.downloadAsync();
    if (asset.localUri) {
      const response = await fetch(asset.localUri);
      const data = await response.json();
      return data as Recipe[];
    }
  } catch (error) {
    console.error('Failed to load recipes from asset:', error);
  }
  return [];
};

export const initializeStorage = async (): Promise<void> => {
  try {
    const initialized = await AsyncStorage.getItem(INITIALIZED_KEY);
    if (!initialized) {
      const recipes = await loadRecipesFromAsset();
      if (recipes.length > 0) {
        await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
        await AsyncStorage.setItem(INITIALIZED_KEY, 'true');
      }
    }
  } catch (error) {
    console.error('Failed to initialize storage:', error);
  }
};

export const loadRecipes = async (): Promise<Recipe[]> => {
  try {
    const recipesJson = await AsyncStorage.getItem(RECIPES_KEY);
    if (recipesJson) {
      return JSON.parse(recipesJson);
    }
    const recipes = await loadRecipesFromAsset();
    if (recipes.length > 0) {
      return recipes;
    }
    return [];
  } catch (error) {
    console.error('Failed to load recipes:', error);
    const recipes = await loadRecipesFromAsset();
    return recipes;
  }
};

export const saveRecipes = async (recipes: Recipe[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
  } catch (error) {
    console.error('Failed to save recipes:', error);
  }
};

export const addRecipe = async (recipe: Recipe): Promise<void> => {
  const recipes = await loadRecipes();
  recipes.push(recipe);
  await saveRecipes(recipes);
};

export const updateRecipe = async (updatedRecipe: Recipe): Promise<void> => {
  const recipes = await loadRecipes();
  const index = recipes.findIndex(r => r.id === updatedRecipe.id);
  if (index !== -1) {
    recipes[index] = updatedRecipe;
    await saveRecipes(recipes);
  }
};

export const deleteRecipe = async (id: string): Promise<void> => {
  const recipes = await loadRecipes();
  const filteredRecipes = recipes.filter(r => r.id !== id);
  await saveRecipes(filteredRecipes);
};
