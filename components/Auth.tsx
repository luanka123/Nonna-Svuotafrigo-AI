import React, { useState } from 'react';
import Login from './Login';
import Registration from './Registration';
import { User } from '../types';
import ChefHatIcon from './icons/ChefHatIcon';
import { t } from '../translations';

interface AuthProps {
  onAuth: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuth }) => {
  const [view, setView] = useState<'options' | 'login' | 'register'>('options');

  if (view === 'login') {
    return <Login onAuth={onAuth} onSwitchToRegister={() => setView('register')} />;
  }

  if (view === 'register') {
    return <Registration onRegister={onAuth} onSwitchToLogin={() => setView('login')} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4 font-sans">
      <div className="w-full max-w-md text-center">
        <ChefHatIcon className="w-20 h-20 text-green-700 mx-auto mb-6" />
        <h1 className="text-4xl font-bold tracking-tight text-stone-800 mb-2">
          Nonna Svuotafrigo AI
        </h1>
        <p className="text-stone-500 text-lg mb-10">{t('welcomeAuth')}</p>
        <div className="space-y-4">
          <button
            onClick={() => setView('login')}
            className="w-full bg-green-700 text-white font-bold py-4 px-6 rounded-lg hover:bg-green-800 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-lg"
          >
            {t('login')}
          </button>
          <button
            onClick={() => setView('register')}
            className="w-full bg-stone-700 text-white font-bold py-4 px-6 rounded-lg hover:bg-stone-800 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 text-lg"
          >
            {t('register')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;