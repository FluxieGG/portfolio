import React, { useState } from 'react';
import { BookOpen, Plus, TrendingUp, CheckCircle2, Clock, History } from 'lucide-react';

// --- SUB-COMPONENT: Add New Book Form ---
const AddBookForm = ({ onAddBook }) => {
    const [title, setTitle] = useState('');
    const [totalPages, setTotalPages] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !totalPages || isNaN(totalPages)) return;

        onAddBook({
            id: Date.now(),
            title,
            totalPages: parseInt(totalPages),
            pagesRead: 0,
            logs: [], // Initialize empty history
        });
        setTitle('');
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
            </div>
            <div className="w-full md:w-48">
                <label className="block text-sm font-medium text-slate-400 mb-2">Total Pages</label>
                <input
                    type="number"
                    value={totalPages}
                    onChange={(e) => setTotalPages(e.target.value)}
                    placeholder="e.g., 412"
                    min="1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
            </div>
            <button
                type="submit"
                className="w-full md:w-auto px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
                <Plus size={18} />
                Add Book
            </button>
        </form>
    );
};

// --- SUB-COMPONENT: Individual Book Card ---
const BookCard = ({ book, onLogSession }) => {
    const [sessionPages, setSessionPages] = useState('');

    const progressPercent = Math.min(Math.round((book.pagesRead / book.totalPages) * 100), 100);
    const pagesRemaining = Math.max(book.totalPages - book.pagesRead, 0);
    const isFinished = pagesRemaining === 0;

    const handleLog = () => {
        if (!sessionPages || isNaN(sessionPages)) return;
        onLogSession(book.id, parseInt(sessionPages));
        setSessionPages('');
    };

    return (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col relative overflow-hidden transition-all hover:border-indigo-500/30">
            {isFinished && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full"></div>}

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                        {book.title}
                        {isFinished && <CheckCircle2 size={18} className="text-emerald-400" />}
                    </h3>
                    <p className="text-sm text-slate-400">
                        {isFinished ? 'Completed!' : `${pagesRemaining} pages remaining`}
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6 mt-2 relative z-10">
                <div className="flex justify-between text-xs text-slate-400 mb-2 font-medium">
                    <span>{book.pagesRead} read</span>
                    <span>{book.totalPages} total</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${isFinished ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Log Action */}
            {!isFinished && (
                <div className="mt-auto pt-4 border-t border-slate-800/50 flex gap-2 relative z-10">
                    <input
                        type="number"
                        value={sessionPages}
                        onChange={(e) => setSessionPages(e.target.value)}
                        placeholder="Pages read..."
                        min="1"
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                        onClick={handleLog}
                        className="px-4 py-2 bg-slate-800 hover:bg-indigo-500/20 hover:text-indigo-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                        <TrendingUp size={16} />
                        Log
                    </button>
                </div>
            )}
        </div>
    );
};

// --- MAIN APP COMPONENT ---
export default function BookTracker() {
    const [books, setBooks] = useState([
    ]);

    const handleAddBook = (newBook) => {
        setBooks([newBook, ...books]);
    };

    const handleLogSession = (bookId, pagesReadInSession) => {
        setBooks(books.map(book => {
            if (book.id === bookId) {
                const newTotalRead = Math.min(book.pagesRead + pagesReadInSession, book.totalPages);
                const newLog = {
                    id: Date.now(),
                    date: new Date().toISOString(),
                    pages: pagesReadInSession
                };
                return {
                    ...book,
                    pagesRead: newTotalRead,
                    logs: [newLog, ...book.logs]
                };
            }
            return book;
        }));
    };

    // Extract and sort all logs across all books to build the global timeline
    const allLogs = books.flatMap(book =>
        book.logs.map(log => ({ ...log, bookTitle: book.title }))
    ).sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-12">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <BookOpen className="text-indigo-500" size={32} />
                    Reading Tracker
                </h2>
                <p className="text-slate-400 mt-2">Log your reading sessions and visualize your progress.</p>
            </div>

            <AddBookForm onAddBook={handleAddBook} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Book Grid (Takes up 2/3 width on large screens) */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                        <BookOpen size={20} className="text-indigo-400" />
                        Your Library
                    </h3>
                    {books.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl">
                            <p className="text-slate-400">No books tracked yet. Add one above!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {books.map(book => (
                                <BookCard key={book.id} book={book} onLogSession={handleLogSession} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Side: Activity Timeline (Takes up 1/3 width) */}
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                        <History size={20} className="text-emerald-400" />
                        Reading History
                    </h3>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[400px] overflow-y-auto custom-scrollbar relative">
                        {allLogs.length === 0 ? (
                            <p className="text-slate-500 text-sm text-center mt-10">No sessions logged yet.</p>
                        ) : (
                            <div className="space-y-6 before:absolute before:inset-0 before:ml-[35px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
                                {allLogs.map((log) => {
                                    const logDate = new Date(log.date);
                                    const timeString = logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    const dateString = logDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

                                    return (
                                        <div key={log.id} className="relative flex items-center justify-between group">
                                            {/* Timeline Dot */}
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-950 border-2 border-indigo-500 text-indigo-400 shrink-0 z-10 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                                                <TrendingUp size={14} />
                                            </div>

                                            {/* Event Card */}
                                            <div className="w-[calc(100%-3rem)] pl-4">
                                                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl group-hover:border-indigo-500/30 transition-colors">
                                                    <p className="text-white text-sm font-medium">{log.bookTitle}</p>
                                                    <p className="text-indigo-400 text-xs mt-1 font-bold">+{log.pages} pages</p>
                                                    <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                                                        <Clock size={12} />
                                                        <span>{dateString} at {timeString}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}