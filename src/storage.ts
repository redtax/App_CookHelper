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

const DATA_VERSION_KEY = 'cookhelper_data_version';
const CURRENT_DATA_VERSION = 1;

const BACKUP_RECIPES_KEY = 'cookhelper_backup_recipes';
const BACKUP_FAVORITES_KEY = 'cookhelper_backup_favorites';
const BACKUP_INVENTORY_KEY = 'cookhelper_backup_inventory';
const BACKUP_SHOPPING_KEY = 'cookhelper_backup_shopping';
const BACKUP_NOTES_KEY = 'cookhelper_backup_notes';
const BACKUP_MEALPLAN_KEY = 'cookhelper_backup_mealplan';
const BACKUP_COOKING_STATE_KEY = 'cookhelper_backup_cooking_state';
const BACKUP_MODIFIED_KEY = 'cookhelper_backup_modified';
const BACKUP_RECENT_KEY = 'cookhelper_backup_recent';

const BACKUP_PAIRS: [string, string][] = [
  [RECIPES_KEY, BACKUP_RECIPES_KEY],
  [FAVORITES_KEY, BACKUP_FAVORITES_KEY],
  [INVENTORY_KEY, BACKUP_INVENTORY_KEY],
  [SHOPPING_KEY, BACKUP_SHOPPING_KEY],
  [NOTES_KEY, BACKUP_NOTES_KEY],
  [MEALPLAN_KEY, BACKUP_MEALPLAN_KEY],
  [COOKING_STATE_KEY, BACKUP_COOKING_STATE_KEY],
  [MODIFIED_KEY, BACKUP_MODIFIED_KEY],
  [RECENT_KEY, BACKUP_RECENT_KEY],
];

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
    source: recipe.source || undefined,
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
    const correctSource = assetIdSet.has(r.id) ? 'official' as const : (r.source || 'user' as const);
    if (r.source === correctSource) return r;
    return { ...r, source: correctSource };
  });
};

// ============================================================
// 数据备份与恢复系统
// ============================================================

async function backupAllUserData(): Promise<void> {
  for (const [src, dst] of BACKUP_PAIRS) {
    const data = await AsyncStorage.getItem(src);
    if (data !== null) {
      await AsyncStorage.setItem(dst, data);
    }
  }
}

async function restoreFromBackup(): Promise<void> {
  for (const [src, dst] of BACKUP_PAIRS) {
    const data = await AsyncStorage.getItem(dst);
    if (data !== null) {
      await AsyncStorage.setItem(src, data);
    } else {
      await AsyncStorage.removeItem(dst);
    }
  }
}

// ============================================================
// 数据版本迁移链
// ============================================================

async function getValidRecipeIds(): Promise<Set<string>> {
  const recipesJson = await AsyncStorage.getItem(RECIPES_KEY);
  if (!recipesJson) return new Set();
  try {
    const recipes: any[] = JSON.parse(recipesJson);
    return new Set(recipes.map((r: any) => r.id));
  } catch {
    return new Set();
  }
}

async function migrateInventoryV0toV1(): Promise<void> {
  const data = await AsyncStorage.getItem(INVENTORY_KEY);
  if (!data) return;
  try {
    const items: any[] = JSON.parse(data);
    if (!Array.isArray(items)) return;
    const migrated = items.map((item: any) => ({
      id: item.id || '',
      name: item.name || '',
      quantity: item.quantity || '0',
      unit: item.unit || '',
      expiryDate: item.expiryDate || undefined,
      addedDate: item.addedDate || new Date().toISOString().split('T')[0],
    }));
    await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(migrated));
  } catch (e) {
    console.error('[Migration] Invalid inventory data, resetting:', e);
    await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify([]));
  }
}

async function migrateShoppingV0toV1(): Promise<void> {
  const data = await AsyncStorage.getItem(SHOPPING_KEY);
  if (!data) return;
  try {
    const items: any[] = JSON.parse(data);
    if (!Array.isArray(items)) return;
    const migrated = items.map((item: any) => ({
      id: item.id || '',
      name: item.name || '',
      quantity: item.quantity || '0',
      unit: item.unit || '',
      checked: typeof item.checked === 'boolean' ? item.checked : false,
    }));
    await AsyncStorage.setItem(SHOPPING_KEY, JSON.stringify(migrated));
  } catch (e) {
    console.error('[Migration] Invalid shopping data, resetting:', e);
    await AsyncStorage.setItem(SHOPPING_KEY, JSON.stringify([]));
  }
}

async function migrateNotesV0toV1(): Promise<void> {
  const data = await AsyncStorage.getItem(NOTES_KEY);
  if (!data) return;
  try {
    const notes: any[] = JSON.parse(data);
    if (!Array.isArray(notes)) return;
    const migrated = notes.map((note: any) => ({
      id: note.id || '',
      recipeId: note.recipeId || '',
      recipeName: note.recipeName || '',
      date: note.date || new Date().toISOString().split('T')[0],
      content: note.content || '',
      rating: typeof note.rating === 'number' ? note.rating : 0,
      isSuccess: typeof note.isSuccess === 'boolean' ? note.isSuccess : true,
    }));
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(migrated));
  } catch (e) {
    console.error('[Migration] Invalid notes data, resetting:', e);
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify([]));
  }
}

async function migrateMealPlansV0toV1(): Promise<void> {
  const data = await AsyncStorage.getItem(MEALPLAN_KEY);
  if (!data) return;
  try {
    const plans: any[] = JSON.parse(data);
    if (!Array.isArray(plans)) return;
    const migrated = plans.map((plan: any) => ({
      id: plan.id || '',
      dayOfWeek: typeof plan.dayOfWeek === 'number' ? plan.dayOfWeek : 0,
      mealType: plan.mealType || 'lunch',
      recipeId: plan.recipeId || '',
      recipeName: plan.recipeName || '',
    }));
    await AsyncStorage.setItem(MEALPLAN_KEY, JSON.stringify(migrated));
  } catch (e) {
    console.error('[Migration] Invalid meal plan data, resetting:', e);
    await AsyncStorage.setItem(MEALPLAN_KEY, JSON.stringify([]));
  }
}

async function migrateFavoritesV0toV1(validRecipeIds: Set<string>): Promise<void> {
  const data = await AsyncStorage.getItem(FAVORITES_KEY);
  if (!data) return;
  try {
    const raw: any = JSON.parse(data);
    if (!Array.isArray(raw)) {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify([]));
      return;
    }
    const stringIds: string[] = raw.filter((id: any) => typeof id === 'string');
    const uniqueIds = [...new Set(stringIds)];
    const cleaned = uniqueIds.filter(id => validRecipeIds.has(id));
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(cleaned));
  } catch (e) {
    console.error('[Migration] Invalid favorites data, resetting:', e);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify([]));
  }
}

async function migrateModifiedV0toV1(validRecipeIds: Set<string>): Promise<void> {
  const data = await AsyncStorage.getItem(MODIFIED_KEY);
  if (!data) return;
  try {
    const raw: any = JSON.parse(data);
    if (!Array.isArray(raw)) {
      await AsyncStorage.setItem(MODIFIED_KEY, JSON.stringify([]));
      return;
    }
    const stringIds: string[] = raw.filter((id: any) => typeof id === 'string');
    const uniqueIds = [...new Set(stringIds)];
    const cleaned = uniqueIds.filter(id => validRecipeIds.has(id));
    await AsyncStorage.setItem(MODIFIED_KEY, JSON.stringify(cleaned));
  } catch (e) {
    console.error('[Migration] Invalid modified data, resetting:', e);
    await AsyncStorage.setItem(MODIFIED_KEY, JSON.stringify([]));
  }
}

async function migrateRecentV0toV1(validRecipeIds: Set<string>): Promise<void> {
  const data = await AsyncStorage.getItem(RECENT_KEY);
  if (!data) return;
  try {
    const raw: any = JSON.parse(data);
    if (!Array.isArray(raw)) {
      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify([]));
      return;
    }
    const stringIds: string[] = raw.filter((id: any) => typeof id === 'string');
    const uniqueIds = [...new Set(stringIds)];
    const cleaned = uniqueIds.filter(id => validRecipeIds.has(id));
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(cleaned));
  } catch (e) {
    console.error('[Migration] Invalid recent data, resetting:', e);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify([]));
  }
}

async function migrateCookingStateV0toV1(): Promise<void> {
  const data = await AsyncStorage.getItem(COOKING_STATE_KEY);
  if (!data) return;
  try {
    const state = JSON.parse(data);
    if (!state || typeof state !== 'object') {
      await AsyncStorage.setItem(COOKING_STATE_KEY, JSON.stringify({ recipeId: null, stepIndex: 0 }));
      return;
    }
    await AsyncStorage.setItem(COOKING_STATE_KEY, JSON.stringify({
      recipeId: state.recipeId || null,
      stepIndex: typeof state.stepIndex === 'number' ? state.stepIndex : 0,
    }));
  } catch (e) {
    console.error('[Migration] Invalid cooking state, resetting:', e);
    await AsyncStorage.setItem(COOKING_STATE_KEY, JSON.stringify({ recipeId: null, stepIndex: 0 }));
  }
}

// ============================================================
// 菜谱初始化与增量更新
// ============================================================

async function runRecipeInitialization(): Promise<void> {
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
}

// ============================================================
// 主迁移入口：v0 → v1
// ============================================================

async function migrateV0toV1(): Promise<void> {
  try {
    console.log('[DataMigration] Starting v0 → v1 migration...');

    await backupAllUserData();
    console.log('[DataMigration] All user data backed up');

    await runRecipeInitialization();
    console.log('[DataMigration] Recipe initialization complete');

    const validRecipeIds = await getValidRecipeIds();

    await migrateInventoryV0toV1();
    await migrateShoppingV0toV1();
    await migrateNotesV0toV1();
    await migrateMealPlansV0toV1();
    console.log('[DataMigration] Entity data validation complete');

    await migrateFavoritesV0toV1(validRecipeIds);
    await migrateModifiedV0toV1(validRecipeIds);
    await migrateRecentV0toV1(validRecipeIds);
    console.log('[DataMigration] Reference data cleanup complete');

    await migrateCookingStateV0toV1();

    await AsyncStorage.setItem(DATA_VERSION_KEY, String(CURRENT_DATA_VERSION));
    console.log('[DataMigration] v0 → v1 migration completed');
  } catch (error) {
    console.error('[DataMigration] Migration failed, rolling back:', error);
    await restoreFromBackup();
    throw error;
  }
}

async function runMigrations(): Promise<void> {
  const versionStr = await AsyncStorage.getItem(DATA_VERSION_KEY);
  const currentVersion = versionStr ? parseInt(versionStr, 10) : 0;

  if (currentVersion >= CURRENT_DATA_VERSION) {
    return;
  }

  if (currentVersion === 0) {
    await migrateV0toV1();
  }
}

// ============================================================
// 对外暴露的统一初始化入口
// ============================================================

export const initializeStorage = async (): Promise<void> => {
  try {
    await runMigrations();
    await runRecipeInitialization();
  } catch (error) {
    console.error('Failed to initialize storage:', error);
  }
};

// ============================================================
// 菜谱 CRUD
// ============================================================

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

// ============================================================
// 收藏
// ============================================================

export const loadFavorites = async (): Promise<string[]> => {
  const data = await AsyncStorage.getItem(FAVORITES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveFavorites = async (favorites: string[]): Promise<void> => {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

// ============================================================
// 食材库存
// ============================================================

export const loadInventory = async (): Promise<InventoryItem[]> => {
  const data = await AsyncStorage.getItem(INVENTORY_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveInventory = async (inventory: InventoryItem[]): Promise<void> => {
  await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
};

// ============================================================
// 采购清单
// ============================================================

export const loadShoppingList = async (): Promise<ShoppingItem[]> => {
  const data = await AsyncStorage.getItem(SHOPPING_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveShoppingList = async (list: ShoppingItem[]): Promise<void> => {
  await AsyncStorage.setItem(SHOPPING_KEY, JSON.stringify(list));
};

// ============================================================
// 烹饪笔记
// ============================================================

export const loadNotes = async (): Promise<CookingNote[]> => {
  const data = await AsyncStorage.getItem(NOTES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveNotes = async (notes: CookingNote[]): Promise<void> => {
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
};

// ============================================================
// 计划菜单
// ============================================================

export const loadMealPlans = async (): Promise<MealPlanItem[]> => {
  const data = await AsyncStorage.getItem(MEALPLAN_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveMealPlans = async (plans: MealPlanItem[]): Promise<void> => {
  await AsyncStorage.setItem(MEALPLAN_KEY, JSON.stringify(plans));
};

// ============================================================
// 烹饪状态（断点续做）
// ============================================================

export const loadCookingState = async (): Promise<{ recipeId: string | null; stepIndex: number }> => {
  const data = await AsyncStorage.getItem(COOKING_STATE_KEY);
  return data ? JSON.parse(data) : { recipeId: null, stepIndex: 0 };
};

export const saveCookingState = async (recipeId: string | null, stepIndex: number): Promise<void> => {
  await AsyncStorage.setItem(COOKING_STATE_KEY, JSON.stringify({ recipeId, stepIndex }));
};

// ============================================================
// 用户已修改菜谱标记
// ============================================================

export const loadModifiedRecipes = async (): Promise<string[]> => {
  const data = await AsyncStorage.getItem(MODIFIED_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveModifiedRecipes = async (ids: string[]): Promise<void> => {
  await AsyncStorage.setItem(MODIFIED_KEY, JSON.stringify(ids));
};

// ============================================================
// 最近打开
// ============================================================

export const loadRecentlyOpened = async (): Promise<string[]> => {
  const data = await AsyncStorage.getItem(RECENT_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveRecentlyOpened = async (ids: string[]): Promise<void> => {
  await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(ids));
};