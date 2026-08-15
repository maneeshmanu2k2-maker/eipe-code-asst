import React from 'react';
import {
  BookOpen,
  PlusCircle,
  BarChart3,
  FileCheck2,
  Cpu,
  UserCheck,
  GraduationCap,
  FlaskConical,
  LogOut,
} from 'lucide-react';
import { UserProfile } from '../../types/assessment';

interface NavbarProps {
  activeTab: 'assessments' | 'create' | 'submissions' | 'research' | 'prompts';
  setActiveTab: (tab: 'assessments' | 'create' | 'submissions' | 'research' | 'prompts') => void;
  currentUser: UserProfile;
  users: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  users,
  onSelectUser,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-inner text-white">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base md:text-lg tracking-tight text-white">
                  EIPE Assessment Lab
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[11px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                  GenAI Research Prototype
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Explain-in-Plain-English Code Comprehension Evaluator
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              id="nav-tab-assessments"
              onClick={() => setActiveTab('assessments')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'assessments'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Assessments
            </button>

            {currentUser.role === 'teacher' && (
              <button
                id="nav-tab-create"
                onClick={() => setActiveTab('create')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'create'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                Create Assessment
              </button>
            )}

            <button
              id="nav-tab-submissions"
              onClick={() => setActiveTab('submissions')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'submissions'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              Submissions & Audits
            </button>

            <button
              id="nav-tab-research"
              onClick={() => setActiveTab('research')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'research'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Research Evaluation
            </button>

            <button
              id="nav-tab-prompts"
              onClick={() => setActiveTab('prompts')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'prompts'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Cpu className="w-4 h-4" />
              Prompts & Model
            </button>
          </nav>

          {/* User & Role Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-lg p-1.5">
              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white shadow-sm ${
                  currentUser.role === 'teacher' ? 'bg-amber-600' : 'bg-sky-600'
                }`}
              >
                {currentUser.avatarInitials}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-slate-100 flex items-center gap-1">
                  {currentUser.name}
                  {currentUser.role === 'teacher' ? (
                    <GraduationCap className="w-3.5 h-3.5 text-amber-400 inline" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5 text-sky-400 inline" />
                  )}
                </div>
                <div className="text-[10px] text-slate-400 capitalize">
                  Role: <span className="text-slate-200 font-medium">{currentUser.role}</span>
                </div>
              </div>

              {/* Role Quick Selector */}
              <select
                id="role-user-selector"
                value={currentUser.id}
                onChange={e => {
                  const u = users.find(x => x.id === e.target.value);
                  if (u) onSelectUser(u);
                }}
                className="ml-1 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                title="Switch User / Role"
              >
                <optgroup label="Faculty / Evaluators">
                  {users
                    .filter(u => u.role === 'teacher')
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} (Teacher)
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Enrolled Students">
                  {users
                    .filter(u => u.role === 'student')
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} (Student)
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            {onLogout && (
              <button
                id="btn-navbar-logout"
                type="button"
                onClick={onLogout}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-red-950/50 border border-slate-700 hover:border-red-800/60 text-slate-300 hover:text-red-300 transition-colors cursor-pointer text-xs flex items-center gap-1.5"
                title="Sign out or switch login"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden xl:inline font-medium">Log Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('assessments')}
            className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap ${
              activeTab === 'assessments' ? 'bg-indigo-600 text-white' : 'text-slate-300'
            }`}
          >
            Assessments
          </button>
          {currentUser.role === 'teacher' && (
            <button
              onClick={() => setActiveTab('create')}
              className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap ${
                activeTab === 'create' ? 'bg-indigo-600 text-white' : 'text-slate-300'
              }`}
            >
              Create
            </button>
          )}
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap ${
              activeTab === 'submissions' ? 'bg-indigo-600 text-white' : 'text-slate-300'
            }`}
          >
            Submissions
          </button>
          <button
            onClick={() => setActiveTab('research')}
            className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap ${
              activeTab === 'research' ? 'bg-indigo-600 text-white' : 'text-slate-300'
            }`}
          >
            Research Metrics
          </button>
          <button
            onClick={() => setActiveTab('prompts')}
            className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap ${
              activeTab === 'prompts' ? 'bg-indigo-600 text-white' : 'text-slate-300'
            }`}
          >
            Prompts
          </button>
        </div>
      </div>
    </header>
  );
};
