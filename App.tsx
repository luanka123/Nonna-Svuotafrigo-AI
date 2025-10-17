import React, { useState, useCallback, useEffect } from 'react';
import { Recipe, User } from './types';
import { generateItalianRecipeFromIngredients, identifyIngredientsFromImage } from './services/geminiService';
import RecipeCard from './components/RecipeCard';
import LoadingSpinner from './components/LoadingSpinner';
import ChefHatIcon from './components/icons/ChefHatIcon';
import CameraIcon from './components/icons/CameraIcon';
import TrashIcon from './components/icons/TrashIcon';
import IngredientInput from './components/IngredientInput';
import CameraScanner from './components/CameraScanner';
import SplashScreen from './components/SplashScreen';
import HeartIcon from './components/icons/HeartIcon';
import LeafIcon from './components/icons/LeafIcon';
import { t, lang } from './translations';
import Auth from './components/Auth';

type View = 'search' | 'favorites';
const FAVORITES_LIMIT = 12;

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [currentView, setCurrentView] = useState<View>('search');

  useEffect(() => {
    const timer = setTimeout(() => {
        setShowSplash(false);
    }, 2500);

    try {
        const storedUser = localStorage.getItem('nonna-ai-user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    } catch (e) {
        console.error("Failed to parse user from localStorage", e);
    }

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem('favoriteRecipes');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (e) {
      console.error("Failed to parse favorites from localStorage", e);
      setFavorites([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
    } catch (e) {
      console.error("Failed to save favorites to localStorage", e);
    }
  }, [favorites]);

  const handleAuth = (newUser: User) => {
    try {
        localStorage.setItem('nonna-ai-user', JSON.stringify(newUser));
        setUser(newUser);
    } catch(e) {
        console.error("Failed to save user to localStorage", e);
    }
  };

  const handleLogout = () => {
    try {
        localStorage.removeItem('nonna-ai-user');
        setUser(null);
        setFavorites([]);
        localStorage.removeItem('favoriteRecipes');
    } catch (e) {
        console.error("Failed to remove user from localStorage", e);
    }
  };

  const handleAddIngredient = (ingredient: string) => {
    if (!ingredients.some(i => i.toLowerCase() === ingredient.toLowerCase())) {
      setIngredients(prev => [...prev, ingredient]);
    }
  };

  const handleRemoveIngredient = (ingredientToRemove: string) => {
    setIngredients(prev => prev.filter(ingredient => ingredient !== ingredientToRemove));
  };

  const handleClearIngredients = () => {
    setIngredients([]);
    setRecipes([]);
    setError(null);
  }

  const handleFindRecipe = useCallback(async () => {
    if (ingredients.length === 0) {
      setError(t('addIngredientsFirst'));
      return;
    }
    setIsLoading(true);
    setError(null);
    setRecipes([]);

    try {
      const result = await generateItalianRecipeFromIngredients(ingredients, lang);
      if (result.length === 0) {
        setError(t('noRecipeFound'));
      } else {
        setRecipes(result);
      }
    } catch (err: any) {
      setError(err.message || t('unexpectedError'));
    } finally {
      setIsLoading(false);
    }
  }, [ingredients]);
  
  const handleIngredientsScanned = (scannedIngredients: string[]) => {
    setIngredients(prev => [...new Set([...prev, ...scannedIngredients])]);
    setIsCameraOpen(false);
  };

  const handleToggleFavorite = useCallback((recipe: Recipe) => {
    setFavorites(prevFavorites => {
      const isAlreadyFavorite = prevFavorites.some(fav => fav.recipeName === recipe.recipeName);
      
      if (isAlreadyFavorite) {
        return prevFavorites.filter(fav => fav.recipeName !== recipe.recipeName);
      } else {
        if (prevFavorites.length >= FAVORITES_LIMIT) {
          alert(t('favoritesLimitReached'));
          return prevFavorites;
        }
        return [...prevFavorites, recipe];
      }
    });
  }, []);

  const isFavorite = (recipe: Recipe) => {
    return favorites.some(fav => fav.recipeName === recipe.recipeName);
  };

  if (!showSplash && !user) {
    return <Auth onAuth={handleAuth} />;
  }

  const renderContent = () => {
    if (currentView === 'favorites') {
      return (
        <div className="mt-8">
          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {favorites.map((recipe, index) => (
                <RecipeCard
                  key={`${recipe.recipeName}-${index}`}
                  recipe={recipe}
                  isFavorite={true}
                  onToggleFavorite={handleToggleFavorite}
                  userIngredients={ingredients}
                  onAddMissingIngredient={handleAddIngredient}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-6 bg-white/50 rounded-lg shadow-sm">
              <HeartIcon className="mx-auto w-16 h-16 text-stone-400 mb-4" />
              <h3 className="text-2xl font-semibold text-stone-700">{t('noFavorites')}</h3>
              <p className="text-stone-500 mt-2">{t('saveRecipesPrompt')}</p>
            </div>
          )}
        </div>
      );
    }

    // Search view
    return (
      <>
        <div className="bg-white/50 p-6 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-bold text-stone-800 mb-4">{t('addYourIngredients')}</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <IngredientInput onAddIngredient={handleAddIngredient} />
            <button
              onClick={() => setIsCameraOpen(true)}
              className="flex items-center justify-center gap-2 bg-stone-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-stone-800 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
              aria-label="Scan ingredients with camera"
            >
              <CameraIcon className="w-5 h-5" />
              <span>{t('scanWithCamera')}</span>
            </button>
          </div>

          {ingredients.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-stone-700 mb-2">{t('yourIngredients')}</h3>
              <ul className="flex flex-wrap gap-2">
                {ingredients.map(ingredient => (
                  <li key={ingredient} className="flex items-center bg-green-200 text-green-900 text-sm font-medium px-3 py-1 rounded-full">
                    <span>{ingredient}</span>
                    <button onClick={() => handleRemoveIngredient(ingredient)} className="ml-2 text-green-700 hover:text-green-900" aria-label={`Remove ${ingredient}`}>
                      &#x2715;
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleFindRecipe}
                  disabled={isLoading}
                  className="bg-green-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-800 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-stone-400"
                >
                  {isLoading ? t('searching') : t('findRecipe')}
                </button>
                <button
                    onClick={handleClearIngredients}
                    className="flex items-center justify-center gap-2 bg-stone-200 text-stone-700 font-bold py-3 px-4 rounded-lg hover:bg-stone-300 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2"
                    aria-label="Clear all ingredients"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          {isLoading && <LoadingSpinner />}
          {error && <div className="text-center text-red-600 bg-red-100 p-4 rounded-lg">{error}</div>}
          {!isLoading && recipes.length > 0 && (
            <div className="grid grid-cols-1 gap-8">
              {recipes.map((recipe, index) => (
                <RecipeCard
                  key={`${recipe.recipeName}-${index}`}
                  recipe={recipe}
                  isFavorite={isFavorite(recipe)}
                  onToggleFavorite={handleToggleFavorite}
                  userIngredients={ingredients}
                  onAddMissingIngredient={handleAddIngredient}
                />
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      <SplashScreen show={showSplash} />
      {isCameraOpen && (
        <CameraScanner
          onClose={() => setIsCameraOpen(false)}
          onIngredientsScanned={handleIngredientsScanned}
          lang={lang}
        />
      )}
      <div className={`min-h-screen font-sans transition-opacity duration-300 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        <header className="bg-stone-100/80 backdrop-blur-sm sticky top-0 z-10 shadow-md">
          <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <ChefHatIcon className="w-10 h-10 text-green-700" />
              <h1 className="text-3xl font-bold tracking-tight text-stone-800">
                Nonna Svuotafrigo AI
              </h1>
            </div>
            {user && (
                 <div className="flex flex-col md:flex-row items-center gap-4">
                     <p className="text-stone-600 font-medium">
                        {t('welcomeUser').replace('{name}', user.firstName)}
                     </p>
                    <nav className="flex gap-2 p-1 bg-stone-200/50 rounded-full">
                       <button
                          onClick={() => setCurrentView('search')}
                          className={`px-4 py-2 rounded-full font-semibold transition-colors ${currentView === 'search' ? 'bg-white text-green-700 shadow' : 'text-stone-600 hover:bg-white/50'}`}
                        >
                          {t('searchForRecipes')}
                        </button>
                        <button
                          onClick={() => setCurrentView('favorites')}
                          className={`px-4 py-2 rounded-full font-semibold transition-colors ${currentView === 'favorites' ? 'bg-white text-green-700 shadow' : 'text-stone-600 hover:bg-white/50'}`}
                        >
                          {t('viewFavorites')} ({favorites.length})
                        </button>
                    </nav>
                     <button
                        onClick={handleLogout}
                        className="text-sm text-stone-500 hover:text-stone-800 transition-colors"
                     >
                        {t('logout')}
                     </button>
                 </div>
            )}
          </div>
        </header>

        <main className="container mx-auto p-4 md:p-8">
          {currentView === 'search' && !ingredients.length && !recipes.length && !isLoading && !error && (
             <div className="text-center py-16 px-6">
                <h2 className="text-4xl font-bold text-stone-700">{t('welcomeTitle')}</h2>
                <p className="text-stone-500 mt-2 text-lg max-w-2xl mx-auto">{t('addIngredientsPrompt')}</p>
                <div className="mt-8 inline-flex items-center gap-3 bg-green-100 text-green-800 font-semibold px-4 py-2 rounded-full">
                  <LeafIcon className="w-6 h-6" />
                  <span>{t('antiWasteMission')}</span>
                </div>
             </div>
          )}
          {renderContent()}
        </main>

        <footer className="container mx-auto px-4 py-6 text-center text-stone-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Nonna AI. {t('appSubtitle')}</p>
        </footer>
      </div>
    </>
  );
};

export default App;
