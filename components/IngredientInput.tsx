import React, { useState } from 'react';
import { t } from '../translations';

interface IngredientInputProps {
  onAddIngredient: (ingredient: string) => void;
}

const IngredientInput: React.FC<IngredientInputProps> = ({ onAddIngredient }) => {
  const [ingredient, setIngredient] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredient.trim()) {
      onAddIngredient(ingredient.trim());
      setIngredient('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-grow flex gap-2">
      <input
        type="text"
        value={ingredient}
        onChange={(e) => setIngredient(e.target.value)}
        placeholder={t('placeholderIngredients')}
        className="flex-grow w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        aria-label="New ingredient"
      />
      <button
        type="submit"
        className="bg-green-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-800 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-stone-400"
        disabled={!ingredient.trim()}
      >
        {t('add')}
      </button>
    </form>
  );
};

export default IngredientInput;