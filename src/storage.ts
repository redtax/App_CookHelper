import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import { Recipe } from './types';

const RECIPES_KEY = 'cookhelper_recipes';
const INITIALIZED_KEY = 'cookhelper_initialized_v5';

const migrateRecipe = (recipe: any): Recipe => {
  let categories = recipe.categories;
  if (!categories && recipe.category) {
    categories = [recipe.category];
  }
  if (!categories || !Array.isArray(categories)) {
    categories = ['家常菜'];
  }
  return {
    ...recipe,
    categories,
    category: undefined,
    mainIngredients: recipe.mainIngredients || [],
    auxiliaryIngredients: recipe.auxiliaryIngredients || [],
    seasonings: recipe.seasonings || [],
    preparationSteps: recipe.preparationSteps || [],
    cookingSteps: recipe.cookingSteps || [],
    technique: recipe.technique || undefined,
    flavor: recipe.flavor || undefined,
    overallFlow: recipe.overallFlow || undefined,
  };
};

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
    const recipesJson = await AsyncStorage.getItem(RECIPES_KEY);
    let recipes: Recipe[] = [];
    if (recipesJson) {
      const parsed = JSON.parse(recipesJson);
      recipes = parsed.map(migrateRecipe);
    }
    const initialized = await AsyncStorage.getItem(INITIALIZED_KEY);
    if (!initialized) {
      const assetRecipes = await loadRecipesFromAsset();
      if (assetRecipes.length > 0) {
        recipes = assetRecipes.map(migrateRecipe);
      }
      await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
      await AsyncStorage.setItem(INITIALIZED_KEY, 'true');
    } else if (recipes.length > 0) {
      await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
    }
  } catch (error) {
    console.error('Failed to initialize storage:', error);
  }
};

export const loadRecipes = async (): Promise<Recipe[]> => {
  try {
    const recipesJson = await AsyncStorage.getItem(RECIPES_KEY);
    if (recipesJson) {
      const parsed = JSON.parse(recipesJson);
      return parsed.map(migrateRecipe);
    }
    const assetRecipes = await loadRecipesFromAsset();
    return assetRecipes.map(migrateRecipe);
  } catch (error) {
    console.error('Failed to load recipes:', error);
    const assetRecipes = await loadRecipesFromAsset();
    return assetRecipes.map(migrateRecipe);
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
