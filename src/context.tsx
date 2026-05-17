import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Recipe, AppContextType } from './types';
import { loadRecipes as loadFromStorage, saveRecipes, addRecipe as addToStorage, updateRecipe as updateInStorage, deleteRecipe as deleteFromStorage, initializeStorage } from './storage';

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

  useEffect(() => {
    const initialize = async () => {
      await initializeStorage();
      const loadedRecipes = await loadFromStorage();
      setRecipes(loadedRecipes);
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

  const value: AppContextType = {
    recipes,
    selectedRecipe,
    searchQuery,
    selectedCategory,
    preparationCheckedItems,
    preparationCheckedSteps,
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
