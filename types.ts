
export interface Ingredient {
  name: string;
  fullText: string;
}

export interface Recipe {
  recipeName: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  difficulty: number;
  preparationTime: string;
}

export interface User {
  firstName: string;
  lastName: string;
  email: string;
}
