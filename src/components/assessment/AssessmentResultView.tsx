import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  GitCommit,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen,
  Send,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { FinalOutcome, Submission, UnderstandingLevel } from '../../types/assessment';
import { CodeViewer } from '../common/CodeViewer';

interface AssessmentResultViewProps {
  submission: Submission;
  isTeacher?: boolean;
  onBack: () => void;
  onHumanGradeUpdated?: (updated: Submission) => void;
}

export const AssessmentResultView: React.FC<AssessmentResultViewProps> = ({
  submission,
  isTeacher = false,
  onBack,
  onHumanGradeUpdated,
}) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'generated' | 'original' | 'diff'>('generated');
  
  // Human grade state for teacher annotation
  const [humanGrade, setHumanGrade] = useState<'CORRECT' | 'INCORRECT'>(
    submission.humanGrade?.grade || (submission.finalOutcome === 'CORRECT — PASS + HIGH' ? 'CORRECT' : 'INCORRECT')
  );
  const [humanUnderstanding, setHumanUnderstanding] = useState<UnderstandingLevel>(
    submission.humanGrade?.understandingLevel || submission.understandingLevel
  );
  const [humanNotes, setHumanNotes] = useState(submission.humanGrade?.notes || '');
  const [isSavingGrade, setIsSavingGrade] = useState(false);
  const [gradeSavedMessage, setGradeSavedMessage] = useState(false);

  const toggleStep = (stepNumber: number) => {
    setExpandedStep(expandedStep === stepNumber ? null : stepNumber);
  };

  const handleSaveHumanGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGrade(true);
    try {
      const res = await fetch(`/api/submissions/${submission.id}/human-grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: humanGrade,
          understandingLevel: humanUnderstanding,
          notes: humanNotes,
          evaluatorName: 'Dr. Elena Rostova',
        }),
      });
      if (!res.ok) throw new Error('Failed to save human grade');
      const updated: Submission = await res.json();
      if (onHumanGradeUpdated) onHumanGradeUpdated(updated);
      setGradeSavedMessage(true);
      setTimeout(() => setGradeSavedMessage(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingGrade(false);
    }
  };

  const getOutcomeCard = (outcome: FinalOutcome) => {
    switch (outcome) {
      case 'CORRECT — PASS + HIGH':
        return {
          title: 'CORRECT — PASS + HIGH',
          subtitle: "The student's explanation successfully demonstrated understanding of the code at a high level.",
          bg: 'bg-emerald-950/70 border-emerald-500/50 text-emerald-100',
          badge: 'bg-emerald-500 text-slate-950 font-bold',
          icon: <CheckCircle className="w-8 h-8 text-emerald-400 shrink-0" />,
        };
      case 'INCORRECT — PASS + LOW':
        return {
          title: 'INCORRECT — PASS + LOW',
          subtitle: "The student's explanation was sufficient to reproduce the tested behaviour, but the explanation demonstrates only low-level understanding.",
          bg: 'bg-amber-950/70 border-amber-500/50 text-amber-100',
          badge: 'bg-amber-500 text-slate-950 font-bold',
          icon: <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />,
        };
      case 'INCORRECT — FAIL':
      default:
        return {
          title: 'INCORRECT — FAIL',
          subtitle: "The generated code based on the student's explanation did not satisfy the required unit tests.",
          bg: 'bg-rose-950/70 border-rose-500/50 text-rose-100',
          badge: 'bg-rose-500 text-white font-bold',
          icon: <XCircle className="w-8 h-8 text-rose-400 shrink-0" />,
        };
    }
  };

  const outcomeDetails = getOutcomeCard(submission.finalOutcome);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <button
            onClick={onBack}
            className="text-xs text-indigo-400 hover:text-indigo-300 mb-1 flex items-center gap-1 cursor-pointer font-medium"
          >
            ← Back to List
          </button>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Assessment Evaluation Report
          </h1>
          <p className="text-xs text-slate-400">
            Student: <strong className="text-slate-200">{submission.studentName}</strong> | Task: <strong className="text-slate-200">{submission.assessmentTitle}</strong> | Submitted: {new Date(submission.timestamp).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300">
            ID: {submission.id}
          </span>
        </div>
      </div>

      {/* Flagship Final Outcome Banner */}
      <div className={`rounded-2xl border p-6 shadow-xl ${outcomeDetails.bg}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {outcomeDetails.icon}
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-black tracking-tight">
                  {outcomeDetails.title}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs uppercase ${outcomeDetails.badge}`}>
                  Research Grade
                </span>
              </div>
              <p className="text-sm mt-1.5 opacity-90 max-w-3xl leading-relaxed">
                {outcomeDetails.subtitle}
              </p>
            </div>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-xl p-3 text-center shrink-0 w-full md:w-auto">
            <div className="text-[11px] opacity-75 uppercase tracking-wider font-semibold">
              Comprehension Level
            </div>
            <div className="text-lg font-black mt-0.5">
              {submission.understandingLevel} ({(submission.confidence * 100).toFixed(0)}%)
            </div>
          </div>
        </div>
      </div>

      {/* Summary Scorecard Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Code Complexity
          </span>
          <div className="text-lg font-bold text-white mt-1">
            {submission.complexityClassification}
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Score: {submission.complexityScore.toFixed(1)} / 10
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Unit Tests Result
          </span>
          <div className={`text-lg font-bold mt-1 ${submission.testPassStatus ? 'text-emerald-400' : 'text-rose-400'}`}>
            {submission.unitTestResults.testsPassed} / {submission.unitTestResults.testsTotal} Passed
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {submission.unitTestResults.executionTime}s execution
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Understanding Level
          </span>
          <div className={`text-lg font-bold mt-1 ${submission.understandingLevel === 'HIGH' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {submission.understandingLevel}
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Confidence: {(submission.confidence * 100).toFixed(0)}%
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Synthesized Code
          </span>
          <div className="text-lg font-bold text-indigo-300 mt-1">
            {submission.codeGenDetails?.reconstructionSufficiency || 'SUFFICIENT'}
          </div>
          <span className="text-xs text-slate-400 font-mono">
            from student EIPE
          </span>
        </div>
      </div>

      {/* Main Content Grid: Explanation, Generated Code & Unit Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Student Explanation & AI Evaluation Details */}
        <div className="space-y-6">
          {/* Student Explanation */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                Student Plain-English Explanation
              </h3>
              <span className="text-[11px] text-slate-400">
                Question: "{submission.generatedQuestion}"
              </span>
            </div>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-slate-200 text-sm leading-relaxed italic">
              "{submission.studentResponse}"
            </div>
          </div>

          {/* AI Pedagogical Feedback */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sparkles className="w-4 h-4" />
              <h3 className="text-sm font-bold text-white">AI Pedagogical Assessment & Evidence</h3>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
              {submission.highLowDetails.reasoningSummary}
            </p>

            {/* Strengths */}
            {submission.highLowDetails.strengths?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                  Key Strengths
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {submission.highLowDetails.strengths.map((st, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas for Improvement */}
            {submission.highLowDetails.areasForImprovement?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
                  Areas for Improvement
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {submission.highLowDetails.areasForImprovement.map((imp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Evidence Extracts */}
            {submission.highLowDetails.evidence?.length > 0 && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Syntactic & Conceptual Evidence Quotes:
                </span>
                <div className="space-y-1.5">
                  {submission.highLowDetails.evidence.map((ev, i) => (
                    <div key={i} className="text-xs font-mono text-indigo-300 bg-indigo-950/40 px-2.5 py-1.5 rounded border border-indigo-900/50">
                      {ev}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Code Viewer (Generated vs Original) & Unit Test Results */}
        <div className="space-y-6">
          {/* Code Viewer Tab */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveCodeTab('generated')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    activeCodeTab === 'generated'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  GenAI Synthesized Code (Prompt B)
                </button>
                <button
                  onClick={() => setActiveCodeTab('original')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    activeCodeTab === 'original'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Original Reference Code
                </button>
              </div>
            </div>

            <CodeViewer
              code={activeCodeTab === 'generated' ? submission.generatedCode : submission.originalCode}
              title={activeCodeTab === 'generated' ? 'Generated from Student Explanation' : 'Teacher Reference'}
              badgeText={activeCodeTab === 'generated' ? 'Prompt B Output' : 'Original'}
              maxHeight="max-h-72"
            />
          </div>

          {/* Unit Test Execution Sandbox Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Secure Sandbox Unit Test Results ({submission.unitTestResults.testsPassed}/{submission.unitTestResults.testsTotal})
              </h3>
              <span className={`text-xs font-bold ${submission.testPassStatus ? 'text-emerald-400' : 'text-rose-400'}`}>
                {submission.testPassStatus ? 'PASSED' : 'FAILED'}
              </span>
            </div>

            <div className="space-y-2">
              {submission.unitTestResults.tests?.map((t, idx) => (
                <div
                  key={t.testId || idx}
                  className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                    t.passed
                      ? 'bg-emerald-950/30 border-emerald-800/60 text-slate-200'
                      : 'bg-rose-950/30 border-rose-800/60 text-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-semibold flex items-center gap-2">
                      {t.passed ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      )}
                      <span>{t.name}</span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-400 pl-5">
                      {t.assertionCode}
                    </div>
                    {t.errorMessage && (
                      <div className="text-[11px] text-rose-300 pl-5">
                        {t.errorMessage}
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] font-mono text-slate-500">
                    {t.executionTimeMs}ms
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Auditability: Visual 9-Step Assessment Pipeline Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              9-Step Assessment Pipeline Audit Record
            </h3>
            <p className="text-xs text-slate-400">
              Complete research provenance trail from AST complexity to final conceptual verdict.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {submission.pipelineLog?.length || 9} Pipeline Nodes
          </span>
        </div>

        <div className="space-y-3 pt-2">
          {submission.pipelineLog?.map((step) => {
            const isExpanded = expandedStep === step.stepNumber;
            return (
              <div
                key={step.stepNumber}
                className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden transition-colors"
              >
                <div
                  onClick={() => toggleStep(step.stepNumber)}
                  className="flex items-center justify-between p-3.5 hover:bg-slate-900/70 cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                        step.status === 'completed'
                          ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-600/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {step.stepNumber}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-200 text-sm">
                        {step.title}
                      </span>
                      <p className="text-slate-400 text-[11px]">{step.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {step.summary && (
                      <span className="hidden md:inline-block px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[11px] font-mono border border-slate-800">
                        {step.summary}
                      </span>
                    )}
                    {step.durationMs !== undefined && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        {step.durationMs}ms
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && step.data && (
                  <div className="p-4 bg-slate-900/60 border-t border-slate-800 text-xs font-mono text-slate-300 space-y-2">
                    <pre className="overflow-x-auto p-3 bg-slate-950 rounded border border-slate-800 text-[11px] text-indigo-300 whitespace-pre-wrap">
                      {JSON.stringify(step.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Human Reference Grade Annotation (for Research Studies) */}
      {isTeacher && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <Award className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">Researcher / Human Reference Grade</h3>
          </div>
          <p className="text-xs text-slate-400">
            Record the ground-truth human expert grade to measure Agreement, Precision, Recall, and F1 metrics against AI evaluation.
          </p>

          <form onSubmit={handleSaveHumanGrade} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Human Grade Verdict
                </label>
                <select
                  value={humanGrade}
                  onChange={e => setHumanGrade(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="CORRECT">CORRECT (Passes comprehension)</option>
                  <option value="INCORRECT">INCORRECT (Fails comprehension)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Human Understanding Level
                </label>
                <select
                  value={humanUnderstanding}
                  onChange={e => setHumanUnderstanding(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="HIGH">HIGH (Purposeful, conceptual, algorithmic)</option>
                  <option value="LOW">LOW (Mechanical line-by-line syntax)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Researcher Annotations / Notes
              </label>
              <textarea
                rows={2}
                value={humanNotes}
                onChange={e => setHumanNotes(e.target.value)}
                placeholder="Notes on student phrasing, missed edge cases, or classification nuances..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                id="btn-save-human-grade"
                disabled={isSavingGrade}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSavingGrade ? 'Saving...' : 'Save Human Reference Grade'}
              </button>
              {gradeSavedMessage && (
                <span className="text-xs text-emerald-400 font-medium">
                  ✓ Human grade updated!
                </span>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
