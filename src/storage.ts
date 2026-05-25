import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe, InventoryItem, ShoppingItem, CookingNote, MealPlanItem } from './types';

const RECIPES_KEY = 'cookhelper_recipes';
const INITIALIZED_KEY = 'cookhelper_initialized_v11';
const FAVORITES_KEY = 'cookhelper_favorites';
const INVENTORY_KEY = 'cookhelper_inventory';
const SHOPPING_KEY = 'cookhelper_shopping';
const NOTES_KEY = 'cookhelper_notes';
const MEALPLAN_KEY = 'cookhelper_mealplan';
const COOKING_STATE_KEY = 'cookhelper_cooking_state';
const MODIFIED_KEY = 'cookhelper_modified';
const RECENT_KEY = 'cookhelper_recent';

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
    imageUrl: recipe.imageUrl || undefined,
    source: recipe.source || 'user',
  };
};

const loadRecipesFromAsset = async (): Promise<Recipe[]> => {
  try {
    const data = require('../assets/recipes.json');
    const recipes = (Array.isArray(data) ? data : []) as Recipe[];
    return recipes.map(r => ({ ...r, source: 'official' as const }));
  } catch (error) {
    console.error('Failed to load recipes from asset:', error);
  }
  return [];
};

const migrateSourceField = (recipes: Recipe[], assetRecipes: Recipe[]): Recipe[] => {
  const assetIdSet = new Set(assetRecipes.map(r => r.id));
  return recipes.map(r => {
    if (r.source) return r;
    return { ...r, source: assetIdSet.has(r.id) ? 'official' as const : 'user' as const };
  });
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
    const assetRecipes = await loadRecipesFromAsset();

    if (!initialized) {
      if (assetRecipes.length > 0) {
        recipes = migrateSourceField(recipes, assetRecipes);
        const existingIds = new Set(recipes.map(r => r.id));
        for (const official of assetRecipes) {
          if (!existingIds.has(official.id)) {
            recipes.push(migrateRecipe(official));
          }
        }
        await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
        await AsyncStorage.setItem(INITIALIZED_KEY, 'true');
      }
    } else {
      recipes = migrateSourceField(recipes, assetRecipes);
      const modifiedIds = await loadModifiedRecipes();
      let changed = false;

      for (const official of assetRecipes) {
        if (modifiedIds.includes(official.id)) continue;

        const existingIdx = recipes.findIndex(r => r.id === official.id);
        if (existingIdx >= 0) {
          if (recipes[existingIdx].source === 'official') {
            recipes[existingIdx] = migrateRecipe(official);
            changed = true;
          }
        } else {
          recipes.push(migrateRecipe(official));
          changed = true;
        }
      }

      if (changed) {
        await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
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
      const parsed = JSON.parse(recipesJson);
      const migrated = parsed.map(migrateRecipe);
      if (migrated.length > 0) {
        return migrated;
      }
    }
    const assetRecipes = await loadRecipesFromAsset();
    if (assetRecipes.length > 0) {
      await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(assetRecipes));
    }
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

export const loadFavorites = async (): Promise<string[]> => {
  const data = await AsyncStorage.getItem(FAVORITES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveFavorites = async (favorites: string[]): Promise<void> => {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

export const loadInventory = async (): Promise<InventoryItem[]> => {
  const data = await AsyncStorage.getItem(INVENTORY_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveInventory = async (inventory: InventoryItem[]): Promise<void> => {
  await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
};

export const loadShoppingList = async (): Promise<ShoppingItem[]> => {
  const data = await AsyncStorage.getItem(SHOPPING_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveShoppingList = async (list: ShoppingItem[]): Promise<void> => {
  await AsyncStorage.setItem(SHOPPING_KEY, JSON.stringify(list));
};

export const loadNotes = async (): Promise<CookingNote[]> => {
  const data = await AsyncStorage.getItem(NOTES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveNotes = async (notes: CookingNote[]): Promise<void> => {
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
};

export const loadMealPlans = async (): Promise<MealPlanItem[]> => {
  const data = await AsyncStorage.getItem(MEALPLAN_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveMealPlans = async (plans: MealPlanItem[]): Promise<void> => {
  await AsyncStorage.setItem(MEALPLAN_KEY, JSON.stringify(plans));
};

export const loadCookingState = async (): Promise<{ recipeId: string | null; stepIndex: number }> => {
  const data = await AsyncStorage.getItem(COOKING_STATE_KEY);
  return data ? JSON.parse(data) : { recipeId: null, stepIndex: 0 };
};

export const saveCookingState = async (recipeId: string | null, stepIndex: number): Promise<void> => {
  await AsyncStorage.setItem(COOKING_STATE_KEY, JSON.stringify({ recipeId, stepIndex }));
};

export const loadModifiedRecipes = async (): Promise<string[]> => {
  const data = await AsyncStorage.getItem(MODIFIED_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveModifiedRecipes = async (ids: string[]): Promise<void> => {
  await AsyncStorage.setItem(MODIFIED_KEY, JSON.stringify(ids));
};

export const loadRecentlyOpened = async (): Promise<string[]> => {
  const data = await AsyncStorage.getItem(RECENT_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveRecentlyOpened = async (ids: string[]): Promise<void> => {
  await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(ids));
};