import React from 'react';
import { t } from '../translations';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 border-4 border-t-4 border-stone-200 border-t-green-700 rounded-full animate-spin"></div>
      <p className="text-slate-600 text-lg">{t('nonnaIsChecking')}</p>
    </div>
  );
};

export default LoadingSpinner;