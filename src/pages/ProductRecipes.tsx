import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, ChefHat, ChevronDown, Clock3, Sparkles,
} from 'lucide-react';
import { recipeProducts } from '../data/productRecipes';
import type { NaturalRecipe } from '../data/productRecipes';

/**
 * Page générique d'un produit « recettes » (Accélérateur 10x, Zéro Rétention...).
 * Les données viennent de src/data/productRecipes.ts, sélectionnées par :productId.
 */
const ProductRecipes: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);

  const product = productId ? recipeProducts[productId] : undefined;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf2f8] px-6">
        <div className="text-center max-w-xs">
          <h2 className="font-display text-2xl text-gray-900 mb-3">Programme introuvable</h2>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-pink-500 text-white font-bold py-4 rounded-2xl cursor-pointer"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf2f8] pb-28">
      {/* ── Héros / capa du produit ─────────────────────────────── */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${product.gradient} text-white`}>
        {/* Décor : halos doux */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />

        <div className="relative px-5 pt-6 pb-8">
          <button
            onClick={() => navigate('/')}
            aria-label="Retour à l'accueil"
            className="inline-flex items-center gap-2 text-white/80 text-sm font-semibold mb-6 cursor-pointer hover:text-white transition-colors duration-200 py-2 pr-3 -ml-1"
          >
            <ArrowLeft size={18} /> Accueil
          </button>

          <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em]">{product.subtitle}</p>
          <h1 className="font-display text-3xl leading-tight mt-2 mb-4">{product.title}</h1>
          <p className="text-white/85 text-base leading-relaxed">{product.intro}</p>
        </div>
      </div>

      {/* ── Mode d'emploi ───────────────────────────────────────── */}
      <div className="px-5 -mt-4 relative z-10">
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-white">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center flex-shrink-0">
              <Sparkles size={19} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">Comment l'utiliser</h2>
              <p className="text-sm text-gray-600 leading-relaxed mt-1">{product.usage}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recettes ────────────────────────────────────────────── */}
      <div className="px-5 mt-7">
        <h2 className="font-display text-2xl text-gray-900 mb-1">Les recettes</h2>
        <p className="text-sm text-gray-500 mb-5">
          {product.recipes.length} recettes naturelles — quantités, préparation et pourquoi ça marche.
        </p>

        <div className="flex flex-col gap-4">
          {product.recipes.map((recipe: NaturalRecipe, index: number) => {
            const isOpen = expanded === recipe.id;
            return (
              <section
                key={recipe.id}
                className="bg-white rounded-3xl shadow-soft border border-white overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : recipe.id)}
                  aria-expanded={isOpen}
                  className="w-full p-5 text-left cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-[11px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full bg-pink-50 text-pink-600">
                      {recipe.moment}
                    </span>
                    <ChevronDown
                      size={20}
                      className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                  <h3 className="font-display text-xl text-gray-900 leading-snug">
                    <span className="text-pink-400 mr-1">{index + 1}.</span>
                    {recipe.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{recipe.benefit}</p>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 pt-1 border-t border-pink-50">
                    {/* Quantités */}
                    <div className="mt-4 mb-5">
                      <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                        <ChefHat size={15} className="text-pink-400" /> Ingrédients & quantités
                      </h4>
                      <ul className="space-y-2.5">
                        {recipe.ingredients.map((ing, i) => (
                          <li key={i} className="text-[15px] text-gray-700 flex justify-between items-baseline gap-3">
                            <span>{ing.label}</span>
                            <span className="font-bold text-gray-900 whitespace-nowrap text-right">{ing.amount}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Préparation */}
                    <div className="mb-5">
                      <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                        <Clock3 size={15} className="text-pink-400" /> Préparation
                      </h4>
                      <ol className="space-y-3">
                        {recipe.steps.map((step, i) => (
                          <li key={i} className="text-[15px] text-gray-700 flex items-start gap-3 leading-relaxed">
                            <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span className="flex-1">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Pourquoi ça marche */}
                    <div className="bg-pink-50/80 rounded-2xl p-4 flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-pink-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-pink-900 leading-relaxed">
                        <span className="font-bold">Pourquoi ça marche : </span>
                        {recipe.why}
                      </p>
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductRecipes;
