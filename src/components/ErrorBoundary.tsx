import React from 'react';

interface State {
  hasError: boolean;
  message?: string;
}

/**
 * Capture toute erreur de rendu pour éviter l'écran blanc.
 * Affiche un message clair + un bouton pour recharger l'application.
 */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#fff7fb] px-6">
          <div className="text-center max-w-xs">
            <div className="text-5xl mb-4">🌸</div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Une erreur est survenue</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              L'application a rencontré un problème. Rechargez la page pour continuer.
            </p>
            <button
              onClick={() => { window.location.href = '/'; }}
              className="w-full bg-pink-500 text-white font-black py-3.5 rounded-2xl"
            >
              Recharger l'application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
