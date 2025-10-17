import React, { useState } from 'react';
import { User } from '../types';
import { t } from '../translations';
import ChefHatIcon from './icons/ChefHatIcon';

interface LoginProps {
  onAuth: (user: User) => void;
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onAuth, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError(t('fieldRequired'));
      return;
    }
    if (!validateEmail(email)) {
        setError(t('invalidEmail'));
        return;
    }
    
    try {
      const storedUser = localStorage.getItem('nonna-ai-user');
      if (storedUser) {
        const user: User = JSON.parse(storedUser);
        if (user.email.toLowerCase() === email.trim().toLowerCase()) {
          onAuth(user);
        } else {
          setError(t('loginError'));
        }
      } else {
        setError(t('loginError'));
      }
    } catch (e) {
      console.error("Failed to process login", e);
      setError(t('unexpectedError'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <ChefHatIcon className="w-16 h-16 text-green-700 mx-auto mb-4" />
            <h1 className="text-3xl font-bold tracking-tight text-stone-800">
                {t('loginTitle')}
            </h1>
            <p className="text-stone-500 mt-2">{t('loginSubtitle')}</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-stone-200">
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-stone-700">{t('email')}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`mt-1 block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-stone-300 focus:ring-green-500'}`}
                  required
                  placeholder="you@example.com"
                  aria-invalid={!!error}
                  aria-describedby="email-error"
                />
                {error && <p id="email-error" className="mt-1 text-sm text-red-600">{error}</p>}
              </div>
            </div>
            <div className="mt-8">
              <button
                type="submit"
                className="w-full bg-green-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-800 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {t('login')}
              </button>
            </div>
          </form>
          <p className="text-center text-sm text-stone-600 mt-6">
            {t('noAccount')}{' '}
            <button onClick={onSwitchToRegister} className="font-semibold text-green-700 hover:text-green-600">
              {t('register')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
