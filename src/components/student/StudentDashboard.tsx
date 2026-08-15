import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Clock,
  Award,
} from 'lucide-react';
import { Assessment, Submission, UserProfile } from '../../types/assessment';

interface StudentDashboardProps {
  currentUser: UserProfile;
  assessments: Assessment[];
  submissions: Submission[];
  onTakeAssessment: (assessment: Assessment) => void;
  onViewSubmission: (submission: Submission) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  assessments,
  submissions,
  onTakeAssessment,
  onViewSubmission,
}) => {
  const studentSubmissions = submissions.filter(s => s.studentId === currentUser.id);

  const completedAssessmentIds = new Set(studentSubmissions.map(s => s.assessmentId));

  const totalAssigned = assessments.length;
  const completedCount = completedAssessmentIds.size;
  const correctCount = studentSubmissions.filter(s => s.finalOutcome === 'CORRECT — PASS + HIGH').length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900/60 to-slate-900 border border-indigo-800/50 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Student Learning Portal
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Explain code in plain English to demonstrate algorithmic comprehension. Your responses are evaluated for both behavioral correctness and conceptual understanding.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 p-4 rounded-xl shrink-0">
            <div className="text-center">
              <div className="text-xs text-slate-400">Assigned</div>
              <div className="text-xl font-bold text-white">{totalAssigned}</div>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center">
              <div className="text-xs text-slate-400">Completed</div>
              <div className="text-xl font-bold text-indigo-300">{completedCount}</div>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center">
              <div className="text-xs text-slate-400">High-Level Pass</div>
              <div className="text-xl font-bold text-emerald-400">{correctCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Assessments Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Active Code Comprehension Tasks
          </h2>
          <p className="text-xs text-slate-400">
            Select a task to review the Python snippet and provide your plain-English explanation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {assessments.map(asmt => {
            const hasCompleted = completedAssessmentIds.has(asmt.id);
            const latestSub = studentSubmissions.find(s => s.assessmentId === asmt.id);

            return (
              <div
                key={asmt.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        asmt.complexity.classification === 'COMPLEX'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : asmt.complexity.classification === 'MODERATE'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {asmt.complexity.classification} ({asmt.complexity.complexityScore.toFixed(1)}/10)
                    </span>

                    {hasCompleted ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Attempted
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Pending</span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-white">{asmt.title}</h3>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                      Question:
                    </span>
                    <p className="text-xs text-indigo-300 italic line-clamp-2">
                      "{asmt.generatedQuestion}"
                    </p>
                  </div>

                  {latestSub && (
                    <div className="pt-2">
                      <span className="text-[10px] text-slate-400">Previous Outcome:</span>
                      <div
                        className={`mt-0.5 text-xs font-bold px-2 py-1 rounded ${
                          latestSub.finalOutcome === 'CORRECT — PASS + HIGH'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                            : latestSub.finalOutcome === 'INCORRECT — PASS + LOW'
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                            : 'bg-rose-950/60 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {latestSub.finalOutcome}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-5 mt-4 border-t border-slate-800 flex items-center justify-between">
                  {latestSub && (
                    <button
                      onClick={() => onViewSubmission(latestSub)}
                      className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      View Report
                    </button>
                  )}
                  <button
                    onClick={() => onTakeAssessment(asmt)}
                    id={`btn-take-asmt-${asmt.id}`}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm"
                  >
                    <span>{hasCompleted ? 'Retry / Re-explain' : 'Start Task'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Student Past Submissions History */}
      {studentSubmissions.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" />
              Your Assessment Submissions ({studentSubmissions.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60 font-semibold uppercase text-[10px]">
                  <th className="p-3">Task</th>
                  <th className="p-3">Complexity</th>
                  <th className="p-3">Behavioral Tests</th>
                  <th className="p-3">Conceptual Level</th>
                  <th className="p-3">Research Outcome</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {studentSubmissions.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-semibold text-slate-200">{sub.assessmentTitle}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        {sub.complexityClassification}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={sub.testPassStatus ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                        {sub.unitTestResults.testsPassed} / {sub.unitTestResults.testsTotal} Passed
                      </span>
                    </td>
                    <td className="p-3 font-semibold">
                      <span className={sub.understandingLevel === 'HIGH' ? 'text-emerald-400' : 'text-amber-400'}>
                        {sub.understandingLevel}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sub.finalOutcome === 'CORRECT — PASS + HIGH'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : sub.finalOutcome === 'INCORRECT — PASS + LOW'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {sub.finalOutcome}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onViewSubmission(sub)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        View Feedback
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
