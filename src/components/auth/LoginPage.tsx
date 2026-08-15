import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FlaskConical,
  GraduationCap,
  UserCheck,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Code2,
  Cpu,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  Layers,
  HelpCircle,
  X,
  Send,
  Building2,
  Github,
} from 'lucide-react';
import { UserProfile } from '../../types/assessment';

interface LoginPageProps {
  users: UserProfile[];
  onLogin: (user: UserProfile) => void;
  onGuestAccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ users, onLogin, onGuestAccess }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('elena.rostova@edu.cs');
  const [password, setPassword] = useState('••••••••••••');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student'>('teacher');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Quick Persona selection
  const handleSelectPersona = (user: UserProfile) => {
    setEmail(user.email);
    setPassword('demopassword123');
    setSelectedRole(user.role);
    setErrorMsg(null);
  };

  const handleQuickLogin = (user: UserProfile) => {
    setIsLoading(true);
    setErrorMsg(null);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(user);
    }, 450);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter a valid academic or institutional email address.');
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (authMode === 'signin') {
        // Find existing user or create a session user
        const existing = users.find(
          u => u.email.toLowerCase() === email.trim().toLowerCase()
        );
        if (existing) {
          onLogin(existing);
        } else {
          // Generate a session user with matching role
          const initials = email
            .split('@')[0]
            .split('.')
            .map(part => part.charAt(0).toUpperCase())
            .join('')
            .slice(0, 2) || 'US';
          const name = email
            .split('@')[0]
            .replace('.', ' ')
            .replace(/\b\w/g, c => c.toUpperCase());

          const newUser: UserProfile = {
            id: `user-custom-${Date.now()}`,
            name: name || 'Researcher User',
            email: email.trim(),
            role: selectedRole,
            avatarInitials: initials,
          };
          onLogin(newUser);
        }
      } else {
        // Sign up mode
        if (!fullName.trim()) {
          setErrorMsg('Please provide your full name for student or faculty records.');
          return;
        }

        const initials = fullName
          .split(' ')
          .map(part => part.charAt(0).toUpperCase())
          .join('')
          .slice(0, 2) || 'CS';

        const newUser: UserProfile = {
          id: `user-registered-${Date.now()}`,
          name: fullName.trim(),
          email: email.trim(),
          role: selectedRole,
          avatarInitials: initials,
        };

        setSuccessMsg(`Account created for ${newUser.name}! Entering research environment...`);
        setTimeout(() => {
          onLogin(newUser);
        }, 600);
      }
    }, 600);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden font-sans">
      {/* Subtle Background Glow Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between border-b border-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">
                EIPE Assessment Lab
              </span>
              <span className="px-2 py-0.5 text-[11px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                GenAI Benchmark
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Code Comprehension & AST Complexity Framework
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Evaluation Server Online
          </span>
          {onGuestAccess && (
            <button
              id="btn-guest-access-top"
              onClick={onGuestAccess}
              className="px-3.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/70 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs font-medium"
            >
              Guest Sandbox
            </button>
          )}
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Research Framework Feature Showcase */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 space-y-8"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Next-Gen Explain-In-Plain-English Evaluation
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Authentic Code <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-sky-300 to-violet-400">
                  Comprehension Assessment
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                Combining <strong>Tree-sitter AST structural complexity</strong>, <strong>GenAI-driven Python synthesis</strong>, and <strong>semantic HIGH vs LOW level reasoning</strong> to accurately assess student code comprehension without multiple-choice guesswork.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2.5">
                  <Code2 className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-semibold text-slate-200 mb-1">AST Complexity Metrics</h2>
                <p className="text-xs text-slate-400 leading-normal">
                  Automatic cyclomatic calculation, nesting depth, and calibrated question generation.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-2.5">
                  <Cpu className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-semibold text-slate-200 mb-1">AI Code Synthesis</h2>
                <p className="text-xs text-slate-400 leading-normal">
                  GenAI reconstructs executable Python from plain-English student explanations.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-2.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-semibold text-slate-200 mb-1">Sandbox Test Harness</h2>
                <p className="text-xs text-slate-400 leading-normal">
                  Executes synthesized programs against assertions in an isolated runtime environment.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2.5">
                  <Layers className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-semibold text-slate-200 mb-1">Semantic High/Low Filter</h2>
                <p className="text-xs text-slate-400 leading-normal">
                  Identifies superficial line-by-line syntax vs true conceptual understanding.
                </p>
              </div>
            </div>

            {/* Quick Persona Fast Login Ribbon */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                  Quick Demo Persona Logins (1-Click)
                </span>
                <span className="text-[11px] text-slate-500">Preset research profiles</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {users.slice(0, 4).map(user => (
                  <button
                    key={user.id}
                    id={`btn-persona-quick-${user.id}`}
                    type="button"
                    onClick={() => handleQuickLogin(user)}
                    className="p-2 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 text-left transition-all group cursor-pointer flex flex-col"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white ${
                          user.role === 'teacher' ? 'bg-amber-600' : 'bg-sky-600'
                        }`}
                      >
                        {user.avatarInitials}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                          user.role === 'teacher'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-sky-500/20 text-sky-300'
                        }`}
                      >
                        {user.role === 'teacher' ? 'Faculty' : 'Student'}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-slate-200 group-hover:text-indigo-300 truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">{user.name.split(' ').slice(1).join(' ')}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Authentication Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-6 w-full max-w-md mx-auto"
          >
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative">
              
              {/* Card Header & Tab Switcher */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {authMode === 'signin' ? 'Welcome Back' : 'Create Research Account'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {authMode === 'signin'
                      ? 'Sign in to access your assessment console'
                      : 'Enroll as faculty instructor or student participant'}
                  </p>
                </div>

                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    id="tab-auth-signin"
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                      authMode === 'signin'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    id="tab-auth-signup"
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                      authMode === 'signup'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Register
                  </button>
                </div>
              </div>

              {/* Error & Success Alerts */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-5 p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-start gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}
                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-5 p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Role Picker (For both modes, clearly shows which workspace is entered) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Account Role & Workspace
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="btn-role-select-teacher"
                      type="button"
                      onClick={() => setSelectedRole('teacher')}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        selectedRole === 'teacher'
                          ? 'bg-amber-950/40 border-amber-500/70 text-amber-200 ring-1 ring-amber-500/40'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          selectedRole === 'teacher' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-100">Faculty / Teacher</div>
                        <div className="text-[10px] text-slate-400">Author & Audits</div>
                      </div>
                    </button>

                    <button
                      id="btn-role-select-student"
                      type="button"
                      onClick={() => setSelectedRole('student')}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        selectedRole === 'student'
                          ? 'bg-sky-950/40 border-sky-500/70 text-sky-200 ring-1 ring-sky-500/40'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          selectedRole === 'student' ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-100">Student Learner</div>
                        <div className="text-[10px] text-slate-400">Comprehension Tasks</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Name field for Sign up */}
                {authMode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                      <input
                        id="input-auth-name"
                        type="text"
                        placeholder="e.g. Dr. Jane Doe or Alex Smith"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Email field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Academic Email Address
                    </label>
                    {authMode === 'signin' && (
                      <span className="text-[11px] text-slate-500">
                        Demo: <button type="button" onClick={() => handleSelectPersona(users[0])} className="text-indigo-400 hover:underline cursor-pointer">Dr. Elena</button> or <button type="button" onClick={() => handleSelectPersona(users[1])} className="text-indigo-400 hover:underline cursor-pointer">Alex Chen</button>
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                      id="input-auth-email"
                      type="email"
                      required
                      placeholder="username@institution.edu"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Password
                    </label>
                    {authMode === 'signin' && (
                      <button
                        type="button"
                        id="btn-forgot-password"
                        onClick={() => {
                          setResetEmail(email);
                          setResetSent(false);
                          setShowForgotPassword(true);
                        }}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                      id="input-auth-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                    <button
                      type="button"
                      id="btn-toggle-password-visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      id="checkbox-remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer"
                    />
                    <span className="text-xs text-slate-400">Remember on this device</span>
                  </label>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> Encrypted Session
                  </span>
                </div>

                {/* Submit Action Button */}
                <button
                  id="btn-submit-auth"
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Authenticating credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>{authMode === 'signin' ? 'Sign In to Workspace' : 'Complete Registration'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Single Sign-On Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <span className="relative bg-slate-900 px-3 text-[11px] font-medium text-slate-500">
                  Or authenticate with University SSO
                </span>
              </div>

              {/* Institutional SSO Options */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  id="btn-sso-google-edu"
                  type="button"
                  onClick={() => handleQuickLogin(users[0])}
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Google Workspace</span>
                </button>

                <button
                  id="btn-sso-github"
                  type="button"
                  onClick={() => handleQuickLogin(users[1])}
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Github className="w-3.5 h-3.5 text-slate-300" />
                  <span>GitHub Campus</span>
                </button>
              </div>

              {/* Card Footer Helper */}
              <div className="mt-6 pt-4 border-t border-slate-800/70 text-center">
                <p className="text-[11px] text-slate-400">
                  Research deployment backed by automated Tree-sitter AST and Gemini 3.7 Flash.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
            >
              <button
                id="btn-close-forgot-pwd"
                onClick={() => setShowForgotPassword(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <HelpCircle className="w-5 h-5" />
              </div>

              <h3 className="text-base font-bold text-white mb-1">
                Reset Academic Account Password
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Enter your registered institutional email address and we will dispatch a secure one-time login link.
              </p>

              {resetSent ? (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-center space-y-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                  <p className="text-xs font-semibold text-emerald-300">
                    Reset link dispatched!
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Instructions sent to <span className="text-slate-200 font-mono">{resetEmail}</span>.
                  </p>
                  <button
                    onClick={() => setShowForgotPassword(false)}
                    className="mt-3 px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 cursor-pointer"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <input
                      id="input-reset-email"
                      type="email"
                      required
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      placeholder="username@institution.edu"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      id="btn-send-reset-email"
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send Reset Instructions
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/80 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Research Framework: Automated Assessment of Code Comprehension using GenAI
          </span>
          <span className="font-mono text-slate-600">
            AST + Tree-sitter + GenAI (Prompt B) + Sandbox + Prompt C
          </span>
        </div>
      </footer>
    </div>
  );
};
