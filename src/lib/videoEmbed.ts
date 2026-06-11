// Détection automatique du type de vidéo à partir d'un simple lien.
// L'utilisateur colle n'importe quel lien dans `videoUrl` (voir courseModules.ts)
// et ce module décide comment l'afficher À L'INTÉRIEUR de l'application.

export type EmbedKind = 'youtube' | 'vimeo' | 'file' | 'iframe' | 'none';

export interface ParsedVideo {
  kind: EmbedKind;
  /** URL prête à être utilisée (src d'iframe ou de balise <video>) */
  src: string;
}

/**
 * Analyse un lien vidéo et renvoie le type + une source intégrable.
 * - YouTube / Vimeo  -> URL d'embed (iframe) avec lecture en page
 * - Fichier média    -> URL directe pour <video>
 * - Autre lien       -> tel quel, intégré en iframe
 * - Vide             -> { kind: 'none' }
 */
export function parseVideoUrl(url: string): ParsedVideo {
  const u = (url || '').trim();
  if (!u) return { kind: 'none', src: '' };

  // YouTube : watch?v=, youtu.be/, /embed/, /shorts/
  const yt = u.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/
  );
  if (yt) {
    return {
      kind: 'youtube',
      src: `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1&playsinline=1&autoplay=1`,
    };
  }

  // Vimeo : vimeo.com/123456789 ou vimeo.com/video/123456789
  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) {
    return {
      kind: 'vimeo',
      src: `https://player.vimeo.com/video/${vm[1]}?autoplay=1&title=0&byline=0&portrait=0`,
    };
  }

  // Fichier média direct
  if (/\.(mp4|webm|ogg|mov|m4v|m3u8)(\?.*)?$/i.test(u)) {
    return { kind: 'file', src: u };
  }

  // Tout autre lien : on tente une intégration iframe
  return { kind: 'iframe', src: u };
}

/** Vrai si un lien vidéo a été renseigné et peut être lu. */
export function hasVideo(url: string): boolean {
  return parseVideoUrl(url).kind !== 'none';
}
