import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import {
  Dumbbell,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  X,
  AlertCircle,
  CheckCircle2,
  MinusCircle,
} from 'lucide-react';

// ─── Sub-components ───────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
    </div>
  );
}

function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 bg-red-950/60 border border-red-800 text-red-300 rounded-xl px-4 py-3 mb-4">
      <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
      <p className="text-sm flex-1">{message}</p>
      <button
        onClick={onDismiss}
        className="shrink-0 text-red-400 hover:text-red-200 transition-colors"
        aria-label="Dismiss error"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      <div className="bg-slate-800 rounded-full p-5">
        <Dumbbell className="w-10 h-10 text-indigo-400" />
      </div>
      <div>
        <p className="text-slate-300 font-medium text-lg">No workouts logged yet</p>
        <p className="text-slate-500 text-sm mt-1">
          Use the form to log your first session!
        </p>
      </div>
    </div>
  );
}

function SetRow({ set, setIndex, exerciseIndex, onSetChange, onRemoveSet }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-500 text-xs w-5 text-right shrink-0">
        {setIndex + 1}.
      </span>
      <input
        type="number"
        min="0"
        placeholder="Reps"
        value={set.reps}
        onChange={(e) =>
          onSetChange(exerciseIndex, setIndex, 'reps', e.target.value)
        }
        className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <span className="text-slate-600 text-xs">×</span>
      <input
        type="number"
        min="0"
        placeholder="kg"
        value={set.weight}
        onChange={(e) =>
          onSetChange(exerciseIndex, setIndex, 'weight', e.target.value)
        }
        className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <span className="text-slate-500 text-xs">kg</span>
      <button
        type="button"
        onClick={() => onRemoveSet(exerciseIndex, setIndex)}
        className="ml-auto text-slate-600 hover:text-red-400 transition-colors"
        aria-label="Remove set"
      >
        <MinusCircle className="w-4 h-4" />
      </button>
    </div>
  );
}

function ExerciseBlock({
  exercise,
  exerciseIndex,
  onExerciseNameChange,
  onAddSet,
  onRemoveSet,
  onSetChange,
  onRemoveExercise,
}) {
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Exercise name (e.g. Bench Press)"
          value={exercise.name}
          onChange={(e) => onExerciseNameChange(exerciseIndex, e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="button"
          onClick={() => onRemoveExercise(exerciseIndex)}
          className="text-slate-600 hover:text-red-400 transition-colors shrink-0"
          aria-label="Remove exercise"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {exercise.sets.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-4 px-5 text-xs text-slate-500 font-medium uppercase tracking-wide">
            <span className="w-20">Reps</span>
            <span className="w-20">Weight</span>
          </div>
          {exercise.sets.map((set, setIndex) => (
            <SetRow
              key={setIndex}
              set={set}
              setIndex={setIndex}
              exerciseIndex={exerciseIndex}
              onSetChange={onSetChange}
              onRemoveSet={onRemoveSet}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => onAddSet(exerciseIndex)}
        className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Set
      </button>
    </div>
  );
}

function SessionCard({ session, onDelete }) {
  const [expanded, setExpanded] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const formattedDate = new Date(session.logged_at).toLocaleDateString('en-GB', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  function summariseSets(sets) {
    if (!sets || sets.length === 0) return '';
    const count = sets.length;
    const reps = sets[0]?.reps ?? '?';
    const weight = sets[0]?.weight ?? '?';
    if (sets.every((s) => s.reps === reps && s.weight === weight)) {
      return `${count}×${reps} @ ${weight}kg`;
    }
    return sets.map((s) => `${s.reps}×${s.weight}kg`).join(', ');
  }

  async function handleDelete() {
    setDeleting(true);
    await onDelete(session.id);
    setDeleting(false);
  }

  return (
    <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-5 space-y-3 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-slate-100 font-semibold text-base truncate">
            {session.name}
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">{formattedDate}</p>
          {session.notes && (
            <p className="text-slate-400 text-sm mt-1 line-clamp-2">{session.notes}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-950/40 transition-colors disabled:opacity-40"
            aria-label="Delete session"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-700 transition-colors"
            aria-label={expanded ? 'Collapse exercises' : 'Expand exercises'}
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {expanded && session.workout_exercises && session.workout_exercises.length > 0 && (
        <ul className="space-y-1 pt-1 border-t border-slate-700/60">
          {session.workout_exercises.map((ex) => (
            <li key={ex.id} className="flex items-baseline gap-2 text-sm">
              <span className="text-slate-300 font-medium">{ex.name}</span>
              <span className="text-slate-500">—</span>
              <span className="text-indigo-400 text-xs font-mono">
                {summariseSets(ex.sets)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {expanded && session.workout_exercises && session.workout_exercises.length === 0 && (
        <p className="text-slate-600 text-xs pt-1 border-t border-slate-700/60">
          No exercises recorded.
        </p>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createEmptyExercise() {
  return { name: '', sets: [] };
}

function createEmptySet() {
  return { reps: '', weight: '' };
}

function createEmptyForm() {
  return {
    sessionName: '',
    notes: '',
    exercises: [createEmptyExercise()],
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function WorkoutLogger() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(createEmptyForm());
  const [successMsg, setSuccessMsg] = useState('');

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: err } = await supabase
        .from('workout_sessions')
        .select('*, workout_exercises(*)')
        .order('logged_at', { ascending: false });

      if (err) throw err;
      setSessions(data ?? []);
    } catch (err) {
      setError(err.message ?? 'Failed to load sessions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // ── Delete ─────────────────────────────────────────────────────────────────

  async function handleDeleteSession(sessionId) {
    setError('');
    try {
      // Cascade deletes exercises via FK on delete cascade (or delete manually)
      const { error: exErr } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('session_id', sessionId);
      if (exErr) throw exErr;

      const { error: sessErr } = await supabase
        .from('workout_sessions')
        .delete()
        .eq('id', sessionId);
      if (sessErr) throw sessErr;

      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      setError(err.message ?? 'Failed to delete session.');
    }
  }

  // ── Form handlers ──────────────────────────────────────────────────────────

  function handleFormChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleExerciseNameChange(exIdx, value) {
    setForm((prev) => {
      const exercises = prev.exercises.map((ex, i) =>
        i === exIdx ? { ...ex, name: value } : ex
      );
      return { ...prev, exercises };
    });
  }

  function handleAddExercise() {
    setForm((prev) => ({
      ...prev,
      exercises: [...prev.exercises, createEmptyExercise()],
    }));
  }

  function handleRemoveExercise(exIdx) {
    setForm((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== exIdx),
    }));
  }

  function handleAddSet(exIdx) {
    setForm((prev) => {
      const exercises = prev.exercises.map((ex, i) =>
        i === exIdx ? { ...ex, sets: [...ex.sets, createEmptySet()] } : ex
      );
      return { ...prev, exercises };
    });
  }

  function handleRemoveSet(exIdx, setIdx) {
    setForm((prev) => {
      const exercises = prev.exercises.map((ex, i) =>
        i === exIdx
          ? { ...ex, sets: ex.sets.filter((_, si) => si !== setIdx) }
          : ex
      );
      return { ...prev, exercises };
    });
  }

  function handleSetChange(exIdx, setIdx, field, value) {
    setForm((prev) => {
      const exercises = prev.exercises.map((ex, i) => {
        if (i !== exIdx) return ex;
        const sets = ex.sets.map((s, si) =>
          si === setIdx ? { ...s, [field]: value === '' ? '' : Number(value) } : s
        );
        return { ...ex, sets };
      });
      return { ...prev, exercises };
    });
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.sessionName.trim()) {
      setError('Please enter a session name.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      // 1. Insert session
      const { data: sessionData, error: sessionErr } = await supabase
        .from('workout_sessions')
        .insert({
          name: form.sessionName.trim(),
          notes: form.notes.trim() || null,
          logged_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (sessionErr) throw sessionErr;

      const newSession = sessionData;

      // 2. Insert exercises (only those with a name)
      const exercisesToInsert = form.exercises
        .filter((ex) => ex.name.trim())
        .map((ex) => ({
          session_id: newSession.id,
          name: ex.name.trim(),
          sets: ex.sets.map((s) => ({
            reps: Number(s.reps) || 0,
            weight: Number(s.weight) || 0,
          })),
        }));

      let insertedExercises = [];
      if (exercisesToInsert.length > 0) {
        const { data: exData, error: exErr } = await supabase
          .from('workout_exercises')
          .insert(exercisesToInsert)
          .select();

        if (exErr) throw exErr;
        insertedExercises = exData ?? [];
      }

      // 3. Optimistically update local state
      const fullSession = {
        ...newSession,
        workout_exercises: insertedExercises,
      };
      setSessions((prev) => [fullSession, ...prev]);

      // 4. Reset form
      setForm(createEmptyForm());
      setSuccessMsg('Session logged!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message ?? 'Failed to save session.');
    } finally {
      setSaving(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen bg-slate-900 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-2.5">
            <Dumbbell className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Workout Logger</h1>
        </div>
        <p className="text-slate-500 text-sm ml-14">
          Track your training sessions and exercises.
        </p>
      </div>

      {/* Error banner */}
      <ErrorBanner message={error} onDismiss={() => setError('')} />

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ── Sessions list (left, 2/3 on lg) ── */}
        <section className="w-full lg:w-2/3 space-y-4">
          <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-widest">
            Sessions
          </h2>

          {loading ? (
            <LoadingSpinner />
          ) : sessions.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onDelete={handleDeleteSession}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Log new session panel (right, 1/3 on lg) ── */}
        <aside className="w-full lg:w-1/3 sticky top-6">
          <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-slate-200 font-semibold text-base mb-4">
              Log New Session
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Session name */}
              <div className="space-y-1.5">
                <label className="block text-slate-400 text-xs font-medium uppercase tracking-wide">
                  Session Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Push Day, Leg Day…"
                  value={form.sessionName}
                  onChange={(e) => handleFormChange('sessionName', e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="block text-slate-400 text-xs font-medium uppercase tracking-wide">
                  Notes{' '}
                  <span className="normal-case text-slate-600 font-normal">
                    (optional)
                  </span>
                </label>
                <textarea
                  placeholder="How did it go?"
                  value={form.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Exercises */}
              <div className="space-y-3">
                <label className="block text-slate-400 text-xs font-medium uppercase tracking-wide">
                  Exercises
                </label>

                {form.exercises.map((exercise, exIdx) => (
                  <ExerciseBlock
                    key={exIdx}
                    exercise={exercise}
                    exerciseIndex={exIdx}
                    onExerciseNameChange={handleExerciseNameChange}
                    onAddSet={handleAddSet}
                    onRemoveSet={handleRemoveSet}
                    onSetChange={handleSetChange}
                    onRemoveExercise={handleRemoveExercise}
                  />
                ))}

                <button
                  type="button"
                  onClick={handleAddExercise}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-dashed border-slate-700 hover:border-indigo-500 text-slate-400 hover:text-indigo-400 rounded-xl py-2.5 text-sm font-medium transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Exercise
                </button>
              </div>

              {/* Success message */}
              {successMsg && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-950/50 border border-emerald-800 rounded-xl px-3 py-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {successMsg}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Dumbbell className="w-4 h-4" />
                    Log Session
                  </>
                )}
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
