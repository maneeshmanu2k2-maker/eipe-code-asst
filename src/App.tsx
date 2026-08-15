import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { LoginPage } from './components/auth/LoginPage';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { CreateAssessment } from './components/teacher/CreateAssessment';
import { StudentDashboard } from './components/student/StudentDashboard';
import { TakeAssessment } from './components/student/TakeAssessment';
import { AssessmentResultView } from './components/assessment/AssessmentResultView';
import { ResearchEvaluationView } from './components/research/ResearchEvaluationView';
import { PromptTemplatesView } from './components/prompts/PromptTemplatesView';
import { Assessment, Submission, UserProfile } from './types/assessment';

const DEFAULT_USERS: UserProfile[] = [
  { id: 'user-teacher-1', name: 'Dr. Elena Rostova', email: 'elena.rostova@edu.cs', role: 'teacher', avatarInitials: 'ER' },
  { id: 'user-student-1', name: 'Alex Chen', email: 'alex.chen@student.cs', role: 'student', avatarInitials: 'AC' },
  { id: 'user-student-2', name: 'Maya Patel', email: 'maya.patel@student.cs', role: 'student', avatarInitials: 'MP' },
  { id: 'user-student-3', name: 'Jordan Lee', email: 'jordan.lee@student.cs', role: 'student', avatarInitials: 'JL' },
  { id: 'user-student-4', name: 'Samira Khan', email: 'samira.khan@student.cs', role: 'student', avatarInitials: 'SK' },
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('eipe_auth_logged_in');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState<'assessments' | 'create' | 'submissions' | 'research' | 'prompts'>('assessments');
  const [users, setUsers] = useState<UserProfile[]>(DEFAULT_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USERS[0]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Active modal/screen states
  const [activeAssessmentForTaking, setActiveAssessmentForTaking] = useState<Assessment | null>(null);
  const [activeSubmissionForViewing, setActiveSubmissionForViewing] = useState<Submission | null>(null);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [usersRes, asmtRes, subRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/assessments'),
        fetch('/api/submissions'),
      ]);

      if (usersRes.ok) {
        const uList = await usersRes.json();
        if (Array.isArray(uList) && uList.length > 0) {
          setUsers(uList);
          try {
            const savedUserId = localStorage.getItem('eipe_current_user_id');
            const found = uList.find((u: UserProfile) => u.id === savedUserId);
            if (found) {
              setCurrentUser(found);
            } else {
              setCurrentUser(uList[0]);
            }
          } catch {
            setCurrentUser(uList[0]);
          }
        }
      }

      if (asmtRes.ok) {
        const asmtList = await asmtRes.json();
        setAssessments(asmtList);
      }

      if (subRes.ok) {
        const subList = await subRes.json();
        setSubmissions(subList);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    if (!users.some(u => u.id === user.id)) {
      setUsers(prev => [user, ...prev]);
    }
    setIsAuthenticated(true);
    try {
      localStorage.setItem('eipe_auth_logged_in', 'true');
      localStorage.setItem('eipe_current_user_id', user.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveAssessmentForTaking(null);
    setActiveSubmissionForViewing(null);
    try {
      localStorage.removeItem('eipe_auth_logged_in');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssessmentCreated = (newAsmt: Assessment) => {
    setAssessments(prev => [newAsmt, ...prev]);
    setActiveTab('assessments');
  };

  const handleSubmitSuccess = (submission: Submission) => {
    setSubmissions(prev => [submission, ...prev]);
    setActiveAssessmentForTaking(null);
    setActiveSubmissionForViewing(submission);
  };

  const handleHumanGradeUpdated = (updated: Submission) => {
    setSubmissions(prev => prev.map(s => (s.id === updated.id ? updated : s)));
    setActiveSubmissionForViewing(updated);
  };

  // If not authenticated, render the dedicated Login Page
  if (!isAuthenticated) {
    return (
      <LoginPage
        users={users}
        onLogin={handleLogin}
        onGuestAccess={() => handleLogin(users[0] || DEFAULT_USERS[0])}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={tab => {
          setActiveAssessmentForTaking(null);
          setActiveSubmissionForViewing(null);
          setActiveTab(tab);
        }}
        currentUser={currentUser}
        users={users}
        onSelectUser={u => {
          setCurrentUser(u);
          setActiveAssessmentForTaking(null);
          setActiveSubmissionForViewing(null);
          try {
            localStorage.setItem('eipe_current_user_id', u.id);
          } catch (e) {
            console.error(e);
          }
        }}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 rounded-full border-3 border-indigo-500 border-t-transparent animate-spin" />
            <p className="text-sm text-slate-400 font-medium">
              Initializing automated comprehension assessment environment...
            </p>
          </div>
        ) : activeAssessmentForTaking ? (
          <TakeAssessment
            assessment={activeAssessmentForTaking}
            studentName={currentUser.name}
            studentId={currentUser.id}
            onSubmitSuccess={handleSubmitSuccess}
            onCancel={() => setActiveAssessmentForTaking(null)}
          />
        ) : activeSubmissionForViewing ? (
          <AssessmentResultView
            submission={activeSubmissionForViewing}
            isTeacher={currentUser.role === 'teacher'}
            onBack={() => setActiveSubmissionForViewing(null)}
            onHumanGradeUpdated={handleHumanGradeUpdated}
          />
        ) : activeTab === 'assessments' ? (
          currentUser.role === 'teacher' ? (
            <TeacherDashboard
              assessments={assessments}
              submissions={submissions}
              users={users}
              onSelectSubmission={sub => setActiveSubmissionForViewing(sub)}
              onCreateAssessment={() => setActiveTab('create')}
              onTakeAssessment={asmt => setActiveAssessmentForTaking(asmt)}
            />
          ) : (
            <StudentDashboard
              currentUser={currentUser}
              assessments={assessments}
              submissions={submissions}
              onTakeAssessment={asmt => setActiveAssessmentForTaking(asmt)}
              onViewSubmission={sub => setActiveSubmissionForViewing(sub)}
            />
          )
        ) : activeTab === 'create' ? (
          <CreateAssessment
            onAssessmentCreated={handleAssessmentCreated}
            onCancel={() => setActiveTab('assessments')}
          />
        ) : activeTab === 'submissions' ? (
          <TeacherDashboard
            assessments={assessments}
            submissions={submissions}
            users={users}
            onSelectSubmission={sub => setActiveSubmissionForViewing(sub)}
            onCreateAssessment={() => setActiveTab('create')}
            onTakeAssessment={asmt => setActiveAssessmentForTaking(asmt)}
          />
        ) : activeTab === 'research' ? (
          <ResearchEvaluationView />
        ) : activeTab === 'prompts' ? (
          <PromptTemplatesView />
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Research Framework: Automated Assessment of Code Comprehension using GenAI
          </span>
          <span className="font-mono text-slate-600">
            AST + GenAI (Prompt B) + Sandbox + Prompt C (HIGH/LOW)
          </span>
        </div>
      </footer>
    </div>
  );
}
