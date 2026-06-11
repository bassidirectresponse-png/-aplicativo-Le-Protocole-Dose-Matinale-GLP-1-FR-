import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, PlaySquare, Calendar as CalendarIcon, Settings, CookingPot } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  
  const NAV_ITEMS = [
    { to: '/', icon: Home, label: t('nav.home', 'Home') },
    { to: '/recipes', icon: CookingPot, label: t('nav.recipes', 'Recettes'), isRecipe: true },
    { to: '/courses', icon: PlaySquare, label: t('courses.title', 'Cours'), isPrimary: true },
    { to: '/calendar', icon: CalendarIcon, label: t('nav.calendar', 'Poids') },
    { to: '/profile', icon: Settings, label: t('profile.settings_title', 'Profil') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-white/90 backdrop-blur-xl border-t border-gray-100/80 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]" />
      <ul className="relative flex items-end justify-around max-w-md mx-auto px-2 py-2 pb-safe">
        {NAV_ITEMS.map(({ to, icon: Icon, label, isPrimary, isRecipe }) => (
          <li key={to} className={isPrimary ? "flex-1 flex justify-center -translate-y-3" : "flex-1 flex justify-center"}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }: { isActive: boolean }) =>
                `flex flex-col items-center gap-1 py-1 px-2 rounded-2xl transition-all duration-300 ${
                  isPrimary 
                    ? isActive ? 'scale-110' : 'hover:scale-105'
                    : isActive ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400'
                }`
              }
            >
              {({ isActive }: { isActive: boolean }) => (
                <>
                  <div className={`relative flex items-center justify-center transition-all duration-300 ${
                    isPrimary 
                      ? 'w-14 h-14 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 text-white shadow-lg shadow-pink-200/50' 
                      : isRecipe
                        ? `w-11 h-11 rounded-2xl border ${isActive ? 'bg-rose-50 border-rose-200 text-rose-500 shadow-sm' : 'bg-white border-gray-100 text-gray-400'}`
                        : `w-10 h-10 rounded-2xl ${isActive ? 'bg-pink-50 text-pink-500' : 'text-gray-400'}`
                  }`}>
                    <Icon 
                      size={isPrimary ? 24 : 22} 
                      strokeWidth={isPrimary ? 2.5 : isActive ? 2.5 : 2} 
                      className={isPrimary ? "ml-0.5" : ""}
                    />
                    {!isPrimary && isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-pink-500 rounded-full" />
                    )}
                  </div>
                  <span className={`text-[10px] font-bold tracking-tight mt-0.5 ${
                    isPrimary 
                      ? isActive ? 'text-pink-600' : 'text-gray-500' 
                      : isActive ? 'text-pink-500' : 'text-gray-400'
                  }`}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
