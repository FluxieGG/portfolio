import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import {
  ShoppingCart,
  BookOpen,
  Plus,
  Trash2,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  UtensilsCrossed,
  Tag,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-sm">{message}</span>
      <button
        onClick={onDismiss}
        className="rounded p-0.5 hover:bg-red-500/20 transition-colors"
        aria-label="Dismiss error"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
    </div>
  );
}

function RecipeDetailModal({ recipe, ingredients, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!recipe) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 p-6">
          <div>
            <h2 className="text-xl font-semibold text-white">{recipe.name}</h2>
            <p className="mt-1 text-sm text-slate-400">
              {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto p-6 space-y-5">
          {recipe.description && (
            <p className="text-sm text-slate-300 leading-relaxed">{recipe.description}</p>
          )}

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-indigo-400">
              Ingredients
            </h3>
            {ingredients.length === 0 ? (
              <p className="text-sm text-slate-500">No ingredients added.</p>
            ) : (
              <ul className="space-y-2">
                {ingredients.map((ing) => (
                  <li key={ing.id} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                    <span>
                      {[ing.quantity, ing.unit, ing.name].filter(Boolean).join(' ')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function IngredientRow({ ingredient, index, onChange, onRemove }) {
  return (
    <div className="flex gap-2 items-center">
      <input
        type="text"
        placeholder="Ingredient name"
        value={ingredient.name}
        onChange={(e) => onChange(index, 'name', e.target.value)}
        className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <input
        type="text"
        placeholder="Qty"
        value={ingredient.quantity}
        onChange={(e) => onChange(index, 'quantity', e.target.value)}
        className="w-20 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <input
        type="text"
        placeholder="Unit"
        value={ingredient.unit}
        onChange={(e) => onChange(index, 'unit', e.target.value)}
        className="w-20 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-red-400 transition-colors"
        aria-label="Remove ingredient"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function RecipeCard({ recipe, ingredientCount, onView, onDelete }) {
  return (
    <div className="group rounded-xl border border-slate-800 bg-slate-800/50 p-4 hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <button
          className="flex-1 text-left"
          onClick={() => onView(recipe)}
        >
          <h3 className="font-medium text-white group-hover:text-indigo-300 transition-colors">
            {recipe.name}
          </h3>
          {recipe.description && (
            <p className="mt-1 text-sm text-slate-400 line-clamp-2">{recipe.description}</p>
          )}
          <div className="mt-2 flex gap-3 text-xs text-slate-500">
            <span>{recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}</span>
            <span>·</span>
            <span>{ingredientCount} ingredient{ingredientCount !== 1 ? 's' : ''}</span>
          </div>
        </button>
        <button
          onClick={() => onDelete(recipe)}
          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-700 hover:text-red-400 transition-colors shrink-0"
          aria-label="Delete recipe"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function AddRecipeForm({ onSaved, setError }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [servings, setServings] = useState(2);
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '' }]);
  const [saving, setSaving] = useState(false);

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { name: '', quantity: '', unit: '' }]);
  };

  const removeIngredient = (index) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const updateIngredient = (index, field, value) => {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing))
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const { data: recipeData, error: recipeErr } = await supabase
        .from('recipes')
        .insert({ name: name.trim(), description: description.trim(), servings: Number(servings) })
        .select()
        .single();

      if (recipeErr) throw recipeErr;

      const validIngredients = ingredients.filter((ing) => ing.name.trim());
      if (validIngredients.length > 0) {
        const rows = validIngredients.map((ing) => ({
          recipe_id: recipeData.id,
          name: ing.name.trim(),
          quantity: ing.quantity.trim(),
          unit: ing.unit.trim(),
        }));
        const { error: ingErr } = await supabase.from('recipe_ingredients').insert(rows);
        if (ingErr) throw ingErr;
      }

      // Reset form
      setName('');
      setDescription('');
      setServings(2);
      setIngredients([{ name: '', quantity: '', unit: '' }]);
      onSaved();
    } catch (err) {
      setError(err.message || 'Failed to save recipe.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="rounded-2xl border border-slate-800 bg-slate-800/30 p-5 space-y-4">
      <h2 className="text-base font-semibold text-indigo-400">Add New Recipe</h2>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-400">Recipe Name *</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Spaghetti Bolognese"
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-400">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description..."
          rows={2}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-400">Servings</label>
        <input
          type="number"
          min={1}
          value={servings}
          onChange={(e) => setServings(e.target.value)}
          className="w-24 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-slate-400">Ingredients</label>
        {ingredients.map((ing, i) => (
          <IngredientRow
            key={i}
            ingredient={ing}
            index={i}
            onChange={updateIngredient}
            onRemove={removeIngredient}
          />
        ))}
        <button
          type="button"
          onClick={addIngredient}
          className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Ingredient
        </button>
      </div>

      <button
        type="submit"
        disabled={saving || !name.trim()}
        className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {saving ? 'Saving…' : 'Save Recipe'}
      </button>
    </form>
  );
}

function RecipesTab({ recipes, ingredientsByRecipe, onRecipesChanged, setError }) {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  const handleView = async (recipe) => {
    setSelectedRecipe(recipe);
    setSelectedIngredients(ingredientsByRecipe[recipe.id] || []);
  };

  const handleDelete = async (recipe) => {
    if (!window.confirm(`Delete "${recipe.name}"? This cannot be undone.`)) return;
    try {
      const { error } = await supabase.from('recipes').delete().eq('id', recipe.id);
      if (error) throw error;
      onRecipesChanged();
    } catch (err) {
      setError(err.message || 'Failed to delete recipe.');
    }
  };

  return (
    <>
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          ingredients={selectedIngredients}
          onClose={() => setSelectedRecipe(null)}
        />
      )}

      <div className="flex gap-6">
        {/* Recipe list — 2/3 */}
        <div className="flex-1 min-w-0">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Your Recipes ({recipes.length})
          </h2>
          {recipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 py-16 text-center">
              <UtensilsCrossed className="mb-3 h-10 w-10 text-slate-700" />
              <p className="text-sm text-slate-500">No recipes yet.</p>
              <p className="text-xs text-slate-600 mt-1">Add your first recipe on the right.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  ingredientCount={(ingredientsByRecipe[recipe.id] || []).length}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add Recipe form — 1/3 */}
        <div className="w-80 shrink-0">
          <AddRecipeForm onSaved={onRecipesChanged} setError={setError} />
        </div>
      </div>
    </>
  );
}

function ShoppingItemRow({ item, onToggle }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
        item.is_checked ? 'opacity-40' : 'hover:bg-slate-800/50'
      }`}
    >
      <button
        onClick={() => onToggle(item)}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
          item.is_checked
            ? 'border-indigo-500 bg-indigo-500'
            : 'border-slate-600 bg-transparent hover:border-indigo-400'
        }`}
        aria-label={item.is_checked ? 'Uncheck item' : 'Check item'}
      >
        {item.is_checked && <Check className="h-3 w-3 text-white" />}
      </button>
      <span
        className={`text-sm ${
          item.is_checked ? 'line-through text-slate-500' : 'text-slate-300'
        }`}
      >
        {[item.quantity, item.unit, item.name].filter(Boolean).join(' ')}
      </span>
    </div>
  );
}

function PreviousTrips({ trips }) {
  const [open, setOpen] = useState(false);

  if (trips.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-800/20">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors"
      >
        <span>Previous Trips ({trips.length})</span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && (
        <div className="border-t border-slate-800 px-4 pb-4 pt-3 space-y-2">
          {trips.map((trip) => (
            <div key={trip.id} className="flex items-center justify-between text-sm">
              <span className="text-slate-300">{trip.name}</span>
              <span className="text-xs text-slate-600">
                {new Date(trip.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TripBuilder({ recipes, ingredientsByRecipe, onTripGenerated, setError }) {
  const [tripName, setTripName] = useState('Weekly Shop');
  const [selectedRecipeIds, setSelectedRecipeIds] = useState(new Set());
  const [generating, setGenerating] = useState(false);

  const toggleRecipe = (id) => {
    setSelectedRecipeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleGenerate = async () => {
    if (selectedRecipeIds.size === 0) return;
    setGenerating(true);
    try {
      // Create trip
      const { data: tripData, error: tripErr } = await supabase
        .from('shopping_trips')
        .insert({ name: tripName.trim() || 'Weekly Shop' })
        .select()
        .single();
      if (tripErr) throw tripErr;

      // Link recipes to trip
      const tripRecipeRows = [...selectedRecipeIds].map((rid) => ({
        shopping_trip_id: tripData.id,
        recipe_id: rid,
      }));
      const { error: linkErr } = await supabase.from('shopping_trip_recipes').insert(tripRecipeRows);
      if (linkErr) throw linkErr;

      // Collect ingredients
      const allItems = [];
      for (const rid of selectedRecipeIds) {
        const ings = ingredientsByRecipe[rid] || [];
        for (const ing of ings) {
          allItems.push({
            shopping_trip_id: tripData.id,
            recipe_id: rid,
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            is_checked: false,
          });
        }
      }

      if (allItems.length > 0) {
        const { error: itemsErr } = await supabase.from('shopping_items').insert(allItems);
        if (itemsErr) throw itemsErr;
      }

      onTripGenerated(tripData.id);
    } catch (err) {
      setError(err.message || 'Failed to generate shopping list.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-400">Trip Name</label>
        <input
          type="text"
          value={tripName}
          onChange={(e) => setTripName(e.target.value)}
          placeholder="Weekly Shop"
          className="w-full max-w-xs rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Select Recipes
        </h3>
        {recipes.length === 0 ? (
          <p className="text-sm text-slate-500">No recipes available. Add some on the Recipes tab first.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => {
              const selected = selectedRecipeIds.has(recipe.id);
              const ingCount = (ingredientsByRecipe[recipe.id] || []).length;
              return (
                <button
                  key={recipe.id}
                  type="button"
                  onClick={() => toggleRecipe(recipe.id)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    selected
                      ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                      : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                        selected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-600'
                      }`}
                    >
                      {selected && <Check className="h-2.5 w-2.5 text-white" />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{recipe.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{ingCount} ingredient{ingCount !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button
        onClick={handleGenerate}
        disabled={selectedRecipeIds.size === 0 || generating}
        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      >
        {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
        {generating ? 'Generating…' : `Generate List (${selectedRecipeIds.size} recipe${selectedRecipeIds.size !== 1 ? 's' : ''})`}
      </button>
    </div>
  );
}

function ActiveTrip({ tripId, recipes, onNewTrip, setError }) {
  const [trip, setTrip] = useState(null);
  const [tripRecipes, setTripRecipes] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTripData = useCallback(async () => {
    setLoading(true);
    try {
      const [tripRes, tripRecipesRes, itemsRes] = await Promise.all([
        supabase.from('shopping_trips').select('*').eq('id', tripId).single(),
        supabase.from('shopping_trip_recipes').select('recipe_id').eq('shopping_trip_id', tripId),
        supabase.from('shopping_items').select('*').eq('shopping_trip_id', tripId).order('recipe_id'),
      ]);

      if (tripRes.error) throw tripRes.error;
      if (tripRecipesRes.error) throw tripRecipesRes.error;
      if (itemsRes.error) throw itemsRes.error;

      setTrip(tripRes.data);
      const recipeIds = (tripRecipesRes.data || []).map((r) => r.recipe_id);
      setTripRecipes(recipes.filter((r) => recipeIds.includes(r.id)));
      setItems(itemsRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load trip.');
    } finally {
      setLoading(false);
    }
  }, [tripId, recipes, setError]);

  useEffect(() => {
    fetchTripData();
  }, [fetchTripData]);

  const handleToggle = async (item) => {
    const newVal = !item.is_checked;
    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_checked: newVal } : i))
    );
    try {
      const { error } = await supabase
        .from('shopping_items')
        .update({ is_checked: newVal })
        .eq('id', item.id);
      if (error) throw error;
    } catch (err) {
      // Revert
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_checked: !newVal } : i))
      );
      setError(err.message || 'Failed to update item.');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!trip) return null;

  // Group items by recipe_id
  const groupedItems = {};
  const ungroupedItems = [];
  for (const item of items) {
    if (item.recipe_id) {
      if (!groupedItems[item.recipe_id]) groupedItems[item.recipe_id] = [];
      groupedItems[item.recipe_id].push(item);
    } else {
      ungroupedItems.push(item);
    }
  }

  const checkedCount = items.filter((i) => i.is_checked).length;

  return (
    <div className="space-y-6">
      {/* Trip header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">{trip.name}</h2>
          <p className="mt-1 text-xs text-slate-500">
            {checkedCount} of {items.length} items checked
          </p>
        </div>
        <button
          onClick={onNewTrip}
          className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-indigo-500 hover:text-indigo-400 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Trip
        </button>
      </div>

      {/* Recipe tags */}
      {tripRecipes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tripRecipes.map((r) => (
            <span
              key={r.id}
              className="flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-400"
            >
              <Tag className="h-3 w-3" />
              {r.name}
            </span>
          ))}
        </div>
      )}

      {/* Items list */}
      <div className="rounded-xl border border-slate-800 bg-slate-800/20 overflow-hidden">
        {tripRecipes.map((recipe) => {
          const recipeItems = groupedItems[recipe.id] || [];
          if (recipeItems.length === 0) return null;
          return (
            <div key={recipe.id} className="border-b border-slate-800 last:border-b-0">
              <div className="px-4 py-2.5 bg-slate-800/60">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  {recipe.name}
                </p>
              </div>
              <div className="py-1">
                {recipeItems.map((item) => (
                  <ShoppingItemRow key={item.id} item={item} onToggle={handleToggle} />
                ))}
              </div>
            </div>
          );
        })}
        {ungroupedItems.length > 0 && (
          <div className="border-b border-slate-800 last:border-b-0">
            <div className="px-4 py-2.5 bg-slate-800/60">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Other</p>
            </div>
            <div className="py-1">
              {ungroupedItems.map((item) => (
                <ShoppingItemRow key={item.id} item={item} onToggle={handleToggle} />
              ))}
            </div>
          </div>
        )}
        {items.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-slate-500">No items in this trip.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ShoppingTab({ recipes, ingredientsByRecipe, setError }) {
  const [activeTripId, setActiveTripId] = useState(null);
  const [pastTrips, setPastTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  const fetchPastTrips = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('shopping_trips')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPastTrips(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load past trips.');
    } finally {
      setLoadingTrips(false);
    }
  }, [setError]);

  useEffect(() => {
    fetchPastTrips();
  }, [fetchPastTrips]);

  const handleTripGenerated = (tripId) => {
    setActiveTripId(tripId);
    fetchPastTrips();
  };

  const handleNewTrip = () => {
    setActiveTripId(null);
  };

  if (loadingTrips) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      {activeTripId ? (
        <ActiveTrip
          tripId={activeTripId}
          recipes={recipes}
          onNewTrip={handleNewTrip}
          setError={setError}
        />
      ) : (
        <TripBuilder
          recipes={recipes}
          ingredientsByRecipe={ingredientsByRecipe}
          onTripGenerated={handleTripGenerated}
          setError={setError}
        />
      )}

      <PreviousTrips trips={activeTripId ? pastTrips.filter((t) => t.id !== activeTripId) : pastTrips} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function ShoppingList() {
  const [activeTab, setActiveTab] = useState('recipes');
  const [recipes, setRecipes] = useState([]);
  const [ingredientsByRecipe, setIngredientsByRecipe] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [recipesRes, ingredientsRes] = await Promise.all([
        supabase.from('recipes').select('*').order('created_at', { ascending: false }),
        supabase.from('recipe_ingredients').select('*'),
      ]);

      if (recipesRes.error) throw recipesRes.error;
      if (ingredientsRes.error) throw ingredientsRes.error;

      setRecipes(recipesRes.data || []);

      // Group ingredients by recipe_id
      const grouped = {};
      for (const ing of ingredientsRes.data || []) {
        if (!grouped[ing.recipe_id]) grouped[ing.recipe_id] = [];
        grouped[ing.recipe_id].push(ing);
      }
      setIngredientsByRecipe(grouped);
    } catch (err) {
      setError(err.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const tabs = [
    { id: 'recipes', label: 'Recipes', icon: BookOpen },
    { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen bg-slate-900 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Recipe &amp; Shopping List</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your recipes and generate smart shopping trips.
          </p>
        </div>

        {/* Error banner */}
        <ErrorBanner message={error} onDismiss={() => setError(null)} />

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl border border-slate-800 bg-slate-800/40 p-1 w-fit">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner />
        ) : activeTab === 'recipes' ? (
          <RecipesTab
            recipes={recipes}
            ingredientsByRecipe={ingredientsByRecipe}
            onRecipesChanged={fetchData}
            setError={setError}
          />
        ) : (
          <ShoppingTab
            recipes={recipes}
            ingredientsByRecipe={ingredientsByRecipe}
            setError={setError}
          />
        )}
      </div>
    </div>
  );
}
