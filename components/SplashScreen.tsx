import React from 'react';
import ChefHatIcon from './icons/ChefHatIcon';
import { t } from '../translations';

interface SplashScreenProps {
  show: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ show }) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-stone-50 transition-opacity duration-500 ${
        show ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex items-center justify-center gap-3 mb-2">
        <ChefHatIcon className="w-16 h-16 text-green-700" />
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-800">
          Nonna Svuotafrigo AI
        </h1>
      </div>
      <p className="text-xl text-slate-600">{t('splashTitle')}</p>
    </div>
  );
};

export default SplashScreen;