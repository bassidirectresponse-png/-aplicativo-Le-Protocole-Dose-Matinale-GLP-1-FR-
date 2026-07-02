import React, { useEffect, useRef } from 'react';

interface VturbPlayerProps {
  /** Identifiant de compte ConverteAI. */
  account: string;
  /** ID du lecteur VTurb (sans le préfixe « vid- »). */
  player: string;
}

/**
 * Lecteur vidéo VTurb / ConverteAI (web component <vturb-smartplayer>).
 *
 * VTurb n'est pas une simple URL : chaque vidéo a son propre script de lecteur
 * qui doit être injecté dans la page. Ce composant reproduit exactement la
 * structure attendue par VTurb (placeholder vertical 9:16) et injecte le
 * script correspondant, puis nettoie tout à la fermeture pour permettre une
 * réouverture propre.
 */
export const VturbPlayer: React.FC<VturbPlayerProps> = ({ account, player }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elementId = `vid-${player}`;

    // Structure exacte attendue par VTurb (vidéo verticale 9:16 -> padding 177.77%).
    container.innerHTML =
      `<vturb-smartplayer id="${elementId}" style="display:block;margin:0 auto;width:100%;max-width:400px;">` +
      `<div class="vturb-player-placeholder" style="position:relative;width:100%;padding:177.77777777777777% 0 0;z-index:0;background-color:black;"></div>` +
      `</vturb-smartplayer>`;

    // Injection du script du lecteur (un script par vidéo).
    const src = `https://scripts.converteai.net/${account}/players/${player}/v4/player.js`;
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.vturbPlayer = player;
    document.head.appendChild(script);

    return () => {
      script.remove();
      // Retire d'éventuels scripts résiduels du même lecteur.
      document
        .querySelectorAll(`script[data-vturb-player="${player}"]`)
        .forEach((node) => node.remove());
      container.innerHTML = '';
    };
  }, [account, player]);

  return <div ref={containerRef} className="w-full flex justify-center" />;
};

export default VturbPlayer;
