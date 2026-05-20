import { useState } from "react";
import type { SampleMeal } from "../../utils/api";
import { foods as hardcodedFoods, cuisineFilters as hardcodedFilters } from "../mealrecommendations/mealrec";

interface Props {
  meals?: SampleMeal[] | null;
}

export default function RecommendedMealsSection({ meals }: Props) {
  const displayFoods = meals ?? hardcodedFoods;
  const cuisines = ["All", ...Array.from(new Set(displayFoods.map((f) => f.cuisine)))];
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered =
    activeFilter === "All"
      ? displayFoods
      : displayFoods.filter((f) => f.cuisine === activeFilter);

  return (
    <section className="bg-white py-20 px-4 font-sans">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <span className="inline-block bg-orange-100 text-orange-600 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-3">
              Sample Foods
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Foods in Our Database
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Real Singapore foods, real nutrition data
            </p>
          </div>

          {/* ── Filters ── */}
          <div className="flex flex-wrap gap-2">
            {cuisines.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  activeFilter === f
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-white text-gray-500 border-gray-200 hover:border-emerald-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ── Food Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((food) => (
            <div
              key={food.name}
              className="bg-[#f8faf9] rounded-2xl p-5 border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl mb-4 shadow-sm">
                {food.emoji}
              </div>

              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${food.tag_color}`}>
                {food.tag}
              </span>

              <h4 className="text-sm font-bold text-gray-900 mt-2">{food.name}</h4>
              <p className="text-xs text-gray-400 mb-3">{food.cuisine}</p>

              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-2xl font-extrabold text-emerald-500">{food.calories}</span>
                <span className="text-xs text-gray-400 font-medium">kcal</span>
              </div>

              <div className="grid grid-cols-3 gap-1 text-center">
                {[
                  { label: "Protein", val: food.protein, color: "text-orange-500" },
                  { label: "Carbs",   val: food.carbs,   color: "text-blue-500"   },
                  { label: "Fat",     val: food.fat,     color: "text-yellow-500" },
                ].map((m) => (
                  <div key={m.label} className="bg-white rounded-lg py-1.5">
                    <p className={`text-xs font-bold ${m.color}`}>{m.val}g</p>
                    <p className="text-[10px] text-gray-400">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
