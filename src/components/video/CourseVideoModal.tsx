import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { VturbPlayer } from './VturbPlayer';

interface CourseVideoModalProps {
  account: string;
  player: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  /** Bouton « Marquer comme terminé » (optionnel). */
  onComplete?: () => void;
  completeLabel?: string;
}

/**
 * Lecteur plein écran pour les leçons vidéo (format vertical 9:16).
 * S'ouvre DANS l'application, jamais sur un site externe.
 */
export const CourseVideoModal: React.FC<CourseVideoModalProps> = ({
  account,
  player,
  title,
  subtitle,
  onClose,
  onComplete,
  completeLabel = 'Marquer comme terminé',
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col animate-fade-in">
      {/* En-tête */}
      <div className="flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent flex-shrink-0">
        <div className="flex-1 pr-4 min-w-0">
          <h3 className="text-white font-bold text-sm truncate">{title}</h3>
          {subtitle && <p className="text-white/60 text-xs truncate mt-0.5">{subtitle}</p>}
        </div>
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors flex-shrink-0"
        >
          <X size={20} />
        </button>
      </div>

      {/* Lecteur vertical */}
      <div className="flex-1 overflow-y-auto flex items-center justify-center px-4 py-2">
        <div className="w-full max-w-[400px] rounded-2xl overflow-hidden shadow-2xl">
          <VturbPlayer account={account} player={player} />
        </div>
      </div>

      {/* Action */}
      {onComplete && (
        <div className="p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center pb-safe flex-shrink-0">
          <button
            onClick={onComplete}
            className="bg-green-500 hover:bg-green-600 text-white font-extrabold py-4 px-8 rounded-2xl shadow-lg shadow-green-500/30 transition-all flex items-center gap-2 text-lg w-full max-w-sm justify-center"
          >
            <CheckCircle2 size={22} />
            {completeLabel}
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseVideoModal;
