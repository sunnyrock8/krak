export interface Dish {
  name: string;
  ingredients: Record<string, string>[];
  allergens: string[];
  dietary_restrictions: string[];
  nutritionalInfo: {
    carbohydrates: number;
    protein: number;
    fat: number;
    calories: number;
  };
  keywords: string[];
  disabled?: boolean;
}
