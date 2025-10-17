import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const recipeSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      recipeName: {
        type: Type.STRING,
        description: "The name of the recipe, in the requested language."
      },
      description: {
        type: Type.STRING,
        description: "A short, enticing description of the dish, in the requested language."
      },
      ingredients: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: "The core name of the ingredient, in the requested language (e.g., 'Guanciale', 'Uova', 'Pecorino Romano')."
            },
            fullText: {
              type: Type.STRING,
              description: "The full ingredient string including quantity and preparation notes, in the requested language (e.g., '100g di Guanciale', '4 tuorli d'uovo grandi')."
            }
          },
          required: ["name", "fullText"]
        },
        description: "A list of all ingredients required. Each ingredient must be an object with its name and its full description including quantity."
      },
      instructions: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
        description: "Clear, step-by-step cooking instructions to create the perfect dish, in the requested language."
      },
      difficulty: {
        type: Type.INTEGER,
        description: "A numerical rating of the recipe's difficulty from 1 (very easy) to 5 (very difficult)."
      },
      preparationTime: {
        type: Type.STRING,
        description: "The total estimated time for preparation and cooking, in the requested language (e.g., '45 minuti')."
      },
    },
    required: ["recipeName", "description", "ingredients", "instructions", "difficulty", "preparationTime"],
  },
};

const ingredientsSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.STRING,
  },
  description: "A list of identified food ingredients, in the requested language."
};

export const identifyIngredientsFromImage = async (base64ImageData: string, language: 'it' | 'en'): Promise<string[]> => {
  if (!base64ImageData) {
      throw new Error("Please provide image data.");
  }
  
  const langMap = {
    it: 'Italiano',
    en: 'English'
  };
  const responseLanguage = langMap[language];

  const prompt = `Analyze the image and identify all the food ingredients present. Focus on raw ingredients if possible. Return the list of ingredients as a JSON array of strings. The names of the ingredients MUST be in ${responseLanguage}.`;

  const imagePart = {
      inlineData: {
          mimeType: 'image/jpeg',
          data: base64ImageData,
      },
  };

  const textPart = {
      text: prompt,
  };

  try {
      const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: { parts: [imagePart, textPart] },
          config: {
              responseMimeType: "application/json",
              responseSchema: ingredientsSchema,
          },
      });

      const text = response.text.trim();
      const ingredients: string[] = JSON.parse(text);
      return ingredients;

  } catch (error) {
      console.error("Error identifying ingredients:", error);
      throw new Error("Failed to identify ingredients from the image. Please try again.");
  }
};

export const generateItalianRecipeFromIngredients = async (ingredients: string[], language: 'it' | 'en'): Promise<Recipe[]> => {
  if (!ingredients || ingredients.length === 0) {
    throw new Error("Please provide a list of ingredients.");
  }

  const langMap = {
    it: 'Italiano',
    en: 'English'
  };
  const responseLanguage = langMap[language];
  
  const systemInstruction = `You are an expert Italian chef, acting as a traditional but tech-savvy Italian "Nonna". Your primary skill is to look at a list of available ingredients and intelligently select a *subset* of those ingredients that combine perfectly to create a single, authentic, popular, fast, and high-quality Italian recipe. Your goal is not to use as many ingredients as possible, but to choose the *best combination* for the most delicious result. For example, if given chicken, lemon, rosemary, and also chocolate, you should ignore the chocolate and propose a recipe with chicken, lemon, and rosemary. All parts of your response—recipe name, description, ingredient details, and instructions—MUST be written exclusively in ${responseLanguage}. For each ingredient, provide both the core name and the full text with quantity. If no suitable recipe can be found, you must return an empty JSON array.`;
  
  const prompt = `From the following list of available ingredients: [${ingredients.join(', ')}], intelligently select the best ingredients to create one fantastic and fast Italian recipe. Do not attempt to use all the ingredients; focus on creating a coherent and delicious dish. The entire output must be in ${responseLanguage}. Provide the recipe name, a brief description, a list of ingredients (each as an object with 'name' and 'fullText'), step-by-step instructions, a difficulty rating (1-5), and the total preparation time.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
      },
    });

    const text = response.text.trim();
    const recipes: Recipe[] = JSON.parse(text);
    return recipes;

  } catch (error) {
    console.error("Error fetching recipe:", error);
    throw new Error("The Nonna is taking a nap and couldn't think of a recipe. Please try again with different ingredients.");
  }
};