export interface Ingredient {
  name: string;
  amount: string;
  unit?: string;
  notes?: string;
}

export interface PreparationStep {
  id: string;
  description: string;
  ingredients?: string[];
  tips?: string;
}

export interface CookingStep {
  id: string;
  instruction: string;
  duration?: string;
  tips?: string;
  ingredients?: string[];
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  servings: number;
  prepTime: string;
  cookTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: Ingredient[];
  preparationSteps: PreparationStep[];
  cookingSteps: CookingStep[];
  imageUrl?: string;
}

export interface AppState {
  recipes: Recipe[];
  selectedRecipe: Recipe | null;
  searchQuery: string;
  selectedCategory: string | null;
  preparationCheckedItems: string[];
  preparationCheckedSteps: string[];
}

export interface AppContextType extends AppState {
  loadRecipes: () => Promise<void>;
  addRecipe: (recipe: Recipe) => Promise<void>;
  updateRecipe: (recipe: Recipe) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  selectRecipe: (recipe: Recipe | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  togglePreparationItem: (item: string) => void;
  clearPreparationChecklist: () => void;
  resetPreparationChecklist: () => void;
  togglePreparationStep: (stepId: string) => void;
  resetPreparationSteps: () => void;
}
