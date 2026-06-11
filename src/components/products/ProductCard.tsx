import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Droplets, Flame, PlayCircle, Sparkles, Zap } from 'lucide-react';
import type { ProductSummary } from '../../data/products';

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Flame,
  Zap,
  Droplets,
  PlayCircle,
  Sparkles,
};

/**
 * Capa de produit façon Netflix : grande affiche cliquable avec dégradé,
 * halos décoratifs, badge, titre serif et appel à l'action.
 */
export const ProductCard: React.FC<{ product: ProductSummary }> = ({ product }) => {
  const navigate = useNavigate();
  const Icon = ICONS[product.icon] ?? Sparkles;

  return (
    <button
      onClick={() => navigate(product.route)}
      className={`group relative w-full text-left rounded-[28px] overflow-hidden cursor-pointer
        bg-gradient-to-br ${product.gradient} text-white shadow-soft-lg
        transition-transform duration-200 active:scale-[0.985]`}
    >
      {/* Décor : halos doux + grande icône en filigrane */}
      <div className={`absolute -top-12 -right-12 w-44 h-44 rounded-full ${product.accent} blur-2xl pointer-events-none`} />
      <div className="absolute -bottom-14 -left-8 w-40 h-40 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <Icon
        size={150}
        className="absolute -right-6 -bottom-8 text-white/[0.07] pointer-events-none"
      />

      <div className="relative p-6 min-h-[176px] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            {product.badge && (
              <span className="inline-flex text-[10px] font-bold uppercase tracking-[0.15em] bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                {product.badge}
              </span>
            )}
            <span className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center flex-shrink-0">
              <Icon size={20} />
            </span>
          </div>

          <h3 className="font-display text-[22px] leading-tight">{product.title}</h3>
          <p className="text-white/70 text-[13px] font-semibold mt-1">{product.subtitle}</p>
          <p className="text-white/85 text-sm leading-relaxed mt-2 line-clamp-2">{product.description}</p>
        </div>

        <div className="flex items-center gap-2 mt-4 text-sm font-bold">
          <span>{product.cta}</span>
          <ArrowRight
            size={17}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </div>
      </div>
    </button>
  );
};

export default ProductCard;
