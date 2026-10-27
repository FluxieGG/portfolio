import React, { useState } from 'react';
import {
    LayoutDashboard,
    Grid,
    User,
    Settings,
    Menu,
    X,
    ArrowRight,
    ExternalLink,
    Code,
    Clock,
    CloudSun,
    FileText
} from 'lucide-react';

import {
    BookOpen
} from 'lucide-react';
import BookTracker from './apps/BookTracker';

// ==========================================
// 1. DUMMY APP COMPONENTS (Your future apps go here)
// ==========================================

// This is an example of what a nested web app component might look like.
const PomodoroAppPlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-48 h-48 rounded-full border-8 border-indigo-500/30 flex items-center justify-center mb-8 relative">
            <div className="absolute inset-0 rounded-full border-8 border-indigo-500 border-t-transparent animate-spin-slow" style={{ animationDuration: '3s' }}></div>
            <span className="text-4xl font-mono font-bold text-white">25:00</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Pomodoro Timer</h2>
        <p className="text-slate-400 max-w-md">
            This is a placeholder for your Pomodoro app. When you build the real one,
            you'll replace this component with your actual app logic, state, and UI.
        </p>
        <div className="mt-8 flex gap-4">
            <button className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors">Start</button>
            <button className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors">Reset</button>
        </div>
    </div>
);

// ==========================================
// 2. MAIN LAYOUT COMPONENTS
// ==========================================

const AppCard = ({ title, description, icon: Icon, onClick, colorClass }) => (
    <div
        onClick={onClick}
        className="group relative flex flex-col p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all overflow-hidden hover:shadow-lg hover:shadow-indigo-500/10"
    >
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClass} opacity-10 rounded-bl-full transition-transform group-hover:scale-110`}></div>

        <div className={`p-3 rounded-xl w-fit mb-4 bg-slate-950 border border-slate-800 text-slate-300 group-hover:text-indigo-400 transition-colors`}>
            <Icon size={24} />
        </div>

        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm flex-grow mb-4">{description}</p>

        <div className="flex items-center text-sm font-medium text-indigo-400 mt-auto opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
            Launch App <ArrowRight size={16} className="ml-1" />
        </div>
    </div>
);

const HomeView = ({ setActiveView }) => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
                <p className="text-slate-400 mt-1">Welcome back. Here's a snapshot of your web apps.</p>
            </div>
            <button
                onClick={() => setActiveView('apps')}
                className="flex items-center px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-colors border border-indigo-500/20"
            >
                <Code size={18} className="mr-2" />
                Browse All Apps
            </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
                { label: 'Total Apps Built', value: '3', trend: '+1 this week' },
                { label: 'Active Projects', value: '1', trend: 'In development' },
                { label: 'Coffee Consumed', value: '42', trend: 'Cups' },
            ].map((stat, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                    <div className="text-slate-400 text-sm mb-2">{stat.label}</div>
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-xs text-indigo-400">{stat.trend}</div>
                </div>
            ))}
        </div>

        {/* Featured Apps (Quick Access) */}
        <div>
            <h2 className="text-xl font-semibold text-white mb-4">Featured Apps</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AppCard
                    title="Pomodoro Timer"
                    description="A productivity timer featuring custom intervals and a sleek UI."
                    icon={Clock}
                    colorClass="from-indigo-500 to-purple-500"
                    onClick={() => setActiveView('app-pomodoro')}
                />
                <AppCard
                    title="Weather Dash"
                    description="Real-time weather data visualization using open APIs."
                    icon={CloudSun}
                    colorClass="from-cyan-500 to-blue-500"
                    onClick={() => setActiveView('app-weather')} // Placeholder routing
                />
            </div>
        </div>
    </div>
);

const AppsGridView = ({ setActiveView }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">App Directory</h1>
            <p className="text-slate-400 mt-1">All your custom web applications in one place.</p>
        </div>

        {/*
      HOW TO ADD NEW APP CARDS:
      1. Duplicate an <AppCard /> block below.
      2. Update the title, description, and icon.
      3. Set the onClick prop to setActiveView('YOUR_NEW_APP_ID').
    */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AppCard
                title="Pomodoro Timer"
                description="A sleek productivity tool."
                icon={Clock}
                colorClass="from-indigo-500 to-purple-500"
                onClick={() => setActiveView('app-pomodoro')}
            />
            <AppCard
                title="Weather Dash"
                description="Check conditions anywhere."
                icon={CloudSun}
                colorClass="from-cyan-500 to-blue-500"
                onClick={() => setActiveView('app-weather')}
            />
            <AppCard
                title="MD Editor"
                description="In-browser markdown previewer."
                icon={FileText}
                colorClass="from-emerald-500 to-teal-500"
                onClick={() => setActiveView('app-markdown')}
            />
            <AppCard
                title="Reading Tracker"
                description="Log reading sessions and track book progress."
                icon={BookOpen}
                colorClass="from-indigo-500 to-emerald-500"
                onClick={() => setActiveView('app-booktracker')}
            />

            {/* Add New App Placeholder Card */}
            <div
                className="group flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/30 border border-dashed border-slate-700 hover:border-slate-500 cursor-pointer transition-all hover:bg-slate-900/50 min-h-[200px]"
                onClick={() => alert("Check the code comments on how to add a new app!")}
            >
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors mb-3">
                    <Code size={20} />
                </div>
                <p className="text-slate-400 font-medium">Add New App</p>
            </div>
        </div>
    </div>
);


// ==========================================
// 3. ROOT APPLICATION COMPONENT
// ==========================================

export default function App() {
    // State to manage which view/app is currently active
    const [activeView, setActiveView] = useState('home');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigation = [
        { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'apps', label: 'All Apps', icon: Grid },
        // { id: 'about', label: 'About Me', icon: User }, // Example of additional nav items
    ];

    // Helper to change view and close mobile menu
    const navigateTo = (viewId) => {
        setActiveView(viewId);
        setIsMobileMenuOpen(false);
    };

    // =========================================================================
    // APP ROUTER LOGIC
    // =========================================================================
    // HOW TO ROUTE TO A NEW WEB APP:
    // 1. Import or define your new React component at the top of this file.
    // 2. Add a new `case` inside this switch statement matching your app's ID.
    // 3. Return your new component.
    // =========================================================================
    const renderContent = () => {
        switch (activeView) {
            case 'home':
                return <HomeView setActiveView={navigateTo} />;
            case 'apps':
                return <AppsGridView setActiveView={navigateTo} />;

            // --- APP ROUTES GO HERE ---
            case 'app-booktracker':
                return <BookTracker />;
            case 'app-pomodoro':
                return <PomodoroAppPlaceholder />;
            case 'app-weather':
            case 'app-markdown':
                return (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <h2 className="text-2xl font-bold text-white mb-2">App Not Found</h2>
                        <p className="text-slate-400">This placeholder hasn't been built yet!</p>
                        <button onClick={() => navigateTo('apps')} className="mt-4 text-indigo-400 hover:underline">
                            Back to Apps
                        </button>
                    </div>
                );

            // Fallback
            default:
                return <HomeView setActiveView={navigateTo} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 flex">

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out flex flex-col
        lg:relative lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                {/* Logo / Brand */}
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3">
                        <Code size={18} className="text-white" />
                    </div>
                    <span className="font-bold text-white text-lg tracking-tight">DevBase</span>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2 mt-4">
                        Menu
                    </div>
                    {navigation.map((item) => {
                        const isActive = activeView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => navigateTo(item.id)}
                                className={`
                  w-full flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium
                  ${isActive
                                    ? 'bg-indigo-500/10 text-indigo-400'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                }
                `}
                            >
                                <item.icon size={18} className={`mr-3 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                                {item.label}
                            </button>
                        );
                    })}

                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2 mt-8">
                        My Apps
                    </div>
                    {/* Quick links to apps in sidebar */}
                    {[
                        { label: 'Reading Tracker', id: 'booktracker' },
                        { label: 'Pomodoro', id: 'pomodoro' },
                        { label: 'Weather', id: 'weather' },
                        { label: 'Markdown', id: 'markdown' },
                    ].map((app) => (
                        <button
                            key={app.id}
                            onClick={() => navigateTo(`app-${app.id}`)}
                            className={`
                w-full flex items-center px-3 py-2 rounded-lg transition-colors text-sm
                ${activeView === `app-${app.id}`
                                ? 'bg-slate-800 text-white'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                            }
              `}
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-4 opacity-70"></div>
                            {app.label}
                        </button>
                    ))}
                </nav>

                {/* Footer / Socials in Sidebar */}
                <div className="p-4 border-t border-slate-800">
                    <a href="#" className="flex items-center text-sm text-slate-400 hover:text-white transition-colors py-2 px-2 rounded-lg hover:bg-slate-800/50">
                        <Code size={18} className="mr-3" />
                        GitHub Profile
                        <ExternalLink size={14} className="ml-auto opacity-50" />
                    </a>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

                {/* Top Header (Visible mainly on mobile or for extra actions) */}
                <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-md sticky top-0 z-30">
                    <div className="flex items-center lg:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg focus:outline-none"
                        >
                            <Menu size={24} />
                        </button>
                        <span className="font-bold text-white ml-2">DevBase</span>
                    </div>

                    <div className="flex items-center ml-auto">
                        {/* Contextual top right content based on view could go here */}
                        {activeView.startsWith('app-') && (
                            <button
                                onClick={() => navigateTo('apps')}
                                className="text-sm font-medium text-slate-400 hover:text-white flex items-center bg-slate-900 px-3 py-1.5 rounded-md border border-slate-800 transition-colors"
                            >
                                Exit App
                            </button>
                        )}
                    </div>
                </header>

                {/* Scrollable Content Viewport */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
                    <div className="max-w-6xl mx-auto h-full relative">
                        {renderContent()}
                    </div>
                </div>
            </main>

            {/* Basic Global CSS for subtle niceities (scrollbars) */}
            <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}} />
        </div>
    );
}