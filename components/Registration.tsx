
import React, { useState } from 'react';
import { User } from '../types';
import { t } from '../translations';
import ChefHatIcon from './icons/ChefHatIcon';

interface RegistrationProps {
  onRegister: (user: User) => void;
  onSwitchToLogin: () => void;
}

const Registration: React.FC<RegistrationProps> = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '' });
  const [errors, setErrors] = useState({ firstName: '', lastName: '', email: '' });

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = { firstName: '', lastName: '', email: '' };
    let isValid = true;

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('fieldRequired');
      isValid = false;
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = t('fieldRequired');
      isValid = false;
    }
    if (!formData.email.trim()) {
      newErrors.email = t('fieldRequired');
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('invalidEmail');
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      onRegister({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim()
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <ChefHatIcon className="w-16 h-16 text-green-700 mx-auto mb-4" />
            <h1 className="text-3xl font-bold tracking-tight text-stone-800">
                {t('registerTitle')}
            </h1>
            <p className="text-stone-500 mt-2">{t('registerSubtitle')}</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-stone-200">
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-stone-700">{t('firstName')}</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-stone-300 focus:ring-green-500'}`}
                  required
                />
                {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-stone-700">{t('lastName')}</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-stone-300 focus:ring-green-500'}`}
                  required
                />
                {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-stone-700">{t('email')}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-stone-300 focus:ring-green-500'}`}
                  required
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
            </div>
            <div className="mt-8">
              <button
                type="submit"
                className="w-full bg-green-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-800 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {t('register')}
              </button>
            </div>
          </form>
          <p className="text-center text-sm text-stone-600 mt-6">
            {t('hasAccount')}{' '}
            <button onClick={onSwitchToLogin} className="font-semibold text-green-700 hover:text-green-600">
              {t('login')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registration;
