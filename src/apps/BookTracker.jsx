import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Plus, TrendingUp, CheckCircle2, Clock, History, Trash2, Loader2, AlertCircle, NotebookPen, X, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase.js';

// ─────────────────────────────────────────────
// SUB-COMPONENT: Add New Book Form
// ─────────────────────────────────────────────
const AddBookForm = ({ onAddBook, isAdding }) => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [totalPages, setTotalPages] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !totalPages || isNaN(totalPages)) return;
        await onAddBook({ title: title.trim(), author: author.trim() || null, total_pages: parseInt(totalPages) });
        setTitle('');
        setAuthor('');
        setTotalPages('');
    };

    return (
        <form onSubmit={handleSubmit} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 mb-8 flex flex-col md:flex-row gap-4 items-end shadow-lg shadow-indigo-500/5">
            <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-slate-400 mb-2">Book Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Dune"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
            </div>
            <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-slate-400 mb-2">Author <span className="text-slate-600">(optional)</span></label>
                <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g., Frank Herbert"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
            </div>
            <div className="w-full md:w-40">
                <label className="block text-sm font-medium text-slate-400 mb-2">Total Pages</label>
                <input
                    type="number"
                    value={totalPages}
                    onChange={(e) => setTotalPages(e.target.value)}
                    placeholder="e.g., 412"
                    min="1"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
            </div>
            <button
                type="submit"
                disabled={isAdding}
                className="w-full md:w-auto px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
                {isAdding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                Add Book
            </button>
        </form>
    );
};

// ─────────────────────────────────────────────
// SUB-COMPONENT: Individual Book Card
// ─────────────────────────────────────────────
const BookCard = ({ book, onLogSession, onDelete }) => {
    const [sessionPages, setSessionPages] = useState('');
    const [isLogging, setIsLogging] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const progressPercent = Math.min(Math.round((book.pages_read / book.total_pages) * 100), 100);
    const pagesRemaining = Math.max(book.total_pages - book.pages_read, 0);
    const isFinished = pagesRemaining === 0;

    const handleLog = async () => {
        if (!sessionPages || isNaN(sessionPages) || parseInt(sessionPages) < 1) return;
        setIsLogging(true);
        await onLogSession(book.id, parseInt(sessionPages));
        setSessionPages('');
        setIsLogging(false);
    };

    const handleDelete = async () => {
        if (!window.confirm(`Remove "${book.title}" and all its reading history?`)) return;
        setIsDeleting(true);
        await onDelete(book.id);
    };

    return (
        <div className={`bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col relative overflow-hidden transition-all hover:border-indigo-500/30 ${isDeleting ? 'opacity-50' : ''}`}>
            {isFinished && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full" />}

            <div className="flex justify-between items-start mb-1 relative z-10">
                <div className="flex-1 mr-2">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {book.title}
                        {isFinished && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
                    </h3>
                    {book.author && (
                        <p className="text-sm text-slate-500 mt-0.5">by {book.author}</p>
                    )}
                    <p className="text-sm text-slate-400 mt-1">
                        {isFinished ? 'Completed! 🎉' : `${pagesRemaining} pages remaining`}
                    </p>
                </div>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                    title="Delete book"
                >
                    {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-6 mt-4 relative z-10">
                <div className="flex justify-between text-xs text-slate-400 mb-2 font-medium">
                    <span>{book.pages_read} read</span>
                    <span>{progressPercent}%</span>
                    <span>{book.total_pages} total</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${isFinished ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Log Session */}
            {!isFinished && (
                <div className="mt-auto pt-4 border-t border-slate-800/50 flex gap-2 relative z-10">
                    <input
                        type="number"
                        value={sessionPages}
                        onChange={(e) => setSessionPages(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLog()}
                        placeholder="Pages read this session..."
                        min="1"
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                        onClick={handleLog}
                        disabled={isLogging}
                        className="px-4 py-2 bg-slate-800 hover:bg-indigo-500/20 hover:text-indigo-400 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                        {isLogging ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />}
                        Log
                    </button>
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────
// SUB-COMPONENT: Log Entry (timeline card)
// ─────────────────────────────────────────────
const LogEntry = ({ log, onOpenReflection }) => {
    const [expanded, setExpanded] = useState(false);

    const logDate = new Date(log.logged_at);
    const timeString = logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = logDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const hasReflection = log.reflection && log.reflection.trim().length > 0;

    return (
        <div className="relative flex items-start justify-between group">
            {/* Timeline dot */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-950 border-2 border-indigo-500 text-indigo-400 shrink-0 z-10 shadow-[0_0_10px_rgba(99,102,241,0.2)] mt-0.5">
                <TrendingUp size={14} />
            </div>

            {/* Card */}
            <div className="w-[calc(100%-3rem)] pl-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl group-hover:border-indigo-500/30 transition-colors overflow-hidden">
                    {/* Main row */}
                    <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{log.books?.title ?? 'Unknown Book'}</p>
                                <p className="text-indigo-400 text-xs mt-0.5 font-bold">+{log.pages} pages</p>
                                <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-500">
                                    <Clock size={12} />
                                    <span>{dateString} at {timeString}</span>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-1 shrink-0">
                                {/* Red + button to add/edit reflection */}
                                <button
                                    onClick={onOpenReflection}
                                    title={hasReflection ? 'Edit reflection' : 'Add reflection'}
                                    className={`p-1 rounded-md transition-colors ${
                                        hasReflection
                                            ? 'text-emerald-400 hover:bg-emerald-500/10'
                                            : 'text-red-400 hover:bg-red-500/10'
                                    }`}
                                >
                                    <NotebookPen size={14} />
                                </button>

                                {/* Expand toggle — only if there's a reflection */}
                                {hasReflection && (
                                    <button
                                        onClick={() => setExpanded((v) => !v)}
                                        className="p-1 rounded-md text-slate-500 hover:text-slate-300 transition-colors"
                                        title={expanded ? 'Collapse' : 'View reflection'}
                                    >
                                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Expandable reflection preview */}
                    {hasReflection && expanded && (
                        <div className="px-3 pb-3 border-t border-slate-800/60">
                            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mt-2 mb-1.5">
                                <NotebookPen size={11} />
                                Reflection
                            </div>
                            <p className="text-slate-400 text-xs leading-relaxed whitespace-pre-wrap">{log.reflection}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// SUB-COMPONENT: Reflection Modal
// ─────────────────────────────────────────────
const ReflectionModal = ({ log, onSave, onClose }) => {
    const [notes, setNotes] = useState(log.reflection ?? '');
    const [isSaving, setIsSaving] = useState(false);

    // Close on Escape key
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    const handleSave = async () => {
        setIsSaving(true);
        await onSave(log.id, notes.trim());
        setIsSaving(false);
        onClose();
    };

    const logDate = new Date(log.logged_at);
    const dateString = logDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    const timeString = logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        // Backdrop
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Modal Panel */}
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 flex flex-col animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-slate-800">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium mb-1">
                            <NotebookPen size={15} />
                            Reading Reflection
                        </div>
                        <h3 className="text-white font-bold text-lg leading-tight">{log.books?.title ?? 'Unknown Book'}</h3>
                        <p className="text-slate-500 text-sm mt-1">
                            Session on {dateString} at {timeString} &mdash;
                            <span className="text-indigo-400 font-medium"> +{log.pages} pages</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors shrink-0 ml-4"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col gap-3">
                    <label className="text-sm font-medium text-slate-300">
                        What stood out to you? Any thoughts, quotes, or ideas to remember?
                    </label>
                    <textarea
                        autoFocus
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. The concept of prescience as a burden rather than a gift really hit me. The line about 'he who can destroy a thing controls it' is worth sitting with..."
                        rows={6}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-all resize-none custom-scrollbar"
                    />
                    <p className="text-xs text-slate-600 text-right">{notes.length} characters</p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 pb-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-5 py-2 rounded-lg text-sm font-medium bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                        Save Reflection
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// SUB-COMPONENT: Error Banner
// ─────────────────────────────────────────────
const ErrorBanner = ({ message, onDismiss }) => (
    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
        <AlertCircle size={18} className="shrink-0" />
        <span className="flex-1">{message}</span>
        <button onClick={onDismiss} className="text-red-400/60 hover:text-red-400 transition-colors font-bold">✕</button>
    </div>
);

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function BookTracker() {
    const [books, setBooks] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState(null);
    const [reflectionLog, setReflectionLog] = useState(null); // log entry the modal is open for

    // ── Fetch all books + logs on mount ──
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [{ data: booksData, error: booksErr }, { data: logsData, error: logsErr }] = await Promise.all([
                supabase.from('books').select('*').order('created_at', { ascending: false }),
                supabase.from('reading_logs').select('*, books(title)').order('logged_at', { ascending: false }),
            ]);
            if (booksErr) throw booksErr;
            if (logsErr) throw logsErr;
            setBooks(booksData);
            setLogs(logsData);
        } catch (err) {
            setError('Failed to load your library. Check your Supabase connection.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── Add a new book ──
    const handleAddBook = async ({ title, author, total_pages }) => {
        setIsAdding(true);
        setError(null);
        const { data, error: err } = await supabase
            .from('books')
            .insert({ title, author, total_pages, pages_read: 0 })
            .select()
            .single();
        if (err) {
            setError('Could not add book. Please try again.');
            console.error(err);
        } else {
            setBooks((prev) => [data, ...prev]);
        }
        setIsAdding(false);
    };

    // ── Log a reading session ──
    const handleLogSession = async (bookId, pages) => {
        setError(null);
        const book = books.find((b) => b.id === bookId);
        if (!book) return;

        const newPagesRead = Math.min(book.pages_read + pages, book.total_pages);

        const [{ error: updateErr }, { data: logData, error: logErr }] = await Promise.all([
            supabase.from('books').update({ pages_read: newPagesRead }).eq('id', bookId),
            supabase.from('reading_logs').insert({ book_id: bookId, pages }).select('*, books(title)').single(),
        ]);

        if (updateErr || logErr) {
            setError('Could not save session. Please try again.');
            console.error(updateErr || logErr);
            return;
        }

        // Optimistically update local state
        setBooks((prev) => prev.map((b) => b.id === bookId ? { ...b, pages_read: newPagesRead } : b));
        setLogs((prev) => [logData, ...prev]);
    };

    // ── Delete a book (cascade deletes logs via DB) ──
    const handleDelete = async (bookId) => {
        setError(null);
        const { error: err } = await supabase.from('books').delete().eq('id', bookId);
        if (err) {
            setError('Could not delete book. Please try again.');
            console.error(err);
            return;
        }
        setBooks((prev) => prev.filter((b) => b.id !== bookId));
        setLogs((prev) => prev.filter((l) => l.book_id !== bookId));
    };

    // ── Save a reflection note on a reading log ──
    const handleSaveReflection = async (logId, reflection) => {
        setError(null);
        const { error: err } = await supabase
            .from('reading_logs')
            .update({ reflection })
            .eq('id', logId);
        if (err) {
            setError('Could not save reflection. Please try again.');
            console.error(err);
            return;
        }
        setLogs((prev) => prev.map((l) => l.id === logId ? { ...l, reflection } : l));
    };

    // ─────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <BookOpen className="text-indigo-500" size={32} />
                    Reading Tracker
                </h2>
                <p className="text-slate-400 mt-2">Log your reading sessions and visualize your progress.</p>
            </div>

            {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

            <AddBookForm onAddBook={handleAddBook} isAdding={isAdding} />

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-500">
                    <Loader2 size={40} className="animate-spin text-indigo-500" />
                    <p>Loading your library...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Book Grid */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                            <BookOpen size={20} className="text-indigo-400" />
                            Your Library
                            <span className="ml-auto text-sm font-normal text-slate-500">{books.length} book{books.length !== 1 ? 's' : ''}</span>
                        </h3>
                        {books.length === 0 ? (
                            <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-2xl">
                                <BookOpen size={36} className="mx-auto text-slate-700 mb-3" />
                                <p className="text-slate-400 font-medium">No books yet</p>
                                <p className="text-slate-600 text-sm mt-1">Add your first book above to get started!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {books.map((book) => (
                                    <BookCard
                                        key={book.id}
                                        book={book}
                                        onLogSession={handleLogSession}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Reading History Timeline */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                            <History size={20} className="text-emerald-400" />
                            Reading History
                        </h3>
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[440px] overflow-y-auto custom-scrollbar relative">
                            {logs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-600">
                                    <Clock size={28} />
                                    <p className="text-sm">No sessions logged yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-5 before:absolute before:inset-0 before:ml-[35px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
                                    {logs.map((log) => (
                                        <LogEntry
                                            key={log.id}
                                            log={log}
                                            onOpenReflection={() => setReflectionLog(log)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Reflection Modal */}
            {reflectionLog && (
                <ReflectionModal
                    log={reflectionLog}
                    onSave={handleSaveReflection}
                    onClose={() => setReflectionLog(null)}
                />
            )}
        </div>
    );
}
