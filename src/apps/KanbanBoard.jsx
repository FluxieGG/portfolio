import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase.js';
import { Plus, Trash2, Zap, X, ChevronDown, Loader2, AlertCircle } from 'lucide-react';

// ─── Colour maps ────────────────────────────────────────────────────────────

const columnColorMap = {
  slate:   { border: 'border-slate-500',   text: 'text-slate-400'   },
  indigo:  { border: 'border-indigo-500',  text: 'text-indigo-400'  },
  amber:   { border: 'border-amber-500',   text: 'text-amber-400'   },
  emerald: { border: 'border-emerald-500', text: 'text-emerald-400' },
};

const priorityMap = {
  low:    { label: 'Low',    badge: 'bg-slate-700 text-slate-300'  },
  medium: { label: 'Medium', badge: 'bg-blue-900  text-blue-300'   },
  high:   { label: 'High',   badge: 'bg-orange-900 text-orange-300' },
  urgent: { label: 'Urgent', badge: 'bg-red-900   text-red-300'    },
};

// ─── PriorityBadge ───────────────────────────────────────────────────────────

function PriorityBadge({ priority }) {
  const p = priorityMap[priority] ?? priorityMap.low;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${p.badge}`}>
      {priority === 'urgent' && <Zap size={10} />}
      {p.label}
    </span>
  );
}

// ─── TaskCard ────────────────────────────────────────────────────────────────

function TaskCard({ task, onDelete, onEdit, onDragStart }) {
  const handleDragStart = (e) => {
    onDragStart(e, task);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(task.id);
  };

  const formattedDate = task.created_at
    ? new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onEdit(task)}
      className="group relative bg-slate-800 border border-slate-700 rounded-xl p-3 cursor-pointer
                 hover:border-slate-600 hover:bg-slate-750 transition-all duration-150 select-none"
    >
      {/* Delete button */}
      <button
        onClick={handleDeleteClick}
        className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100
                   text-slate-500 hover:text-red-400 hover:bg-slate-700 transition-all duration-150"
        aria-label="Delete task"
      >
        <Trash2 size={13} />
      </button>

      {/* Title */}
      <p className="font-semibold text-slate-100 text-sm pr-6 mb-1 leading-snug">
        {task.title}
      </p>

      {/* Description */}
      {task.description && (
        <p className="text-slate-400 text-xs leading-relaxed mb-2 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 mt-2">
        <PriorityBadge priority={task.priority} />
        {formattedDate && (
          <span className="text-xs text-slate-500 shrink-0">{formattedDate}</span>
        )}
      </div>
    </div>
  );
}

// ─── AddTaskForm ─────────────────────────────────────────────────────────────

function AddTaskForm({ columnId, onSave, onCancel }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('kanban_tasks')
        .insert({ column_id: columnId, title: trimmed, priority, position: 0 })
        .select()
        .single();
      if (error) throw error;
      onSave(data);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div className="mt-2 p-2 bg-slate-800 border border-slate-700 rounded-xl space-y-2">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Task title…"
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5
                   text-sm text-slate-100 placeholder-slate-500 focus:outline-none
                   focus:border-indigo-500 transition-colors"
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5
                   text-sm text-slate-300 focus:outline-none focus:border-indigo-500
                   transition-colors appearance-none"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed
                     text-white text-xs font-medium rounded-lg py-1.5 transition-colors"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs
                     font-medium rounded-lg py-1.5 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── EditTaskModal ────────────────────────────────────────────────────────────

function EditTaskModal({ task, columns, onSave, onClose }) {
  const [title, setTitle] = useState(task.title ?? '');
  const [description, setDescription] = useState(task.description ?? '');
  const [priority, setPriority] = useState(task.priority ?? 'medium');
  const [columnId, setColumnId] = useState(task.column_id ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const updates = { title: trimmed, description: description.trim(), priority, column_id: columnId };
      const { data, error } = await supabase
        .from('kanban_tasks')
        .update(updates)
        .eq('id', task.id)
        .select()
        .single();
      if (error) throw error;
      onSave(data);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Dialog */}
      <div className="relative z-10 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-slate-100 font-semibold text-lg">Edit Task</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2
                       text-sm text-slate-100 placeholder-slate-500 focus:outline-none
                       focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2
                       text-sm text-slate-100 placeholder-slate-500 focus:outline-none
                       focus:border-indigo-500 transition-colors resize-none"
            placeholder="Optional details…"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
          <div className="relative">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2
                         text-sm text-slate-300 focus:outline-none focus:border-indigo-500
                         transition-colors appearance-none pr-8"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Move to column */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Column</label>
          <div className="relative">
            <select
              value={columnId}
              onChange={(e) => setColumnId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2
                         text-sm text-slate-300 focus:outline-none focus:border-indigo-500
                         transition-colors appearance-none pr-8"
            >
              {columns.map((col) => (
                <option key={col.id} value={col.id}>{col.title}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed
                       text-white text-sm font-medium rounded-xl py-2 transition-colors"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm
                       font-medium rounded-xl py-2 transition-colors border border-slate-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── KanbanColumn ─────────────────────────────────────────────────────────────

function KanbanColumn({ column, tasks, onTaskDelete, onTaskEdit, onTaskAdd, onDragStart, onDragOver, onDrop }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const colors = columnColorMap[column.color] ?? columnColorMap.slate;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
    onDragOver(e, column.id);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    setIsDragOver(false);
    onDrop(e, column.id);
  };

  const handleSaveTask = (newTask) => {
    onTaskAdd(column.id, newTask);
    setShowAddForm(false);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-72 shrink-0 flex flex-col bg-slate-900 border rounded-2xl overflow-hidden transition-all duration-150
                  ${isDragOver ? 'border-indigo-500 ring-1 ring-indigo-500/40' : 'border-slate-800'}`}
    >
      {/* Column header */}
      <div className={`px-4 py-3 border-b-2 ${colors.border} border-t-0 border-l-0 border-r-0 bg-slate-900`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold text-sm ${colors.text}`}>{column.title}</h3>
          <span className="bg-slate-800 text-slate-400 text-xs font-medium px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 min-h-[80px]">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDelete={onTaskDelete}
            onEdit={onTaskEdit}
            onDragStart={onDragStart}
          />
        ))}
        {tasks.length === 0 && !isDragOver && (
          <p className="text-slate-600 text-xs text-center pt-4">No tasks yet</p>
        )}
        {isDragOver && tasks.length === 0 && (
          <div className="border-2 border-dashed border-indigo-500/40 rounded-xl h-16" />
        )}
      </div>

      {/* Add task */}
      <div className="px-3 pb-3">
        {showAddForm ? (
          <AddTaskForm
            columnId={column.id}
            onSave={handleSaveTask}
            onCancel={() => setShowAddForm(false)}
          />
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500
                       hover:text-slate-300 hover:bg-slate-800 transition-all duration-150 text-sm"
          >
            <Plus size={14} />
            Add task
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function KanbanBoard() {
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  // Drag state stored in refs to avoid re-renders during DnD
  const dragTaskRef = useRef(null);
  const dragSourceColumnRef = useRef(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [colRes, taskRes] = await Promise.all([
        supabase.from('kanban_columns').select('*').order('position'),
        supabase.from('kanban_tasks').select('*').order('position'),
      ]);
      if (colRes.error) throw colRes.error;
      if (taskRes.error) throw taskRes.error;
      setColumns(colRes.data ?? []);
      setTasks(taskRes.data ?? []);
    } catch (err) {
      setError(err.message ?? 'Failed to load board.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Drag handlers ──────────────────────────────────────────────────────────

  const handleDragStart = useCallback((e, task) => {
    dragTaskRef.current = task;
    dragSourceColumnRef.current = task.column_id;
    e.dataTransfer.effectAllowed = 'move';
    // Minimal ghost: set drag image opacity via CSS trick
    e.dataTransfer.setData('text/plain', task.id);
  }, []);

  const handleDragOver = useCallback((e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(async (e, targetColumnId) => {
    e.preventDefault();
    const task = dragTaskRef.current;
    if (!task) return;
    if (task.column_id === targetColumnId) return;

    // Optimistically update local state
    setTasks((prev) =>
      prev.map((t) => t.id === task.id ? { ...t, column_id: targetColumnId } : t)
    );

    try {
      const { error } = await supabase
        .from('kanban_tasks')
        .update({ column_id: targetColumnId })
        .eq('id', task.id);
      if (error) throw error;
    } catch (err) {
      // Rollback
      setTasks((prev) =>
        prev.map((t) => t.id === task.id ? { ...t, column_id: task.column_id } : t)
      );
      setError('Failed to move task: ' + err.message);
    } finally {
      dragTaskRef.current = null;
      dragSourceColumnRef.current = null;
    }
  }, []);

  // ── CRUD handlers ──────────────────────────────────────────────────────────

  const handleTaskDelete = useCallback(async (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      const { error } = await supabase.from('kanban_tasks').delete().eq('id', taskId);
      if (error) throw error;
    } catch (err) {
      setError('Failed to delete task: ' + err.message);
      // Re-fetch to restore accurate state
      fetchData();
    }
  }, [fetchData]);

  const handleTaskAdd = useCallback((columnId, newTask) => {
    setTasks((prev) => [...prev, newTask]);
  }, []);

  const handleTaskEdit = useCallback((task) => {
    setEditingTask(task);
  }, []);

  const handleEditSave = useCallback((updatedTask) => {
    setTasks((prev) => prev.map((t) => t.id === updatedTask.id ? updatedTask : t));
    setEditingTask(null);
  }, []);

  const handleEditClose = useCallback(() => {
    setEditingTask(null);
  }, []);

  // ── Render helpers ─────────────────────────────────────────────────────────

  const getTasksForColumn = useCallback(
    (columnId) => tasks.filter((t) => t.column_id === columnId),
    [tasks]
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Home Kanban</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage your DIY projects and household tasks</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700
                     text-slate-300 text-sm font-medium rounded-xl px-4 py-2 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          Refresh
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-start gap-3 bg-red-950/50 border border-red-800 rounded-2xl px-4 py-3 shrink-0">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-300 text-sm flex-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-300 transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2 size={32} className="animate-spin text-indigo-500" />
            <p className="text-sm">Loading board…</p>
          </div>
        </div>
      )}

      {/* Board */}
      {!loading && (
        <div className="flex-1 overflow-x-auto overflow-y-hidden min-h-0">
          <div className="flex gap-4 h-full pb-4" style={{ minWidth: 'max-content' }}>
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={getTasksForColumn(column.id)}
                onTaskDelete={handleTaskDelete}
                onTaskEdit={handleTaskEdit}
                onTaskAdd={handleTaskAdd}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ))}
            {columns.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
                No columns found. Check your database setup.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          columns={columns}
          onSave={handleEditSave}
          onClose={handleEditClose}
        />
      )}
    </div>
  );
}
