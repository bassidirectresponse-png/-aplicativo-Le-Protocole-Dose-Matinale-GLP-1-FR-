import React, { useEffect } from 'react';
import { CheckCircle2, Clock, X } from 'lucide-react';
import { parseVideoUrl } from '../../lib/videoEmbed';

interface VideoPlayerProps {
  /** Lien de la vidéo (YouTube, Vimeo, .mp4...). Vide = « Bientôt disponible ». */
  url: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  /** Bouton « Marquer comme terminé » (optionnel) */
  onComplete?: () => void;
  completeLabel?: string;
}

/**
 * Lecteur vidéo plein écran qui s'ouvre DANS l'application (même page),
 * jamais sur un site externe. Détecte automatiquement le type de lien.
 */
export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  title,
  subtitle,
  onClose,
  onComplete,
  completeLabel = 'Marquer comme terminé',
}) => {
  const video = parseVideoUrl(url);

  // Fermer avec la touche Échap
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-fade-in backdrop-blur-md">
      <div className="flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent">
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

      <div className="flex-1 flex items-center justify-center w-full px-4">
        <div className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
          {video.kind === 'none' ? (
            <div className="text-center px-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-white/10 flex items-center justify-center text-white/80 mb-4">
                <Clock size={30} />
              </div>
              <p className="text-white font-black text-lg">Bientôt disponible</p>
              <p className="text-white/50 text-sm mt-2 leading-relaxed max-w-xs mx-auto">
                Cette vidéo sera ajoutée prochainement. Revenez bientôt pour la découvrir.
              </p>
            </div>
          ) : video.kind === 'file' ? (
            <video
              src={video.src}
              controls
              autoPlay
              playsInline
              className="w-full h-full"
            />
          ) : (
            <iframe
              src={video.src}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              className="w-full h-full"
            />
          )}
        </div>
      </div>

      {onComplete && video.kind !== 'none' && (
        <div className="p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center pb-safe">
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

export default VideoPlayer;
