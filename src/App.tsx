import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { useTranslation } from 'react-i18next';

// Lazy load pages for better performance
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Courses = React.lazy(() => import('./pages/Courses'));
const Recipes = React.lazy(() => import('./pages/Recipes'));
const Calendar = React.lazy(() => import('./pages/Calendar'));
const Profile = React.lazy(() => import('./pages/Profile'));
const ProductRecipes = React.lazy(() => import('./pages/ProductRecipes'));

const SUPPORTED_LANGS = ['en', 'pt', 'fr', 'es', 'de', 'it'];

/** Wrapper: reads :lang param, changes i18n, then renders Onboarding */
const OnboardingWithLang: React.FC = () => {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

  React.useEffect(() => {
    const resolved = lang && SUPPORTED_LANGS.includes(lang) ? lang : 'fr';
    if (i18n.language !== resolved) {
      i18n.changeLanguage(resolved);
    }
  }, [lang, i18n]);

  return <Onboarding />;
};

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
    <div className="w-12 h-12 rounded-full border-4 border-pink-200 border-t-pink-500 animate-spin" />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && !user) navigate('/onboarding', { replace: true });
  }, [user, loading, navigate]);

  if (loading) return <Spinner />;
  return user ? <>{children}</> : null;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <React.Suspense fallback={<Spinner />}>
          <Routes>
            {/* Public Routes */}
            {/* Default onboarding (no language prefix) */}
            <Route path="/onboarding" element={<Onboarding />} />
            {/* Language-specific onboarding URLs: /onboarding/fr, /onboarding/pt, etc. */}
            <Route path="/onboarding/:lang" element={<OnboardingWithLang />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route path="/*" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="courses" element={<Courses />} />
              <Route path="recipes" element={<Recipes />} />
              <Route path="produit/:productId" element={<ProductRecipes />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
