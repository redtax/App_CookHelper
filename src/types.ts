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
  categories: string[];
  tags: string[];
  servings: number;
  prepTime: string;
  cookTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  technique?: string;
  flavor?: string;
  ingredients: Ingredient[];
  mainIngredients: Ingredient[];
  auxiliaryIngredients: Ingredient[];
  seasonings: Ingredient[];
  preparationSteps: PreparationStep[];
  cookingSteps: CookingStep[];
  imageUrl?: string;
  overallFlow?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  expiryDate?: string;
  addedDate: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  checked: boolean;
}

export interface CookingNote {
  id: string;
  recipeId: string;
  recipeName: string;
  date: string;
  content: string;
  rating: number;
  isSuccess: boolean;
}

export interface MealPlanItem {
  id: string;
  dayOfWeek: number;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  recipeId: string;
  recipeName: string;
}

export interface AppState {
  recipes: Recipe[];
  selectedRecipe: Recipe | null;
  searchQuery: string;
  selectedCategory: string | null;
  preparationCheckedItems: string[];
  preparationCheckedSteps: string[];
  activeCookingRecipeId: string | null;
  activeCookingStepIndex: number;
  favorites: string[];
  inventory: InventoryItem[];
  cookingNotes: CookingNote[];
  mealPlans: MealPlanItem[];
  shoppingList: ShoppingItem[];
  userModifiedRecipes: string[];
  recentlyOpenedIds: string[];
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
  setActiveCooking: (recipeId: string | null, stepIndex: number) => void;
  toggleFavorite: (recipeId: string) => void;
  addInventoryItem: (item: InventoryItem) => void;
  removeInventoryItem: (id: string) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  addShoppingItem: (item: ShoppingItem) => void;
  toggleShoppingItem: (id: string) => void;
  removeShoppingItem: (id: string) => void;
  addCookingNote: (note: CookingNote) => void;
  updateCookingNote: (note: CookingNote) => void;
  deleteCookingNote: (id: string) => void;
  saveMealPlan: (plans: MealPlanItem[]) => void;
  markRecipeAsModified: (recipeId: string) => void;
  markRecipeAsOpened: (recipeId: string) => void;
}