import React from 'react';
import { Recipe } from '../types';
import HeartIcon from './icons/HeartIcon';
import { t } from '../translations';
import ChefHatIcon from './icons/ChefHatIcon';
import ClockIcon from './icons/ClockIcon';
import PlusIcon from './icons/PlusIcon';

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: (recipe: Recipe) => void;
  userIngredients?: string[];
  onAddMissingIngredient?: (ingredientName: string) => void;
}

// This function attempts to extract the core name of an ingredient by removing quantities, units, and other noise.
const getCoreIngredient = (text: string): string => {
    // Basic list of stop words for English and Italian.
    const stopWords = new Set([
        'g', 'kg', 'ml', 'l', 'cup', 'cups', 'oz', 'tsp', 'tbsp', 'tablespoon', 'teaspoons', 'teaspoon',
        'of', 'di', 'un', 'una', 'un\'', 'a', 'q.b.', 'qb', 'quanto', 'basta',
        'grammi', 'grammo', 'chilo', 'litro', 'cucchiaio', 'cucchiaino', 'tazza', 'tazze', 'pizzico'
    ]);
    
    // 1. Convert to lowercase and remove numbers and punctuation that are not part of a name.
    const cleaned = text.toLowerCase().replace(/[\d.,()]/g, '').trim();
    
    // 2. Split into words, filter out stop words, and rejoin.
    return cleaned.split(/\s+/)
        .filter(word => word && !stopWords.has(word))
        .join(' ')
        .trim();
};


const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, isFavorite, onToggleFavorite, userIngredients, onAddMissingIngredient }) => {
  
  const renderDifficulty = (level: number) => {
    return (
      <div className="flex items-center" aria-label={`${t('difficulty')}: ${level} / 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <ChefHatIcon
            key={i}
            className={`w-5 h-5 ${i < level ? 'text-green-700' : 'text-stone-300'}`}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className="relative bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 border border-stone-200">
      <button
        onClick={() => onToggleFavorite(recipe)}
        className="absolute top-4 right-4 text-green-600 hover:text-green-700 transition-colors z-10 p-2 rounded-full bg-white/60 hover:bg-white/90"
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <HeartIcon filled={isFavorite} className="w-6 h-6" />
      </button>
      <div className="p-6 md:p-8">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">{recipe.recipeName}</h3>
        <p className="text-slate-600 mb-6">{recipe.description}</p>
        
        <div className="flex flex-wrap items-center justify-around gap-x-6 gap-y-3 mb-6 text-sm text-stone-700 border-y border-stone-200 py-3">
            <div className="flex items-center gap-2" title={`${t('difficulty')}: ${recipe.difficulty}/5`}>
                <span className="font-semibold sr-only">{t('difficulty')}:</span>
                {renderDifficulty(recipe.difficulty)}
            </div>
            <div className="flex items-center gap-2" title={`${t('preparationTime')}: ${recipe.preparationTime}`}>
                <ClockIcon className="w-5 h-5" />
                <span className="font-semibold sr-only">{t('preparationTime')}:</span>
                <span className="font-medium">{recipe.preparationTime}</span>
            </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg text-green-800 mb-2 border-b-2 border-stone-200 pb-1">Ingredienti</h4>
            <ul className="space-y-2 text-slate-700 mt-3">
              {recipe.ingredients.map((item, index) => {
                const isAvailable = userIngredients && userIngredients.length > 0 && userIngredients.some(userIng => {
                    const coreUserIng = getCoreIngredient(userIng);
                    const coreRecipeIng = getCoreIngredient(item.name);
                    
                    if (!coreUserIng || !coreRecipeIng) {
                        return false;
                    }
            
                    // Check if one core name is a substring of the other.
                    // This handles cases like "pecorino" vs "pecorino romano" and also
                    // user input with quantities vs clean recipe ingredient names.
                    return coreUserIng.includes(coreRecipeIng) || coreRecipeIng.includes(coreUserIng);
                });
                return (
                  <li key={index} className={`flex items-center justify-between transition-colors duration-200 ${isAvailable ? 'text-green-800' : 'text-red-700'}`}>
                    <span className={isAvailable ? 'font-medium' : ''}>{item.fullText}</span>
                    {!isAvailable && onAddMissingIngredient && (
                      <button 
                        onClick={() => onAddMissingIngredient(item.name)}
                        className="ml-2 p-1 rounded-full text-stone-500 hover:text-green-700 hover:bg-green-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                        aria-label={`Add ${item.name}`}
                        title={`Add ${item.name} to your ingredients`}
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg text-green-800 mb-2 border-b-2 border-stone-200 pb-1">Istruzioni</h4>
            <ol className="list-decimal list-inside space-y-3 text-slate-700 mt-3">
              {recipe.instructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;