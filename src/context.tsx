import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Recipe, AppContextType, InventoryItem, ShoppingItem, CookingNote, MealPlanItem } from './types';
import {
  loadRecipes as loadFromStorage,
  saveRecipes,
  addRecipe as addToStorage,
  updateRecipe as updateInStorage,
  deleteRecipe as deleteFromStorage,
  initializeStorage,
  loadFavorites,
  saveFavorites,
  loadInventory,
  saveInventory,
  loadShoppingList,
  saveShoppingList,
  loadNotes,
  saveNotes,
  loadMealPlans,
  saveMealPlans,
  loadCookingState,
  saveCookingState,
  loadModifiedRecipes,
  saveModifiedRecipes,
  loadRecentlyOpened,
  saveRecentlyOpened,
} from './storage';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [preparationCheckedItems, setPreparationCheckedItems] = useState<string[]>([]);
  const [preparationCheckedSteps, setPreparationCheckedSteps] = useState<string[]>([]);
  const [activeCookingRecipeId, setActiveCookingRecipeId] = useState<string | null>(null);
  const [activeCookingStepIndex, setActiveCookingStepIndex] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [cookingNotes, setCookingNotes] = useState<CookingNote[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlanItem[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [userModifiedRecipes, setUserModifiedRecipes] = useState<string[]>([]);
  const [recentlyOpenedIds, setRecentlyOpenedIds] = useState<string[]>([]);

  useEffect(() => {
    const initialize = async () => {
      await initializeStorage();
      const loadedRecipes = await loadFromStorage();
      setRecipes(loadedRecipes);
      const favs = await loadFavorites();
      setFavorites(favs);
      const inv = await loadInventory();
      setInventory(inv);
      const shop = await loadShoppingList();
      setShoppingList(shop);
      const notes = await loadNotes();
      setCookingNotes(notes);
      const plans = await loadMealPlans();
      setMealPlans(plans);
      const cookingState = await loadCookingState();
      setActiveCookingRecipeId(cookingState.recipeId);
      setActiveCookingStepIndex(cookingState.stepIndex);
      const modified = await loadModifiedRecipes();
      setUserModifiedRecipes(modified);
      const recent = await loadRecentlyOpened();
      setRecentlyOpenedIds(recent);
    };
    initialize();
  }, []);

  const loadRecipes = async () => {
    const loadedRecipes = await loadFromStorage();
    setRecipes(loadedRecipes);
  };

  const addRecipe = async (recipe: Recipe) => {
    await addToStorage(recipe);
    setRecipes([...recipes, recipe]);
  };

  const updateRecipe = async (recipe: Recipe) => {
    await updateInStorage(recipe);
    setRecipes(recipes.map(r => r.id === recipe.id ? recipe : r));
  };

  const deleteRecipe = async (id: string) => {
    await deleteFromStorage(id);
    setRecipes(recipes.filter(r => r.id !== id));
  };

  const selectRecipe = (recipe: Recipe | null) => {
    setSelectedRecipe(recipe);
  };

  const resetPreparationChecklist = () => {
    setPreparationCheckedItems([]);
  };

  const togglePreparationItem = (item: string) => {
    setPreparationCheckedItems(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const clearPreparationChecklist = () => {
    setPreparationCheckedItems([]);
  };

  const togglePreparationStep = (stepId: string) => {
    setPreparationCheckedSteps(prev =>
      prev.includes(stepId)
        ? prev.filter(i => i !== stepId)
        : [...prev, stepId]
    );
  };

  const resetPreparationSteps = () => {
    setPreparationCheckedSteps([]);
  };

  const setActiveCooking = (recipeId: string | null, stepIndex: number) => {
    setActiveCookingRecipeId(recipeId);
    setActiveCookingStepIndex(stepIndex);
    saveCookingState(recipeId, stepIndex);
  };

  const toggleFavorite = async (recipeId: string) => {
    const newFavs = favorites.includes(recipeId)
      ? favorites.filter(id => id !== recipeId)
      : [...favorites, recipeId];
    setFavorites(newFavs);
    await saveFavorites(newFavs);
  };

  const addInventoryItem = async (item: InventoryItem) => {
    const newInv = [...inventory, item];
    setInventory(newInv);
    await saveInventory(newInv);
  };

  const removeInventoryItem = async (id: string) => {
    const newInv = inventory.filter(i => i.id !== id);
    setInventory(newInv);
    await saveInventory(newInv);
  };

  const updateInventoryItem = async (item: InventoryItem) => {
    const newInv = inventory.map(i => i.id === item.id ? item : i);
    setInventory(newInv);
    await saveInventory(newInv);
  };

  const addShoppingItem = async (item: ShoppingItem) => {
    const newList = [...shoppingList, item];
    setShoppingList(newList);
    await saveShoppingList(newList);
  };

  const toggleShoppingItem = async (id: string) => {
    const newList = shoppingList.map(i => i.id === id ? { ...i, checked: !i.checked } : i);
    setShoppingList(newList);
    await saveShoppingList(newList);
  };

  const removeShoppingItem = async (id: string) => {
    const newList = shoppingList.filter(i => i.id !== id);
    setShoppingList(newList);
    await saveShoppingList(newList);
  };

  const addCookingNote = async (note: CookingNote) => {
    const newNotes = [...cookingNotes, note];
    setCookingNotes(newNotes);
    await saveNotes(newNotes);
  };

  const updateCookingNote = async (note: CookingNote) => {
    const newNotes = cookingNotes.map(n => n.id === note.id ? note : n);
    setCookingNotes(newNotes);
    await saveNotes(newNotes);
  };

  const deleteCookingNote = async (id: string) => {
    const newNotes = cookingNotes.filter(n => n.id !== id);
    setCookingNotes(newNotes);
    await saveNotes(newNotes);
  };

  const saveMealPlan = async (plans: MealPlanItem[]) => {
    setMealPlans(plans);
    await saveMealPlans(plans);
  };

  const markRecipeAsModified = async (recipeId: string) => {
    if (!userModifiedRecipes.includes(recipeId)) {
      const updated = [...userModifiedRecipes, recipeId];
      setUserModifiedRecipes(updated);
      await saveModifiedRecipes(updated);
    }
  };

  const markRecipeAsOpened = async (recipeId: string) => {
    const filtered = recentlyOpenedIds.filter(id => id !== recipeId);
    const updated = [recipeId, ...filtered];
    setRecentlyOpenedIds(updated);
    await saveRecentlyOpened(updated);
  };

  const value: AppContextType = {
    recipes,
    selectedRecipe,
    searchQuery,
    selectedCategory,
    preparationCheckedItems,
    preparationCheckedSteps,
    activeCookingRecipeId,
    activeCookingStepIndex,
    favorites,
    inventory,
    cookingNotes,
    mealPlans,
    shoppingList,
    userModifiedRecipes,
    recentlyOpenedIds,
    loadRecipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    selectRecipe,
    setSearchQuery,
    setSelectedCategory,
    togglePreparationItem,
    clearPreparationChecklist,
    resetPreparationChecklist,
    togglePreparationStep,
    resetPreparationSteps,
    setActiveCooking,
    toggleFavorite,
    addInventoryItem,
    removeInventoryItem,
    updateInventoryItem,
    addShoppingItem,
    toggleShoppingItem,
    removeShoppingItem,
    addCookingNote,
    updateCookingNote,
    deleteCookingNote,
    saveMealPlan,
    markRecipeAsModified,
    markRecipeAsOpened,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};